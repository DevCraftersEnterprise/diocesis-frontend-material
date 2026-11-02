import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { TitleComponent } from '../../shared/components/title/title';
import { IconsService } from '../../core/services/icons.service';
import { PaginaContenidoService } from './services/pagina-contenido';

/**
 * `/dashboard/paginas` — listado del catalogo fijo de 10 paginas de contenido
 * (menus que antes mostraban "En construccion"). Sin crear/borrar: solo se edita
 * cada una (titulo, cuerpo con editor enriquecido y galeria de fotos).
 */
@Component({
  selector: 'app-pagina-contenido-list',
  imports: [CommonModule, RouterLink, LucideAngularModule, TitleComponent],
  templateUrl: './pagina-contenido-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaContenidoListComponent implements OnInit {
  protected readonly pagesService = inject(PaginaContenidoService);
  protected readonly iconsService = inject(IconsService);
  private readonly toastr = inject(ToastrService);

  readonly loading = signal(true);

  ngOnInit(): void {
    this.pagesService.listAdmin().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.toastr.error('No se pudieron cargar las páginas.');
      },
    });
  }
}
