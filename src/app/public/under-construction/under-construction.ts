import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { IconsService } from '../../core/services/icons.service';

/**
 * Página genérica "En construcción" para rutas que ya aparecen en la navegación
 * pública pero todavía no tienen módulo en el backend ni vista propia. Se usa desde
 * varias entradas de `app.routes.ts`, cada una con `data: { label: '...' }` para
 * personalizar el mensaje; sin `label`, muestra un mensaje genérico. Reemplazar cada
 * entrada por su vista real conforme vaya llegando la información/el backend.
 */
@Component({
  selector: 'app-under-construction',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './under-construction.html',
  styleUrl: './under-construction.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnderConstruction {
  private readonly route = inject(ActivatedRoute);
  protected readonly iconsService = inject(IconsService);

  protected readonly label = this.route.snapshot.data['label'] as string | undefined;
}
