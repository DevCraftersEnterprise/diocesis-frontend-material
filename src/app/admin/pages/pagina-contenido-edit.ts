import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { QuillEditorFieldComponent } from 'ngx-quill';
import { PaginaContenido, PaginaImagen } from '../../core/models/pagina-contenido.model';
import { CleanUrlPipe } from '../../core/pipes/clean-url.pipe';
import { IconsService } from '../../core/services/icons.service';
import { TitleComponent } from '../../shared/components/title/title';
import { PaginaContenidoService } from './services/pagina-contenido';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

// [styles] de ngx-quill espera un objeto (lo aplica como Object.assign sobre
// HTMLElement.style), no un string CSS — pasar un string hace que itere sus
// caracteres como si fueran claves y truena con "Indexed property setter...".
const QUILL_STYLES = { 'min-height': '220px' };

/**
 * `/dashboard/paginas/:slug` — edicion de una pagina de contenido: titulo, cuerpo
 * (ngx-quill, formato html) y galeria de fotos (subir, pie de foto, reordenar con
 * flechas, eliminar). El slug viene fijo del catalogo del backend (ver
 * PAGINA_CONTENIDO_SLUGS); si no existe, el servicio devuelve 404 y se muestra el
 * mensaje de error.
 */
@Component({
  selector: 'app-pagina-contenido-edit',
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    TitleComponent,
    QuillEditorFieldComponent,
    CleanUrlPipe,
  ],
  templateUrl: './pagina-contenido-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaContenidoEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly pagesService = inject(PaginaContenidoService);
  private readonly toastr = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);

  protected readonly quillModules = QUILL_MODULES;
  protected readonly quillStyles = QUILL_STYLES;

  readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';
  readonly page = signal<PaginaContenido | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly saving = signal(false);

  readonly title = signal('');
  readonly body = signal('');

  readonly newImageCaption = signal('');
  readonly newImageFile = signal<File | null>(null);
  readonly uploadingImage = signal(false);
  readonly editingCaptionId = signal<string | null>(null);
  readonly editingCaptionValue = signal('');

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.pagesService.get(this.slug).subscribe({
      next: (page) => {
        this.page.set(page);
        this.title.set(page.title);
        this.body.set(page.body);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  onTitleChange(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  onBodyChange(value: string | object | null): void {
    this.body.set(typeof value === 'string' ? value : '');
  }

  save(): void {
    this.saving.set(true);
    this.pagesService.update(this.slug, { title: this.title(), body: this.body() }).subscribe({
      next: (page) => {
        this.page.set(page);
        this.saving.set(false);
        this.toastr.success('Página guardada correctamente.');
      },
      error: () => {
        this.saving.set(false);
        this.toastr.error('No se pudo guardar la página.');
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newImageFile.set(input.files?.[0] ?? null);
  }

  addImage(): void {
    const file = this.newImageFile();
    if (!file) return;

    this.uploadingImage.set(true);
    this.pagesService.addImage(this.slug, file, this.newImageCaption()).subscribe({
      next: (image) => {
        this.page.update((p) => (p ? { ...p, images: [...p.images, image] } : p));
        this.newImageFile.set(null);
        this.newImageCaption.set('');
        this.uploadingImage.set(false);
        this.toastr.success('Foto agregada a la galería.');
      },
      error: () => {
        this.uploadingImage.set(false);
        this.toastr.error('No se pudo subir la foto.');
      },
    });
  }

  startEditCaption(image: PaginaImagen): void {
    this.editingCaptionId.set(image.id);
    this.editingCaptionValue.set(image.caption ?? '');
  }

  cancelEditCaption(): void {
    this.editingCaptionId.set(null);
  }

  saveCaption(id: string): void {
    this.pagesService.updateImageCaption(this.slug, id, this.editingCaptionValue()).subscribe({
      next: (updated) => {
        this.page.update((p) =>
          p ? { ...p, images: p.images.map((i) => (i.id === id ? updated : i)) } : p,
        );
        this.editingCaptionId.set(null);
        this.toastr.success('Pie de foto actualizado.');
      },
      error: () => this.toastr.error('No se pudo actualizar el pie de foto.'),
    });
  }

  deleteImage(id: string): void {
    this.pagesService.deleteImage(this.slug, id).subscribe({
      next: () => {
        this.page.update((p) => (p ? { ...p, images: p.images.filter((i) => i.id !== id) } : p));
        this.toastr.success('Foto eliminada.');
      },
      error: () => this.toastr.error('No se pudo eliminar la foto.'),
    });
  }

  moveImage(index: number, direction: -1 | 1): void {
    const page = this.page();
    if (!page) return;
    const target = index + direction;
    if (target < 0 || target >= page.images.length) return;

    const reordered = [...page.images];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    this.page.set({ ...page, images: reordered });

    this.pagesService.reorderImages(this.slug, reordered.map((i) => i.id)).subscribe({
      error: () => {
        this.toastr.error('No se pudo reordenar la galería.');
        this.load();
      },
    });
  }
}
