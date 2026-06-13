import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('../features/auth/login/login').then(c => c.Login),
    canActivate: [noAuthGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('../features/auth/forgot-password/forgot-password').then(c => c.ForgotPassword),
    canActivate: [noAuthGuard]
  },
  {
    path: 'verify-otp',
    loadComponent: () => import('../features/auth/verify-otp/verify-otp').then(c => c.VerifyOtp),
    canActivate: [noAuthGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('../features/auth/reset-password/reset-password').then(c => c.ResetPassword),
    canActivate: [noAuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('../layout/dashboard-layout/shell/shell').then(c => c.Shell),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'destinations',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'hotels',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'trips',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'ai-usage',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'stripe',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
