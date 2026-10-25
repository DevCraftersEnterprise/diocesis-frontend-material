import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Colonia } from '../../../core/models/colony.model';
import { fetchAllPages } from '../../../shared/utils/fetch-all-pages.util';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Colony {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/colonias`;

  readonly colonies = signal<Colonia[]>([]);
  readonly totalColonies = signal<number>(0);

  getColoniasPaginated(page: number, limit: number, filters: Record<string, any> = {}) {
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
        results: Colonia[];
      }>(`${this.apiUrl}/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.colonies.set(Array.isArray(res.results) ? res.results : []);
          this.totalColonies.set(res.count);
        }),
      );
  }

  /** Trae TODAS las colonias (no una pagina) — usado por el select de la creacion de
   * parroquias. Antes solo pedia sin `page_size`, asi que el backend devolvia su
   * limite por defecto (10) y el select se veia incompleto con ~100 colonias en
   * produccion. */
  getAllColonias(filters: Record<string, any> = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    return fetchAllPages<Colonia>(this.http, `${this.apiUrl}/`, params).pipe(
      tap((results) => {
        this.colonies.set(results);
        this.totalColonies.set(results.length);
      }),
    );
  }

  getColoniaById(id: string) {
    return this.http.get<Colonia>(`${this.apiUrl}/${id}/`);
  }

  createColonia(data: Partial<Colonia>) {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  activateColonia(id: string) {
    return this.http.post(`${this.apiUrl}/habilitar/${id}/`, {});
  }

  updateColonia(id: string, data: Partial<Colonia>) {
    return this.http.put(`${this.apiUrl}/${id}/`, data);
  }

  deleteColonia(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
