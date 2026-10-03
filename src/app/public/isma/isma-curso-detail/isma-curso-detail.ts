import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { IsmaCursosService } from '../../../admin/isma-cursos/services/isma-cursos';
import { DIAS_SEMANA, IsmaCurso } from '../../../core/models/isma-curso.model';
import { IconsService } from '../../../core/services/icons.service';

/** Primer numero de telefono de un campo libre ("644 413 2819 / 644 413 4770"). */
export function primerTelefono(texto: string): string {
  return texto.split(/[\/,;]/)[0].replace(/[^\d+]/g, '');
}

@Component({
  selector: 'app-isma-curso-detail',
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './isma-curso-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsmaCursoDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cursosService = inject(IsmaCursosService);
  protected readonly iconsService = inject(IconsService);

  readonly diasSemana = DIAS_SEMANA;
  readonly curso = signal<IsmaCurso | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.cursosService.getCursoPublico(id).subscribe({
      next: (c) => {
        this.curso.set(c);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  telHref(texto: string): string {
    return `tel:${primerTelefono(texto)}`;
  }

  horario(c: IsmaCurso): string {
    if (c.diaSemana === null || !c.horaInicio || !c.horaFin) return 'Por confirmar';
    return `${this.diasSemana[c.diaSemana]} de ${c.horaInicio} a ${c.horaFin}`;
  }
}
