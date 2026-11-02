import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { Reverends } from '../../admin/reverends/services/reverends';
import { IconsService } from '../../core/services/icons.service';
import { CleanUrlPipe } from '../../core/pipes/clean-url.pipe';
import { PadreRole } from '../../core/models/reverend.model';
import { createSearchState } from '../../shared/utils/search.util';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../shared/components/pagination/pagination';

interface DeaconSearchRouteData {
  role: PadreRole;
  title: string;
  subtitle: string;
}

/** `/directorio/diaconos/permanentes` y `/directorio/diaconos/transitorios`, parametrizadas
 * por `role` via datos de ruta (mismo componente, igual que `ContentPage` con `slug`). */
@Component({
  selector: 'app-deacon-search',
  imports: [
    CommonModule,
    LucideAngularModule,
    CleanUrlPipe,
    EmptyState,
    PaginationComponent,
    RouterModule,
  ],
  templateUrl: './deacon-search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeaconSearch implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  protected readonly reverendsService = inject(Reverends);
  protected readonly iconsService = inject(IconsService);

  readonly loading = signal(false);
  readonly pageTitle = signal('');
  readonly pageSubtitle = signal('');
  private role: PadreRole = 'diacono_permanente';

  private readonly paginationState = createPaginationState(this.reverendsService.totalReverends, {
    onChange: () => this.loadDeacons(),
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
      this.loadDeacons();
    },
  });

  private readonly searchLastNameState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadDeacons();
    },
  });

  readonly searchName = this.searchNameState.searchTerm;
  readonly searchLastName = this.searchLastNameState.searchTerm;

  updateNameSearch = (e: Event) => this.searchNameState.updateSearch(e);
  updateLastNameSearch = (e: Event) => this.searchLastNameState.updateSearch(e);

  ngOnInit(): void {
    const data = this.route.snapshot.data as DeaconSearchRouteData;
    this.role = data.role;
    this.pageTitle.set(data.title);
    this.pageSubtitle.set(data.subtitle);
    this.title.setTitle(`${data.title} - Diócesis de Ciudad Obregón`);
    this.loadDeacons();
  }

  loadDeacons(): void {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.reverendsService
      .getPadresPaginated(offset, limit, {
        firstName: this.searchName(),
        lastName: this.searchLastName(),
        isActive: true,
        role: this.role,
      })
      .subscribe({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false),
      });
  }
}
