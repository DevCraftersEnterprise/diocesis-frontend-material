import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { Reverends } from '../../admin/reverends/services/reverends';
import { PADRE_ROLE_LABELS, Padre, PadreRole } from '../../core/models/reverend.model';
import { IconsService } from '../../core/services/icons.service';
import { CleanUrlPipe } from '../../core/pipes/clean-url.pipe';

@Component({
  selector: 'app-reverend-details',
  imports: [CommonModule, LucideAngularModule, CleanUrlPipe, RouterLink],
  templateUrl: './reverend-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReverendDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  protected readonly reverendsService = inject(Reverends);
  protected readonly iconsService = inject(IconsService);

  reverend = signal<Padre | null>(null);
  currentUrl = signal<string>('');
  protected readonly padreRoleLabels = PADRE_ROLE_LABELS;

  protected roleShortLabel(role: PadreRole): string {
    return role === 'presbitero' ? 'Pbro.' : 'Diác.';
  }

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (!param) {
      this.router.navigate(['/directorio/padres']);
      return;
    }

    // Si el parámetro contiene guiones, es un slug completo, extraemos el ID
    const id = param.includes('-') ? ReverendDetails.extractIdFromSlug(param) : param;

    this.currentUrl.set(window.location.href);

    this.reverendsService.getPadreById(id).subscribe({
      next: (data) => {
        this.reverend.set(data);
        this.title.setTitle(`${data.firstName} ${data.lastName} - Diócesis de Ciudad Obregón`);
        this.updateUrlWithSlug(data.firstName, data.lastName, id);
      },
      error: () => {
        this.router.navigate(['/directorio/padres']);
      },
    });
  }

  private updateUrlWithSlug(firstName: string, lastName: string, id: string): void {
    const slug = ReverendDetails.generateSlug(firstName, lastName, id);
    const url = `/directorio/padres/${slug}`;
    window.history.replaceState({}, '', url);
    this.currentUrl.set(window.location.href);
  }

  public static generateSlug(firstName: string, lastName: string, id: string): string {
    const fullName = `${firstName} ${lastName}`;
    const slug = fullName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
      .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y final
      .substring(0, 60) // Limitar longitud del slug
      .replace(/-+$/g, ''); // Eliminar guiones al final después del substring
    return `${slug}-${id}`;
  }

  public static extractIdFromSlug(slug: string): string {
    // El slug tiene formato: nombre-apellido-UUID
    // UUID formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (5 segmentos separados por guiones)
    const parts = slug.split('-');
    if (parts.length >= 5) {
      return parts.slice(-5).join('-');
    }
    return parts[parts.length - 1];
  }
}
