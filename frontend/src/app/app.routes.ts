import { Component, inject } from '@angular/core';
import { Routes } from '@angular/router';

import { guestGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';

// TEMPORARY: Student 2 will replace this with the real home page
@Component({
  template: `
    <div class="container py-5">
      <h1>Home (placeholder)</h1>
      @if (auth.isLoggedIn()) {
        <p>Logged in as {{ auth.fullName() }} ({{ auth.role() }})</p>
        <button class="btn btn-outline-danger" (click)="auth.logout()">Log out</button>
      } @else {
        <a class="btn btn-primary" href="/login">Log in</a>
      }
    </div>
  `
})
class HomePlaceholder {
  protected readonly auth = inject(AuthService);
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomePlaceholder },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register').then((m) => m.Register)
  }
];