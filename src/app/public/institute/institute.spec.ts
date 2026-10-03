import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { of } from 'rxjs';
import { Institute } from './institute';
import { InstituteInformationService } from '../../admin/institute-information/services/institute-information';
import { InstituteCoursesService } from '../../admin/institute-courses/services/institute-courses';
import { InstituteEventsService } from '../../admin/institute-events/services/institute-events';
import { InstituteTrainingsService } from '../../admin/institute-trainings/services/institute-trainings';
import { InstituteVenuesService } from '../../admin/institute-venues/services/institute-venues';
import { Curso } from '../../core/models/institute-course.model';
import { Evento } from '../../core/models/institute-event.model';
import { InstitutoInformacion } from '../../core/models/institute-information.model';
import { Capacitacion } from '../../core/models/institute-training.model';
import { Sede } from '../../core/models/institute-venue.model';

const row: InstitutoInformacion = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Instituto Biblico — Instituto del Sagrado Corazón de Jesús',
  description: 'Formacion biblica para toda la Diocesis.',
  contactEmail: 'instituto@example.test',
  contactPhone: '6444151646',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedBy: null,
};

const training: Capacitacion = {
  id: 't1',
  name: 'Biblia I',
  description: 'Introduccion al Antiguo Testamento.',
  modality: 'presencial',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  deletedBy: null,
};

const course: Curso = {
  id: 'c1',
  title: 'Curso de Biblia',
  description: 'Curso activo de introduccion.',
  modality: 'en_linea',
  capacitacionId: 't1',
  startDate: '2026-02-01',
  endDate: '2026-06-01',
  meetingLink: 'https://meet.example.test/curso',
  picture: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  deletedBy: null,
};

const venue: Sede = {
  id: 'v1',
  name: 'Sede Centro',
  address: 'Calle 1',
  mapsUrl: 'https://maps.example.test/sede-centro',
  picture: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  deletedBy: null,
};

const event: Evento = {
  id: 'e1',
  title: 'Inscripciones abiertas',
  description: 'Descripcion del evento.',
  type: 'inscripcion',
  startDate: '2026-02-01',
  endDate: null,
  cursoId: null,
  sedeId: 'v1',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  deletedBy: null,
};

describe('Institute (pagina publica)', () => {
  let fixture: ComponentFixture<Institute>;
  let serviceStub: jasmine.SpyObj<InstituteInformationService>;
  let trainingsStub: jasmine.SpyObj<InstituteTrainingsService>;
  let coursesStub: jasmine.SpyObj<InstituteCoursesService>;
  let venuesStub: jasmine.SpyObj<InstituteVenuesService>;
  let eventsStub: jasmine.SpyObj<InstituteEventsService>;

  beforeEach(async () => {
    serviceStub = jasmine.createSpyObj<InstituteInformationService>('InstituteInformationService', [
      'getInformation',
    ]);
    serviceStub.getInformation.and.returnValue(of(row));

    trainingsStub = jasmine.createSpyObj<InstituteTrainingsService>('InstituteTrainingsService', [
      'getCapacitacionesPaginated',
    ]);
    (trainingsStub as { trainings: unknown }).trainings = signal([training]);
    trainingsStub.getCapacitacionesPaginated.and.returnValue(
      of({ count: 1, next: null, previous: null, results: [training] }),
    );

    coursesStub = jasmine.createSpyObj<InstituteCoursesService>('InstituteCoursesService', [
      'getCursosPaginated',
    ]);
    (coursesStub as { courses: unknown }).courses = signal([course]);
    coursesStub.getCursosPaginated.and.returnValue(
      of({ count: 1, next: null, previous: null, results: [course] }),
    );

    venuesStub = jasmine.createSpyObj<InstituteVenuesService>('InstituteVenuesService', [
      'getSedesPaginated',
    ]);
    (venuesStub as { venues: unknown }).venues = signal([venue]);
    venuesStub.getSedesPaginated.and.returnValue(
      of({ count: 1, next: null, previous: null, results: [venue] }),
    );

    eventsStub = jasmine.createSpyObj<InstituteEventsService>('InstituteEventsService', [
      'getEventosPaginated',
    ]);
    (eventsStub as { events: unknown }).events = signal([event]);
    eventsStub.getEventosPaginated.and.returnValue(
      of({ count: 1, next: null, previous: null, results: [event] }),
    );

    await TestBed.configureTestingModule({
      imports: [Institute],
      providers: [
        provideZonelessChangeDetection(),
        { provide: InstituteInformationService, useValue: serviceStub },
        { provide: InstituteTrainingsService, useValue: trainingsStub },
        { provide: InstituteCoursesService, useValue: coursesStub },
        { provide: InstituteVenuesService, useValue: venuesStub },
        { provide: InstituteEventsService, useValue: eventsStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Institute);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('carga y muestra el nombre/descripcion publicos', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Instituto Biblico');
    expect(text).toContain('Formacion biblica para toda la Diocesis.');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('muestra el correo y telefono de contacto como enlaces', () => {
    const el: HTMLElement = fixture.nativeElement;
    const mailLink = el.querySelector('a[href^="mailto:"]');
    const telLink = el.querySelector('a[href^="tel:"]');
    expect(mailLink?.textContent?.trim()).toBe('instituto@example.test');
    expect(telLink?.textContent?.trim()).toBe('6444151646');
  });

  it('muestra la oferta de capacitacion y los cursos activos', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Biblia I');
    expect(text).toContain('Curso de Biblia');
  });

  it('muestra las sedes y monta el widget de calendario con los eventos', () => {
    const el: HTMLElement = fixture.nativeElement;
    const text = el.textContent ?? '';
    expect(text).toContain('Sede Centro');
    expect(el.querySelector('full-calendar')).not.toBeNull();
  });
});
