import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, type WritableSignal } from '@angular/core';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Reverends } from '../../admin/reverends/services/reverends';
import { Padre } from '../../core/models/reverend.model';
import { DeaconSearch } from './deacon-search';

const padre = (over: Partial<Padre> = {}): Padre => ({
  id: 'd1',
  firstName: 'Jose',
  lastName: 'Diaz',
  birthDate: '1980-01-01',
  isActive: true,
  role: 'diacono_permanente',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
  updatedBy: null,
  deletedBy: null,
  ...over,
});

interface ReverendsStub {
  reverends: WritableSignal<Padre[]>;
  totalReverends: WritableSignal<number>;
  getPadresPaginated: jasmine.Spy;
}

describe('DeaconSearch', () => {
  let reverendsService: ReverendsStub;

  async function createFixture(
    role: string,
    title: string,
    subtitle: string,
  ): Promise<ComponentFixture<DeaconSearch>> {
    await TestBed.configureTestingModule({
      imports: [DeaconSearch],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: Reverends, useValue: reverendsService },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { role, title, subtitle } } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DeaconSearch);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    reverendsService = {
      reverends: signal<Padre[]>([]),
      totalReverends: signal<number>(0),
      getPadresPaginated: jasmine.createSpy('getPadresPaginated'),
    };
    reverendsService.getPadresPaginated.and.returnValue(
      of({ count: 0, next: null, previous: null, results: [] }),
    );
  });

  it('pide los padres filtrando por el role de la ruta', async () => {
    await createFixture('diacono_permanente', 'Diáconos Permanentes', 'subt');

    expect(reverendsService.getPadresPaginated).toHaveBeenCalledWith(
      0,
      jasmine.any(Number),
      jasmine.objectContaining({ role: 'diacono_permanente', isActive: true }),
    );
  });

  it('muestra el titulo y subtitulo recibidos por datos de ruta', async () => {
    const fixture = await createFixture(
      'diacono_transitorio',
      'Diáconos Transitorios',
      'Subtitulo de prueba',
    );

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Diáconos Transitorios');
    expect(text).toContain('Subtitulo de prueba');
  });

  it('sin resultados: muestra el estado vacio', async () => {
    const fixture = await createFixture('diacono_permanente', 'Diáconos Permanentes', 'subt');

    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
  });

  it('con resultados: muestra una tarjeta por diacono', async () => {
    reverendsService.reverends.set([padre(), padre({ id: 'd2', firstName: 'Luis' })]);
    const fixture = await createFixture('diacono_permanente', 'Diáconos Permanentes', 'subt');

    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('a[href^="/directorio/padres"]');
    expect(cards.length).toBe(2);
  });
});
