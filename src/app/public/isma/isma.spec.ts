import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { of } from 'rxjs';
import { Isma } from './isma';
import { IsmaFaqService } from '../../admin/isma-faq/services/isma-faq';
import { IsmaInformationService } from '../../admin/isma-information/services/isma-information';
import { IsmaSpecialCasesService } from '../../admin/isma-special-cases/services/isma-special-cases';
import { PreguntaFrecuente } from '../../core/models/isma-faq.model';
import { IsmaInformacion } from '../../core/models/isma-information.model';
import { CasoEspecial } from '../../core/models/isma-special-case.model';

const row: IsmaInformacion = {
  id: '00000000-0000-0000-0000-000000000002',
  introduccion: 'Introduccion de ISMA.',
  documentacionNecesaria: 'Documentacion necesaria de ISMA.',
  parroquiaCorrespondiente: 'Parroquia correspondiente de ISMA.',
  entrevistaParroco: 'Entrevista con el parroco.',
  programaIsma: 'Programa de ISMA.',
  tiemposAnticipacion: 'Tiempos de anticipacion.',
  contactoTelefono1: '6444151646',
  contactoTelefono2: '6444132098',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedBy: null,
};

const specialCase: CasoEspecial = {
  id: 'c1',
  title: 'Divorciados con nulidad matrimonial',
  order: 1,
  requisitosAdicionales: 'Requisitos adicionales de prueba.',
  documentosAdicionales: null,
  excepciones: null,
  contacto: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  deletedBy: null,
};

const faq: PreguntaFrecuente = {
  id: 'p1',
  question: '¿Pregunta de prueba?',
  answer: 'Respuesta de prueba.',
  order: 1,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  deletedBy: null,
};

describe('Isma (pagina publica)', () => {
  let fixture: ComponentFixture<Isma>;
  let serviceStub: jasmine.SpyObj<IsmaInformationService>;
  let specialCasesStub: jasmine.SpyObj<IsmaSpecialCasesService>;
  let faqStub: jasmine.SpyObj<IsmaFaqService>;

  beforeEach(async () => {
    serviceStub = jasmine.createSpyObj<IsmaInformationService>('IsmaInformationService', [
      'getInformation',
    ]);
    serviceStub.getInformation.and.returnValue(of(row));

    specialCasesStub = jasmine.createSpyObj<IsmaSpecialCasesService>('IsmaSpecialCasesService', [
      'getCasosEspecialesPaginated',
    ]);
    (specialCasesStub as { specialCases: unknown }).specialCases = signal([specialCase]);
    specialCasesStub.getCasosEspecialesPaginated.and.returnValue(
      of({ count: 1, next: null, previous: null, results: [specialCase] }),
    );

    faqStub = jasmine.createSpyObj<IsmaFaqService>('IsmaFaqService', ['getPreguntasPaginated']);
    (faqStub as { faqs: unknown }).faqs = signal([faq]);
    faqStub.getPreguntasPaginated.and.returnValue(
      of({ count: 1, next: null, previous: null, results: [faq] }),
    );

    await TestBed.configureTestingModule({
      imports: [Isma],
      providers: [
        provideZonelessChangeDetection(),
        { provide: IsmaInformationService, useValue: serviceStub },
        { provide: IsmaSpecialCasesService, useValue: specialCasesStub },
        { provide: IsmaFaqService, useValue: faqStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Isma);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('carga y muestra las secciones informativas', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Introduccion de ISMA.');
    expect(text).toContain('Documentacion necesaria de ISMA.');
    expect(text).toContain('Programa de ISMA.');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('muestra los telefonos de contacto como enlaces', () => {
    const el: HTMLElement = fixture.nativeElement;
    const telLinks = el.querySelectorAll('a[href^="tel:"]');
    expect(telLinks.length).toBe(2);
    expect(telLinks[0].textContent?.trim()).toBe('6444151646');
    expect(telLinks[1].textContent?.trim()).toBe('6444132098');
  });

  it('muestra los casos especiales y las preguntas frecuentes como acordeon cerrado', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Divorciados con nulidad matrimonial');
    expect(text).toContain('¿Pregunta de prueba?');
    expect(text).not.toContain('Requisitos adicionales de prueba.');
    expect(text).not.toContain('Respuesta de prueba.');
  });

  it('toggleCase()/toggleFaq() expanden el contenido', async () => {
    fixture.componentInstance.toggleCase('c1');
    fixture.componentInstance.toggleFaq('p1');
    fixture.detectChanges();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Requisitos adicionales de prueba.');
    expect(text).toContain('Respuesta de prueba.');
  });
});
