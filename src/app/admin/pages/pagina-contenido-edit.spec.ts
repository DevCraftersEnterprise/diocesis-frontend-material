import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { of } from 'rxjs';
import { PaginaContenido } from '../../core/models/pagina-contenido.model';
import { PaginaContenidoEditComponent } from './pagina-contenido-edit';
import { PaginaContenidoService } from './services/pagina-contenido';

const page = (over: Partial<PaginaContenido> = {}): PaginaContenido => ({
  id: 'p1',
  slug: 'historia',
  title: 'Historia',
  body: '<p>Texto inicial.</p>',
  updatedAt: '2026-01-01T00:00:00.000Z',
  images: [],
  ...over,
});

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Prueba de integracion real (Karma + ChromeHeadless, no mocks de DOM): monta el
 * componente completo, incluido <quill-editor-field>, en un navegador de verdad.
 * Quill inicializa su DOM (.ql-toolbar/.ql-editor) de forma asincrona fuera del
 * scheduler de Angular, por eso la espera extra tras whenStable().
 */
describe('PaginaContenidoEditComponent — integracion real de ngx-quill', () => {
  let fixture: ComponentFixture<PaginaContenidoEditComponent>;

  beforeEach(async () => {
    const serviceStub = jasmine.createSpyObj<PaginaContenidoService>('PaginaContenidoService', [
      'get',
      'update',
    ]);
    serviceStub.get.and.returnValue(of(page()));

    await TestBed.configureTestingModule({
      imports: [PaginaContenidoEditComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideToastr(),
        { provide: PaginaContenidoService, useValue: serviceStub },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'historia' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaContenidoEditComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await wait(200);
    fixture.detectChanges();
  });

  it('renderiza el toolbar y el area editable de Quill (prueba que el componente real se instancio)', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('quill-editor-field')).not.toBeNull();
    expect(el.querySelector('.ql-toolbar')).not.toBeNull();
    expect(el.querySelector('.ql-editor')).not.toBeNull();
  });

  it('carga el contenido inicial de la pagina dentro del editor', () => {
    const el: HTMLElement = fixture.nativeElement;
    const editorContent = el.querySelector('.ql-editor')?.innerHTML ?? '';
    expect(editorContent).toContain('Texto inicial');
  });

  it('el boton "bold" del toolbar de Quill esta presente (toolbar configurado via [modules])', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.ql-toolbar .ql-bold')).not.toBeNull();
  });
});
