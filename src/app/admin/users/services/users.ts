import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Users {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  readonly users = signal<User[]>([]);
  readonly totalUsers = signal<number>(0);

  getUsersPaginated(page: number, limit: number, filters: Record<string, any> = {}) {
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
        results: User[];
      }>(`${this.apiUrl}/users/usuarios/?${params.toString()}`)
      .pipe(
        tap((res) => {
          this.users.set(Array.isArray(res.results) ? res.results : []);
          this.totalUsers.set(res.count);
        }),
      );
  }

  createUser(data: Partial<User>) {
    return this.http.post<User>(`${this.apiUrl}/users/usuarios/`, data);
  }

  updateUser(id: string, data: Partial<User>) {
    return this.http.put(`${this.apiUrl}/users/usuarios/${id}/`, data);
  }

  resetPassword(id: string) {
    return this.http.post<{ mensaje: string; password: string }>(
      `${this.apiUrl}/users/usuarios/reset-password/${id}/`,
      {},
    );
  }

  changeUserStatus(id: string) {
    return this.http.put(`${this.apiUrl}/users/usuarios/cambiar-estado/${id}/`, {});
  }

  createUsersByCsv(formData: FormData) {
    return this.http.post<any>(`${this.apiUrl}/users/usuarios/cargar-por-csv/`, formData);
  }
}
