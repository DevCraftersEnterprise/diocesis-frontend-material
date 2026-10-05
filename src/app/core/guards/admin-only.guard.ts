import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { Auth } from '../../public/login/services/auth';

/**
 * Solo `admin` y `super` entran a la gestion de usuarios. Un usuario con acceso a un
 * modulo (Instituto Biblico / ISMA) se redirige a la primera pagina de ese modulo, en vez
 * de pedirle datos que el backend le niega.
 */
export const adminOnlyGuard: CanActivateFn = (): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const auth = inject(Auth);
  const router = inject(Router);

  const decide = (user: User): boolean | UrlTree => {
    if (user.role === 'admin' || user.role === 'super') return true;
    const acceso = user.moduleAccess ?? [];
    if (acceso.includes('instituto-biblico')) return router.createUrlTree(['/dashboard/institute/information']);
    if (acceso.includes('isma')) return router.createUrlTree(['/dashboard/isma/information']);
    return router.createUrlTree(['/login']);
  };

  const cached = auth.user();
  if (cached) return decide(cached);

  const userId = auth.getUserIdFromToken();
  if (!userId) return router.createUrlTree(['/login']);

  return auth.loadProfile(userId).pipe(
    map(decide),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
