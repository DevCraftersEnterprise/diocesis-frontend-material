import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Indicador de carga reutilizable: ocupa una altura minima propia (`min-h-[50vh]`)
 * para quedar centrado en la pantalla en vez de pegado al navbar, que era lo que
 * pasaba con un `<p>Cargando…</p>` suelto sin alto. `message` permite personalizar
 * el texto; por defecto "Cargando…".
 */
@Component({
  selector: 'app-loading-state',
  imports: [],
  templateUrl: './loading-state.html',
  styleUrl: './loading-state.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingState {
  message = input<string>('Cargando…');
}
