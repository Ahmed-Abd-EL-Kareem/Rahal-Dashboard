// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { AuthService } from '../auth/auth.service';
// import { environment } from '../../../environments/environment';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const token = inject(AuthService).token();
  
//   let clonedReq = req;
//   if (req.url.startsWith(environment.apiUrl)) {
//     clonedReq = req.clone({ withCredentials: true });
//   }

//   if (token) {
//     clonedReq = clonedReq.clone({ headers: clonedReq.headers.set('Authorization', `Bearer ${token}`) });
//   }
  
//   return next(clonedReq);
// };
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();

  // لا تضف أي Headers لطلبات Cloudinary
  if (req.url.includes('cloudinary.com')) {
    return next(req);
  }

  let clonedReq = req;

  if (req.url.startsWith(environment.apiUrl)) {
    clonedReq = req.clone({
      withCredentials: true
    });

    if (token) {
      clonedReq = clonedReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(clonedReq);
};