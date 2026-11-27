import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { getErrorMessage, getFieldErrors } from '../../core/utils/http-error';

// Same rules as the backend
const passwordRules: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value ?? '';
  const errors: ValidationErrors = {};
  if (!/[a-z]/.test(value)) errors['lower'] = true;
  if (!/[A-Z]/.test(value)) errors['upper'] = true;
  if (!/[0-9]/.test(value)) errors['digit'] = true;
  return Object.keys(errors).length ? errors : null;
};

const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null =>
  group.get('password')?.value === group.get('confirmPassword')?.value ? null : { mismatch: true };

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly serverErrors = signal<Record<string, string>>({});

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(64), passwordRules]
      ],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatch }
  );

  /** A field shows its error once it was touched. */
  showError(name: string, error?: string): boolean {
    const control = this.form.get(name);
    if (!control || !control.touched) return false;
    return error ? control.hasError(error) : control.invalid;
  }

  /** Remove the server message of a field as soon as the user edits it. */
  clearServerError(name: string): void {
    if (this.serverErrors()[name]) {
      this.serverErrors.update(({ [name]: _removed, ...rest }) => rest);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.serverErrors.set({});

    this.auth.register(this.form.getRawValue()).subscribe({
      next: (user) => void this.router.navigateByUrl(this.auth.homeRoute(user.role)),
      error: (err) => {
        const fields = getFieldErrors(err);
        this.serverErrors.set(fields);
        // Show the general message only when no field is concerned (e.g. "Email already registered")
        this.error.set(Object.keys(fields).length ? '' : getErrorMessage(err));
        this.loading.set(false);
      }
    });
  }
}