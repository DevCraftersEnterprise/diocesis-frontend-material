import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AppModuleName, User } from '../models/user.model';
import { Auth } from '../../public/login/services/auth';

/**
 * Igual que el `ModuleAccessGuard` del backend (`docs/instituto-biblico-isma.md` §4):
 * `admin`/`super` pasan siempre; un `user` pasa solo si `moduleAccess` incluye el
 * modulo exigido. Se usa por ruta — `canActivate: [moduleAccessGuard('instituto-biblico')]`
 * — en las rutas admin de Instituto Biblico/ISMA, nunca en las 9 existentes.
 *
 * `Auth.user` solo se carga en `ngOnInit` del layout admin; si aun no esta poblado
 * (navegacion directa a la URL), este guard lo carga el mismo antes de decidir.
 */
export function moduleAccessGuard(mod: AppModuleName): CanActivateFn {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);

    const cached = auth.user();
    if (cached) return hasAccess(cached, mod) || router.createUrlTree(['/dashboard']);

    const userId = auth.getUserIdFromToken();
    if (!userId) return router.createUrlTree(['/login']);

    return auth.loadProfile(userId).pipe(
      map((user) => hasAccess(user, mod) || router.createUrlTree(['/dashboard'])),
      catchError(() => of(router.createUrlTree(['/login']))),
    );
  };
}

function hasAccess(user: User, mod: AppModuleName): boolean {
  if (user.role === 'admin' || user.role === 'super') return true;
  return (user.moduleAccess ?? []).includes(mod);
}
