import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, filter, map, of } from 'rxjs';

interface VersionInfo {
  version: string;
}

const CHECK_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Como es una SPA, Angular Router navega sin recargar la página: si alguien deja una
 * pestaña abierta desde antes de un despliegue, se queda con el JS viejo en memoria
 * aunque el servidor ya tenga la versión nueva (el `no-cache` de `index.html` solo ayuda
 * en la siguiente recarga completa). Este servicio compara `version.json` (generado en
 * cada build por `deploy.yml`, sin hash de contenido y sin caché) contra la versión con
 * la que arrancó la pestaña, y avisa para recargar en vez de que la gente tenga que
 * adivinar que debe borrar el caché manualmente.
 */
@Injectable({ providedIn: 'root' })
export class VersionCheckService {
  private readonly http = inject(HttpClient);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  private bootVersion: string | null = null;
  private notified = false;

  init(): void {
    this.fetchVersion().subscribe((version) => {
      this.bootVersion = version;
    });

    setInterval(() => this.checkForUpdate(), CHECK_INTERVAL_MS);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.checkForUpdate());
  }

  private checkForUpdate(): void {
    if (this.notified || !this.bootVersion) return;

    this.fetchVersion().subscribe((version) => {
      if (version && version !== this.bootVersion) {
        this.notified = true;
        this.showUpdateToast();
      }
    });
  }

  /** `version.json` puede no existir todavía (primer deploy con este cambio) o fallar
   * por red: en ambos casos se ignora en silencio, nunca se muestra el aviso. */
  private fetchVersion() {
    return this.http.get<VersionInfo>(`/version.json?t=${Date.now()}`).pipe(
      map((res) => res.version),
      catchError(() => of(null)),
    );
  }

  private showUpdateToast(): void {
    const toast = this.toastr.info(
      'Haz clic aquí para cargar los cambios.',
      'Hay una nueva versión disponible',
      {
        timeOut: 0,
        extendedTimeOut: 0,
        tapToDismiss: false,
        closeButton: true,
      },
    );
    toast.onTap.subscribe(() => window.location.reload());
  }
}
