import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Curso } from '../../../core/models/institute-course.model';

@Injectable({
  providedIn: 'root',
})
export class InstituteCoursesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/instituto-biblico/cursos`;

  readonly courses = signal<Curso[]>([]);
  readonly totalCourses = signal<number>(0);

  getCursosPaginated(page: number, limit: number, filters: Record<string, any> = {}) {
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
        results: Curso[];
      }>(`${this.apiUrl}/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.courses.set(Array.isArray(res.results) ? res.results : []);
          this.totalCourses.set(res.count);
        }),
      );
  }

  createCurso(data: FormData) {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  activateCurso(id: string) {
    return this.http.post(`${this.apiUrl}/habilitar/${id}/`, {});
  }

  updateCurso(id: string, data: FormData) {
    return this.http.put(`${this.apiUrl}/${id}/`, data);
  }

  deleteCurso(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
