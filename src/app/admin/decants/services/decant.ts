import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Decanato } from '../../../core/models/decant.model';
import { fetchAllPages } from '../../../shared/utils/fetch-all-pages.util';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Decant {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/decanatos`;

  readonly decants = signal<Decanato[]>([]);
  readonly totalDecants = signal<number>(0);

  getDecanatosPaginated(page: number, limit: number, filters: Record<string, any> = {}) {
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
        results: Decanato[];
      }>(`${this.apiUrl}/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.decants.set(Array.isArray(res.results) ? res.results : []);
          this.totalDecants.set(res.count);
        }),
      );
  }

  /** Trae TODOS los decanatos (no una pagina), usado por selects de admin. */
  getAllDecanatos(filters: Record<string, any> = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    return fetchAllPages<Decanato>(this.http, `${this.apiUrl}/`, params).pipe(
      tap((results) => {
        this.decants.set(results);
        this.totalDecants.set(results.length);
      }),
    );
  }

  getDecanatoById(id: string) {
    return this.http.get<Decanato>(`${this.apiUrl}/${id}/`);
  }

  createDecanato(data: Partial<Decanato>) {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  activateDecanato(id: string) {
    return this.http.post(`${this.apiUrl}/habilitar/${id}/`, {});
  }

  updateDecanato(id: string, data: Partial<Decanato>) {
    return this.http.put(`${this.apiUrl}/${id}/`, data);
  }

  deleteDecanato(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
