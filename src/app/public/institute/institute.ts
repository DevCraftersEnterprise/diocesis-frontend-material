import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { combineLatest } from 'rxjs';
import { InstituteInformationService } from '../../admin/institute-information/services/institute-information';
import { InstituteCoursesService } from '../../admin/institute-courses/services/institute-courses';
import { InstituteEventsService } from '../../admin/institute-events/services/institute-events';
import { InstituteTrainingsService } from '../../admin/institute-trainings/services/institute-trainings';
import { InstituteVenuesService } from '../../admin/institute-venues/services/institute-venues';
import { Evento } from '../../core/models/institute-event.model';
import { InstitutoInformacion } from '../../core/models/institute-information.model';
import { Capacitacion } from '../../core/models/institute-training.model';
import { CleanUrlPipe } from '../../core/pipes/clean-url.pipe';

const MODALITY_LABELS: Record<Capacitacion['modality'], string> = {
  presencial: 'Presencial',
  en_linea: 'En línea',
  mixta: 'Mixta',
};

const TYPE_LABELS: Record<Evento['type'], string> = {
  inscripcion: 'Inscripción',
  curso: 'Curso',
  actividad: 'Actividad',
};

const TYPE_COLORS: Record<Evento['type'], string> = {
  inscripcion: '#b45309',
  curso: '#1d4ed8',
  actividad: '#15803d',
};

/**
 * Página pública "Instituto Bíblico" (`/diocesis/instituto-biblico`, Tarea 3.1/4.1/5.1).
 * Información general, oferta de capacitación, cursos activos, sedes y el widget de
 * calendario visual (decisión Tarea 0.1 #2 — `@fullcalendar/angular`, validado en el
 * spike de la Tarea 2.1).
 */
@Component({
  selector: 'app-institute',
  imports: [CommonModule, CleanUrlPipe, FullCalendarModule],
  templateUrl: './institute.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Institute implements OnInit {
  private readonly informationService = inject(InstituteInformationService);
  protected readonly trainingsService = inject(InstituteTrainingsService);
  protected readonly coursesService = inject(InstituteCoursesService);
  protected readonly venuesService = inject(InstituteVenuesService);
  protected readonly eventsService = inject(InstituteEventsService);

  readonly modalityLabels = MODALITY_LABELS;
  readonly typeLabels = TYPE_LABELS;

  readonly information = signal<InstitutoInformacion | null>(null);
  readonly loading = signal(true);
  readonly selectedEvent = signal<Evento | null>(null);

  readonly calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    height: 'auto',
    locale: 'es',
    events: this.eventsService.events().map((e) => ({
      id: e.id,
      title: e.title,
      start: e.startDate,
      end: e.endDate ?? undefined,
      allDay: true,
      backgroundColor: TYPE_COLORS[e.type],
      borderColor: TYPE_COLORS[e.type],
    })),
    eventClick: (arg: EventClickArg) => {
      const event = this.eventsService.events().find((e) => e.id === arg.event.id);
      this.selectedEvent.set(event ?? null);
    },
  }));

  ngOnInit(): void {
    combineLatest([
      this.informationService.getInformation(),
      this.trainingsService.getCapacitacionesPaginated(0, 100, { isActive: true }),
      this.coursesService.getCursosPaginated(0, 100, { isActive: true }),
      this.venuesService.getSedesPaginated(0, 100, { isActive: true }),
      this.eventsService.getEventosPaginated(0, 100, { isActive: true }),
    ]).subscribe({
      next: ([info]) => {
        this.information.set(info);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  chargeVenueName(id: string | null): string | null {
    if (!id) return null;
    return this.venuesService.venues().find((v) => v.id === id)?.name ?? null;
  }
}
