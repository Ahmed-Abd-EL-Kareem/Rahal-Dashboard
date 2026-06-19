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
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Debugging: log token presence for dev (remove in production)
  // eslint-disable-next-line no-console
  console.debug('[authInterceptor] url=', req.url, 'startsWithApi=', req.url.startsWith(environment.apiUrl), 'tokenPresent=', !!token);

  // لا تضف أي Headers لطلبات Cloudinary
  if (req.url.includes('cloudinary.com')) {
    return next(req);
  }

  let clonedReq = req;

  if (req.url.startsWith(environment.apiUrl)) {
    clonedReq = req.clone({ withCredentials: true });

    if (token) {
      // eslint-disable-next-line no-console
      console.debug('[authInterceptor] Attaching Authorization header');
      clonedReq = clonedReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(clonedReq);
};
