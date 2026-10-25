import { HttpClient } from '@angular/common/http';
import { map, Observable, of, range } from 'rxjs';
import { concatMap, reduce, switchMap } from 'rxjs/operators';

/** Espejo de `MAX_PAGE_SIZE` en `pagination-query.dto.ts` del backend: el tope duro
 * que respeta cada pagina, sin importar lo que pida el cliente. */
const MAX_PAGE_SIZE = 100;

interface PaginatedEnvelope<T> {
  count: number;
  results: T[];
}

/**
 * Trae TODAS las filas de un endpoint paginado estilo DRF (usado por los selects de
 * admin que necesitan la lista completa, no una pagina: colonias, decanatos,
 * parrocos, etc.). El backend deja `next`/`previous` siempre en `null` por diseño
 * (ver `contract-matrix.md`, el FE nunca los usa), asi que no se puede "seguir el
 * siguiente enlace": hay que calcular cuantas paginas hacen falta a partir de
 * `count` y pedirlas.
 *
 * Pedir una sola pagina de `page_size=100` (el tope del backend) no alcanza si la
 * tabla ya tiene mas de 100 filas — exactamente el bug que esto corrige (colonias
 * rondando el centenar mostraba solo 10 porque no se mandaba `page_size`).
 */
export function fetchAllPages<T>(
  http: HttpClient,
  url: string,
  params: URLSearchParams,
): Observable<T[]> {
  const fetchPage = (page: number): Observable<PaginatedEnvelope<T>> => {
    const pageParams = new URLSearchParams(params);
    pageParams.set('page', String(page));
    pageParams.set('page_size', String(MAX_PAGE_SIZE));
    return http.get<PaginatedEnvelope<T>>(`${url}?${pageParams.toString()}`);
  };

  return fetchPage(1).pipe(
    switchMap((first) => {
      const firstResults = first.results ?? [];
      const totalPages = Math.max(1, Math.ceil(first.count / MAX_PAGE_SIZE));
      if (totalPages <= 1) return of(firstResults);

      return range(2, totalPages - 1).pipe(
        concatMap((page) => fetchPage(page)),
        map((res) => res.results ?? []),
        reduce((acc, chunk) => [...acc, ...chunk], [] as T[]),
        map((restResults) => [...firstResults, ...restResults]),
      );
    }),
  );
}
