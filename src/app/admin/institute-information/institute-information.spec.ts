import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { InstituteInformationComponent } from './institute-information';
import { InstituteInformationService } from './services/institute-information';
import { InstitutoInformacion } from '../../core/models/institute-information.model';

const row: InstitutoInformacion = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Instituto Biblico',
  description: 'Descripcion inicial',
  contactEmail: null,
  contactPhone: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedBy: null,
};

describe('InstituteInformationComponent (admin)', () => {
  let fixture: ComponentFixture<InstituteInformationComponent>;
  let serviceStub: jasmine.SpyObj<InstituteInformationService>;

  beforeEach(async () => {
    serviceStub = jasmine.createSpyObj<InstituteInformationService>(
      'InstituteInformationService',
      ['getInformation', 'updateInformation'],
    );
    serviceStub.getInformation.and.returnValue(of(row));
    serviceStub.updateInformation.and.returnValue(
      of({ ...row, name: 'Actualizado' }),
    );

    await TestBed.configureTestingModule({
      imports: [InstituteInformationComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideHttpClient(),
        provideToastr(),
        { provide: InstituteInformationService, useValue: serviceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InstituteInformationComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('carga la informacion al iniciar y llena el formulario', () => {
    expect(serviceStub.getInformation).toHaveBeenCalled();
    expect(fixture.componentInstance.form().name).toBe('Instituto Biblico');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('save() con formulario valido llama a updateInformation con los campos', async () => {
    fixture.componentInstance.form.set({
      name: 'Nuevo nombre',
      description: 'Nueva descripcion',
      contactEmail: '',
      contactPhone: '',
    });
    fixture.componentInstance.save();
    await fixture.whenStable();

    expect(serviceStub.updateInformation).toHaveBeenCalledWith({
      name: 'Nuevo nombre',
      description: 'Nueva descripcion',
      contactEmail: null,
      contactPhone: null,
    });
  });

  it('save() con nombre vacio no llama al servicio', () => {
    fixture.componentInstance.form.update((f) => ({ ...f, name: '' }));
    fixture.componentInstance.save();
    expect(serviceStub.updateInformation).not.toHaveBeenCalled();
  });

  it('error al cargar -> loading queda en false (sin colgarse)', async () => {
    serviceStub.getInformation.and.returnValue(throwError(() => new Error('falla')));
    const toastr = TestBed.inject(ToastrService);
    spyOn(toastr, 'error');

    const f2 = TestBed.createComponent(InstituteInformationComponent);
    f2.detectChanges();
    await f2.whenStable();

    expect(f2.componentInstance.loading()).toBe(false);
    expect(toastr.error).toHaveBeenCalled();
  });
});
