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
import { catchError, combineLatest, EMPTY } from 'rxjs';
import { InstituteCoursesService } from '../institute-courses/services/institute-courses';
import { EVENTO_TYPES, Evento } from '../../core/models/institute-event.model';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { TitleComponent } from '../../shared/components/title/title';
import { EventForm, Mode } from '../../shared/models/common.models';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { createSearchState } from '../../shared/utils/search.util';
import { InstituteVenuesService } from '../institute-venues/services/institute-venues';
import { InstituteEventsService } from './services/institute-events';

const TYPE_LABELS: Record<Evento['type'], string> = {
  inscripcion: 'Inscripción',
  curso: 'Curso',
  actividad: 'Actividad',
};

const EMPTY_FORM: EventForm = {
  title: '',
  description: '',
  type: 'actividad',
  startDate: '',
  endDate: '',
  cursoId: '',
  sedeId: '',
};

@Component({
  selector: 'app-institute-events',
  imports: [
    CommonModule,
    TitleComponent,
    PaginationComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './institute-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstituteEventsComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);
  protected readonly coursesService = inject(InstituteCoursesService);
  protected readonly venuesService = inject(InstituteVenuesService);
  protected readonly eventsService = inject(InstituteEventsService);

  readonly types = EVENTO_TYPES;
  readonly typeLabels = TYPE_LABELS;

  readonly confirmingToggle = signal(false);
  readonly targetEvent = signal<Evento | null>(null);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);
  readonly filters = signal<{ isActive?: boolean }>({});

  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);

  readonly createForm = signal<EventForm>({ ...EMPTY_FORM });

  private readonly paginationState = createPaginationState(this.eventsService.totalEvents, {
    onChange: () => this.loadEvents(),
  });

  private readonly searchState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadEvents();
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
    if (currentMode === 'create') return 'Crear Evento';
    if (currentMode === 'edit') return 'Editar Evento';
    return '';
  });

  readonly isCreateFormValid = computed(() => {
    const f = this.createForm();
    return f.title.trim() !== '' && f.startDate.trim() !== '';
  });

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Activar evento' : 'Desactivar evento',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'activar' : 'desactivar';
    return `¿Seguro que quieres ${action} "${this.targetEvent()?.title}"?`;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    combineLatest([
      this.coursesService.getCursosPaginated(0, 100, { isActive: true }),
      this.venuesService.getAllSedes({ isActive: true }),
      this.eventsService.getEventosPaginated(offset, limit, {
        isActive: this.filters().isActive,
      }),
    ]).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: () => {
        this.toastrService.error(
          'Error al cargar los datos. Por favor, intente nuevamente.',
          'Error',
        );
        this.loading.set(false);
      },
    });
  }

  loadEvents() {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.eventsService
      .getEventosPaginated(offset, limit, {
        isActive: this.filters().isActive,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.toastrService.error('Error al cargar los eventos', 'Error');
          this.loading.set(false);
        },
      });
  }

  openCreateEvent() {
    this.mode.set('create');
    this.createForm.set({ ...EMPTY_FORM });
  }

  openEditEvent(event: Evento) {
    this.mode.set('edit');
    this.targetEvent.set(event);
    this.createForm.set({
      title: event.title,
      description: event.description ?? '',
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate ?? '',
      cursoId: event.cursoId ?? '',
      sedeId: event.sedeId ?? '',
    });
  }

  confirmToggleEvent(event: Evento, action: 'activate' | 'deactivate') {
    this.targetEvent.set(event);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetEvent.set(null);
    this.targetAction.set(null);
  }

  executeToggle(): void {
    const event = this.targetEvent();
    const action = this.targetAction();

    if (!event || !action) return;

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

    const { title, description, type, startDate, endDate, cursoId, sedeId } = this.createForm();

    const payload: Partial<Evento> = {
      title,
      description: description || null,
      type,
      startDate,
      endDate: endDate || null,
      cursoId: cursoId || null,
      sedeId: sedeId || null,
    };

    this.saving.set(true);

    const action =
      this.mode() === 'create'
        ? this.eventsService.createEvento(payload)
        : this.eventsService.updateEvento(this.targetEvent()!.id, payload);

    action.subscribe({
      next: () => {
        const msg =
          this.mode() === 'create'
            ? 'Evento creado correctamente'
            : 'Evento actualizado correctamente';

        this.toastrService.success(msg, 'Éxito');
        this.closeModal();
        this.loadEvents();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar el evento', 'Error');
        this.saving.set(false);
      },
    });
  }

  changeStatus() {
    const action =
      this.targetAction() === 'activate'
        ? this.eventsService.activateEvento(this.targetEvent()?.id!)
        : this.eventsService.deleteEvento(this.targetEvent()?.id!);

    action
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al cambiar estado del evento');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Evento cambiado de estado correctamente');
        this.loadEvents();
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
    this.loadEvents();
  }

  updateCreateFormField(field: keyof EventForm, e: Event) {
    const value = (e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    this.createForm.update((f) => ({ ...f, [field]: value }));
  }

  chargeCourseRowInfo(id: string | null): string {
    if (!id) return '—';
    const course = this.coursesService.courses().find((c) => c.id === id);
    return course ? course.title : 'Desconocido';
  }

  chargeVenueRowInfo(id: string | null): string {
    if (!id) return '—';
    const venue = this.venuesService.venues().find((v) => v.id === id);
    return venue ? venue.name : 'Desconocido';
  }
}
