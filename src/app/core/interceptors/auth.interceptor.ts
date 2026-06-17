import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  let clonedReq = req;

  // Only add auth header for API requests
  if (req.url.startsWith(environment.apiUrl)) {
    console.log(`🔐 Auth Interceptor: Processing request to ${req.url}`);
    console.log(`🔑 Token status: ${token ? '✅ Token found' : '❌ No token available'}`);
    
    if (token) {
      console.log(`📤 Adding Bearer token to Authorization header`);
      clonedReq = req.clone({
        withCredentials: true,
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    } else {
      console.warn(`⚠️ No token available for API request to ${req.url}`);
      clonedReq = req.clone({
        withCredentials: true
      });
    }
  }

  return next(clonedReq);
};