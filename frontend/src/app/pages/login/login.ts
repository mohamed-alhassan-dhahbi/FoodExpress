import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { getErrorMessage } from '../../core/utils/http-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (user) => {
        // Go back to the page the user came from, otherwise to the space of their role
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const safe = returnUrl?.startsWith('/') && !returnUrl.startsWith('//');
        void this.router.navigateByUrl(safe ? returnUrl! : this.auth.homeRoute(user.role));
      },
      error: (err) => {
        this.error.set(getErrorMessage(err));
        this.loading.set(false);
      }
    });
  }
}