import { computed, Injectable, signal } from '@angular/core';

export type IsmaBackgroundPattern = 'diagonal' | 'geometric' | 'dots' | 'gradient' | 'solid';

export interface IsmaBackgroundConfig {
  pattern: IsmaBackgroundPattern;
  bgColor: string;
  patternColor: string;
  /** Porcentaje, 0-100. */
  patternOpacity: number;
  /** Pixeles. Solo aplica a los patrones donde "tamaño/separación" tiene sentido. */
  patternSize: number;
}

export interface IsmaBackgroundPatternOption {
  value: IsmaBackgroundPattern;
  label: string;
  /** Si el patrón usa `patternSize` (lineas, geometrico, puntos) o no (degradado, solido). */
  hasSize: boolean;
}

export const ISMA_BACKGROUND_PATTERNS: IsmaBackgroundPatternOption[] = [
  { value: 'diagonal', label: 'Líneas diagonales sutiles', hasSize: true },
  { value: 'geometric', label: 'Patrón geométrico (vitral)', hasSize: true },
  { value: 'dots', label: 'Puntos minimalistas', hasSize: true },
  { value: 'gradient', label: 'Degradado cálido', hasSize: false },
  { value: 'solid', label: 'Fondo sólido sin patrón', hasSize: false },
];

/** Paleta inicial calida (marfil/beige) que combina con el turquesa y dorado del
 * logotipo de ISMA, pedida por el cliente como punto de partida para probar. */
export const ISMA_BACKGROUND_DEFAULT: IsmaBackgroundConfig = {
  pattern: 'diagonal',
  bgColor: '#F8F5F0',
  patternColor: '#C9A227',
  patternOpacity: 10,
  patternSize: 18,
};

const STORAGE_KEY = 'isma-bg-picker-config';

/** Convierte "#RGB" o "#RRGGBB" + opacidad (0-100) a "rgba(r, g, b, a)". */
export function hexToRgba(hex: string, opacityPercent: number): string {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const a = Math.min(100, Math.max(0, opacityPercent)) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Estado de la herramienta TEMPORAL para que el cliente pruebe fondos de la vista
 * publica de ISMA (ver `isma-background-picker/`). Una vez elegido el diseno
 * definitivo, este archivo, el componente y sus referencias en
 * isma.html/isma.ts/isma.css se pueden borrar sin afectar el resto de la app — nada
 * fuera de esta carpeta depende de el salvo esos tres puntos de enganche, marcados
 * con comentarios "TEMPORAL".
 */
@Injectable({ providedIn: 'root' })
export class IsmaBackgroundConfigService {
  private readonly state = signal<IsmaBackgroundConfig>(this.loadFromStorage());

  readonly config = this.state.asReadonly();
  readonly patternRgba = computed(() =>
    hexToRgba(this.state().patternColor, this.state().patternOpacity),
  );

  update(partial: Partial<IsmaBackgroundConfig>): void {
    this.state.update((current) => ({ ...current, ...partial }));
    this.persist();
  }

  reset(): void {
    this.state.set({ ...ISMA_BACKGROUND_DEFAULT });
    this.persist();
  }

  toClipboardText(): string {
    const c = this.state();
    const patternLabel =
      ISMA_BACKGROUND_PATTERNS.find((p) => p.value === c.pattern)?.label ?? c.pattern;
    return [
      'Fondo ISMA — configuración elegida',
      `Patrón: ${patternLabel}`,
      `Color de fondo: ${c.bgColor}`,
      `Color del patrón: ${c.patternColor}`,
      `Opacidad del patrón: ${c.patternOpacity}%`,
      `Tamaño del patrón: ${c.patternSize}px`,
    ].join('\n');
  }

  private loadFromStorage(): IsmaBackgroundConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...ISMA_BACKGROUND_DEFAULT };
      return { ...ISMA_BACKGROUND_DEFAULT, ...JSON.parse(raw) };
    } catch {
      return { ...ISMA_BACKGROUND_DEFAULT };
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
    } catch {
      // Almacenamiento no disponible (modo privado, cuota llena, etc.): se ignora,
      // la configuracion solo vive en memoria para esta pestana.
    }
  }
}
