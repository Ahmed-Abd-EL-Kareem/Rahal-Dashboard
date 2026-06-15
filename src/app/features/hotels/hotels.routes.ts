
// import { Routes } from '@angular/router';

// export const HOTELS_ROUTES: Routes = [
//  {
//     path: '',
//     loadComponent: () =>
//       import('./hotels-list/hotels-list.component.')
//         .then(m => m.HotelsListComponent),
//   },
//   {
//     path: 'create',
//     loadComponent: () =>
//       import('./hotel-create/hotel-create')
//         .then(m => m.HotelCreateComponent),
//   },
// //   {
// //     path: 'bookings',
// //     loadComponent: () =>
// //       import('./hotel-bookings/hotel-bookings.component').then(m => m.HotelBookingsComponent),
// //   },
//   // {
//   //   path: ':id/edit',
//   //   loadComponent: () =>
//   //     import('./hotel-edit/').then(m => m.HotelEditComponent),
//   // },
//   {
//     path: ':id',
//     loadComponent: () =>
//       import('./hotel-detail/hotel-detail').then(m => m.HotelDetail),
//   },
// ];




import { Routes } from '@angular/router';

export const HOTELS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./hotels-list/hotels-list.component.')  // ✅ شيل النقطة الزيادة
        .then(m => m.HotelsListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./hotel-create/hotel-create')
        .then(m => m.HotelCreateComponent),
  },
// {
//   path: ':id/edit',
//   loadComponent: () =>
//     import('./hotel-edit/hotel-edit')
//       .then(m => m.HotelEdit),  // ✅ HotelEditComponent مش HotelEdit
// },
  {
    path: ':id',  // دايمًا تيجي آخر
    loadComponent: () =>
      import('./hotel-detail/hotel-detail').then(m => m.HotelDetailComponent),
  },
  
];