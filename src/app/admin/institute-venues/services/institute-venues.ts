import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Sede } from '../../../core/models/institute-venue.model';
import { fetchAllPages } from '../../../shared/utils/fetch-all-pages.util';

@Injectable({
  providedIn: 'root',
})
export class InstituteVenuesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/instituto-biblico/sedes`;

  readonly venues = signal<Sede[]>([]);
  readonly totalVenues = signal<number>(0);

  getSedesPaginated(page: number, limit: number, filters: Record<string, any> = {}) {
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
        results: Sede[];
      }>(`${this.apiUrl}/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.venues.set(Array.isArray(res.results) ? res.results : []);
          this.totalVenues.set(res.count);
        }),
      );
  }

  /** Trae TODAS las sedes (no una pagina), usado por selects de admin. */
  getAllSedes(filters: Record<string, any> = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    return fetchAllPages<Sede>(this.http, `${this.apiUrl}/`, params).pipe(
      tap((results) => {
        this.venues.set(results);
        this.totalVenues.set(results.length);
      }),
    );
  }

  createSede(data: FormData) {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  activateSede(id: string) {
    return this.http.post(`${this.apiUrl}/habilitar/${id}/`, {});
  }

  updateSede(id: string, data: FormData) {
    return this.http.put(`${this.apiUrl}/${id}/`, data);
  }

  deleteSede(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
