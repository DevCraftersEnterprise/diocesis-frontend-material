import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PaginaContenidoService } from '../../admin/pages/services/pagina-contenido';
import { PaginaContenido } from '../../core/models/pagina-contenido.model';
import { ContentPage } from './content-page';

const page = (over: Partial<PaginaContenido> = {}): PaginaContenido => ({
  id: 'p1',
  slug: 'historia',
  title: 'Historia',
  body: '<p>Texto de la página.</p>',
  updatedAt: '2026-01-01T00:00:00.000Z',
  images: [],
  ...over,
});

describe('ContentPage', () => {
  let service: jasmine.SpyObj<PaginaContenidoService>;

  async function createFixture(): Promise<ComponentFixture<ContentPage>> {
    await TestBed.configureTestingModule({
      imports: [ContentPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PaginaContenidoService, useValue: service },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { slug: 'historia' } } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ContentPage);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    service = jasmine.createSpyObj<PaginaContenidoService>('PaginaContenidoService', ['get']);
  });

  it('muestra el titulo y el cuerpo de la pagina', async () => {
    service.get.and.returnValue(of(page()));
    const fixture = await createFixture();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Historia');
    expect(text).toContain('Texto de la página.');
  });

  it('sin body: muestra un mensaje amable en vez de una pagina vacia', async () => {
    service.get.and.returnValue(of(page({ body: '' })));
    const fixture = await createFixture();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Pronto publicaremos el contenido');
  });

  it('con galeria: muestra una foto por cada imagen', async () => {
    service.get.and.returnValue(
      of(
        page({
          images: [
            { id: 'i1', url: 'https://x/1.jpg', caption: 'Foto 1', order: 0 },
            { id: 'i2', url: 'https://x/2.jpg', caption: null, order: 1 },
          ],
        }),
      ),
    );
    const fixture = await createFixture();

    const imgs = (fixture.nativeElement as HTMLElement).querySelectorAll('button img');
    expect(imgs.length).toBe(2);
  });

  it('abre y cierra el lightbox al hacer clic en una foto', async () => {
    service.get.and.returnValue(
      of(page({ images: [{ id: 'i1', url: 'https://x/1.jpg', caption: 'Foto 1', order: 0 }] })),
    );
    const fixture = await createFixture();

    expect(fixture.componentInstance.lightboxImage()).toBeNull();
    fixture.componentInstance.openLightbox({ id: 'i1', url: 'https://x/1.jpg', caption: 'Foto 1', order: 0 });
    expect(fixture.componentInstance.lightboxImage()?.id).toBe('i1');

    fixture.componentInstance.closeLightbox();
    expect(fixture.componentInstance.lightboxImage()).toBeNull();
  });

  it('slug inexistente: muestra "No se encontró esta página"', async () => {
    service.get.and.returnValue(throwError(() => new Error('404')));
    const fixture = await createFixture();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No se encontró esta página');
  });
});
