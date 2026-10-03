import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IsmaInformacionForm } from '../../core/models/isma-information.model';
import { TitleComponent } from '../../shared/components/title/title';
import { IsmaInformationService } from './services/isma-information';

const EMPTY_FORM: IsmaInformacionForm = {
  introduccion: '',
  documentacionNecesaria: '',
  parroquiaCorrespondiente: '',
  entrevistaParroco: '',
  programaIsma: '',
  tiemposAnticipacion: '',
  contactoTelefono1: '',
  contactoTelefono2: '',
};

/**
 * Admin de "ISMA → Información general" (Tarea 6.1). Recurso singleton: un solo
 * formulario en la pagina, sin tabla ni modal de creación/edición (mismo patrón que
 * `InstituteInformationComponent`).
 */
@Component({
  selector: 'app-isma-information',
  imports: [CommonModule, TitleComponent],
  templateUrl: './isma-information.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsmaInformationComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly informationService = inject(IsmaInformationService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly form = signal<IsmaInformacionForm>({ ...EMPTY_FORM });

  readonly isFormValid = () => {
    const f = this.form();
    return (
      f.introduccion.trim() !== '' &&
      f.documentacionNecesaria.trim() !== '' &&
      f.parroquiaCorrespondiente.trim() !== '' &&
      f.entrevistaParroco.trim() !== '' &&
      f.programaIsma.trim() !== '' &&
      f.tiemposAnticipacion.trim() !== ''
    );
  };

  ngOnInit(): void {
    this.loading.set(true);
    this.informationService.getInformation().subscribe({
      next: (info) => {
        this.form.set({
          introduccion: info.introduccion,
          documentacionNecesaria: info.documentacionNecesaria,
          parroquiaCorrespondiente: info.parroquiaCorrespondiente,
          entrevistaParroco: info.entrevistaParroco,
          programaIsma: info.programaIsma,
          tiemposAnticipacion: info.tiemposAnticipacion,
          contactoTelefono1: info.contactoTelefono1 ?? '',
          contactoTelefono2: info.contactoTelefono2 ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.toastrService.error('Error al cargar la información de ISMA');
        this.loading.set(false);
      },
    });
  }

  updateField(field: keyof IsmaInformacionForm, e: Event): void {
    const value = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  save(): void {
    if (!this.isFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    const {
      introduccion,
      documentacionNecesaria,
      parroquiaCorrespondiente,
      entrevistaParroco,
      programaIsma,
      tiemposAnticipacion,
      contactoTelefono1,
      contactoTelefono2,
    } = this.form();
    this.saving.set(true);

    this.informationService
      .updateInformation({
        introduccion,
        documentacionNecesaria,
        parroquiaCorrespondiente,
        entrevistaParroco,
        programaIsma,
        tiemposAnticipacion,
        contactoTelefono1: contactoTelefono1.trim() === '' ? null : contactoTelefono1.trim(),
        contactoTelefono2: contactoTelefono2.trim() === '' ? null : contactoTelefono2.trim(),
      })
      .subscribe({
        next: () => {
          this.toastrService.success('Información actualizada correctamente', 'Éxito');
          this.saving.set(false);
        },
        error: () => {
          this.toastrService.error('Error al guardar la información');
          this.saving.set(false);
        },
      });
  }
}
