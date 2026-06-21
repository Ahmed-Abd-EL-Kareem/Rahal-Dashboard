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
  TopHotel,
} from './dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private readonly authOpts = { withCredentials: true };

  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      users: this.http
        .get<{ data: UserStats }>(`${this.api}/users/stats`, this.authOpts)
        .pipe(map((r) => r.data)),

      trips: this.http
        .get<{ data: TripStats }>(`${this.api}/trips/stats`, this.authOpts)
        .pipe(map((r) => r.data)),

      bookings: this.http
        .get<{ data: Record<string, unknown> }>(`${this.api}/bookings/admin/stats`, this.authOpts)
        .pipe(
          map((r) => {
            const data = r.data;
            const topHotels = this.mapTopHotels(data['topHotels']);

            return {
              totalRevenue: Number(data['totalRevenue'] ?? 0),
              revenueGrowth: Number(data['revenueGrowth'] ?? 0),
              revenueChart: (data['revenueByMonth'] as BookingStats['revenueChart']) ?? [],
              bookingTrends: ((data['bookingTrends'] as Array<{ day: string; hotels: number }>) ?? []).map(
                (t) => ({
                  day: t.day,
                  hotels: t.hotels,
                })
              ),
              topHotels,
            };
          })
        ),

      destinations: this.http
        .get<{ data: DestinationsResponse }>(
          `${this.api}/destinations/trending?limit=3`,
          this.authOpts
        )
        .pipe(map((r) => r.data)),

      subscriptions: this.http
        .get<{ data: SubscriptionStats }>(
          `${this.api}/subscriptions/admin/dashboard-stats`,
          this.authOpts
        )
        .pipe(map((r) => r.data)),

      ai: this.http
        .get<{ data: AiStats }>(`${this.api}/ai/stats`, this.authOpts)
        .pipe(map((r) => r.data)),
    }).pipe(
      map(({ users, trips, bookings, destinations, subscriptions, ai }) => ({
        users,
        trips,
        bookings: {
          totalRevenue: bookings.totalRevenue,
          revenueGrowth: bookings.revenueGrowth,
          revenueChart: bookings.revenueChart,
          bookingTrends: bookings.bookingTrends,
        },
        destinations,
        hotels: { hotels: bookings.topHotels } satisfies HotelsResponse,
        subscriptions,
        ai,
      }))
    );
  }

  private mapTopHotels(raw: unknown): TopHotel[] {
    if (!Array.isArray(raw)) return [];

    return raw.map((hotel) => {
      const item = hotel as Record<string, unknown>;
      const name = item['name'];

      return {
        name: typeof name === 'object' && name !== null
          ? String((name as Record<string, unknown>)['en'] ?? '')
          : String(name ?? ''),
        location: String(item['city'] ?? item['location'] ?? ''),
        revenue: Number(item['revenue'] ?? 0),
        bookings: Number(item['bookings'] ?? 0),
        rating: Number(item['stars'] ?? item['rating'] ?? 0),
      };
    });
  }
}
