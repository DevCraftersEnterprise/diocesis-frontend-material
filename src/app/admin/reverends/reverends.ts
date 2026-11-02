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
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { TitleComponent } from '../../shared/components/title/title';
import { Reverends } from './services/reverends';
import { PADRE_ROLE_LABELS, Padre, PadreRole } from '../../core/models/reverend.model';
import { Mode, ReverendForm } from '../../shared/models/common.models';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { createSearchState } from '../../shared/utils/search.util';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, EMPTY } from 'rxjs';
import { CleanUrlPipe } from '../../core/pipes/clean-url.pipe';

@Component({
  selector: 'app-reverends',
  imports: [
    CommonModule,
    TitleComponent,
    PaginationComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
    CleanUrlPipe,
  ],
  templateUrl: './reverends.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReverendsComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly reverendsService = inject(Reverends);
  protected readonly iconsService = inject(IconsService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly padreRoleLabels = PADRE_ROLE_LABELS;
  protected readonly padreRoles: PadreRole[] = [
    'presbitero',
    'diacono_permanente',
    'diacono_transitorio',
  ];

  readonly confirmingToggle = signal(false);
  readonly targetReverend = signal<Padre | null>(null);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);
  readonly filters = signal<{ isActive?: boolean; role?: PadreRole }>({});

  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string | null>(null);

  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);

  readonly createForm = signal<ReverendForm>({
    firstName: '',
    lastName: '',
    birthDate: '',
    role: 'presbitero',
  });

  private readonly paginationState = createPaginationState(this.reverendsService.totalReverends, {
    onChange: () => this.loadReverends(),
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
    if (currentMode === 'create') return 'Crear Padre';
    if (currentMode === 'edit') return 'Editar Padre';
    return '';
  });

  readonly isCreateFormValid = computed(() => {
    const f = this.createForm();

    return f.firstName.trim() !== '' && f.lastName.trim() !== '' && f.birthDate.trim() !== '';
  });

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Activar padre' : 'Desactivar padre',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'activar' : 'desactivar';
    return `¿Seguro que quieres ${action} a "${this.targetReverend()?.firstName} ${this.targetReverend()?.lastName}"?`;
  });

  private readonly searchNameState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadReverends();
    },
  });

  private readonly searchLastNameState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadReverends();
    },
  });

  readonly searchName = this.searchNameState.searchTerm;
  readonly searchLastName = this.searchLastNameState.searchTerm;

  updateNameSearch = (e: Event) => this.searchNameState.updateSearch(e);
  updateLastNameSearch = (e: Event) => this.searchLastNameState.updateSearch(e);

  readonly activeFilterValue = computed(() => {
    const isActive = this.filters().isActive;
    if (isActive === undefined) return '';
    return isActive ? 'true' : 'false';
  });

  readonly photoPreview = signal<SafeUrl | null>(null);

  ngOnInit(): void {
    this.loadReverends();
  }

  loadReverends() {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.reverendsService
      .getPadresPaginated(offset, limit, {
        firstName: this.searchName(),
        lastName: this.searchLastName(),
        isActive: this.filters().isActive,
        role: this.filters().role,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.toastrService.error('Error al cargar los padres', 'Error');
          this.loading.set(false);
        },
      });
  }

  openCreateReverend() {
    this.mode.set('create');
    this.createForm.set({
      firstName: '',
      lastName: '',
      birthDate: '',
      email: '',
      facebook: '',
      instagram: '',
      twitter: '',
      role: 'presbitero',
      ordinationDate: '',
      phone: '',
      assignedCommunity: '',
    });
  }

  openEditReverend(row: Padre) {
    this.mode.set('edit');
    this.createForm.set({
      firstName: row.firstName,
      lastName: row.lastName,
      birthDate: row.birthDate,
      email: row.email ?? '',
      facebook: row.facebook ?? '',
      instagram: row.instagram ?? '',
      twitter: row.twitter ?? '',
      role: row.role,
      ordinationDate: row.ordinationDate ?? '',
      phone: row.phone ?? '',
      assignedCommunity: row.assignedCommunity ?? '',
    });

    this.targetReverend.set(row);
  }

  closeModal() {
    this.mode.set(null);
    this.resetCreateForm();
    this.photoPreview.set(null); // Reiniciar la vista previa de la foto
    this.selectedFile.set(null); // Reiniciar el archivo seleccionado
    this.selectedFileName.set(null); // Reiniciar el nombre del archivo

    const photoInput = document.getElementById('photo') as HTMLInputElement | null;
    if (photoInput) {
      photoInput.value = ''; // Reiniciar el valor del input de archivo
    }
  }

  confirmToggleReverend(reverend: Padre, action: 'activate' | 'deactivate') {
    this.targetReverend.set(reverend);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetReverend.set(null);
    this.targetAction.set(null);
  }

  save() {
    if (!this.isCreateFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    const {
      firstName,
      lastName,
      birthDate,
      email,
      facebook,
      instagram,
      twitter,
      role,
      ordinationDate,
      phone,
      assignedCommunity,
    } = this.createForm();

    const file = this.selectedFile();

    const formData = new FormData();

    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('birthDate', new Date(birthDate).toISOString().split('T')[0]);
    formData.append('email', email ?? '');
    formData.append('facebook', facebook ?? '');
    formData.append('instagram', instagram ?? '');
    formData.append('twitter', twitter ?? '');
    formData.append('role', role);
    formData.append(
      'ordinationDate',
      ordinationDate ? new Date(ordinationDate).toISOString().split('T')[0] : '',
    );
    formData.append('phone', phone ?? '');
    formData.append('assignedCommunity', assignedCommunity ?? '');

    if (file !== null) formData.append('picture', file);

    this.saving.set(true);

    debugger;

    const action =
      this.mode() === 'create'
        ? this.reverendsService.createPadre(formData)
        : this.reverendsService.updatePadre(this.targetReverend()?.id!, formData);

    action.subscribe({
      next: () => {
        this.toastrService.success('Padre creado correctamente', 'Éxito');
        this.closeModal();
        this.loadReverends();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar padre', 'Error');
        this.saving.set(false);
      },
    });
  }

  executeToggle(): void {
    const reverend = this.targetReverend();
    const action = this.targetAction();

    if (!reverend || !action) return;

    if (action === 'activate') this.activatePadre(reverend);
    else this.deletePadre(reverend);

    this.closeToggleConfirmation();
  }

  activatePadre(row: Padre) {
    this.reverendsService
      .activatePadre(row.id)
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al activar padre');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Padre activado correctamente', 'Éxito');
        this.loadReverends();
      });
  }

  deletePadre(row: Padre) {
    this.reverendsService
      .deletePadre(row.id)
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al desactivar padre');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Padre desactivado correctamente', 'Éxito');
        this.loadReverends();
      });
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
    this.loadReverends();
  }

  updateFilterRole(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const role = (select.value || undefined) as PadreRole | undefined;

    this.filters.update((f) => ({ ...f, role }));
    this.paginationState.resetToFirstPage();
    this.loadReverends();
  }

  onPhotoUpload(event: Event) {
    event.preventDefault(); // Prevenir el comportamiento predeterminado
    event.stopPropagation(); // Prevenir la propagación del evento

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.selectedFileName.set(file.name);

    try {
      const objectUrl = URL.createObjectURL(file);
      this.photoPreview.set(this.sanitizer.bypassSecurityTrustUrl(objectUrl));
    } catch (error) {
      console.error('Error al generar la URL de vista previa:', error);
      this.photoPreview.set(null);
    }
  }

  updateCreateFormField(field: keyof ReverendForm, e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.createForm.update((f) => ({ ...f, [field]: value }));
  }

  private resetCreateForm() {
    this.createForm.set({
      firstName: '',
      lastName: '',
      birthDate: '',
      email: '',
      facebook: '',
      instagram: '',
      twitter: '',
      role: 'presbitero',
      ordinationDate: '',
      phone: '',
      assignedCommunity: '',
    });
  }
}
