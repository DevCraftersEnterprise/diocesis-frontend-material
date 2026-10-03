import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY } from 'rxjs';
import { AppModuleName, MODULE_ACCESS_OPTIONS, User, UserRole } from '../../core/models/user.model';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { TitleComponent } from '../../shared/components/title/title';
import { Mode, UserCreateForm, UserEditForm } from '../../shared/models/common.models';
import { downloadTemplate } from '../../shared/utils/download-template.util';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { createSearchState } from '../../shared/utils/search.util';
import { Users } from './services/users';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    TitleComponent,
    PaginationComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './users.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly usersService = inject(Users);
  protected readonly iconsService = inject(IconsService);

  readonly confirmingToggle = signal(false);
  readonly targetUser = signal<User | null>(null);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);
  readonly filters = signal<{ isActive?: boolean }>({});

  readonly USER_ROLES: UserRole[] = ['admin', 'user'];
  readonly MODULE_ACCESS_OPTIONS = MODULE_ACCESS_OPTIONS;

  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);

  readonly createForm = signal<UserCreateForm>({
    email: '',
    password: '',
    username: '',
    role: 'user',
    moduleAccess: [],
  });

  readonly editForm = signal<UserEditForm>({
    email: '',
    username: '',
    role: 'user',
    moduleAccess: [],
  });

  private readonly paginationState = createPaginationState(this.usersService.totalUsers, {
    onChange: () => this.loadUsers(),
  });

  readonly pagination = this.paginationState.pagination;
  readonly pageFrom = this.paginationState.pageFrom;
  readonly pageTo = this.paginationState.pageTo;
  readonly canPrev = this.paginationState.canPrev;
  readonly canNext = this.paginationState.canNext;

  prevPage = () => this.paginationState.prevPage();
  nextPage = () => this.paginationState.nextPage();
  changeLimit = (e: Event) => this.paginationState.changeLimit(e);

  readonly modalTitle = computed(() => {
    const currentMode = this.mode();
    if (currentMode === 'create') return 'Crear Usuario';
    if (currentMode === 'edit') return 'Editar Usuario';
    return '';
  });

  readonly isCreateFormValid = computed(() => {
    const f = this.createForm();

    return (
      f.email.trim() !== '' &&
      f.username.trim() !== '' &&
      f.role.trim() !== '' &&
      f.password!.trim().length >= 6
    );
  });

  readonly isEditFormValid = computed(() => {
    const f = this.editForm();
    return f.email.trim() !== '' && f.username.trim() !== '' && f.role.trim() !== '';
  });

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Activar usuario' : 'Desactivar usuario',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'activar' : 'desactivar';
    return `¿Seguro que quieres ${action} a "${this.targetUser()?.email}"?`;
  });

  private readonly searchState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadUsers();
    },
  });

  readonly search = this.searchState.searchTerm;

  updateSearch = (e: Event) => this.searchState.updateSearch(e);

  readonly activeFilterValue = computed(() => {
    const isActive = this.filters().isActive;
    if (isActive === undefined) return '';
    return isActive ? 'true' : 'false';
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  openCreateUser() {
    this.mode.set('create');
    this.createForm.set({
      email: '',
      password: '',
      role: 'user',
      username: '',
      moduleAccess: [],
    });
  }

  openEditUser(user: User) {
    this.mode.set('edit');
    this.targetUser.set(user);
    this.editForm.set({
      email: user.email,
      role: user.role,
      username: user.username,
      moduleAccess: [...(user.moduleAccess ?? [])],
    });
  }

  loadUsers() {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.usersService
      .getUsersPaginated(offset, limit, {
        username: this.search() || undefined,
        isActive: this.filters().isActive,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.toastrService.error('Error al cargar los usuarios', 'Error');
          this.loading.set(false);
        },
      });
  }

  closeModal() {
    this.mode.set(null);
    this.createForm.set({
      email: '',
      password: '',
      role: 'user',
      username: '',
      moduleAccess: [],
    });
  }

  save() {
    if (!this.isCreateFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    const { email, password, role, username, moduleAccess } = this.createForm();

    const payload: Partial<User> = {
      username,
      email,
      role,
      password,
      moduleAccess,
    };

    this.saving.set(true);

    this.usersService.createUser(payload).subscribe({
      next: () => {
        this.toastrService.success('Usuario creado correctamente', 'Éxito');
        this.closeModal();
        this.loadUsers();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar el usuario', 'Error');
        this.saving.set(false);
      },
    });
  }

  update() {
    if (!this.isEditFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    const { email, role, username, moduleAccess } = this.editForm();

    const payload: Partial<User> = {
      username,
      email,
      role,
      moduleAccess,
    };

    if (this.targetUser() === null) return;

    this.saving.set(true);

    this.usersService.updateUser(this.targetUser()!.id, payload).subscribe({
      next: () => {
        this.toastrService.success('Usuario actualizado correctamente', 'Éxito');
        this.closeModal();
        this.targetUser.set(null);
        this.loadUsers();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar el usuario', 'Error');
        this.saving.set(false);
      },
    });
  }

  confirmToggleUser(user: User, action: 'activate' | 'deactivate') {
    this.targetUser.set(user);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetUser.set(null);
    this.targetAction.set(null);
  }

  executeToggle(): void {
    const user = this.targetUser();
    const action = this.targetAction();

    if (!user || !action) return;

    this.changeStatus(user);

    this.closeToggleConfirmation();
  }

  changeStatus(row: User) {
    this.usersService
      .changeUserStatus(row.id)
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al cambiar estado del usuario');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Usuario cambiado de estado correctamente');
        this.loadUsers();
      });
  }

  onCsvSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;
    if (file.type !== 'text/csv') return;

    const formData = new FormData();
    formData.append('archivo_csv', file);

    this.usersService
      .createUsersByCsv(formData)
      .pipe(
        catchError((e) => {
          console.error('Error uploading CSV:', e);
          this.toastrService.error('Error al subir el archivo CSV');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        input.value = '';
        this.toastrService.success('Usuarios cargados correctamente');
        this.paginationState.resetToFirstPage();
        this.loadUsers();
      });
  }

  onDownloadTemplate(): void {
    downloadTemplate('users-template.csv');
  }

  updateCreateFormName(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.createForm.update((f) => ({ ...f, username: value }));
  }

  updateCreateFormEmail(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.createForm.update((f) => ({ ...f, email: value }));
  }

  updateCreateFormPassword(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.createForm.update((f) => ({ ...f, password: value }));
  }

  updateCreateFormRole(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.createForm.update((f) => ({ ...f, role: target.value as UserRole }));
  }

  toggleCreateModuleAccess(mod: AppModuleName, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.createForm.update((f) => ({
      ...f,
      moduleAccess: checked
        ? [...f.moduleAccess, mod]
        : f.moduleAccess.filter((m) => m !== mod),
    }));
  }

  toggleEditModuleAccess(mod: AppModuleName, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.editForm.update((f) => ({
      ...f,
      moduleAccess: checked
        ? [...f.moduleAccess, mod]
        : f.moduleAccess.filter((m) => m !== mod),
    }));
  }

  updateEditName(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.editForm.update((f) => ({ ...f, username: value }));
  }

  updateEditEmail(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.editForm.update((f) => ({ ...f, email: value }));
  }

  updateEditRole(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.editForm.update((f) => ({ ...f, role: target.value as UserRole }));
  }

  updateFilterActive(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    let isActive: boolean | undefined;

    if (value === '') {
      isActive = undefined;
    } else if (value === 'true') {
      isActive = true;
    } else if (value === 'false') {
      isActive = false;
    }

    this.filters.update((f) => ({ ...f, isActive }));
    this.paginationState.resetToFirstPage();
    this.loadUsers();
  }
}
