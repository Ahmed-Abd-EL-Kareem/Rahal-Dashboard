// import { Injectable, inject } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';
// import { Booking, BookingsAdminQuery, BookingsAdminResponse } from '../../models/booking.models';

// @Injectable({
//   providedIn: 'root'
// })
// export class BookingService {
//   private http = inject(HttpClient);
//   private baseUrl = `${environment.apiUrl}/bookings`;

//   /**
//    * Fetches all bookings (admin only). Used to derive payment KPIs,
//    * revenue chart data, and recent transactions on the Payments Overview page.
//    * GET /api/v1/bookings/admin/all
//    */
//   getAllBookings(query: BookingsAdminQuery = {}): Observable<BookingsAdminResponse> {
//     let params = new HttpParams();
//     if (query.page) params = params.set('page', query.page);
//     if (query.limit) params = params.set('limit', query.limit);
//     if (query.sort) params = params.set('sort', query.sort);
//     if (query.status) params = params.set('status', query.status);
//     if (query.paymentStatus) params = params.set('paymentStatus', query.paymentStatus);

//     return this.http.get<BookingsAdminResponse>(`${this.baseUrl}/admin/all`, { params });
    
//   }

//   /**
//    * GET /api/v1/bookings/:id
//    * Fetches a single booking by ID (used for Transaction Details).
//    */
//   getBookingById(id: string): Observable<{ status: string; data: { booking: Booking } }> {
//     return this.http.get<{ status: string; data: { booking: Booking } }>(`${this.baseUrl}/${id}`);
//   }

//   /**
//    * GET /api/v1/payments/status/:bookingId
//    * Get payment status for a single booking (Stripe-backed).
//    */
//   getPaymentStatus(bookingId: string): Observable<{ status: string; data: any }> {
//     return this.http.get<{ status: string; data: any }>(`${environment.apiUrl}/payments/status/${bookingId}`);
//   }

//   /**
//    * POST /api/v1/payments/pay/checkout
//    * Creates a Stripe checkout session for a booking.
//    */
//   createCheckoutSession(bookingId: string, currency?: string): Observable<{ url: string; sessionId: string; amount: number; currency: string; bookingId: string }> {
//     return this.http.post<{ url: string; sessionId: string; amount: number; currency: string; bookingId: string }>(
//       `${environment.apiUrl}/payments/pay/checkout`,
//       { bookingId, ...(currency ? { currency } : {}) }
//     );
//   }
// }
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Booking,
  BookingsAdminQuery,
  BookingsAdminResponse
} from '../../models/booking.models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/bookings`;

  /**
   * Fetches all bookings (admin only).
   * GET /api/v1/bookings/admin/all
   */
  getAllBookings(query: BookingsAdminQuery = {}): Observable<BookingsAdminResponse> {
    let params = new HttpParams();

    if (query.page) {
      params = params.set('page', query.page);
    }

    if (query.limit) {
      params = params.set('limit', query.limit);
    }

    if (query.sort) {
      params = params.set('sort', query.sort);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    if (query.paymentStatus) {
      params = params.set('paymentStatus', query.paymentStatus);
    }

    console.log('========== GET ALL BOOKINGS ==========');
    console.log('URL:', `${this.baseUrl}/admin/all`);
    console.log('Params:', params.toString());

    return this.http
      .get<BookingsAdminResponse>(`${this.baseUrl}/admin/all`, { params })
      .pipe(
        tap({
          next: (response) => {
            console.log('✅ BOOKINGS RESPONSE:', response);

            if (response?.data?.bookings) {
              console.log(
                '📦 Number of bookings:',
                response.data.bookings.length
              );
              console.log(
                '📦 Bookings:',
                response.data.bookings
              );
            } else {
              console.warn('⚠️ No bookings found in response');
            }
          },
          error: (error) => {
            console.error('❌ BOOKINGS API ERROR:', error);
          }
        })
      );
  }

  /**
   * GET /api/v1/bookings/:id
   */
  getBookingById(
    id: string
  ): Observable<{ status: string; data: { booking: Booking } }> {
    console.log('========== GET BOOKING BY ID ==========');
    console.log('Booking ID:', id);

    return this.http
      .get<{ status: string; data: { booking: Booking } }>(
        `${this.baseUrl}/${id}`
      )
      .pipe(
        tap({
          next: (response) => {
            console.log('✅ BOOKING DETAILS RESPONSE:', response);
          },
          error: (error) => {
            console.error('❌ BOOKING DETAILS ERROR:', error);
          }
        })
      );
  }

  /**
   * GET /api/v1/payments/status/:bookingId
   */
  getPaymentStatus(
    bookingId: string
  ): Observable<{ status: string; data: any }> {
    console.log('========== PAYMENT STATUS ==========');
    console.log('Booking ID:', bookingId);

    return this.http
      .get<{ status: string; data: any }>(
        `${environment.apiUrl}/payments/status/${bookingId}`
      )
      .pipe(
        tap({
          next: (response) => {
            console.log('✅ PAYMENT STATUS RESPONSE:', response);
          },
          error: (error) => {
            console.error('❌ PAYMENT STATUS ERROR:', error);
          }
        })
      );
  }

  /**
   * POST /api/v1/payments/pay/checkout
   */
  createCheckoutSession(
    bookingId: string,
    currency?: string
  ): Observable<{
    url: string;
    sessionId: string;
    amount: number;
    currency: string;
    bookingId: string;
  }> {
    const payload = {
      bookingId,
      ...(currency ? { currency } : {})
    };

    console.log('========== CREATE CHECKOUT ==========');
    console.log('Payload:', payload);

    return this.http
      .post<{
        url: string;
        sessionId: string;
        amount: number;
        currency: string;
        bookingId: string;
      }>(
        `${environment.apiUrl}/payments/pay/checkout`,
        payload
      )
      .pipe(
        tap({
          next: (response) => {
            console.log('✅ CHECKOUT RESPONSE:', response);
          },
          error: (error) => {
            console.error('❌ CHECKOUT ERROR:', error);
          }
        })
      );
  }
}