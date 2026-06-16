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
        loadChildren: () =>
          import('../features/hotels/hotels.routes').then(r => r.HOTELS_ROUTES)
      },
      {
        path: 'trips',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('../features/hotels/hotel-bookings/hotel-bookings').then(m => m.HotelBookingsComponent),
      },
      {
        path: 'ai-usage',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },

      // ── Subscriptions ──────────────────────────────────────────────────────
      {
        path: 'subscriptions',
        loadComponent: () =>
          import('../features/Subscription/pages/admin-subscription-plans/admin-subscription-plans')
            .then(c => c.AdminSubscriptionsComponent),
      },
      
       
{
  path: 'subscription',
  loadComponent: () =>
    import('../features/Subscription/pages/subscription-plans/subscription-plans')
      .then(c => c.SubscriptionsComponent),
},
      
  {
  path: 'admin-plans',
  loadComponent: () =>
    import('../features/Subscription/pages/admin-plans-componentmag/admin-plans-componentmag')
      .then(c => c.AdminPlansComponent),
},    // ──────────────────────────────────────────────────────────────────────

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