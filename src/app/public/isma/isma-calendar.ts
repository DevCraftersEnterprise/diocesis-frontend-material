import type { EventInput } from '@fullcalendar/core';
import type { IsmaCurso } from '../../core/models/isma-curso.model';

/** Abreviaturas RRULE indexadas por `diaSemana` (0 = domingo). */
const BYDAY = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'] as const;

function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/**
 * Convierte un curso en eventos de calendario. Con horario: sesiones semanales (rrule) de
 * `startDate` a `endDate`. Sin horario: un bloque de dias completos de inicio a fin (el
 * `end` de FullCalendar es exclusivo, por eso se suma un dia).
 */
export function cursoToEvents(curso: IsmaCurso): EventInput[] {
  const base = {
    id: curso.id,
    title: `ISMA · ${curso.parroquia.name}`,
    extendedProps: { cursoId: curso.id },
  };

  if (curso.diaSemana === null || !curso.horaInicio || !curso.horaFin) {
    return [
      {
        ...base,
        start: curso.startDate,
        end: sumarDias(curso.endDate, 1),
        allDay: true,
      },
    ];
  }

  return [
    {
      ...base,
      rrule: {
        freq: 'weekly',
        dtstart: `${curso.startDate}T${curso.horaInicio}:00`,
        until: `${curso.endDate}T23:59:59`,
        byweekday: [BYDAY[curso.diaSemana]],
      },
      duration: duracion(curso.horaInicio, curso.horaFin),
    },
  ];
}

/** Duracion `HH:mm` entre dos horas `HH:mm` del mismo dia. */
export function duracion(inicio: string, fin: string): string {
  const [hi, mi] = inicio.split(':').map(Number);
  const [hf, mf] = fin.split(':').map(Number);
  const minutos = hf * 60 + mf - (hi * 60 + mi);
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
