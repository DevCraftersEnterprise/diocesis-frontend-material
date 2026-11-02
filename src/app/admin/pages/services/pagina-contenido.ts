import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PaginaContenido,
  PaginaContenidoListItem,
  PaginaImagen,
} from '../../../core/models/pagina-contenido.model';

@Injectable({ providedIn: 'root' })
export class PaginaContenidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/paginas`;

  readonly pages = signal<PaginaContenidoListItem[]>([]);

  listAdmin() {
    return this.http
      .get<PaginaContenidoListItem[]>(`${this.apiUrl}/`)
      .pipe(tap((rows) => this.pages.set(rows)));
  }

  get(slug: string) {
    return this.http.get<PaginaContenido>(`${this.apiUrl}/${slug}/`);
  }

  update(slug: string, data: { title?: string; body?: string }) {
    return this.http.put<PaginaContenido>(`${this.apiUrl}/${slug}/`, data);
  }

  addImage(slug: string, file: File, caption: string) {
    const formData = new FormData();
    formData.append('picture', file);
    if (caption.trim()) formData.append('caption', caption.trim());
    return this.http.post<PaginaImagen>(`${this.apiUrl}/${slug}/imagenes/`, formData);
  }

  updateImageCaption(slug: string, id: string, caption: string) {
    return this.http.put<PaginaImagen>(`${this.apiUrl}/${slug}/imagenes/${id}/`, { caption });
  }

  deleteImage(slug: string, id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${slug}/imagenes/${id}/`);
  }

  reorderImages(slug: string, order: string[]) {
    return this.http.put<PaginaImagen[]>(`${this.apiUrl}/${slug}/imagenes/reordenar/`, { order });
  }
}
