import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, type WritableSignal } from '@angular/core';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { moduleAccessGuard } from './module-access.guard';
import { Auth } from '../../public/login/services/auth';
import { User } from '../models/user.model';

interface AuthStub {
  user: WritableSignal<User | null>;
  getUserIdFromToken: jasmine.Spy<() => string | null>;
  loadProfile: jasmine.Spy<(id: string) => Observable<User>>;
}

function run(mod: 'instituto-biblico' | 'isma') {
  return TestBed.runInInjectionContext(() =>
    moduleAccessGuard(mod)({} as never, {} as never),
  );
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

describe('moduleAccessGuard', () => {
  let authStub: AuthStub;

  beforeEach(() => {
    authStub = {
      user: signal<User | null>(null),
      getUserIdFromToken: jasmine.createSpy('getUserIdFromToken'),
      loadProfile: jasmine.createSpy('loadProfile'),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: Auth, useValue: authStub },
      ],
    });
  });

  it('admin en cache -> pasa sin llamar loadProfile', () => {
    authStub.user.set(fakeUser({ role: 'admin' }));
    expect(run('isma')).toBe(true);
    expect(authStub.loadProfile).not.toHaveBeenCalled();
  });

  it('user en cache con el modulo -> pasa', () => {
    authStub.user.set(fakeUser({ moduleAccess: ['isma'] }));
    expect(run('isma')).toBe(true);
  });

  it('user en cache sin el modulo -> UrlTree a /dashboard', () => {
    authStub.user.set(fakeUser({ moduleAccess: [] }));
    expect(run('isma')).toBeInstanceOf(UrlTree);
  });

  it('sin user en cache pero con token valido -> carga el perfil y decide', (done) => {
    authStub.getUserIdFromToken.and.returnValue('u1');
    authStub.loadProfile.and.returnValue(of(fakeUser({ moduleAccess: ['isma'] })));

    const result = run('isma');
    expect(result).not.toBe(true);
    (result as Observable<boolean | UrlTree>).subscribe((value: boolean | UrlTree) => {
      expect(value).toBe(true);
      done();
    });
  });

  it('sin user en cache y sin token -> UrlTree a /login', () => {
    authStub.getUserIdFromToken.and.returnValue(null);
    expect(run('isma')).toBeInstanceOf(UrlTree);
  });

  it('el UrlTree de "sin acceso" apunta a /dashboard', () => {
    const router = TestBed.inject(Router);
    authStub.user.set(fakeUser({ moduleAccess: [] }));
    const result = run('instituto-biblico') as UrlTree;
    expect(router.serializeUrl(result)).toBe('/dashboard');
  });
});
