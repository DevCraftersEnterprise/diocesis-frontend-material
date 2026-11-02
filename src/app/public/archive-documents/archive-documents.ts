import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { Document } from '../../admin/documents/services/document';
import { DOCUMENT_TYPE_LABELS, DocumentType } from '../../core/models/document.model';
import { CleanUrlPipe } from '../../core/pipes/clean-url.pipe';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { createSearchState } from '../../shared/utils/search.util';

/**
 * `/archivo/documentos` — vista publica del archivo de documentos oficiales (cartas,
 * circulares, decretos, etc.). Reutiliza el modulo "Documentos" que ya existia en el
 * admin (`Document` service, `GET /documentos/` ya es publico) — no hay entidad nueva,
 * solo faltaba esta pagina.
 */
@Component({
  selector: 'app-archive-documents',
  imports: [CommonModule, LucideAngularModule, CleanUrlPipe, EmptyState, PaginationComponent],
  templateUrl: './archive-documents.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchiveDocuments implements OnInit {
  private readonly title = inject(Title);
  protected readonly iconsService = inject(IconsService);
  protected readonly documentsService = inject(Document);

  protected readonly typeLabels = DOCUMENT_TYPE_LABELS;
  protected readonly types = Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][];

  readonly loading = signal(false);

  private readonly paginationState = createPaginationState(
    this.documentsService.totalDocuments,
    { onChange: () => this.load() },
  );

  readonly pagination = this.paginationState.pagination;
  readonly pageFrom = this.paginationState.pageFrom;
  readonly pageTo = this.paginationState.pageTo;
  readonly canPrev = this.paginationState.canPrev;
  readonly canNext = this.paginationState.canNext;

  prevPage = () => this.paginationState.prevPage();
  nextPage = () => this.paginationState.nextPage();
  changeLimit = (e: Event) => this.paginationState.changeLimit(e);

  private readonly searchTitleState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.load();
    },
  });

  readonly searchTitle = this.searchTitleState.searchTerm;
  updateTitleSearch = (e: Event) => this.searchTitleState.updateSearch(e);

  readonly selectedType = signal<DocumentType | ''>('');

  updateType(event: Event): void {
    this.selectedType.set((event.target as HTMLSelectElement).value as DocumentType | '');
    this.paginationState.resetToFirstPage();
    this.load();
  }

  ngOnInit(): void {
    this.title.setTitle('Documentos - Diócesis de Ciudad Obregón');
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.documentsService
      .getDocumentosPaginated(offset, limit, {
        title: this.searchTitle(),
        type: this.selectedType(),
        isActive: true,
      })
      .subscribe({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false),
      });
  }
}
