import { IsmaCurso } from '../../core/models/isma-curso.model';
import { cursoToEvents, duracion } from './isma-calendar';

const base = (over: Partial<IsmaCurso> = {}): IsmaCurso =>
  ({
    id: 'c1',
    parroquia: { id: 'p1', name: 'Santa Teresita', address: 'Juárez 121', town: 'Obregón' },
    startDate: '2026-08-24',
    endDate: '2026-11-08',
    finalizado: false,
    diaSemana: 2,
    horaInicio: '19:30',
    horaFin: '21:00',
    modalidad: 'presencial',
    telefonoInformes: null,
    notas: null,
    isActive: true,
    createdAt: '',
    updatedAt: null,
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    deletedBy: null,
    ...over,
  }) as IsmaCurso;

describe('cursoToEvents', () => {
  it('con dia y horario genera sesiones semanales (rrule) de inicio a fin', () => {
    const [ev] = cursoToEvents(base());
    expect(ev).toEqual(
      jasmine.objectContaining({
        rrule: {
          freq: 'weekly',
          dtstart: '2026-08-24T19:30:00',
          until: '2026-11-08T23:59:59',
          byweekday: ['tu'],
        },
        duration: '01:30',
      }),
    );
    expect(ev.extendedProps).toEqual({ cursoId: 'c1' });
  });

  it('sin horario muestra un bloque de dias completos con end exclusivo', () => {
    const [ev] = cursoToEvents(base({ diaSemana: null, horaInicio: null, horaFin: null }));
    expect(ev).toEqual(
      jasmine.objectContaining({
        start: '2026-08-24',
        end: '2026-11-09',
        allDay: true,
      }),
    );
    expect(ev.rrule).toBeUndefined();
  });

  it('mapea diaSemana 0 (domingo) a su abreviatura RRULE', () => {
    const [ev] = cursoToEvents(base({ diaSemana: 0 }));
    expect((ev.rrule as { byweekday: string[] }).byweekday).toEqual(['su']);
  });
});

describe('duracion', () => {
  it('calcula HH:mm entre dos horas del mismo dia', () => {
    expect(duracion('19:00', '21:00')).toBe('02:00');
    expect(duracion('07:30', '09:00')).toBe('01:30');
  });
});
