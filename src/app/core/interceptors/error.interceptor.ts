import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isChangePasswordRequest = req.url.includes('/users/change-password');

      if (err.status === 401 && req.url.startsWith(environment.apiUrl) && !isChangePasswordRequest) {
        auth.logout();
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.routerState.snapshot.url }
        });
      }

      // Handle 403 Forbidden
      if (err.status === 403) {
        console.warn('⚠️ 403 Forbidden: Access denied to this resource');
      }

      // Handle 404 Not Found
      if (err.status === 404) {
        console.warn('⚠️ 404 Not Found: Resource does not exist');
      }

      // Handle 500+ Server Errors
      if (err.status >= 500) {
        console.error('🔴 Server Error:', err.status);
      }

      // Log network errors
      if (err.status === 0) {
        console.error('🔴 Network Error: Cannot reach the server at', req.url);
        console.error('This could be:', [
          '- Backend server is down',
          '- Network connectivity issues',
          '- CORS policy violation',
          '- Invalid API URL'
        ]);
      }

      // Return the error to the caller
      return throwError(() => err);
    })
  );
};
