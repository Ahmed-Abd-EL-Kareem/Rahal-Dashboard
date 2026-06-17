import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const errorDetails = {
        status: err.status,
        statusText: err.statusText,
        url: err.url,
        message: err.error?.message || err.message,
        error: err.error
      };

      console.error('🔴 HTTP Error Intercepted:', errorDetails);

      // Handle 401 Unauthorized
      if (err.status === 401) {
        console.warn('⚠️ 401 Unauthorized: Token is invalid or expired');
        console.warn('📍 Triggering logout due to authentication failure');
        
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
