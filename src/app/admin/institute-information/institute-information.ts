import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { InstitutoInformacionForm } from '../../core/models/institute-information.model';
import { TitleComponent } from '../../shared/components/title/title';
import { InstituteInformationService } from './services/institute-information';

const EMPTY_FORM: InstitutoInformacionForm = {
  name: '',
  description: '',
  contactEmail: '',
  contactPhone: '',
};

/**
 * Admin de "Instituto Bíblico → Información general" (Tarea 3.1). Recurso singleton:
 * un solo formulario en la pagina, sin tabla ni modal de creación/edición.
 */
@Component({
  selector: 'app-institute-information',
  imports: [CommonModule, TitleComponent],
  templateUrl: './institute-information.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstituteInformationComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  protected readonly informationService = inject(InstituteInformationService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly form = signal<InstitutoInformacionForm>({ ...EMPTY_FORM });

  readonly isFormValid = () => {
    const f = this.form();
    return f.name.trim() !== '' && f.description.trim() !== '';
  };

  ngOnInit(): void {
    this.loading.set(true);
    this.informationService.getInformation().subscribe({
      next: (info) => {
        this.form.set({
          name: info.name,
          description: info.description,
          contactEmail: info.contactEmail ?? '',
          contactPhone: info.contactPhone ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.toastrService.error('Error al cargar la información del Instituto');
        this.loading.set(false);
      },
    });
  }

  updateName(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    this.form.update((f) => ({ ...f, name: value }));
  }

  updateDescription(e: Event): void {
    const value = (e.target as HTMLTextAreaElement).value;
    this.form.update((f) => ({ ...f, description: value }));
  }

  updateContactEmail(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    this.form.update((f) => ({ ...f, contactEmail: value }));
  }

  updateContactPhone(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    this.form.update((f) => ({ ...f, contactPhone: value }));
  }

  save(): void {
    if (!this.isFormValid()) {
      this.toastrService.warning('Revise la información proporcionada', 'Formulario inválido');
      return;
    }

    const { name, description, contactEmail, contactPhone } = this.form();
    this.saving.set(true);

    this.informationService
      .updateInformation({
        name,
        description,
        contactEmail: contactEmail.trim() === '' ? null : contactEmail.trim(),
        contactPhone: contactPhone.trim() === '' ? null : contactPhone.trim(),
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
