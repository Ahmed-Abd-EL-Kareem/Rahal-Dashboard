<<<<<<< HEAD
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

import { routes } from './routes/app.routes';
// import { authInterceptor } from './core/interceptors/auth.interceptor';
// import { errorInterceptor } from './core/interceptors/error.interceptor';
=======
// import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// import { routes } from './routes/app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideRouter(routes),
//     provideCharts(withDefaultRegisterables())
//   ]
// };

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // 👈 ضيفي السطر ده
import { authInterceptor } from './core/interceptors/auth.interceptor'; // 👈 تأكدي من صحة المسار حسب مشروعك

import { routes } from './routes/app.routes';
>>>>>>> 8457a8f (Initial commit)

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
<<<<<<< HEAD
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
  ]
};

=======
    provideCharts(withDefaultRegisterables()),
    provideHttpClient(withInterceptors([authInterceptor])) // 👈 سجلنا الـ HttpClient والـ Interceptor هنا
  ]
};
>>>>>>> 8457a8f (Initial commit)
