import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { TitleComponent } from '../../shared/components/title/title';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { IconsService } from '../../core/services/icons.service';
import { Document } from './services/document';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DOCUMENT_TYPE_LABELS, Documento, DocumentType } from '../../core/models/document.model';
import { DocumentForm, Mode } from '../../shared/models/common.models';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { createSearchState } from '../../shared/utils/search.util';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-documents',
  imports: [
    CommonModule,
    TitleComponent,
    PaginationComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './documents.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);
  protected readonly documentsService = inject(Document);
  private readonly sanitizer = inject(DomSanitizer);

  readonly confirmingToggle = signal(false);
  readonly targetDocument = signal<Documento | null>(null);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);
  readonly filters = signal<{ type?: DocumentType; isActive?: boolean }>({});

  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);
  readonly documentPreview = signal<SafeUrl | null>(null);
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string | null>(null);

  readonly createForm = signal<DocumentForm>({
    title: '',
    tags: '',
    type: '' as DocumentType,
  });

  private readonly paginationState = createPaginationState(this.documentsService.totalDocuments, {
    onChange: () => this.loadDocuments(),
  });

  private readonly searchTitleState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadDocuments();
    },
  });

  private readonly searchTagsState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadDocuments();
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
  readonly searchTags = this.searchTagsState.searchTerm;

  updateTitleSearch = (e: Event) => this.searchTitleState.updateSearch(e);
  updateTagsSearch = (e: Event) => this.searchTagsState.updateSearch(e);

  readonly activeFilterValue = computed(() => {
    const isActive = this.filters().isActive;
    if (isActive === undefined) return '';
    return isActive ? 'true' : 'false';
  });

  readonly documentTypeFilterValue = computed(() => {
    const docType = this.filters().type;
    if (docType === undefined) return '';
    return docType;
  });

  readonly modalTitle = computed(() => {
    const currentMode = this.mode();
    if (currentMode === 'create') return 'Crear Documento';
    if (currentMode === 'edit') return 'Editar Documento';
    return '';
  });

  readonly isCreateFormValid = computed(() => {
    const f = this.createForm();

    return f.title.trim() !== '' && f.type.trim() !== '' && f.tags.trim() !== '';
  });

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Activar documento' : 'Desactivar documento',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'activar' : 'desactivar';
    return `¿Seguro que quieres ${action} "${this.targetDocument()?.title}"?`;
  });

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.documentsService
      .getDocumentosPaginated(offset, limit, {
        title: this.searchTitle(),
        tags: this.searchTags(),
        type: this.filters().type,
        isActive: this.filters().isActive,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.toastrService.error('Error al cargar los documentos', 'Error');
          this.loading.set(false);
        },
      });
  }

  openCreateDocument() {
    this.mode.set('create');
    this.createForm.set({
      title: '',
      type: '' as DocumentType,
      tags: '',
    });
  }

  openEditDocument(row: Documento) {
    this.mode.set('edit');
    this.createForm.set({
      title: row.title,
      type: row.type,
      tags: row.tags.join(', '),
    });

    this.targetDocument.set(row);
  }

  closeModal() {
    this.mode.set(null);
    this.resetCreateForm();
    this.selectedFile.set(null);
    this.selectedFileName.set(null);

    const documentInput = document.getElementById('document') as HTMLInputElement | null;
    if (documentInput) {
      documentInput.value = '';
    }
  }

  confirmToggleDocument(document: Documento, action: 'activate' | 'deactivate') {
    this.targetDocument.set(document);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetDocument.set(null);
    this.targetAction.set(null);
  }

  executeToggle(): void {
    const document = this.targetDocument();
    const action = this.targetAction();

    if (!document || !action) return;

    if (action === 'activate') this.activateDocument(document);
    else this.deleteDocument(document);

    this.closeToggleConfirmation();
  }

  activateDocument(row: Documento) {
    this.documentsService
      .activateDocumento(row.id)
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al activar documento');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Documento activado correctamente', 'Éxito');
        this.loadDocuments();
      });
  }

  deleteDocument(row: Documento) {
    this.documentsService
      .deleteDocumento(row.id)
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al desactivar documento');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Documento desactivado correctamente', 'Éxito');
        this.loadDocuments();
      });
  }

  save() {
    if (!this.isCreateFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    const { title, tags, type } = this.createForm();

    const file = this.selectedFile();

    const formData = new FormData();

    formData.append('title', title);
    formData.append('type', type);
    ``;
    const tagsList = tags.split(',').map((tag) => tag.trim());
    formData.append('tags', JSON.stringify(tagsList));

    if (file !== null) formData.append('document', file);

    this.saving.set(true);

    const action =
      this.mode() === 'create'
        ? this.documentsService.createDocumento(formData)
        : this.documentsService.updateDocumento(this.targetDocument()?.id!, formData);

    action.subscribe({
      next: () => {
        this.toastrService.success('Documento creado correctamente', 'Éxito');
        this.closeModal();
        this.loadDocuments();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar documento', 'Error');
        this.saving.set(false);
      },
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
    this.loadDocuments();
  }

  updateFilterDocumentType(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    this.filters.update((f) => ({ ...f, type: value as DocumentType }));
    this.paginationState.resetToFirstPage();
    this.loadDocuments();
  }

  updateCreateFormField(field: keyof DocumentForm, e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.createForm.update((f) => ({ ...f, [field]: value }));
  }

  onDocumentUpload(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.selectedFileName.set(file.name);

    try {
      const objectUrl = URL.createObjectURL(file);
      this.documentPreview.set(this.sanitizer.bypassSecurityTrustUrl(objectUrl));
    } catch (error) {
      console.error('Error al generar la URL de vista previa:', error);
      this.documentPreview.set(null);
    }
  }

  documentTypeTransformation(type: DocumentType): string {
    return DOCUMENT_TYPE_LABELS[type] || type;
  }

  private resetCreateForm() {
    this.createForm.set({
      title: '',
      type: '' as DocumentType,
      tags: '',
    });
  }
}
