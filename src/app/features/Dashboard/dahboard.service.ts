import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DashboardData,
  UserStats,
  TripStats,
  BookingStats,
  DestinationsResponse,
  HotelsResponse,
  SubscriptionStats,
  AiStats,
} from '../Dashboard/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      users: this.http
        .get<{ data: UserStats }>(`${this.api}/users/stats`)
        .pipe(map((r) => r.data)),

      trips: this.http
        .get<{ data: TripStats }>(`${this.api}/trips/stats`)
        .pipe(map((r) => r.data)),

    bookings: this.http
  .get<any>(`${this.api}/bookings/admin/stats`)
  .pipe(map((r) => ({
    totalRevenue: r.data.totalRevenue,
    revenueGrowth: r.data.revenueGrowth,
    revenueChart: r.data.revenueByMonth,
    bookingTrends: r.data.bookingTrends.map((t: any) => ({
      day: t.day,
      hotels: t.hotels,
      
    })),
  }))),

      destinations: this.http
        .get<{ data: DestinationsResponse }>(
          `${this.api}/destinations/trending?limit=3`
        )
        .pipe(map((r) => r.data)),
hotels: this.http
  .get<any>(`${this.api}/hotels/top?limit=5`)
  .pipe(map((r) => ({ hotels: r.data.hotels }))),

      subscriptions: this.http
        .get<{ data: SubscriptionStats }>(
          `${this.api}/subscriptions/admin/dashboard-stats`
        )
        .pipe(map((r) => r.data)),

      ai: this.http
        .get<{ data: AiStats }>(`${this.api}/ai/stats`)
        .pipe(map((r) => r.data)),
    });
  }
}