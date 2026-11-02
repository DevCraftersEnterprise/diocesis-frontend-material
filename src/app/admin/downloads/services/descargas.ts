import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Descarga } from '../../../core/models/descarga.model';

@Injectable({
  providedIn: 'root',
})
export class DescargasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/descargas`;

  readonly downloads = signal<Descarga[]>([]);
  readonly totalDownloads = signal<number>(0);

  getDescargasPaginated(page: number, limit: number, filters: Record<string, any> = {}) {
    const params = new URLSearchParams({
      page: (page / limit + 1).toString(),
      page_size: limit.toString(),
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    return this.http
      .get<{
        count: number;
        next: string | null;
        previous: string | null;
        results: Descarga[];
      }>(`${this.apiUrl}/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.downloads.set(Array.isArray(res.results) ? res.results : []);
          this.totalDownloads.set(res.count);
        }),
      );
  }

  getDescargaById(id: string) {
    return this.http.get<Descarga>(`${this.apiUrl}/${id}/`);
  }

  createDescarga(data: FormData) {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  activateDescarga(id: string) {
    return this.http.post(`${this.apiUrl}/habilitar/${id}/`, {});
  }

  updateDescarga(id: string, data: FormData) {
    return this.http.put(`${this.apiUrl}/${id}/`, data);
  }

  deleteDescarga(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
