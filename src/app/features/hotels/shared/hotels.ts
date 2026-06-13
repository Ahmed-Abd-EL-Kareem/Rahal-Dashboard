import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  HotelListResponse,
  HotelResponse,
  BookingListResponse,
  HotelFilters,
  CreateHotelDto,
} from './hotel.model';

@Injectable({ providedIn: 'root' })
export class HotelsService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getHotels(filters: HotelFilters = {}): Observable<HotelListResponse> {
    let params = new HttpParams();

    if (filters.city) params = params.set('city', filters.city);
    if (filters.stars) params = params.set('stars', filters.stars.toString());
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sort) params = params.set('sort', filters.sort);

    params = params.set('page', (filters.page || 1).toString());
    params = params.set('limit', (filters.limit || 10).toString());

    return this.http.get<HotelListResponse>(`${this.base}/hotels`, { params });
  }

  getHotelById(id: string): Observable<HotelResponse> {
    return this.http.get<HotelResponse>(`${this.base}/hotels/${id}`);
  }

  createHotel(dto: CreateHotelDto): Observable<HotelResponse> {
    return this.http.post<HotelResponse>(`${this.base}/hotels`, dto);
  }

  updateHotel(id: string, dto: Partial<CreateHotelDto>): Observable<HotelResponse> {
    return this.http.patch<HotelResponse>(`${this.base}/hotels/${id}`, dto);
  }

  deleteHotel(id: string): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(
      `${this.base}/hotels/${id}`
    );
  }

  getAllBookings(filters: any = {}): Observable<BookingListResponse> {
    let params = new HttpParams();

    if (filters.status) params = params.set('status', filters.status);
    if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);

    params = params.set('page', (filters.page || 1).toString());
    params = params.set('limit', (filters.limit || 10).toString());

    return this.http.get<BookingListResponse>(
      `${this.base}/bookings/admin/all`,
      { params }
    );
  }

  updateBookingStatus(id: string, status: any) {
    return this.http.patch(`${this.base}/bookings/admin/${id}/status`, { status });
  }

  // ✅ FIXED: getCities
  getCities(): Observable<string[]> {
    return this.http
      .get<HotelListResponse>(`${this.base}/hotels?limit=200&fields=city`)
      .pipe(
        map(res =>
          [...new Set(
            res.data
              .map(h => h.city)
              .filter(Boolean)
          )].sort()
        )
      );
  }

  // ⭐ stars options
  getAvailableStars(): Observable<number[]> {
    return this.http
      .get<HotelListResponse>(`${this.base}/hotels?limit=200&fields=stars`)
      .pipe(
        map(res =>
          [...new Set(
            res.data
              .map(h => h.stars)
              .filter(Boolean)
          )].sort((a, b) => a - b)
        )
      );
  }

  getMeta(): Observable<{
  cities: string[];
  regions: string[];
  amenities: string[];
  roomTypes: string[];
  currencies: string[];
}> {
  return this.http
    .get<any>(`${this.base}/hotels/meta`)
    .pipe(map(res => res.data));
}

getHotelBookings(hotelId: string, filters: any = {}): Observable<BookingListResponse> {
  let params = new HttpParams();
  if (filters.status) params = params.set('status', filters.status);
  params = params.set('page', (filters.page || 1).toString());
  params = params.set('limit', (filters.limit || 100).toString());

  return this.http.get<BookingListResponse>(
    `${this.base}/bookings/admin/all`,
    { params }
  ).pipe(
    // فلتر على مستوى الـ client على الفندق المطلوب
map(res => ({
  ...res,
  data: {
    ...res.data,
    bookings: res.data.bookings.filter((b: any) =>
      (b.hotel?._id ?? b.hotel) === hotelId
    )
  }
}))
  );
}
}

