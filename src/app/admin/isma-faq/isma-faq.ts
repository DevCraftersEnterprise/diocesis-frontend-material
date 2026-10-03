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
import { PreguntaFrecuente } from '../../core/models/isma-faq.model';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { TitleComponent } from '../../shared/components/title/title';
import { FaqForm, Mode } from '../../shared/models/common.models';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { IsmaFaqService } from './services/isma-faq';

const EMPTY_FORM: FaqForm = { question: '', answer: '', order: 1 };

@Component({
  selector: 'app-isma-faq',
  imports: [
    CommonModule,
    TitleComponent,
    PaginationComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './isma-faq.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsmaFaqComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);
  protected readonly faqService = inject(IsmaFaqService);

  readonly confirmingToggle = signal(false);
  readonly targetFaq = signal<PreguntaFrecuente | null>(null);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);
  readonly filters = signal<{ isActive?: boolean }>({});

  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);

  readonly createForm = signal<FaqForm>({ ...EMPTY_FORM });

  private readonly paginationState = createPaginationState(this.faqService.totalFaqs, {
    onChange: () => this.loadFaqs(),
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
    const isActive = this.filters().isActive;
    if (isActive === undefined) return '';
    return isActive ? 'true' : 'false';
  });

  readonly modalTitle = computed(() => {
    const currentMode = this.mode();
    if (currentMode === 'create') return 'Crear Pregunta Frecuente';
    if (currentMode === 'edit') return 'Editar Pregunta Frecuente';
    return '';
  });

  readonly isCreateFormValid = computed(() => {
    const f = this.createForm();
    return f.question.trim() !== '' && f.answer.trim() !== '' && f.order >= 1;
  });

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Activar pregunta' : 'Desactivar pregunta',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'activar' : 'desactivar';
    return `¿Seguro que quieres ${action} "${this.targetFaq()?.question}"?`;
  });

  ngOnInit(): void {
    this.loadFaqs();
  }

  loadFaqs() {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.faqService
      .getPreguntasPaginated(offset, limit, {
        isActive: this.filters().isActive,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.toastrService.error('Error al cargar las preguntas frecuentes', 'Error');
          this.loading.set(false);
        },
      });
  }

  openCreateFaq() {
    this.mode.set('create');
    this.createForm.set({ ...EMPTY_FORM });
  }

  openEditFaq(item: PreguntaFrecuente) {
    this.mode.set('edit');
    this.targetFaq.set(item);
    this.createForm.set({
      question: item.question,
      answer: item.answer,
      order: item.order,
    });
  }

  confirmToggleFaq(item: PreguntaFrecuente, action: 'activate' | 'deactivate') {
    this.targetFaq.set(item);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetFaq.set(null);
    this.targetAction.set(null);
  }

  executeToggle(): void {
    const item = this.targetFaq();
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

    const payload: Partial<PreguntaFrecuente> = { ...this.createForm() };

    this.saving.set(true);

    const action =
      this.mode() === 'create'
        ? this.faqService.createPregunta(payload)
        : this.faqService.updatePregunta(this.targetFaq()!.id, payload);

    action.subscribe({
      next: () => {
        const msg =
          this.mode() === 'create'
            ? 'Pregunta creada correctamente'
            : 'Pregunta actualizada correctamente';

        this.toastrService.success(msg, 'Éxito');
        this.closeModal();
        this.loadFaqs();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar la pregunta', 'Error');
        this.saving.set(false);
      },
    });
  }

  changeStatus() {
    const action =
      this.targetAction() === 'activate'
        ? this.faqService.activatePregunta(this.targetFaq()?.id!)
        : this.faqService.deletePregunta(this.targetFaq()?.id!);

    action
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al cambiar estado de la pregunta');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Pregunta cambiada de estado correctamente');
        this.loadFaqs();
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
    this.loadFaqs();
  }

  updateCreateFormField(field: 'question' | 'answer', e: Event): void {
    const value = (e.target as HTMLTextAreaElement).value;
    this.createForm.update((f) => ({ ...f, [field]: value }));
  }

  updateCreateFormOrder(e: Event): void {
    const value = Number((e.target as HTMLInputElement).value);
    this.createForm.update((f) => ({ ...f, order: Number.isFinite(value) ? value : 1 }));
  }
}
