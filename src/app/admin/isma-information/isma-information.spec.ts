import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { IsmaInformationComponent } from './isma-information';
import { IsmaInformationService } from './services/isma-information';
import { IsmaInformacion } from '../../core/models/isma-information.model';

const row: IsmaInformacion = {
  id: '00000000-0000-0000-0000-000000000002',
  introduccion: 'Introduccion inicial',
  documentacionNecesaria: 'Documentacion inicial',
  parroquiaCorrespondiente: 'Parroquia inicial',
  entrevistaParroco: 'Entrevista inicial',
  programaIsma: 'Programa inicial',
  tiemposAnticipacion: 'Tiempos inicial',
  contactoTelefono1: null,
  contactoTelefono2: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedBy: null,
};

describe('IsmaInformationComponent (admin)', () => {
  let fixture: ComponentFixture<IsmaInformationComponent>;
  let serviceStub: jasmine.SpyObj<IsmaInformationService>;

  beforeEach(async () => {
    serviceStub = jasmine.createSpyObj<IsmaInformationService>('IsmaInformationService', [
      'getInformation',
      'updateInformation',
    ]);
    serviceStub.getInformation.and.returnValue(of(row));
    serviceStub.updateInformation.and.returnValue(of({ ...row, introduccion: 'Actualizado' }));

    await TestBed.configureTestingModule({
      imports: [IsmaInformationComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideHttpClient(),
        provideToastr(),
        { provide: IsmaInformationService, useValue: serviceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IsmaInformationComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('carga la informacion al iniciar y llena el formulario', () => {
    expect(serviceStub.getInformation).toHaveBeenCalled();
    expect(fixture.componentInstance.form().introduccion).toBe('Introduccion inicial');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('save() con formulario valido llama a updateInformation con los campos', async () => {
    fixture.componentInstance.form.set({
      introduccion: 'Nueva introduccion',
      documentacionNecesaria: 'Nueva documentacion',
      parroquiaCorrespondiente: 'Nueva parroquia',
      entrevistaParroco: 'Nueva entrevista',
      programaIsma: 'Nuevo programa',
      tiemposAnticipacion: 'Nuevos tiempos',
      contactoTelefono1: '',
      contactoTelefono2: '',
    });
    fixture.componentInstance.save();
    await fixture.whenStable();

    expect(serviceStub.updateInformation).toHaveBeenCalledWith({
      introduccion: 'Nueva introduccion',
      documentacionNecesaria: 'Nueva documentacion',
      parroquiaCorrespondiente: 'Nueva parroquia',
      entrevistaParroco: 'Nueva entrevista',
      programaIsma: 'Nuevo programa',
      tiemposAnticipacion: 'Nuevos tiempos',
      contactoTelefono1: null,
      contactoTelefono2: null,
    });
  });

  it('save() con introduccion vacia no llama al servicio', () => {
    fixture.componentInstance.form.update((f) => ({ ...f, introduccion: '' }));
    fixture.componentInstance.save();
    expect(serviceStub.updateInformation).not.toHaveBeenCalled();
  });

  it('error al cargar -> loading queda en false (sin colgarse)', async () => {
    serviceStub.getInformation.and.returnValue(throwError(() => new Error('falla')));
    const toastr = TestBed.inject(ToastrService);
    spyOn(toastr, 'error');

    const f2 = TestBed.createComponent(IsmaInformationComponent);
    f2.detectChanges();
    await f2.whenStable();

    expect(f2.componentInstance.loading()).toBe(false);
    expect(toastr.error).toHaveBeenCalled();
  });
});
