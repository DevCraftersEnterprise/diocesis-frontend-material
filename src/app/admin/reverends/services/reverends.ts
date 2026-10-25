import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Padre } from '../../../core/models/reverend.model';
import { fetchAllPages } from '../../../shared/utils/fetch-all-pages.util';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Reverends {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/padres`;

  readonly reverends = signal<Padre[]>([]);
  readonly totalReverends = signal<number>(0);

  getPadresPaginated(page: number, limit: number, filters: Record<string, any> = {}) {
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
        results: Padre[];
      }>(`${this.apiUrl}/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.reverends.set(Array.isArray(res.results) ? res.results : []);
          this.totalReverends.set(res.count);
        }),
      );
  }

  /** Trae TODOS los padres (no una pagina), usado por el select de parroco en la
   * creacion/edicion de parroquias. Antes de este arreglo quedaba siempre vacio:
   * `res` nunca es un arreglo (es el sobre `{count, results}`), asi que
   * `Array.isArray(res)` era siempre `false` y descartaba los resultados. */
  getAllPadres(filters: Record<string, any> = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    return fetchAllPages<Padre>(this.http, `${this.apiUrl}/`, params).pipe(
      tap((results) => {
        this.reverends.set(results);
        this.totalReverends.set(results.length);
      }),
    );
  }

  getPadreById(id: string) {
    return this.http.get<Padre>(`${this.apiUrl}/${id}/`);
  }

  createPadre(data: FormData) {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  activatePadre(id: string) {
    return this.http.post(`${this.apiUrl}/habilitar/${id}/`, {});
  }

  updatePadre(id: string, data: FormData) {
    return this.http.put(`${this.apiUrl}/${id}/`, data);
  }

  deletePadre(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
