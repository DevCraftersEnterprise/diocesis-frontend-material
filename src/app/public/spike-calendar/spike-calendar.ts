import { Component, signal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

/**
 * SPIKE (Tarea 2.1) — prueba tecnica de @fullcalendar/angular contra Angular 21
 * standalone + zoneless (`provideZonelessChangeDetection`, ver app.config.ts).
 *
 * No es codigo de produccion: no esta enlazado desde ninguna navegacion real. Sirve
 * solo para verificar que la libreria compila y reacciona a datos bajo deteccion de
 * cambios sin zone.js antes de comprometerla para el calendario real del Instituto
 * Biblico (FASE 5 de docs/instituto-biblico-isma.md en el backend).
 */
@Component({
  selector: 'app-spike-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './spike-calendar.html',
})
export class SpikeCalendar {
  /** Signal mutado por un click (no un evento de FullCalendar) para probar que la
   * vista se actualiza bajo zoneless cuando cambia el input `[events]`. */
  protected readonly clickedEventTitle = signal<string | null>(null);
  protected readonly extraEventAdded = signal(false);

  protected readonly calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    height: 'auto',
    events: [
      { title: 'Inscripciones curso biblico', date: this.isoToday() },
      { title: 'Entrevista ISMA (ejemplo)', date: this.isoInDays(3) },
    ],
    eventClick: (arg: EventClickArg) => {
      this.clickedEventTitle.set(arg.event.title);
    },
  });

  protected addExtraEvent(): void {
    const current = this.calendarOptions();
    const events = Array.isArray(current.events) ? [...current.events] : [];
    events.push({ title: 'Evento agregado en runtime', date: this.isoInDays(7) });
    this.calendarOptions.set({ ...current, events });
    this.extraEventAdded.set(true);
  }

  private isoToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private isoInDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
}
