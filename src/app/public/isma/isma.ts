import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { combineLatest } from 'rxjs';
import { IsmaFaqService } from '../../admin/isma-faq/services/isma-faq';
import { IsmaInformationService } from '../../admin/isma-information/services/isma-information';
import { IsmaSpecialCasesService } from '../../admin/isma-special-cases/services/isma-special-cases';
import { IsmaInformacion } from '../../core/models/isma-information.model';

/**
 * Página pública "ISMA" (`/diocesis/isma`, Tarea 6.1/7.1). Información general
 * organizada por secciones (introducción, documentación, parroquia correspondiente,
 * entrevista, programa, tiempos de anticipación, contacto), mas los casos especiales y
 * preguntas frecuentes en un acordeón (decision Tarea 0.1 #5: colecciones reales).
 */
@Component({
  selector: 'app-isma',
  imports: [CommonModule],
  templateUrl: './isma.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Isma implements OnInit {
  private readonly informationService = inject(IsmaInformationService);
  protected readonly specialCasesService = inject(IsmaSpecialCasesService);
  protected readonly faqService = inject(IsmaFaqService);

  readonly information = signal<IsmaInformacion | null>(null);
  readonly loading = signal(true);
  readonly openCaseIds = signal<Set<string>>(new Set());
  readonly openFaqIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
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
