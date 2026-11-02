import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EnlaceMultimedia } from '../../../core/models/enlace-multimedia.model';

@Injectable({ providedIn: 'root' })
export class MultimediaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/multimedia`;

  readonly links = signal<EnlaceMultimedia[]>([]);

  /** Admin: trae tambien los inactivos (`?all=true`). */
  listAdmin() {
    return this.http
      .get<EnlaceMultimedia[]>(`${this.apiUrl}/?all=true`)
      .pipe(tap((rows) => this.links.set(rows)));
  }

  /** Publico: solo activos, ya ordenados por el backend. */
  listPublic() {
    return this.http
      .get<EnlaceMultimedia[]>(`${this.apiUrl}/`)
      .pipe(tap((rows) => this.links.set(rows)));
  }

  create(data: { title: string; description: string; url: string }) {
    return this.http.post<EnlaceMultimedia>(`${this.apiUrl}/`, data);
  }

  update(id: string, data: Partial<{ title: string; description: string; url: string }>) {
    return this.http.put<EnlaceMultimedia>(`${this.apiUrl}/${id}/`, data);
  }

  activate(id: string) {
    return this.http.post(`${this.apiUrl}/habilitar/${id}/`, {});
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  /** No actualiza `links` directamente: el backend solo devuelve los activos
   * reordenados, y el admin tambien necesita ver los inactivos — el caller decide
   * si recarga la lista completa despues. */
  reorder(order: string[]) {
    return this.http.put<EnlaceMultimedia[]>(`${this.apiUrl}/reordenar/`, { order });
  }
}
