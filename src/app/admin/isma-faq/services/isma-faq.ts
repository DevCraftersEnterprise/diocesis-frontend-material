import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PreguntaFrecuente } from '../../../core/models/isma-faq.model';

@Injectable({
  providedIn: 'root',
})
export class IsmaFaqService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/isma/preguntas-frecuentes`;

  readonly faqs = signal<PreguntaFrecuente[]>([]);
  readonly totalFaqs = signal<number>(0);

  getPreguntasPaginated(page: number, limit: number, filters: Record<string, any> = {}) {
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
        results: PreguntaFrecuente[];
      }>(`${this.apiUrl}/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.faqs.set(Array.isArray(res.results) ? res.results : []);
          this.totalFaqs.set(res.count);
        }),
      );
  }

  createPregunta(data: Partial<PreguntaFrecuente>) {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  activatePregunta(id: string) {
    return this.http.post(`${this.apiUrl}/habilitar/${id}/`, {});
  }

  updatePregunta(id: string, data: Partial<PreguntaFrecuente>) {
    return this.http.put(`${this.apiUrl}/${id}/`, data);
  }

  deletePregunta(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
