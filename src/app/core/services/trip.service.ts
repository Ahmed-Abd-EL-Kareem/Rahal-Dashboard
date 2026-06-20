// import { Injectable, inject, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of, throwError } from 'rxjs';
// import { map, catchError, tap } from 'rxjs/operators';
// import { environment } from '../../../environments/environment';
// import { TripTemplate, TripCategory } from '../../models/trip-template.model';
// import { TripDetails, DayItinerary, TimelineEvent } from '../../models/trip-details.model';
// @Injectable({
//   providedIn: 'root'
// })
// export class TripService {
//   private http = inject(HttpClient);

//    // Standard list of templates (sharing database)
//   private initialTemplates: TripTemplate[] = [
//     {
//       id: 'TRP-8472',
//       title: 'Orlando Theme Park Classic',
//       description: 'A structured 7-day itinerary covering major theme parks with built-in rest days for families.',
//       category: 'Family',
//       icon: 'family_restroom',
//       duration: 7,
//       avgCost: '$$$-$$$$',
//       tags: ['Theme Parks', 'Kid-Friendly Dining'],
//       imageUrl: 'https://res.cloudinary.com/dczf74z1r/image/upload/v1718000000/family-classic.jpg',
//       imageAlt: 'Family playing on Orlando beach near parks'
//     },
//     {
//       id: 'TRP-9021',
//       title: 'Maldives Overwater Escape',
//       description: 'Ultimate relaxation with private transfers, spa treatments, and exclusive dining experiences.',
//       category: 'Luxury',
//       icon: 'diamond',
//       duration: 10,
//       avgCost: '$$$$$',
//       tags: ['Spa', 'Fine Dining', 'Private Tour'],
//       imageUrl: 'https://res.cloudinary.com/dczf74z1r/image/upload/v1718000000/luxury-retreat.jpg',
//       imageAlt: 'Luxury resort overwater villa'
//     },
//     {
//       id: 'TRP-7341',
//       title: 'Patagonia Circuit',
//       description: 'Intense 14-day trekking route with pre-booked refugios and optimal pacing suggestions.',
//       category: 'Adventure',
//       icon: 'hiking',
//       duration: 14,
//       avgCost: '$$$',
//       tags: ['Trekking', 'Camping'],
//       isAiGenerated: true,
//       imageUrl: 'https://res.cloudinary.com/dczf74z1r/image/upload/v1718000000/adventure.jpg',
//       imageAlt: 'Hiker overlooking vast Patagonia valley'
//     },
//     {
//       id: 'TRP-4812',
//       title: 'Paris 48-Hour Dash',
//       description: 'A highly optimized route hitting top landmarks and culinary hotspots with minimal transit time.',
//       category: 'Weekend',
//       icon: 'weekend',
//       duration: 3,
//       avgCost: '$$',
//       tags: ['Museums', 'Walking', 'Cafes'],
//       imageUrl: 'https://res.cloudinary.com/dczf74z1r/image/upload/v1718000000/weekend-getaway.jpg',
//       imageAlt: 'European cafe street layout at dusk'
//     }
//   ];
//    // Map from template ID to full trip details
//   private initialDetails: Record<string, TripDetails> = {
//     'TRP-8472': {
//       id: 'TRP-8472',
//       title: 'Classical Egypt Tour', // Recreated from Stitch Design
//       status: 'Confirmed',
//       pax: 12,
//       startDate: 'Oct 12',
//       endDate: 'Oct 22, 2024',
//       locations: ['Cairo', 'Luxor', 'Aswan'],
//       leadName: 'Sarah Jenkins',
//       budgetTotal: 18450,
//       grossMargin: 24,
//       budgetBreakdown: [
//         { label: 'Accommodation', amount: 8300, color: '#0F766E' },
//         { label: 'Activities & Tours', amount: 4610, color: '#F59E0B' },
//         { label: 'Transportation', amount: 3690, color: '#3B82F6' },
//         { label: 'Misc/Fees', amount: 1850, color: '#94A3B8' }
//       ],
//       internalNotes: 'VIP client (Mr. Smith). Ensure room at Marriott Mena House has direct pyramid view. Dietary restrictions: 2 vegetarians in group.',
//       routeOverviewCities: '3 Cities',
//       routeOverviewDetails: '1 Internal Flight • 1 Train'
//     },
//     'TRP-9021': {
//       id: 'TRP-9021',
//       title: 'Maldives Overwater Escape',
//       status: 'Confirmed',
//       pax: 2,
//       startDate: 'Nov 05',
//       endDate: 'Nov 15, 2024',
//       locations: ['Male', 'Maafushi'],
//       leadName: 'James C.',
//       budgetTotal: 12500,
//       grossMargin: 18,
//       budgetBreakdown: [
//         { label: 'Accommodation', amount: 7500, color: '#0F766E' },
//         { label: 'Activities & Tours', amount: 2500, color: '#F59E0B' },
//         { label: 'Transportation', amount: 1500, color: '#3B82F6' },
//         { label: 'Misc/Fees', amount: 1000, color: '#94A3B8' }
//       ],
//       internalNotes: 'Honeymoon couple. Request private beach dinners and sunset cruise scheduling.',
//       routeOverviewCities: '2 Atolls',
//       routeOverviewDetails: 'Private Speedboat Transfers'
//     }
//   };

//   // Default day-by-day itineraries mapping
//   private initialItineraries: Record<string, DayItinerary[]> = {
//     'TRP-8472': [
//       {
//         dayNumber: 1,
//         title: 'Arrival in Cairo',
//         date: 'Oct 12',
//         events: [
//           {
//             id: 'e1',
//             type: 'flight',
//             time: '14:30 PM',
//             title: 'CAI International Airport',
//             subtitle: 'EgyptAir MS986 • Terminal 3 • Meet & Greet included',
//             icon: 'flight_land'
//           },
//           {
//             id: 'e2',
//             type: 'transfer',
//             time: '15:30 PM',
//             title: 'Airport to Marriott Mena House',
//             subtitle: 'Mercedes Sprinter • Provider: Rahal Transport',
//             icon: 'directions_bus'
//           },
//           {
//             id: 'e3',
//             type: 'hotel',
//             time: 'Check-in: 16:30 PM',
//             title: 'Marriott Mena House',
//             subtitle: '6x Deluxe Pyramid View Rooms',
//             icon: 'hotel',
//             rating: 5
//           }
//         ]
//       },
//       {
//         dayNumber: 2,
//         title: 'Giza Plateau & Museum',
//         date: 'Oct 13',
//         events: [
//           {
//             id: 'e4',
//             type: 'activity',
//             time: '08:00 AM - 12:00 PM',
//             title: 'Great Pyramids of Giza & Sphinx',
//             subtitle: 'Private Egyptologist: Dr. Ahmed Zaki • Includes Great Pyramid entry ticket',
//             icon: 'tour'
//           }
//         ]
//       }
//     ]
//   };
// // Local signals acting as state cache
//   templatesSignal = signal<TripTemplate[]>(this.initialTemplates);
//   detailsSignal = signal<Record<string, TripDetails>>(this.initialDetails);
//   itinerariesSignal = signal<Record<string, DayItinerary[]>>(this.initialItineraries);

//   // ── Template List Methods ─────────────────────────────────
//   // getTemplates(): Observable<TripTemplate[]> {
//   //   return this.http.get<{ data: TripTemplate[] }>(`${environment.apiUrl}/trips`).pipe(
//   //     map(res => res.data),
//   //     tap(data => this.templatesSignal.set(data)),
//   //     catchError(() => {
//   //       console.log('Backend /trips API not ready. Loading local template cache.');
//   //       return of(this.templatesSignal());
//   //     })
//   //   );
//   // }
//   getTemplates(): Observable<TripTemplate[]> {
//   return this.http.get<any>(
//     `${environment.apiUrl}/trips`
//   ).pipe(
//     tap(res => console.log('Trips API Response:', res)),
//     map(res => res.data)
//   );
// }

//   createTemplate(templateData: Omit<TripTemplate, 'id'>): Observable<TripTemplate> {
//     return this.http.post<{ data: TripTemplate }>(`${environment.apiUrl}/trips`, templateData).pipe(
//       map(res => res.data),
//       tap(newT => {
//         this.templatesSignal.update(curr => [newT, ...curr]);
//       }),
//       catchError(() => {
//         console.log('Backend POST /trips failed. Creating in local cache.');
//         const mockNew: TripTemplate = {
//           ...templateData,
//           id: 'TRP-' + Math.floor(1000 + Math.random() * 9000).toString()
//         };
//         this.templatesSignal.update(curr => [mockNew, ...curr]);

//         // Also auto-initialize a mock details page for it
//         this.detailsSignal.update(curr => ({
//           ...curr,
//           [mockNew.id]: {
//             id: mockNew.id,
//             title: mockNew.title,
//             status: 'Confirmed',
//             pax: 2,
//             startDate: 'TBD',
//             endDate: 'TBD',
//             locations: [mockNew.category],
//             leadName: 'New Client',
//             budgetTotal: 5000,
//             grossMargin: 20,
//             budgetBreakdown: [
//               { label: 'Accommodation', amount: 3000, color: '#0F766E' },
//               { label: 'Activities & Tours', amount: 1000, color: '#F59E0B' },
//               { label: 'Transportation', amount: 1000, color: '#3B82F6' }
//             ],
//             internalNotes: mockNew.description,
//             routeOverviewCities: '1 City',
//             routeOverviewDetails: 'Standard transfers included'
//           }
//         }));

//         return of(mockNew);
//       })
//     );
//   }

//   deleteTemplate(id: string): Observable<boolean> {
//     return this.http.delete(`${environment.apiUrl}/trips/${id}`).pipe(
//       map(() => true),
//       tap(() => {
//         this.templatesSignal.update(curr => curr.filter(t => t.id !== id));
//       }),
//       catchError(() => {
//         console.log(`Backend DELETE /trips/${id} failed. Deleting from local cache.`);
//         this.templatesSignal.update(curr => curr.filter(t => t.id !== id));
//         return of(true);
//       })
//     );
//   }

//   // ── Trip Details Methods ──────────────────────────────────
//   getTripDetails(id: string): Observable<TripDetails> {
//     return this.http.get<{ data: TripDetails }>(`${environment.apiUrl}/trips/${id}`).pipe(
//       map(res => res.data),
//       tap(data => {
//         this.detailsSignal.update(curr => ({ ...curr, [id]: data }));
//       }),
//       catchError(() => {
//         console.log(`Backend GET /trips/${id} failed. Resolving from local detail cache.`);
//         const detail = this.detailsSignal()[id];
//         if (detail) return of(detail);

//         // Dynamic fallback creation for random IDs
//         const fallbackDetail: TripDetails = {
//           id,
//           title: 'Classical Trip Pack',
//           status: 'Confirmed',
//           pax: 2,
//           startDate: 'Nov 10',
//           endDate: 'Nov 20, 2024',
//           locations: ['Multiple Cities'],
//           leadName: 'Sarah Jenkins',
//           budgetTotal: 12000,
//           grossMargin: 22,
//           budgetBreakdown: [
//             { label: 'Accommodation', amount: 6000, color: '#0F766E' },
//             { label: 'Activities & Tours', amount: 3000, color: '#F59E0B' },
//             { label: 'Transportation', amount: 2000, color: '#3B82F6' },
//             { label: 'Misc/Fees', amount: 1000, color: '#94A3B8' }
//           ],
//           internalNotes: 'No notes entered yet.',
//           routeOverviewCities: '2 Cities',
//           routeOverviewDetails: 'Standard schedule'
//         };
//         return of(fallbackDetail);
//       })
//     );
//   }

//   getItinerary(id: string): Observable<DayItinerary[]> {
//     return this.http.get<{ data: DayItinerary[] }>(`${environment.apiUrl}/trips/${id}/itinerary`).pipe(
//       map(res => res.data),
//       tap(data => {
//         this.itinerariesSignal.update(curr => ({ ...curr, [id]: data }));
//       }),
//       catchError(() => {
//         console.log(`Backend Itinerary API failed. Loading local itinerary cache for ${id}.`);
//         const itin = this.itinerariesSignal()[id];
//         if (itin) return of(itin);

//         // Default standard fallback
//         const fallbackItin: DayItinerary[] = [
//           {
//             dayNumber: 1,
//             title: 'Initial Welcome & Briefing',
//             date: 'Day 1',
//             events: [
//               {
//                 id: 'e-fallback-1',
//                 type: 'flight',
//                 time: '12:00 PM',
//                 title: 'Arrival & Welcome',
//                 subtitle: 'Greeting by Rahal Coordinator',
//                 icon: 'flight_land'
//               }
//             ]
//           }
//         ];
//         return of(fallbackItin);
//       })
//     );
//   }

//   updateTripDetails(id: string, details: Partial<TripDetails>): Observable<TripDetails> {
//     return this.http.patch<{ data: TripDetails }>(`${environment.apiUrl}/trips/${id}`, details).pipe(
//       map(res => res.data),
//       tap(updated => {
//         this.detailsSignal.update(curr => ({ ...curr, [id]: updated }));
//       }),
//       catchError(() => {
//         console.log(`Backend PATCH /trips/${id} failed. Updating local cache.`);
//         this.detailsSignal.update(curr => {
//           const old = curr[id] || {};
//           return {
//             ...curr,
//             [id]: { ...old, ...details } as TripDetails
//           };
//         });
//         return of(this.detailsSignal()[id]);
//       })
//     );
//   }

//   updateItinerary(id: string, itinerary: DayItinerary[]): Observable<DayItinerary[]> {
//     return this.http.put<{ data: DayItinerary[] }>(`${environment.apiUrl}/trips/${id}/itinerary`, { itinerary }).pipe(
//       map(res => res.data),
//       tap(updated => {
//         this.itinerariesSignal.update(curr => ({ ...curr, [id]: updated }));
//       }),
//       catchError(() => {
//         console.log(`Backend PUT itinerary failed. Updating local itinerary cache for ${id}.`);
//         this.itinerariesSignal.update(curr => ({
//           ...curr,
//           [id]: itinerary
//         }));
//         return of(itinerary);
//       })
//     );
//   }
// }
































///////////
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Trip, TripQueryParams, TripsListResponse } from '../../models/trip.model';
import { MOCK_TRIPS, MOCK_TRIP_BY_ID } from '../mocks/trip.mock';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private http = inject(HttpClient);

  // Local signals acting as state cache
  templatesSignal = signal<Trip[]>([]);
  detailsSignal = signal<Record<string, Trip>>({});

  // ── Trip API Methods ──────────────────────────────────────

  getTemplates(params?: TripQueryParams): Observable<TripsListResponse> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit != null) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search?.trim()) httpParams = httpParams.set('search', params.search.trim());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.isAIGenerated != null) {
        httpParams = httpParams.set('isAIGenerated', String(params.isAIGenerated));
      }
      if (params.category && params.category !== 'All') {
        httpParams = httpParams.set('category', params.category);
      }
      if (params.budgetRange && params.budgetRange !== 'All') {
        httpParams = httpParams.set('budgetRange', params.budgetRange);
      }
    }

    return this.http
      .get<{ data: Trip[]; pagination?: TripsListResponse['pagination'] }>(
        `${environment.apiUrl}/trips/admin/all`,
        { params: httpParams }
      )
      .pipe(
        map((res) => ({
          data: res.data || [],
          pagination: res.pagination ?? {
            total: res.data?.length ?? 0,
            page: params?.page ?? 1,
            limit: params?.limit ?? 10,
            totalPages: 1,
          },
        })),
        tap(({ data }) => {
          this.templatesSignal.set(data);
        }),
        catchError((error: HttpErrorResponse) => {
          console.warn('Failed to fetch trips, using mock data:', error);
          this.templatesSignal.set(MOCK_TRIPS);
          return of({
            data: MOCK_TRIPS,
            pagination: {
              total: MOCK_TRIPS.length,
              page: 1,
              limit: params?.limit ?? 10,
              totalPages: 1,
            },
          });
        })
      );
  }

  createTemplate(templateData: any): Observable<Trip> {
    console.log('📡 Creating trip template:', templateData);
    return this.http.post<{ data: { trip: Trip } }>(`${environment.apiUrl}/trips`, templateData).pipe(
      map(res => res.data.trip),
      tap(newT => {
        console.log('✅ Trip template created successfully:', newT);
        this.templatesSignal.update(curr => [newT, ...curr]);
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn('❌ Failed to create trip template:', error);
        // Create a mock trip for offline use
        const mockTrip: Trip = {
          _id: Date.now().toString(),
          ...templateData,
          estimatedTotalCost: templateData.estimatedTotalCost || 0,
          days: [],
          status: 'draft',
          isAIGenerated: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.templatesSignal.update(curr => [mockTrip, ...curr]);
        return of(mockTrip);
      })
    );
  }

  deleteTemplate(id: string): Observable<boolean> {
    console.log('📡 Deleting trip template:', id);
    return this.http.delete(`${environment.apiUrl}/trips/${id}`).pipe(
      map(() => true),
      tap(() => {
        console.log('✅ Trip template deleted successfully');
        this.templatesSignal.update(curr => curr.filter(t => t._id !== id));
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn('❌ Failed to delete trip template:', error);
        // Still remove from local state even if API fails
        this.templatesSignal.update(curr => curr.filter(t => t._id !== id));
        return of(true);
      })
    );
  }

  getTripDetails(id: string): Observable<Trip> {
    console.log('📡 Fetching trip details for ID:', id);
    return this.http
      .get<{ data: Trip }>(`${environment.apiUrl}/trips/admin/${id}`)

      .pipe(
        map((res) => res.data),
        tap((data) => {
          console.log('✅ Trip details loaded successfully:', data);
          this.detailsSignal.update((curr) => ({ ...curr, [id]: data }));
        }),
        catchError((error: HttpErrorResponse) => {
          console.warn('❌ Failed to fetch trip details, using mock data:', error);
          console.warn('Error status:', error.status, 'Message:', error.message);

          // Try to get mock data
          const mockTrip = MOCK_TRIP_BY_ID[id];
          if (mockTrip) {
            console.log('✅ Using mock data for trip:', id);
            this.detailsSignal.update((curr) => ({ ...curr, [id]: mockTrip }));
            return of(mockTrip);
          }

          // If no mock data found, return a default trip
          const defaultTrip: Trip = {
            _id: id,
            title: 'Trip Not Found',
            destination: 'Unknown',
            imageUrl: null,
            duration: 0,
            budget: 'mid-range',
            travelers: 1,
            interests: [],
            summary: 'This trip data is not available.',
            estimatedTotalCost: 0,
            currency: 'EGP',
            language: 'en',
            status: 'draft',
            isAIGenerated: false,
            days: [],
          };
          this.detailsSignal.update((curr) => ({ ...curr, [id]: defaultTrip }));
          return of(defaultTrip);
        }),
      );
  }

  updateTripDetails(id: string, details: Partial<Trip>): Observable<Trip> {
    console.log('📡 Updating trip details for ID:', id, 'with:', details);
    return this.http.patch<{ data: Trip }>(`${environment.apiUrl}/trips/admin/${id}`, details).pipe(
      map(res => res.data),
      tap(updated => {
        console.log('✅ Trip details updated successfully:', updated);
        this.detailsSignal.update(curr => ({ ...curr, [id]: updated }));
        this.templatesSignal.update(curr =>
          curr.map(t => (t._id === id ? { ...t, ...updated } : t))
        );
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn('❌ Failed to update trip details:', error);
        // Still update local state with the partial data
        const currentTrip = this.detailsSignal()[id];
        if (currentTrip) {
          const updatedTrip = { ...currentTrip, ...details, updatedAt: new Date().toISOString() };
          this.detailsSignal.update(curr => ({ ...curr, [id]: updatedTrip }));
          this.templatesSignal.update(curr =>
            curr.map(t => (t._id === id ? { ...t, ...updatedTrip } : t))
          );
          return of(updatedTrip);
        }
        return of({ ...details, _id: id } as Trip);
      })
    );
  }
}
