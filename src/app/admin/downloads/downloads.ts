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
import { Descarga, formatFileSize } from '../../core/models/descarga.model';
import { IconsService } from '../../core/services/icons.service';
import { DescargaForm, Mode } from '../../shared/models/common.models';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { TitleComponent } from '../../shared/components/title/title';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { createSearchState } from '../../shared/utils/search.util';
import { DescargasService } from './services/descargas';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-downloads',
  imports: [
    CommonModule,
    TitleComponent,
    PaginationComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './downloads.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadsComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);
  protected readonly downloadsService = inject(DescargasService);

  protected readonly formatFileSize = formatFileSize;

  readonly confirmingToggle = signal(false);
  readonly targetDownload = signal<Descarga | null>(null);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);
  readonly filters = signal<{ isActive?: boolean }>({});

  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly selectedFileName = signal<string | null>(null);

  readonly createForm = signal<DescargaForm>({
    title: '',
    description: '',
    publishedAt: todayIso(),
  });

  private readonly paginationState = createPaginationState(this.downloadsService.totalDownloads, {
    onChange: () => this.loadDownloads(),
  });

  private readonly searchTitleState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadDownloads();
    },
  });

  readonly pagination = this.paginationState.pagination;
  readonly pageFrom = this.paginationState.pageFrom;
  readonly pageTo = this.paginationState.pageTo;
  readonly canPrev = this.paginationState.canPrev;
  readonly canNext = this.paginationState.canNext;

  prevPage = () => this.paginationState.prevPage();
  nextPage = () => this.paginationState.nextPage();
  changeLimit = (e: Event) => this.paginationState.changeLimit(e);

  readonly searchTitle = this.searchTitleState.searchTerm;
  updateTitleSearch = (e: Event) => this.searchTitleState.updateSearch(e);

  readonly activeFilterValue = computed(() => {
    const isActive = this.filters().isActive;
    if (isActive === undefined) return '';
    return isActive ? 'true' : 'false';
  });

  readonly modalTitle = computed(() => {
    const currentMode = this.mode();
    if (currentMode === 'create') return 'Crear Descarga';
    if (currentMode === 'edit') return 'Editar Descarga';
    return '';
  });

  readonly isCreateFormValid = computed(() => {
    const f = this.createForm();
    const requiresFile = this.mode() === 'create';
    return (
      f.title.trim() !== '' &&
      f.description.trim() !== '' &&
      f.publishedAt.trim() !== '' &&
      (!requiresFile || this.selectedFile() !== null)
    );
  });

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Activar descarga' : 'Desactivar descarga',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'activar' : 'desactivar';
    return `¿Seguro que quieres ${action} "${this.targetDownload()?.title}"?`;
  });

  ngOnInit(): void {
    this.loadDownloads();
  }

  loadDownloads() {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.downloadsService
      .getDescargasPaginated(offset, limit, {
        title: this.searchTitle(),
        isActive: this.filters().isActive,
      })
      .subscribe({
        next: () => this.loading.set(false),
        error: () => {
          this.toastrService.error('Error al cargar las descargas', 'Error');
          this.loading.set(false);
        },
      });
  }

  openCreateDownload() {
    this.mode.set('create');
    this.createForm.set({ title: '', description: '', publishedAt: todayIso() });
  }

  openEditDownload(row: Descarga) {
    this.mode.set('edit');
    this.createForm.set({
      title: row.title,
      description: row.description,
      publishedAt: row.publishedAt,
    });
    this.targetDownload.set(row);
  }

  closeModal() {
    this.mode.set(null);
    this.targetDownload.set(null);
    this.selectedFile.set(null);
    this.selectedFileName.set(null);

    const fileInput = document.getElementById('descarga-file') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  }

  confirmToggleDownload(row: Descarga, action: 'activate' | 'deactivate') {
    this.targetDownload.set(row);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetDownload.set(null);
    this.targetAction.set(null);
  }

  executeToggle(): void {
    const row = this.targetDownload();
    const action = this.targetAction();
    if (!row || !action) return;

    if (action === 'activate') this.activateDownload(row);
    else this.deleteDownload(row);

    this.closeToggleConfirmation();
  }

  activateDownload(row: Descarga) {
    this.downloadsService
      .activateDescarga(row.id)
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al activar la descarga');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Descarga activada correctamente', 'Éxito');
        this.loadDownloads();
      });
  }

  deleteDownload(row: Descarga) {
    this.downloadsService
      .deleteDescarga(row.id)
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al desactivar la descarga');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Descarga desactivada correctamente', 'Éxito');
        this.loadDownloads();
      });
  }

  save() {
    if (!this.isCreateFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    const { title, description, publishedAt } = this.createForm();
    const file = this.selectedFile();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('publishedAt', publishedAt);
    if (file !== null) formData.append('file', file);

    this.saving.set(true);

    const action =
      this.mode() === 'create'
        ? this.downloadsService.createDescarga(formData)
        : this.downloadsService.updateDescarga(this.targetDownload()?.id!, formData);

    action.subscribe({
      next: () => {
        this.toastrService.success('Descarga guardada correctamente', 'Éxito');
        this.closeModal();
        this.loadDownloads();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar la descarga', 'Error');
        this.saving.set(false);
      },
    });
  }

  updateFilterActive(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const isActive = value === '' ? undefined : value === 'true';
    this.filters.update((f) => ({ ...f, isActive }));
    this.paginationState.resetToFirstPage();
    this.loadDownloads();
  }

  updateCreateFormField(field: keyof DescargaForm, e: Event) {
    const value = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.createForm.update((f) => ({ ...f, [field]: value }));
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.selectedFileName.set(file.name);
  }
}
