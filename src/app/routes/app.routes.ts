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
        loadComponent: () => import('../features/destinations/list/destination-list').then(c => c.DestinationListComponent)
      },
      {
        path: 'destinations/create',
        loadComponent: () => import('../features/destinations/create/destination-create').then(c => c.DestinationCreateComponent)
      },
      {
        path: 'destinations/edit/:id',
        loadComponent: () => import('../features/destinations/edit/destination-edit').then(c => c.DestinationEditComponent)
      },
      {
        path: 'destinations/:id',
        loadComponent: () => import('../features/destinations/details/destination-details').then(c => c.DestinationDetailsComponent)
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
