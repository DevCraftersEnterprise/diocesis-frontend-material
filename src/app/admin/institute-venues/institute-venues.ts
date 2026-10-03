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
import { catchError, EMPTY } from 'rxjs';
import { Sede } from '../../core/models/institute-venue.model';
import { CleanUrlPipe } from '../../core/pipes/clean-url.pipe';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { TitleComponent } from '../../shared/components/title/title';
import { Mode, VenueForm } from '../../shared/models/common.models';
import { createPaginationState } from '../../shared/utils/pagination.util';
import { createSearchState } from '../../shared/utils/search.util';
import { InstituteVenuesService } from './services/institute-venues';

const EMPTY_FORM: VenueForm = { name: '', address: '', mapsUrl: '' };

@Component({
  selector: 'app-institute-venues',
  imports: [
    CommonModule,
    TitleComponent,
    PaginationComponent,
    EmptyState,
    ModalComponent,
    LucideAngularModule,
    CleanUrlPipe,
  ],
  templateUrl: './institute-venues.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstituteVenuesComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);
  protected readonly venuesService = inject(InstituteVenuesService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly confirmingToggle = signal(false);
  readonly targetVenue = signal<Sede | null>(null);
  readonly targetAction = signal<'activate' | 'deactivate' | null>(null);
  readonly filters = signal<{ isActive?: boolean }>({});

  readonly loading = signal(false);
  readonly mode = signal<Mode>(null);
  readonly saving = signal(false);
  readonly photoPreview = signal<SafeUrl | null>(null);
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string | null>(null);

  readonly createForm = signal<VenueForm>({ ...EMPTY_FORM });

  private readonly paginationState = createPaginationState(this.venuesService.totalVenues, {
    onChange: () => this.loadVenues(),
  });

  private readonly searchState = createSearchState({
    onSearch: () => {
      this.paginationState.resetToFirstPage();
      this.loadVenues();
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
    if (currentMode === 'create') return 'Crear Sede';
    if (currentMode === 'edit') return 'Editar Sede';
    return '';
  });

  readonly isCreateFormValid = computed(() => {
    const f = this.createForm();
    return f.name.trim() !== '' && f.address.trim() !== '' && f.mapsUrl.trim() !== '';
  });

  readonly toggleConfirmTitle = computed(() =>
    this.targetAction() === 'activate' ? 'Activar sede' : 'Desactivar sede',
  );

  readonly toggleConfirmMessage = computed(() => {
    const action = this.targetAction() === 'activate' ? 'activar' : 'desactivar';
    return `¿Seguro que quieres ${action} "${this.targetVenue()?.name}"?`;
  });

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues() {
    this.loading.set(true);
    const { limit, offset } = this.pagination();

    this.venuesService
      .getSedesPaginated(offset, limit, {
        name: this.search() || undefined,
        isActive: this.filters().isActive,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.toastrService.error('Error al cargar las sedes', 'Error');
          this.loading.set(false);
        },
      });
  }

  openCreateVenue() {
    this.mode.set('create');
    this.createForm.set({ ...EMPTY_FORM });
  }

  openEditVenue(venue: Sede) {
    this.mode.set('edit');
    this.targetVenue.set(venue);
    this.createForm.set({
      name: venue.name,
      address: venue.address,
      mapsUrl: venue.mapsUrl,
    });
  }

  confirmToggleVenue(venue: Sede, action: 'activate' | 'deactivate') {
    this.targetVenue.set(venue);
    this.targetAction.set(action);
    this.confirmingToggle.set(true);
  }

  closeToggleConfirmation(): void {
    this.confirmingToggle.set(false);
    this.targetVenue.set(null);
    this.targetAction.set(null);
  }

  executeToggle(): void {
    const venue = this.targetVenue();
    const action = this.targetAction();

    if (!venue || !action) return;

    this.changeStatus();

    this.closeToggleConfirmation();
  }

  closeModal() {
    this.mode.set(null);
    this.createForm.set({ ...EMPTY_FORM });
    this.photoPreview.set(null);
    this.selectedFile.set(null);
    this.selectedFileName.set(null);

    const photoInput = document.getElementById('venue-photo') as HTMLInputElement | null;
    if (photoInput) {
      photoInput.value = '';
    }
  }

  save() {
    if (!this.isCreateFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    const { name, address, mapsUrl } = this.createForm();
    const file = this.selectedFile();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    formData.append('mapsUrl', mapsUrl);
    if (file !== null) formData.append('picture', file);

    this.saving.set(true);

    const action =
      this.mode() === 'create'
        ? this.venuesService.createSede(formData)
        : this.venuesService.updateSede(this.targetVenue()!.id, formData);

    action.subscribe({
      next: () => {
        const msg =
          this.mode() === 'create' ? 'Sede creada correctamente' : 'Sede actualizada correctamente';

        this.toastrService.success(msg, 'Éxito');
        this.closeModal();
        this.loadVenues();
        this.saving.set(false);
      },
      error: () => {
        this.toastrService.error('Error al guardar la sede', 'Error');
        this.saving.set(false);
      },
    });
  }

  changeStatus() {
    const action =
      this.targetAction() === 'activate'
        ? this.venuesService.activateSede(this.targetVenue()?.id!)
        : this.venuesService.deleteSede(this.targetVenue()?.id!);

    action
      .pipe(
        catchError((e) => {
          console.error(e);
          this.toastrService.error('Error al cambiar estado de la sede');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Sede cambiada de estado correctamente');
        this.loadVenues();
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
    this.loadVenues();
  }

  updateCreateFormField(field: keyof VenueForm, e: Event) {
    const value = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.createForm.update((f) => ({ ...f, [field]: value }));
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
