import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { IconsService } from '../../../core/services/icons.service';

type PulblicNavItem = {
  label: string;
  icon?: LucideIconData;
  to?: string;
  children?: PulblicNavItem[];
};

@Component({
  selector: 'app-layout',
  imports: [CommonModule, LucideAngularModule, RouterOutlet, RouterLink],
  templateUrl: './layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  protected readonly iconsService = inject(IconsService);

  protected navItems: PulblicNavItem[] = [
    { label: 'Inicio', to: '/inicio', icon: this.iconsService.home },
    {
      label: 'Diócesis',
      icon: this.iconsService.parishPlaceholder,
      children: [
        { label: 'Historia', to: '/diocesis/historia', icon: this.iconsService.history },
        { label: 'Obispo', to: '/diocesis/obispo', icon: this.iconsService.user },
        {
          label: 'Planeación Pastoral',
          to: '/diocesis/planeacion-pastoral',
          icon: this.iconsService.calendar1,
        },
        { label: 'Obituario', to: '/diocesis/obituario', icon: this.iconsService.heart },
        {
          label: 'Instituto Bíblico',
          to: '/diocesis/instituto-biblico',
          icon: this.iconsService.institute,
        },
        { label: 'ISMA', to: '/diocesis/isma', icon: this.iconsService.isma },
      ],
    },
    {
      label: 'Gobierno',
      icon: this.iconsService.hammer,
      children: [
        { label: 'Curia', to: '/gobierno/curia', icon: this.iconsService.bank },
        { label: 'Gobierno Pastoral', to: '/gobierno/pastoral', icon: this.iconsService.users },
        {
          label: 'Actividad Pastoral',
          to: '/gobierno/actividad-pastoral',
          icon: this.iconsService.calendar,
        },
      ],
    },
    {
      label: 'Directorio',
      icon: this.iconsService.phoneAgenda,
      children: [
        { label: 'Presbítero', to: '/directorio/padres', icon: this.iconsService.user },
        { label: 'Parroquias', to: '/directorio/parroquias', icon: this.iconsService.reverends },
        {
          label: 'Diáconos Permanentes',
          to: '/directorio/diaconos/permanentes',
          icon: this.iconsService.user,
        },
        {
          label: 'Diáconos Transitorios',
          to: '/directorio/diaconos/transitorios',
          icon: this.iconsService.user,
        },
      ],
    },
    {
      label: 'Noticias',
      icon: this.iconsService.megaphone,
      children: [
        { label: 'Todas', to: '/noticias', icon: this.iconsService.newspaper },
        { label: 'Diócesis', to: '/noticias/diocesis', icon: this.iconsService.reverends },
        { label: 'Seminario', to: '/noticias/seminario', icon: this.iconsService.graduationCap },
        { label: 'Nacional', to: '/noticias/nacional', icon: this.iconsService.national },
        { label: 'Vaticano', to: '/noticias/vaticano', icon: this.iconsService.international },
        {
          label: 'Instituto Bíblico',
          to: '/noticias/instituto-biblico',
          icon: this.iconsService.institute,
        },
      ],
    },
    { label: 'Seminario', to: '/seminario', icon: this.iconsService.graduationCap },
    {
      label: 'Archivo',
      icon: this.iconsService.archive,
      children: [
        { label: 'Documentos', to: '/archivo/documentos', icon: this.iconsService.documents },
        { label: 'Nombramientos', to: '/archivo/nombramientos', icon: this.iconsService.idCard },
      ],
    },
    { label: 'Descargas', to: '/descargas', icon: this.iconsService.download },
    {
      label: 'Multimedia',
      icon: this.iconsService.tv,
      children: [{ label: 'Misas', to: '/multimedia/misas', icon: this.iconsService.calendar }],
    },
    { label: 'Diezmo', to: '/diezmo', icon: this.iconsService.handCoins },
  ];

  open = signal(false);
  openSubmenus = signal<Set<string>>(new Set());

  toggle(): void {
    this.open.update((isOpen) => !isOpen);
  }

  toggleSubmenu(label: string): void {
    this.openSubmenus.update((submenus) => {
      const newSubmenus = new Set(submenus);
      if (newSubmenus.has(label)) {
        newSubmenus.delete(label);
      } else {
        newSubmenus.add(label);
      }
      return newSubmenus;
    });
  }

  isSubmenuOpen(label: string): boolean {
    return this.openSubmenus().has(label);
  }

  closeOnNavigate(): void {
    this.open.set(false);
    this.openSubmenus.set(new Set());
  }
}
