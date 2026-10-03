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
import esLocale from '@fullcalendar/core/locales/es';
import rrulePlugin from '@fullcalendar/rrule';
import { LucideAngularModule } from 'lucide-angular';
import { combineLatest } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { IsmaFaqService } from '../../admin/isma-faq/services/isma-faq';
import { IsmaInformationService } from '../../admin/isma-information/services/isma-information';
import { IsmaCursosService } from '../../admin/isma-cursos/services/isma-cursos';
import { IsmaSpecialCasesService } from '../../admin/isma-special-cases/services/isma-special-cases';
import { IsmaInformacion } from '../../core/models/isma-information.model';
import { DIAS_SEMANA, etiquetasModalidades } from '../../core/models/isma-curso.model';
import { IconsService } from '../../core/services/icons.service';
import { cursoToEvents } from './isma-calendar';

/**
 * Página pública "ISMA" (`/diocesis/isma`, Tarea 6.1/7.1). Información general
 * organizada por secciones (introducción, documentación, parroquia correspondiente,
 * entrevista, programa, tiempos de anticipación, contacto), mas los casos especiales y
 * preguntas frecuentes en un acordeón (decision Tarea 0.1 #5: colecciones reales).
 */
@Component({
  selector: 'app-isma',
  imports: [CommonModule, LucideAngularModule, FullCalendarModule, RouterLink],
  templateUrl: './isma.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Isma implements OnInit {
  private readonly informationService = inject(IsmaInformationService);
  private readonly router = inject(Router);
  protected readonly specialCasesService = inject(IsmaSpecialCasesService);
  protected readonly faqService = inject(IsmaFaqService);
  protected readonly cursosService = inject(IsmaCursosService);
  protected readonly iconsService = inject(IconsService);

  readonly diasSemana = DIAS_SEMANA;
  readonly etiquetas = etiquetasModalidades;
  readonly information = signal<IsmaInformacion | null>(null);
  readonly loading = signal(true);
  readonly openCaseIds = signal<Set<string>>(new Set());
  readonly openFaqIds = signal<Set<string>>(new Set());

  readonly calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, rrulePlugin],
    initialView: 'dayGridMonth',
    locale: 'es',
    locales: [esLocale],
    height: 'auto',
    headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
    events: this.cursosService.cursos().flatMap((c) => cursoToEvents(c)),
    eventClick: (arg: EventClickArg) => {
      const id = arg.event.extendedProps['cursoId'] as string | undefined;
      if (id) void this.router.navigate(['/diocesis/isma/cursos', id]);
    },
  }));

  ngOnInit(): void {
    this.cursosService.getPublicCursos(0, 100).subscribe();
    combineLatest([
      this.informationService.getInformation(),
      this.specialCasesService.getCasosEspecialesPaginated(0, 100, { isActive: true }),
      this.faqService.getPreguntasPaginated(0, 100, { isActive: true }),
    ]).subscribe({
      next: ([info]) => {
        this.information.set(info);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleCase(id: string): void {
    this.openCaseIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  isCaseOpen(id: string): boolean {
    return this.openCaseIds().has(id);
  }

  toggleFaq(id: string): void {
    this.openFaqIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  isFaqOpen(id: string): boolean {
    return this.openFaqIds().has(id);
  }
}
