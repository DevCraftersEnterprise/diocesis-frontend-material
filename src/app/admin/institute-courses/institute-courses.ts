import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { catchError, combineLatest, EMPTY } from 'rxjs';
import { Curso } from '../../core/models/institute-course.model';
import { INSTITUTE_MODALITIES } from '../../core/models/institute-training.model';
import { CleanUrlPipe } from '../../core/pipes/clean-url.pipe';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { TitleComponent } from '../../shared/components/title/title';
import { CourseForm, Mode } from '../../shared/models/common.models';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { createSearchState } from '../../shared/utils/search.util';
import { InstituteTrainingsService } from '../institute-trainings/services/institute-trainings';
import { InstituteCoursesService } from './services/institute-courses';

const MODALITY_LABELS: Record<Curso['modality'], string> = {
  presencial: 'Presencial',
  en_linea: 'En línea',
  mixta: 'Mixta',
};

const EMPTY_FORM: CourseForm = {
  title: '',
  description: '',
  modality: 'presencial',
  capacitacionId: '',
  startDate: '',
  endDate: '',
  meetingLink: '',
};

@Component({
  selector: 'app-institute-courses',
  imports: [
    CommonModule,
    TitleComponent,
    PaginationComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
    CleanUrlPipe,
  ],
  templateUrl: './institute-courses.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstituteCoursesComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);
  protected readonly trainingsService = inject(InstituteTrainingsService);
  protected readonly coursesService = inject(InstituteCoursesService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly modalities = INSTITUTE_MODALITIES;
  readonly modalityLabels = MODALITY_LABELS;

  readonly confirmingToggle = signal(false);
  readonly targetCourse = signal<Curso | null>(null);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);
  readonly filters = signal<{ isActive?: boolean }>({});

  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);
  readonly photoPreview = signal<SafeUrl | null>(null);
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string | null>(null);

  readonly createForm = signal<CourseForm>({ ...EMPTY_FORM });

  private readonly paginationState = createPaginationState(this.coursesService.totalCourses, {
    onChange: () => this.loadCourses(),
  });

  private readonly searchState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadCourses();
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
    if (currentMode === 'create') return 'Crear Curso';
    if (currentMode === 'edit') return 'Editar Curso';
    return '';
  });

  readonly isCreateFormValid = computed(() => {
    const f = this.createForm();
    return f.title.trim() !== '' && f.description.trim() !== '';
  });

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Activar curso' : 'Desactivar curso',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'activar' : 'desactivar';
    return `¿Seguro que quieres ${action} "${this.targetCourse()?.title}"?`;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    combineLatest([
      this.trainingsService.getAllCapacitaciones({ isActive: true }),
      this.coursesService.getCursosPaginated(offset, limit, {
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

  loadCourses() {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.coursesService
      .getCursosPaginated(offset, limit, {
        title: this.search() || undefined,
        isActive: this.filters().isActive,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.toastrService.error('Error al cargar los cursos', 'Error');
          this.loading.set(false);
        },
      });
  }

  openCreateCourse() {
    this.mode.set('create');
    this.createForm.set({ ...EMPTY_FORM });
  }

  openEditCourse(course: Curso) {
    this.mode.set('edit');
    this.targetCourse.set(course);
    this.createForm.set({
      title: course.title,
      description: course.description,
      modality: course.modality,
      capacitacionId: course.capacitacionId ?? '',
      startDate: course.startDate ?? '',
      endDate: course.endDate ?? '',
      meetingLink: course.meetingLink ?? '',
    });
  }

  confirmToggleCourse(course: Curso, action: 'activate' | 'deactivate') {
    this.targetCourse.set(course);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetCourse.set(null);
    this.targetAction.set(null);
  }

  executeToggle(): void {
    const course = this.targetCourse();
    const action = this.targetAction();

    if (!course || !action) return;

    this.changeStatus();

    this.closeToggleConfirmation();
  }

  closeModal() {
    this.mode.set(null);
    this.createForm.set({ ...EMPTY_FORM });
    this.photoPreview.set(null);
    this.selectedFile.set(null);
    this.selectedFileName.set(null);

    const photoInput = document.getElementById('course-photo') as HTMLInputElement | null;
    if (photoInput) {
      photoInput.value = '';
    }
  }

  save() {
    if (!this.isCreateFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    const { title, description, modality, capacitacionId, startDate, endDate, meetingLink } =
      this.createForm();

    const file = this.selectedFile();

    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description);
    formData.append('modality', modality);
    if (capacitacionId) formData.append('capacitacionId', capacitacionId);
    if (startDate) formData.append('startDate', startDate);
    if (endDate) formData.append('endDate', endDate);
    if (meetingLink) formData.append('meetingLink', meetingLink);
    if (file !== null) formData.append('picture', file);

    this.saving.set(true);

    const action =
      this.mode() === 'create'
        ? this.coursesService.createCurso(formData)
        : this.coursesService.updateCurso(this.targetCourse()!.id, formData);

    action.subscribe({
      next: () => {
        const msg =
          this.mode() === 'create'
            ? 'Curso creado correctamente'
            : 'Curso actualizado correctamente';

        this.toastrService.success(msg, 'Éxito');
        this.closeModal();
        this.loadCourses();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar el curso', 'Error');
        this.saving.set(false);
      },
    });
  }

  changeStatus() {
    const action =
      this.targetAction() === 'activate'
        ? this.coursesService.activateCurso(this.targetCourse()?.id!)
        : this.coursesService.deleteCurso(this.targetCourse()?.id!);

    action
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al cambiar estado del curso');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Curso cambiado de estado correctamente');
        this.loadCourses();
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
    this.loadCourses();
  }

  updateCreateFormField(field: keyof CourseForm, e: Event) {
    const value = (e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    this.createForm.update((f) => ({ ...f, [field]: value }));
  }

  chargeTrainingRowInfo(id: string | null): string {
    if (!id) return 'Sin capacitación asociada';
    const training = this.trainingsService.trainings().find((t) => t.id === id);
    return training ? training.name : 'Desconocido';
  }

  onPhotoUpload(event: Event) {
    event.preventDefault();
    event.stopPropagation();

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
}
