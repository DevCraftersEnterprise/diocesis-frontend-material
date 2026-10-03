import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IsmaCurso } from '../../../core/models/isma-curso.model';

@Injectable({
  providedIn: 'root',
})
export class IsmaCursosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/isma/cursos`;

  readonly cursos = signal<IsmaCurso[]>([]);
  readonly totalCursos = signal<number>(0);

  getPublicCursos(page: number, limit: number, filters: Record<string, string> = {}) {
    return this.fetchPage(`${this.apiUrl}/`, page, limit, filters).pipe(
      tap((res) => this.cursos.set(Array.isArray(res.results) ? res.results : [])),
    );
  }

  getGestionPaginated(page: number, limit: number, filters: Record<string, string> = {}) {
    return this.fetchPage(`${this.apiUrl}/gestion/`, page, limit, filters).pipe(
      tap((res) => {
        this.cursos.set(Array.isArray(res.results) ? res.results : []);
        this.totalCursos.set(res.count);
      }),
    );
  }

  getCursoPublico(id: string) {
    return this.http.get<IsmaCurso>(`${this.apiUrl}/${id}/`);
  }

  createCurso(data: unknown) {
    return this.http.post(`${this.apiUrl}/gestion/`, data);
  }

  updateCurso(id: string, data: unknown) {
    return this.http.put(`${this.apiUrl}/gestion/${id}/`, data);
  }

  activateCurso(id: string) {
    return this.http.post(`${this.apiUrl}/gestion/habilitar/${id}/`, {});
  }

  deleteCurso(id: string) {
    return this.http.delete(`${this.apiUrl}/gestion/${id}/`);
  }

  private fetchPage(url: string, page: number, limit: number, filters: Record<string, string>) {
    const params = new URLSearchParams({
      page: (page / limit + 1).toString(),
      page_size: limit.toString(),
    });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') params.append(key, value);
    });
    return this.http.get<{ count: number; results: IsmaCurso[] }>(
      `${url}?${params.toString()}`,
    );
  }
}
