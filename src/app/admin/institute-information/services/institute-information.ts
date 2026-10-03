import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InstitutoInformacion } from '../../../core/models/institute-information.model';

/**
 * Recurso "singleton" (Tarea 3.1) — a diferencia de `Newspaper`/`Parish`, no hay lista
 * ni paginacion: una sola fila, `GET`/`PUT` sin `:id`.
 */
@Injectable({ providedIn: 'root' })
export class InstituteInformationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/instituto-biblico/informacion`;

  readonly information = signal<InstitutoInformacion | null>(null);

  getInformation() {
    return this.http
      .get<InstitutoInformacion>(`${this.apiUrl}/`)
      .pipe(tap((res) => this.information.set(res)));
  }

  updateInformation(data: Partial<InstitutoInformacion>) {
    return this.http
      .put<InstitutoInformacion>(`${this.apiUrl}/`, data)
      .pipe(tap((res) => this.information.set(res)));
  }
}
