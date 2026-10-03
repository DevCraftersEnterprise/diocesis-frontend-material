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
import { CasoEspecial } from '../../core/models/isma-special-case.model';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { TitleComponent } from '../../shared/components/title/title';
import { Mode, SpecialCaseForm } from '../../shared/models/common.models';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { createSearchState } from '../../shared/utils/search.util';
import { IsmaSpecialCasesService } from './services/isma-special-cases';

const EMPTY_FORM: SpecialCaseForm = {
  title: '',
  order: 1,
  requisitosAdicionales: '',
  documentosAdicionales: '',
  excepciones: '',
  contacto: '',
};

@Component({
  selector: 'app-isma-special-cases',
  imports: [
    CommonModule,
    TitleComponent,
    PaginationComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './isma-special-cases.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsmaSpecialCasesComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);
  protected readonly specialCasesService = inject(IsmaSpecialCasesService);

  readonly confirmingToggle = signal(false);
  readonly targetCase = signal<CasoEspecial | null>(null);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);
  readonly filters = signal<{ isActive?: boolean }>({});

  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);

  readonly createForm = signal<SpecialCaseForm>({ ...EMPTY_FORM });

  private readonly paginationState = createPaginationState(
    this.specialCasesService.totalSpecialCases,
    { onChange: () => this.loadSpecialCases() },
  );

  private readonly searchState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadSpecialCases();
    },
  });

  readonly pagination = this.paginationState.pagination;
  readonly pageFrom = this.paginationState.pageFrom;
  readonly pageTo = this.paginationState.pageTo;
  readonly canPrev = this.paginationState.canPrev;
  readonly canNext = this.paginationState.canNext;

  readonly search = this.searchState.searchTerm;

  prevPage = () => this.paginationState.prevPage();
  nextPage = () => this.paginationState.nextPage();
  changeLimit = (e: Event) => this.paginationState.changeLimit(e);
  updateSearch = (e: Event) => this.searchState.updateSearch(e);

  readonly activeFilterValue = computed(() => {
    const isActive = this.filters().isActive;
    if (isActive === undefined) return '';
    return isActive ? 'true' : 'false';
  });

  readonly modalTitle = computed(() => {
    const currentMode = this.mode();
    if (currentMode === 'create') return 'Crear Caso Especial';
    if (currentMode === 'edit') return 'Editar Caso Especial';
    return '';
  });

  readonly isCreateFormValid = computed(() => {
    const f = this.createForm();
    return f.title.trim() !== '' && f.requisitosAdicionales.trim() !== '' && f.order >= 1;
  });

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Activar caso especial' : 'Desactivar caso especial',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'activar' : 'desactivar';
    return `¿Seguro que quieres ${action} "${this.targetCase()?.title}"?`;
  });

  ngOnInit(): void {
    this.loadSpecialCases();
  }

  loadSpecialCases() {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.specialCasesService
      .getCasosEspecialesPaginated(offset, limit, {
        title: this.search() || undefined,
        isActive: this.filters().isActive,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.toastrService.error('Error al cargar los casos especiales', 'Error');
          this.loading.set(false);
        },
      });
  }

  openCreateCase() {
    this.mode.set('create');
    this.createForm.set({ ...EMPTY_FORM });
  }

  openEditCase(item: CasoEspecial) {
    this.mode.set('edit');
    this.targetCase.set(item);
    this.createForm.set({
      title: item.title,
      order: item.order,
      requisitosAdicionales: item.requisitosAdicionales,
      documentosAdicionales: item.documentosAdicionales ?? '',
      excepciones: item.excepciones ?? '',
      contacto: item.contacto ?? '',
    });
  }

  confirmToggleCase(item: CasoEspecial, action: 'activate' | 'deactivate') {
    this.targetCase.set(item);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetCase.set(null);
    this.targetAction.set(null);
  }

  executeToggle(): void {
    const item = this.targetCase();
    const action = this.targetAction();

    if (!item || !action) return;

    this.changeStatus();

    this.closeToggleConfirmation();
  }

  closeModal() {
    this.mode.set(null);
    this.createForm.set({ ...EMPTY_FORM });
  }

  save() {
    if (!this.isCreateFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    const { title, order, requisitosAdicionales, documentosAdicionales, excepciones, contacto } =
      this.createForm();

    const payload: Partial<CasoEspecial> = {
      title,
      order,
      requisitosAdicionales,
      documentosAdicionales: documentosAdicionales.trim() === '' ? null : documentosAdicionales,
      excepciones: excepciones.trim() === '' ? null : excepciones,
      contacto: contacto.trim() === '' ? null : contacto,
    };

    this.saving.set(true);

    const action =
      this.mode() === 'create'
        ? this.specialCasesService.createCasoEspecial(payload)
        : this.specialCasesService.updateCasoEspecial(this.targetCase()!.id, payload);

    action.subscribe({
      next: () => {
        const msg =
          this.mode() === 'create'
            ? 'Caso especial creado correctamente'
            : 'Caso especial actualizado correctamente';

        this.toastrService.success(msg, 'Éxito');
        this.closeModal();
        this.loadSpecialCases();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar el caso especial', 'Error');
        this.saving.set(false);
      },
    });
  }

  changeStatus() {
    const action =
      this.targetAction() === 'activate'
        ? this.specialCasesService.activateCasoEspecial(this.targetCase()?.id!)
        : this.specialCasesService.deleteCasoEspecial(this.targetCase()?.id!);

    action
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al cambiar estado del caso especial');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Caso especial cambiado de estado correctamente');
        this.loadSpecialCases();
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
    this.loadSpecialCases();
  }

  updateCreateFormField(field: Exclude<keyof SpecialCaseForm, 'order'>, e: Event): void {
    const value = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.createForm.update((f) => ({ ...f, [field]: value }));
  }

  updateCreateFormOrder(e: Event): void {
    const value = Number((e.target as HTMLInputElement).value);
    this.createForm.update((f) => ({ ...f, order: Number.isFinite(value) ? value : 1 }));
  }
}
