import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaginaContenidoService } from '../../admin/pages/services/pagina-contenido';
import { PaginaContenido, PaginaImagen } from '../../core/models/pagina-contenido.model';
import { CleanUrlPipe } from '../../core/pipes/clean-url.pipe';
import { LoadingState } from '../../shared/components/loading-state/loading-state';
import { ModalComponent } from '../../shared/components/modal/modal';

/**
 * Página pública genérica para el catalogo fijo de `PaginaContenido` (menus que antes
 * mostraban "En construcción"). El slug viene de `data.slug` en la ruta (ver
 * `app.routes.ts`). Reutiliza `PaginaContenidoService` del admin — mismo patron que
 * `Isma`/`Institute` con sus servicios de informacion general.
 */
@Component({
  selector: 'app-content-page',
  imports: [CommonModule, CleanUrlPipe, LoadingState, ModalComponent],
  templateUrl: './content-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly pagesService = inject(PaginaContenidoService);

  private readonly slug = (this.route.snapshot.data['slug'] as string | undefined) ?? '';

  readonly page = signal<PaginaContenido | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly lightboxImage = signal<PaginaImagen | null>(null);

  ngOnInit(): void {
    this.pagesService.get(this.slug).subscribe({
      next: (page) => {
        this.page.set(page);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  openLightbox(image: PaginaImagen): void {
    this.lightboxImage.set(image);
  }

  closeLightbox(): void {
    this.lightboxImage.set(null);
  }
}
