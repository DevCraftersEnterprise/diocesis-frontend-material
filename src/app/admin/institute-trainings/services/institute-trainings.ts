import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Capacitacion } from '../../../core/models/institute-training.model';

@Injectable({
  providedIn: 'root',
})
export class InstituteTrainingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/instituto-biblico/capacitaciones`;

  readonly trainings = signal<Capacitacion[]>([]);
  readonly totalTrainings = signal<number>(0);

  getCapacitacionesPaginated(page: number, limit: number, filters: Record<string, any> = {}) {
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
        results: Capacitacion[];
      }>(`${this.apiUrl}/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.trainings.set(Array.isArray(res.results) ? res.results : []);
          this.totalTrainings.set(res.count);
        }),
      );
  }

  getAllCapacitaciones(filters: Record<string, any> = {}) {
    const params = new URLSearchParams();

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
        results: Capacitacion[];
      }>(`${this.apiUrl}/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.trainings.set(Array.isArray(res.results) ? res.results : []);
          this.totalTrainings.set(res.count);
        }),
      );
  }

  createCapacitacion(data: Partial<Capacitacion>) {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  activateCapacitacion(id: string) {
    return this.http.post(`${this.apiUrl}/habilitar/${id}/`, {});
  }

  updateCapacitacion(id: string, data: Partial<Capacitacion>) {
    return this.http.put(`${this.apiUrl}/${id}/`, data);
  }

  deleteCapacitacion(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
