import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Check, Copy, LucideAngularModule, Palette, RotateCcw, X } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import {
  ISMA_BACKGROUND_PATTERNS,
  IsmaBackgroundConfigService,
  IsmaBackgroundPattern,
} from './services/isma-background-config';

/**
 * Panel flotante TEMPORAL (ver `services/isma-background-config.ts`) para que el
 * cliente pruebe distintos fondos en la vista publica de ISMA y mande la
 * configuracion que mas le guste. Se usa desde `isma.html` con
 * `<app-isma-background-picker />`; borrar esa linea y esta carpeta completa una
 * vez que el cliente elija el diseno definitivo.
 */
@Component({
  selector: 'app-isma-background-picker',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './isma-background-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsmaBackgroundPickerComponent {
  protected readonly bgConfig = inject(IsmaBackgroundConfigService);
  private readonly toastr = inject(ToastrService);

  protected readonly paletteIcon = Palette;
  protected readonly closeIcon = X;
  protected readonly resetIcon = RotateCcw;
  protected readonly copyIcon = Copy;
  protected readonly checkIcon = Check;

  protected readonly patterns = ISMA_BACKGROUND_PATTERNS;
  protected readonly open = signal(false);
  protected readonly copied = signal(false);

  protected hasSize(): boolean {
    return (
      this.patterns.find((p) => p.value === this.bgConfig.config().pattern)?.hasSize ?? false
    );
  }

  toggle(): void {
    this.open.update((v) => !v);
  }

  onPatternChange(value: string): void {
    this.bgConfig.update({ pattern: value as IsmaBackgroundPattern });
  }

  onBgColorChange(value: string): void {
    this.bgConfig.update({ bgColor: value });
  }

  onPatternColorChange(value: string): void {
    this.bgConfig.update({ patternColor: value });
  }

  onOpacityChange(value: string): void {
    this.bgConfig.update({ patternOpacity: Number(value) });
  }

  onSizeChange(value: string): void {
    this.bgConfig.update({ patternSize: Number(value) });
  }

  reset(): void {
    this.bgConfig.reset();
    this.toastr.info('Fondo restablecido al diseño original.');
  }

  async copyConfig(): Promise<void> {
    const text = this.bgConfig.toClipboardText();
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      this.toastr.success('Configuración copiada. Puedes pegarla y enviarla.');
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.toastr.error('No se pudo copiar automáticamente. Selecciona el texto manualmente.');
    }
  }
}
