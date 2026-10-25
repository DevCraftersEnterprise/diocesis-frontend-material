import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fetchAllPages } from './fetch-all-pages.util';

/** El util arma la query a mano en el string de la URL (no via HttpParams), asi que
 * `req.request.params` queda vacio: hay que leer `urlWithParams`. */
function queryParam(urlWithParams: string, key: string): string | null {
  return new URL(urlWithParams, 'http://test.local').searchParams.get(key);
}

describe('fetchAllPages', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('con una sola pagina (count <= 100): pide una vez y devuelve esos resultados', () => {
    let result: unknown[] = [];
    fetchAllPages<{ id: number }>(http, '/api/colonias', new URLSearchParams()).subscribe(
      (res) => (result = res),
    );

    const req = httpMock.expectOne(
      (r) =>
        r.urlWithParams.startsWith('/api/colonias') && queryParam(r.urlWithParams, 'page') === '1',
    );
    expect(queryParam(req.request.urlWithParams, 'page_size')).toBe('100');
    req.flush({ count: 5, results: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }] });

    expect(result.length).toBe(5);
  });

  it('con mas de 100 filas (p. ej. 150): pide pagina 1 y 2, y concatena todo', () => {
    let result: { id: number }[] = [];
    fetchAllPages<{ id: number }>(http, '/api/colonias', new URLSearchParams()).subscribe(
      (res) => (result = res),
    );

    const req1 = httpMock.expectOne((r) => queryParam(r.urlWithParams, 'page') === '1');
    req1.flush({
      count: 150,
      results: Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })),
    });

    const req2 = httpMock.expectOne((r) => queryParam(r.urlWithParams, 'page') === '2');
    expect(queryParam(req2.request.urlWithParams, 'page_size')).toBe('100');
    req2.flush({
      count: 150,
      results: Array.from({ length: 50 }, (_, i) => ({ id: i + 101 })),
    });

    expect(result.length).toBe(150);
    expect(result[0]).toEqual({ id: 1 });
    expect(result[149]).toEqual({ id: 150 });
  });

  it('conserva los filtros adicionales en cada pagina', () => {
    const params = new URLSearchParams({ isActive: 'true' });
    fetchAllPages(http, '/api/colonias', params).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        queryParam(r.urlWithParams, 'isActive') === 'true' &&
        queryParam(r.urlWithParams, 'page') === '1',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ count: 0, results: [] });
  });
});
