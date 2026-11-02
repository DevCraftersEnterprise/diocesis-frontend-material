import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY } from 'rxjs';
import { EnlaceMultimedia } from '../../core/models/enlace-multimedia.model';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { TitleComponent } from '../../shared/components/title/title';
import { MultimediaForm, Mode } from '../../shared/models/common.models';
import { MultimediaService } from './services/multimedia';

/**
 * `/dashboard/multimedia`. Sin paginacion (igual que el backend: `GET /multimedia/`
 * devuelve un arreglo plano) — es una lista corta con orden manual, no un listado
 * que crezca sin limite.
 */
@Component({
  selector: 'app-multimedia',
  imports: [
    CommonModule,
    TitleComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './multimedia.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultimediaComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);
  protected readonly multimediaService = inject(MultimediaService);

  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);

  readonly confirmingToggle = signal(false);
  readonly targetLink = signal<EnlaceMultimedia | null>(null);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);

  readonly createForm = signal<MultimediaForm>({ title: '', description: '', url: '' });

  readonly activeLinks = computed(() =>
    this.multimediaService.links().filter((l) => l.isActive),
  );

  readonly modalTitle = computed(() => {
    const currentMode = this.mode();
    if (currentMode === 'create') return 'Crear Enlace';
    if (currentMode === 'edit') return 'Editar Enlace';
    return '';
  });

  readonly isCreateFormValid = computed(() => {
    const f = this.createForm();
    return f.title.trim() !== '' && f.description.trim() !== '' && f.url.trim() !== '';
  });

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Activar enlace' : 'Desactivar enlace',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'activar' : 'desactivar';
    return `¿Seguro que quieres ${action} "${this.targetLink()?.title}"?`;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.multimediaService.listAdmin().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.toastrService.error('Error al cargar los enlaces', 'Error');
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.mode.set('create');
    this.createForm.set({ title: '', description: '', url: '' });
  }

  openEdit(row: EnlaceMultimedia): void {
    this.mode.set('edit');
    this.targetLink.set(row);
    this.createForm.set({ title: row.title, description: row.description, url: row.url });
  }

  closeModal(): void {
    this.mode.set(null);
    this.targetLink.set(null);
  }

  updateField(field: keyof MultimediaForm, e: Event): void {
    const value = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.createForm.update((f) => ({ ...f, [field]: value }));
  }

  save(): void {
    if (!this.isCreateFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    this.saving.set(true);
    const action =
      this.mode() === 'create'
        ? this.multimediaService.create(this.createForm())
        : this.multimediaService.update(this.targetLink()!.id, this.createForm());

    action.subscribe({
      next: () => {
        this.toastrService.success('Enlace guardado correctamente', 'Éxito');
        this.closeModal();
        this.load();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar el enlace', 'Error');
        this.saving.set(false);
      },
    });
  }

  confirmToggle(row: EnlaceMultimedia, action: 'activate' | 'deactivate'): void {
    this.targetLink.set(row);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetLink.set(null);
    this.targetAction.set(null);
  }

  executeToggle(): void {
    const row = this.targetLink();
    const action = this.targetAction();
    if (!row || !action) return;

    const request =
      action === 'activate'
        ? this.multimediaService.activate(row.id)
        : this.multimediaService.delete(row.id);

    request
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al cambiar el estado del enlace');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Enlace actualizado correctamente');
        this.load();
      });

    this.closeToggleConfirmation();
  }

  moveLink(index: number, direction: -1 | 1): void {
    const links = this.activeLinks();
    const target = index + direction;
    if (target < 0 || target >= links.length) return;

    const reordered = [...links];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    this.multimediaService.reorder(reordered.map((l) => l.id)).subscribe({
      next: () => this.load(),
      error: () => {
        this.toastrService.error('No se pudo reordenar');
        this.load();
      },
    });
  }
}
