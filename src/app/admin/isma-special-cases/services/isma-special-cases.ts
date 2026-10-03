import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CasoEspecial } from '../../../core/models/isma-special-case.model';

@Injectable({
  providedIn: 'root',
})
export class IsmaSpecialCasesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/isma/casos-especiales`;

  readonly specialCases = signal<CasoEspecial[]>([]);
  readonly totalSpecialCases = signal<number>(0);

  getCasosEspecialesPaginated(page: number, limit: number, filters: Record<string, any> = {}) {
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
        results: CasoEspecial[];
      }>(`${this.apiUrl}/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.specialCases.set(Array.isArray(res.results) ? res.results : []);
          this.totalSpecialCases.set(res.count);
        }),
      );
  }

  createCasoEspecial(data: Partial<CasoEspecial>) {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  activateCasoEspecial(id: string) {
    return this.http.post(`${this.apiUrl}/habilitar/${id}/`, {});
  }

  updateCasoEspecial(id: string, data: Partial<CasoEspecial>) {
    return this.http.put(`${this.apiUrl}/${id}/`, data);
  }

  deleteCasoEspecial(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
