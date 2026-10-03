import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Evento } from '../../../core/models/institute-event.model';

@Injectable({
  providedIn: 'root',
})
export class InstituteEventsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/instituto-biblico/eventos`;

  readonly events = signal<Evento[]>([]);
  readonly totalEvents = signal<number>(0);

  getEventosPaginated(page: number, limit: number, filters: Record<string, any> = {}) {
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
        results: Evento[];
      }>(`${this.apiUrl}/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.events.set(Array.isArray(res.results) ? res.results : []);
          this.totalEvents.set(res.count);
        }),
      );
  }

  createEvento(data: Partial<Evento>) {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  activateEvento(id: string) {
    return this.http.post(`${this.apiUrl}/habilitar/${id}/`, {});
  }

  updateEvento(id: string, data: Partial<Evento>) {
    return this.http.put(`${this.apiUrl}/${id}/`, data);
  }

  deleteEvento(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
