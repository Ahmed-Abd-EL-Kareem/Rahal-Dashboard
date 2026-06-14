import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  
  let clonedReq = req;
  if (req.url.startsWith(environment.apiUrl)) {
    clonedReq = req.clone({ withCredentials: true });
    if (token) {
      clonedReq = clonedReq.clone({ headers: clonedReq.headers.set('Authorization', `Bearer ${token}`) });
    }
  }
  
  return next(clonedReq);
};
