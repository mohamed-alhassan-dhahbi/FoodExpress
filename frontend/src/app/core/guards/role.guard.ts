import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Role } from '../models/user.model';
import { AuthService } from '../services/auth.service';

/**
 * Usage in routes: canActivate: [roleGuard('ADMIN')]
 * This only protects the page. The server checks the role again on every API call (rule 12).
 */
export const roleGuard = (...roles: Role[]): CanActivateFn => (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  return auth.hasRole(...roles) ? true : router.createUrlTree([auth.homeRoute()]);
};