import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { DescargasService } from '../../admin/downloads/services/descargas';
import { formatFileSize } from '../../core/models/descarga.model';
import { CleanUrlPipe } from '../../core/pipes/clean-url.pipe';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { createSearchState } from '../../shared/utils/search.util';

/** `/descargas` — reutiliza el servicio DescargasService del admin, igual patron que
 * las demas paginas publicas de listado. */
@Component({
  selector: 'app-downloads-public',
  imports: [CommonModule, LucideAngularModule, CleanUrlPipe, EmptyState, PaginationComponent],
  templateUrl: './downloads.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadsPublic implements OnInit {
  private readonly title = inject(Title);
  protected readonly iconsService = inject(IconsService);
  protected readonly downloadsService = inject(DescargasService);
  protected readonly formatFileSize = formatFileSize;

  readonly loading = signal(false);

  private readonly paginationState = createPaginationState(this.downloadsService.totalDownloads, {
    onChange: () => this.load(),
  });

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

  ngOnInit(): void {
    this.title.setTitle('Descargas - Diócesis de Ciudad Obregón');
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.downloadsService
      .getDescargasPaginated(offset, limit, { title: this.searchTitle(), isActive: true })
      .subscribe({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false),
      });
  }
}
