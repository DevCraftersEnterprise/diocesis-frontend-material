import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { Reverends } from '../../admin/reverends/services/reverends';
import { IconsService } from '../../core/services/icons.service';
import { CleanUrlPipe } from '../../core/pipes/clean-url.pipe';
import { createSearchState } from '../../shared/utils/search.util';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'app-reverend-search',
  imports: [
    CommonModule,
    LucideAngularModule,
    CleanUrlPipe,
    EmptyState,
    PaginationComponent,
    RouterModule,
  ],
  templateUrl: './reverend-search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReverendSearch implements OnInit {
  private readonly title = inject(Title);
  protected readonly reverendsService = inject(Reverends);
  protected readonly iconsService = inject(IconsService);

  readonly loading = signal(false);

  private readonly paginationState = createPaginationState(this.reverendsService.totalReverends, {
    onChange: () => this.loadReverends(),
  });

  readonly pagination = this.paginationState.pagination;
  readonly pageFrom = this.paginationState.pageFrom;
  readonly pageTo = this.paginationState.pageTo;
  readonly canPrev = this.paginationState.canPrev;
  readonly canNext = this.paginationState.canNext;

  prevPage = () => this.paginationState.prevPage();
  nextPage = () => this.paginationState.nextPage();
  changeLimit = (e: Event) => this.paginationState.changeLimit(e);

  private readonly searchNameState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadReverends();
    },
  });

  private readonly searchLastNameState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadReverends();
    },
  });

  readonly searchName = this.searchNameState.searchTerm;
  readonly searchLastName = this.searchLastNameState.searchTerm;

  updateNameSearch = (e: Event) => this.searchNameState.updateSearch(e);
  updateLastNameSearch = (e: Event) => this.searchLastNameState.updateSearch(e);

  ngOnInit(): void {
    this.title.setTitle('Presbíteros - Diócesis de Ciudad Obregón');
    this.loadReverends();
  }

  loadReverends() {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.reverendsService
      .getPadresPaginated(offset, limit, {
        firstName: this.searchName(),
        lastName: this.searchLastName(),
        isActive: true, // Solo mostrar padres activos en la vista pública
        role: 'presbitero',
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
