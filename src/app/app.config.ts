import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './routes/app.routes';
// import { authInterceptor } from './core/interceptors/auth.interceptor';
// import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),

    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
  ]
};


// import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// import { authInterceptor } from './core/interceptors/auth.interceptor';
// import { errorInterceptor } from './core/interceptors/error.interceptor';

// import { routes } from './routes/app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideRouter(routes),

//     // Chart.js
//     provideCharts(withDefaultRegisterables()),

//     // HttpClient + Interceptors
//     provideHttpClient(
//       withInterceptors([
//         authInterceptor,
//         errorInterceptor
//       ])
//     )
//   ]
// };