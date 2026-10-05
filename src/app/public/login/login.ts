import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule } from 'lucide-angular';
import { IconsService } from '../../core/services/icons.service';
import { Auth } from './services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);
  protected readonly iconsService = inject(IconsService);

  protected readonly date = new Date();
  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected readonly form = this.fb.nonNullable.group({
    user: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);

    const { user, password } = this.form.getRawValue();

    this.auth.login(user, password).subscribe({
      next: () => {
        this.toast.success('Inicio de sesión exitoso', 'Éxito');
        this.router.navigateByUrl('/dashboard');
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err.error.detail);
        this.toast.error('Error al iniciar sesión. Verifica tus credenciales.', 'Error');
        this.loading.set(false);
      },
    });
  }
}
