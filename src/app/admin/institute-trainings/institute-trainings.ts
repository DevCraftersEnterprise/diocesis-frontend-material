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
import { Capacitacion, INSTITUTE_MODALITIES } from '../../core/models/institute-training.model';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { TitleComponent } from '../../shared/components/title/title';
import { Mode, TrainingForm } from '../../shared/models/common.models';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { createSearchState } from '../../shared/utils/search.util';
import { InstituteTrainingsService } from './services/institute-trainings';

const MODALITY_LABELS: Record<Capacitacion['modality'], string> = {
  presencial: 'Presencial',
  en_linea: 'En línea',
  mixta: 'Mixta',
};

@Component({
  selector: 'app-institute-trainings',
  imports: [
    CommonModule,
    TitleComponent,
    PaginationComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './institute-trainings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstituteTrainingsComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);
  protected readonly trainingsService = inject(InstituteTrainingsService);

  readonly modalities = INSTITUTE_MODALITIES;
  readonly modalityLabels = MODALITY_LABELS;

  readonly confirmingToggle = signal(false);
  readonly targetTraining = signal<Capacitacion | null>(null);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);
  readonly filters = signal<{ isActive?: boolean }>({});

  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);

  readonly createForm = signal<TrainingForm>({
    name: '',
    description: '',
    modality: 'presencial',
  });

  private readonly paginationState = createPaginationState(this.trainingsService.totalTrainings, {
    onChange: () => this.loadTrainings(),
  });

  private readonly searchState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadTrainings();
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
    if (currentMode === 'create') return 'Crear Capacitación';
    if (currentMode === 'edit') return 'Editar Capacitación';
    return '';
  });

  readonly isCreateFormValid = computed(() => {
    const f = this.createForm();
    return f.name.trim() !== '' && f.description.trim() !== '';
  });

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Activar capacitación' : 'Desactivar capacitación',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'activar' : 'desactivar';
    return `¿Seguro que quieres ${action} "${this.targetTraining()?.name}"?`;
  });

  ngOnInit(): void {
    this.loadTrainings();
  }

  loadTrainings() {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.trainingsService
      .getCapacitacionesPaginated(offset, limit, {
        name: this.search() || undefined,
        isActive: this.filters().isActive,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.toastrService.error('Error al cargar las capacitaciones', 'Error');
          this.loading.set(false);
        },
      });
  }

  openCreateTraining() {
    this.mode.set('create');
    this.createForm.set({ name: '', description: '', modality: 'presencial' });
  }

  openEditTraining(training: Capacitacion) {
    this.mode.set('edit');
    this.targetTraining.set(training);
    this.createForm.set({
      name: training.name,
      description: training.description,
      modality: training.modality,
    });
  }

  confirmToggleTraining(training: Capacitacion, action: 'activate' | 'deactivate') {
    this.targetTraining.set(training);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetTraining.set(null);
    this.targetAction.set(null);
  }

  executeToggle(): void {
    const training = this.targetTraining();
    const action = this.targetAction();

    if (!training || !action) return;

    this.changeStatus();

    this.closeToggleConfirmation();
  }

  closeModal() {
    this.mode.set(null);
    this.createForm.set({ name: '', description: '', modality: 'presencial' });
  }

  save() {
    if (!this.isCreateFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    const payload: Partial<Capacitacion> = { ...this.createForm() };

    this.saving.set(true);

    const action =
      this.mode() === 'create'
        ? this.trainingsService.createCapacitacion(payload)
        : this.trainingsService.updateCapacitacion(this.targetTraining()!.id, payload);

    action.subscribe({
      next: () => {
        const msg =
          this.mode() === 'create'
            ? 'Capacitación creada correctamente'
            : 'Capacitación actualizada correctamente';

        this.toastrService.success(msg, 'Éxito');
        this.closeModal();
        this.loadTrainings();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar la capacitación', 'Error');
        this.saving.set(false);
      },
    });
  }

  changeStatus() {
    const action =
      this.targetAction() === 'activate'
        ? this.trainingsService.activateCapacitacion(this.targetTraining()?.id!)
        : this.trainingsService.deleteCapacitacion(this.targetTraining()?.id!);

    action
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al cambiar estado de la capacitación');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Capacitación cambiada de estado correctamente');
        this.loadTrainings();
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
    this.loadTrainings();
  }

  updateCreateFormField(field: keyof TrainingForm, e: Event) {
    const value = (e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    this.createForm.update((f) => ({ ...f, [field]: value }));
  }
}
