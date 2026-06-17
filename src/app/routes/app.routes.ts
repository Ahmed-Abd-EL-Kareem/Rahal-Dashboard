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
        loadComponent: () => import('../shared/components/user/user').then(c => c.UsersComponent)
      },
      {
        path: 'users/:name',
        loadComponent: () => import('../shared/components/user-details/user-details').then(c => c.UserDetailsComponent)
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
        path: 'destinations/edit/:slug',
        loadComponent: () => import('../features/destinations/edit/destination-edit').then(c => c.DestinationEditComponent)
      },
      {
        path: 'destinations/:slug',
        loadComponent: () => import('../features/destinations/details/destination-details').then(c => c.DestinationDetailsComponent)
      },
 {
  path: 'hotels',
  loadChildren: () =>
    import('../features/hotels/hotels.routes')
      .then(r => r.HOTELS_ROUTES)
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
  loadComponent: () => import('../features/hotels/hotel-bookings/hotel-bookings').then(m => m.HotelBookingsComponent),
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
        loadComponent: () => import('../features/payments/payments').then(c => c.Payments)
      },
      {
        path: 'payments/:id',
        loadComponent: () => import('../features/payments/payment-details/payment-details').then(c => c.PaymentDetails)
      },
      {
        path: 'stripe',
        loadComponent: () => import('../shared/components/placeholder/placeholder.component').then(c => c.PlaceholderComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('../features/profile/profile').then(c => c.ProfileComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
