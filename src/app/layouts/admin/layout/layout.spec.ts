import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, type WritableSignal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Observable } from 'rxjs';
import { Layout } from './layout';
import { Auth } from '../../../public/login/services/auth';
import { User } from '../../../core/models/user.model';

interface AuthStub {
  user: WritableSignal<User | null>;
  getUserIdFromToken: jasmine.Spy<() => string | null>;
  loadProfile: jasmine.Spy<(id: string) => Observable<User>>;
  logout: jasmine.Spy<() => void>;
}

function fakeUser(over: Partial<User> = {}): User {
  return {
    id: 'u1',
    username: 'x',
    email: 'x@x.test',
    role: 'user',
    moduleAccess: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
    ...over,
  };
}

/**
 * Verifica el filtro de `moduleAccess` en el sidebar admin (Tarea 8.1,
 * `docs/instituto-biblico-isma.md` §4/§6): admin/super ven todo; un `user` solo ve los
 * grupos "Instituto Bíblico"/"ISMA" para los que tiene acceso explicito; los 9 modulos
 * existentes (sin `requiredModuleAccess`) siempre son visibles.
 */
describe('Layout (admin) — filtro de moduleAccess en el sidebar', () => {
  let fixture: ComponentFixture<Layout>;
  let authStub: AuthStub;

  const labels = (): string[] => fixture.componentInstance.items().map((i) => i.label);
  const childLabels = (groupLabel: string): string[] =>
    fixture.componentInstance
      .items()
      .find((i) => i.label === groupLabel)
      ?.children?.map((c) => c.label) ?? [];

  beforeEach(async () => {
    authStub = {
      user: signal<User | null>(null),
      getUserIdFromToken: jasmine.createSpy('getUserIdFromToken').and.returnValue(null),
      loadProfile: jasmine.createSpy('loadProfile'),
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: Auth, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('sin usuario cargado: los 9 modulos existentes se ven; Instituto Bíblico/ISMA no', () => {
    expect(labels()).toContain('Usuarios');
    expect(labels()).toContain('Documentos');
    expect(labels()).not.toContain('Instituto Bíblico');
    expect(labels()).not.toContain('ISMA');
  });

  it('admin: ve ambos grupos completos aunque moduleAccess este vacio', () => {
    authStub.user.set(fakeUser({ role: 'admin', moduleAccess: [] }));
    fixture.detectChanges();

    expect(labels()).toContain('Instituto Bíblico');
    expect(labels()).toContain('ISMA');
    expect(childLabels('Instituto Bíblico')).toEqual([
      'Información general',
      'Capacitaciones',
      'Cursos',
      'Sedes',
      'Calendario',
    ]);
    expect(childLabels('ISMA')).toEqual([
      'Información general',
      'Casos especiales',
      'Preguntas frecuentes',
    ]);
  });

  it('super: ve ambos grupos igual que admin', () => {
    authStub.user.set(fakeUser({ role: 'super', moduleAccess: [] }));
    fixture.detectChanges();

    expect(labels()).toContain('Instituto Bíblico');
    expect(labels()).toContain('ISMA');
  });

  it('user con moduleAccess: [instituto-biblico] -> solo ve ese grupo', () => {
    authStub.user.set(fakeUser({ moduleAccess: ['instituto-biblico'] }));
    fixture.detectChanges();

    expect(labels()).toContain('Instituto Bíblico');
    expect(labels()).not.toContain('ISMA');
  });

  it('user con moduleAccess: [isma] -> solo ve ese grupo', () => {
    authStub.user.set(fakeUser({ moduleAccess: ['isma'] }));
    fixture.detectChanges();

    expect(labels()).not.toContain('Instituto Bíblico');
    expect(labels()).toContain('ISMA');
  });

  it('user con moduleAccess: [] -> no ve ninguno de los dos grupos nuevos', () => {
    authStub.user.set(fakeUser({ moduleAccess: [] }));
    fixture.detectChanges();

    expect(labels()).not.toContain('Instituto Bíblico');
    expect(labels()).not.toContain('ISMA');
  });

  it('user con moduleAccess: [instituto-biblico, isma] -> ve ambos', () => {
    authStub.user.set(fakeUser({ moduleAccess: ['instituto-biblico', 'isma'] }));
    fixture.detectChanges();

    expect(labels()).toContain('Instituto Bíblico');
    expect(labels()).toContain('ISMA');
  });

  it('los 9 modulos existentes siempre son visibles, sin importar el rol/moduleAccess', () => {
    authStub.user.set(fakeUser({ role: 'user', moduleAccess: [] }));
    fixture.detectChanges();

    for (const label of [
      'Usuarios',
      'Carrusel',
      'Padres',
      'Noticias',
      'Colonias',
      'Decanatos',
      'Parroquias',
      'Artículos',
      'Documentos',
    ]) {
      expect(labels()).toContain(label);
    }
  });
});
