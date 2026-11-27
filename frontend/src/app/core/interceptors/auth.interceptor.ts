import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

// Messages sent by the backend when the session itself is no longer valid.
// Other 401 errors (wrong login, wrong current password) must NOT log the user out.
const SESSION_ERRORS = [
  'Authentication required',
  'Invalid or expired token',
  'User no longer exists',
  'Your account is inactive'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const isApiCall = req.url.startsWith('/api');

  // Add the JWT automatically to every API request
  const request =
    token && isApiCall
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isSessionError =
        (error.status === 401 || error.status === 403) &&
        SESSION_ERRORS.includes(error.error?.message);

      // Expired token, deleted user or deactivated account: end the session
      if (isApiCall && token && isSessionError) {
        auth.logout();
      }

      return throwError(() => error);
    })
  );
};