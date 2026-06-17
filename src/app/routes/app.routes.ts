import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'trips', redirectTo: '/dashboard/trips', pathMatch: 'full' },
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
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'trips',
        loadComponent: () => import('../features/trips/trips-list/trips-list.component').then(c => c.TripsListComponent)
      },
      {
        path: 'trips/create',
        loadComponent: () => import('../features/trips/create-trip/create-trip.component').then(c => c.CreateTripComponent)
      },
      {
        path: 'trips/edit/:id',
        loadComponent: () => import('../features/trips/edit-trip/edit-trip.component').then(c => c.EditTripComponent)
      },
      {
        path: 'trips/:tripId',
        loadComponent: () => import('../features/trips/trip-details/trip-details.component').then(c => c.TripDetailsComponent)
      },
      {
        path: 'trip-templates',
        loadComponent: () =>
          import('../features/trips/trip-templates/trip-templates.component')
            .then(c => c.TripTemplatesComponent)
      },
      {
        path: 'trip-templates/create',
        loadComponent: () => import('../features/trips/create-template/create-template.component').then(c => c.CreateTemplateComponent)
      },
      {
        path: 'trip-templates/edit/:id',
        loadComponent: () => import('../features/trips/edit-template/edit-template.component').then(c => c.EditTemplateComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'ai-usage',
        loadComponent: () => import('../features/ai-usage/ai-usage.component').then(c => c.AIUsageComponent)
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

