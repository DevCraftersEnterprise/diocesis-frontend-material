import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY } from 'rxjs';
import {
  DIAS_SEMANA,
  etiquetasModalidades,
  IsmaCurso,
  IsmaCursoForm,
  IsmaModalidad,
} from '../../core/models/isma-curso.model';
import { Parroquia } from '../../core/models/parish.model';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { TitleComponent } from '../../shared/components/title/title';
import { Mode } from '../../shared/models/common.models';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { Parish } from '../parishes/services/parish';
import { IsmaCursosService } from './services/isma-cursos';

const EMPTY_FORM: IsmaCursoForm = {
  parroquiaId: '',
  startDate: '',
  endDate: '',
  diaSemana: null,
  horaInicio: '',
  horaFin: '',
  modalidades: ['presencial'],
  telefonoInformes: '',
  notas: '',
};

/** Espejo de la validacion del backend para dar retroalimentacion antes de enviar. */
export function validarCurso(f: IsmaCursoForm): string | null {
  if (!f.parroquiaId) return 'Selecciona una parroquia.';
  if (f.modalidades.length === 0) return 'Selecciona al menos una modalidad.';
  if (!f.startDate || !f.endDate) return 'Indica fecha de inicio y de fin.';
  if (f.endDate < f.startDate) return 'La fecha de fin no puede ser anterior a la de inicio.';
  const tieneHorario = f.horaInicio !== '' || f.horaFin !== '';
  if (tieneHorario && f.diaSemana === null) {
    return 'Indica el día de la semana cuando capturas horario.';
  }
  if (f.diaSemana !== null && (!f.horaInicio || !f.horaFin)) {
    return 'Con día de la semana se requieren hora de inicio y de fin.';
  }
  if (f.horaInicio && f.horaFin && f.horaFin <= f.horaInicio) {
    return 'La hora de fin debe ser posterior a la de inicio.';
  }
  return null;
}

@Component({
  selector: 'app-isma-cursos',
  imports: [
    CommonModule,
    TitleComponent,
    PaginationComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './isma-cursos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsmaCursosComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);
  protected readonly cursosService = inject(IsmaCursosService);
  private readonly parishService = inject(Parish);

  readonly diasSemana = DIAS_SEMANA;
  readonly etiquetas = etiquetasModalidades;
  readonly parroquias = signal<Parroquia[]>([]);
  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);
  readonly targetCurso = signal<IsmaCurso | null>(null);
  readonly confirmingToggle = signal(false);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);
  readonly isActiveFilter = signal<boolean | undefined>(undefined);
  readonly form = signal<IsmaCursoForm>({ ...EMPTY_FORM });

  private readonly paginationState = createPaginationState(this.cursosService.totalCursos, {
    onChange: () => this.loadCursos(),
  });

  readonly pagination = this.paginationState.pagination;
  readonly pageFrom = this.paginationState.pageFrom;
  readonly pageTo = this.paginationState.pageTo;
  readonly canPrev = this.paginationState.canPrev;
  readonly canNext = this.paginationState.canNext;

  prevPage = () => this.paginationState.prevPage();
  nextPage = () => this.paginationState.nextPage();
  changeLimit = (e: Event) => this.paginationState.changeLimit(e);

  readonly activeFilterValue = computed(() => {
    const v = this.isActiveFilter();
    return v === undefined ? '' : v ? 'true' : 'false';
  });

  readonly modalTitle = computed(() =>
    this.mode() === 'create' ? 'Crear curso' : this.mode() === 'edit' ? 'Editar curso' : '',
  );

  readonly formError = computed(() => validarCurso(this.form()));

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Habilitar curso' : 'Deshabilitar curso',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'habilitar' : 'deshabilitar';
    return `¿Seguro que quieres ${action} el curso de "${this.targetCurso()?.parroquia.name}"?`;
  });

  ngOnInit(): void {
    this.loadParroquias();
    this.loadCursos();
  }

  private loadParroquias(): void {
    this.parishService.getParroquiasPaginated(0, 100, { isActive: true }).subscribe({
      next: (res) => this.parroquias.set(res.results),
      error: () => this.toastrService.error('Error al cargar las parroquias', 'Error'),
    });
  }

  loadCursos(): void {
    this.loading.set(true);
    const { limit, offset } = this.pagination();
    const isActive = this.isActiveFilter();
    this.cursosService
      .getGestionPaginated(offset, limit, {
        isActive: isActive === undefined ? '' : String(isActive),
      })
      .subscribe({
        next: () => this.loading.set(false),
        error: () => {
          this.toastrService.error('Error al cargar los cursos', 'Error');
          this.loading.set(false);
        },
      });
  }

  updateFilterActive(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.isActiveFilter.set(value === '' ? undefined : value === 'true');
    this.paginationState.resetToFirstPage();
    this.loadCursos();
  }

  openCreate(): void {
    this.mode.set('create');
    this.targetCurso.set(null);
    this.form.set({ ...EMPTY_FORM });
  }

  openEdit(item: IsmaCurso): void {
    this.mode.set('edit');
    this.targetCurso.set(item);
    this.form.set({
      parroquiaId: item.parroquia.id,
      startDate: item.startDate,
      endDate: item.endDate,
      diaSemana: item.diaSemana,
      horaInicio: item.horaInicio ?? '',
      horaFin: item.horaFin ?? '',
      modalidades: [...item.modalidades],
      telefonoInformes: item.telefonoInformes ?? '',
      notas: item.notas ?? '',
    });
  }

  closeModal(): void {
    this.mode.set(null);
    this.targetCurso.set(null);
    this.form.set({ ...EMPTY_FORM });
  }

  updateField(
    field:
      | 'parroquiaId'
      | 'startDate'
      | 'endDate'
      | 'horaInicio'
      | 'horaFin'
      | 'telefonoInformes'
      | 'notas',
    e: Event,
  ): void {
    const value = (e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  updateDia(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    this.form.update((f) => ({ ...f, diaSemana: value === '' ? null : Number(value) }));
  }

  toggleModalidad(modalidad: IsmaModalidad, e: Event): void {
    const marcada = (e.target as HTMLInputElement).checked;
    this.form.update((f) => {
      const sin = f.modalidades.filter((m) => m !== modalidad);
      return { ...f, modalidades: marcada ? [...sin, modalidad] : sin };
    });
  }

  save(): void {
    const error = this.formError();
    if (error) {
      this.toastrService.warning(error, 'Formulario inválido');
      return;
    }
    const f = this.form();
    const payload = {
      parroquiaId: f.parroquiaId,
      startDate: f.startDate,
      endDate: f.endDate,
      diaSemana: f.diaSemana,
      horaInicio: f.horaInicio || null,
      horaFin: f.horaFin || null,
      modalidades: f.modalidades,
      telefonoInformes: f.telefonoInformes.trim() === '' ? null : f.telefonoInformes.trim(),
      notas: f.notas.trim() === '' ? null : f.notas.trim(),
    };

    this.saving.set(true);
    const request =
      this.mode() === 'create'
        ? this.cursosService.createCurso(payload)
        : this.cursosService.updateCurso(this.targetCurso()!.id, payload);

    request.subscribe({
      next: () => {
        this.toastrService.success(
          this.mode() === 'create' ? 'Curso creado correctamente' : 'Curso actualizado correctamente',
          'Éxito',
        );
        this.closeModal();
        this.loadCursos();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar el curso', 'Error');
        this.saving.set(false);
      },
    });
  }

  confirmToggle(item: IsmaCurso, action: 'activate' | 'deactivate'): void {
    this.targetCurso.set(item);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetCurso.set(null);
    this.targetAction.set(null);
  }

  executeToggle(): void {
    const item = this.targetCurso();
    const action = this.targetAction();
    if (!item || !action) return;

    const request =
      action === 'activate'
        ? this.cursosService.activateCurso(item.id)
        : this.cursosService.deleteCurso(item.id);

    request
      .pipe(
        catchError(() => {
          this.toastrService.error('Error al cambiar el estado del curso');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Estado del curso actualizado correctamente');
        this.loadCursos();
      });
    this.closeToggleConfirmation();
  }

  horarioLabel(c: IsmaCurso): string {
    if (c.diaSemana === null) return 'Sin horario de sesiones';
    return `${DIAS_SEMANA[c.diaSemana]} ${c.horaInicio}–${c.horaFin}`;
  }
}
