import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { AppModuleName, User } from '../../../core/models/user.model';
import { IconsService } from '../../../core/services/icons.service';
import { Auth } from '../../../public/login/services/auth';
import { RoleBadgeComponent } from '../../../shared/components/role-badge/role-badge';

type NavItem = {
  label: string;
  icon?: LucideIconData;
  to?: string;
  /** Si esta puesto, solo se muestra si `moduleAccess` del usuario lo incluye (o si es
   * admin/super — ver `itemVisible()`). Los 9 modulos existentes no lo usan. */
  requiredModuleAccess?: AppModuleName;
  children?: NavItem[];
};

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    RoleBadgeComponent,
  ],
  templateUrl: './layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout implements OnInit {
  private router = inject(Router);
  protected readonly iconsService = inject(IconsService);
  protected authService = inject(Auth);

  private allItems: NavItem[] = [
    { label: 'Usuarios', to: '/dashboard/users', icon: this.iconsService.users },
    { label: 'Carrusel', to: '/dashboard/carousel', icon: this.iconsService.carousel },
    { label: 'Padres', to: '/dashboard/reverends', icon: this.iconsService.reverends },
    { label: 'Noticias', to: '/dashboard/news', icon: this.iconsService.newspaper },
    { label: 'Colonias', to: '/dashboard/colonies', icon: this.iconsService.map },
    { label: 'Decanatos', to: '/dashboard/decants', icon: this.iconsService.network },
    { label: 'Parroquias', to: '/dashboard/parishes', icon: this.iconsService.parish },
    { label: 'Artículos', to: '/dashboard/articles', icon: this.iconsService.articles },
    { label: 'Documentos', to: '/dashboard/documents', icon: this.iconsService.documents },
    {
      label: 'Instituto Bíblico',
      icon: this.iconsService.institute,
      children: [
        {
          label: 'Información general',
          to: '/dashboard/institute/information',
          requiredModuleAccess: 'instituto-biblico',
        },
        {
          label: 'Capacitaciones',
          to: '/dashboard/institute/trainings',
          requiredModuleAccess: 'instituto-biblico',
        },
        {
          label: 'Cursos',
          to: '/dashboard/institute/courses',
          requiredModuleAccess: 'instituto-biblico',
        },
        {
          label: 'Sedes',
          to: '/dashboard/institute/venues',
          requiredModuleAccess: 'instituto-biblico',
        },
        {
          label: 'Calendario',
          to: '/dashboard/institute/events',
          requiredModuleAccess: 'instituto-biblico',
        },
      ],
    },
    {
      label: 'ISMA',
      icon: this.iconsService.isma,
      children: [
        {
          label: 'Información general',
          to: '/dashboard/isma/information',
          requiredModuleAccess: 'isma',
        },
        {
          label: 'Casos especiales',
          to: '/dashboard/isma/special-cases',
          requiredModuleAccess: 'isma',
        },
        {
          label: 'Preguntas frecuentes',
          to: '/dashboard/isma/faq',
          requiredModuleAccess: 'isma',
        },
      ],
    },
  ];

  open = signal(false);
  openSubmenus = signal<Set<string>>(new Set());

  /** Filtra por `moduleAccess`: admin/super ven todo; un `user` solo ve los grupos para
   * los que tiene acceso (o los que no exigen ninguno, como los 9 modulos existentes). */
  items = computed(() => {
    const user = this.authService.user();
    return this.allItems
      .map((item) => this.filterItem(item, user))
      .filter((item): item is NavItem => item !== null);
  });

  private filterItem(item: NavItem, user: User | null): NavItem | null {
    if (item.children) {
      const children = item.children.filter((child) => this.itemVisible(child, user));
      return children.length > 0 ? { ...item, children } : null;
    }
    return this.itemVisible(item, user) ? item : null;
  }

  private itemVisible(item: NavItem, user: User | null): boolean {
    if (!item.requiredModuleAccess) return true;
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'super') return true;
    return (user.moduleAccess ?? []).includes(item.requiredModuleAccess);
  }

  toggleSubmenu(label: string): void {
    this.openSubmenus.update((submenus) => {
      const next = new Set(submenus);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  isSubmenuOpen(label: string): boolean {
    return this.openSubmenus().has(label);
  }

  ngOnInit(): void {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) return;
    this.authService.loadProfile(userId).subscribe();
  }

  toggle(): void {
    this.open.update((isOpen) => !isOpen);
  }

  closeOnNavigate(): void {
    if (window.innerWidth < 1024) {
      this.open.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
