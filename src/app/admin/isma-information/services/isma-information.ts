import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IsmaInformacion } from '../../../core/models/isma-information.model';

/**
 * Recurso "singleton" (Tarea 6.1) — igual que `InstituteInformationService`: no hay
 * lista ni paginacion, una sola fila, `GET`/`PUT` sin `:id`.
 */
@Injectable({ providedIn: 'root' })
export class IsmaInformationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/isma/informacion`;

  readonly information = signal<IsmaInformacion | null>(null);

  getInformation() {
    return this.http
      .get<IsmaInformacion>(`${this.apiUrl}/`)
      .pipe(tap((res) => this.information.set(res)));
  }

  updateInformation(data: Partial<IsmaInformacion>) {
    return this.http
      .put<IsmaInformacion>(`${this.apiUrl}/`, data)
      .pipe(tap((res) => this.information.set(res)));
  }
}
