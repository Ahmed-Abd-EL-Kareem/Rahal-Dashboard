import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { BookingService } from './booking.service';
import {
  PaymentDetails,
  PaymentRevenueResponse,
  PaymentAveragePriceResponse,
  PaymentCancelledBookingsResponse
} from '../../models/payment.models';
import { Booking, BookingUserRef, BookingHotelRef } from '../../models/booking.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private bookingService = inject(BookingService);
  private baseUrl = `${environment.apiUrl}/payments`;

  /**
   * GET /api/v1/payments/admin/revenue
   */
  getRevenue(): Observable<PaymentRevenueResponse> {
    return this.http
      .get<PaymentRevenueResponse | { data: PaymentRevenueResponse }>(`${this.baseUrl}/admin/revenue`)
      .pipe(
        map(res => ({ totalRevenue: this.extractNumber(res, 'totalRevenue') })),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * GET /api/v1/payments/admin/avg-price
   */
  getAveragePrice(): Observable<PaymentAveragePriceResponse> {
    return this.http
      .get<PaymentAveragePriceResponse | { data: PaymentAveragePriceResponse }>(`${this.baseUrl}/admin/avg-price`)
      .pipe(
        map(res => ({ averageBookingPrice: this.extractNumber(res, 'averageBookingPrice') })),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * GET /api/v1/payments/admin/cancelled
   */
  getCancelledBookings(): Observable<PaymentCancelledBookingsResponse> {
    return this.http
      .get<PaymentCancelledBookingsResponse | { data: PaymentCancelledBookingsResponse }>(`${this.baseUrl}/admin/cancelled`)
      .pipe(
        map(res => ({ cancelledBookings: this.extractNumber(res, 'cancelledBookings') })),
        catchError(err => throwError(() => err))
      );
  }

  private extractNumber(response: unknown, key: string): number {
    const root = response as Record<string, unknown>;
    const payload =
      root['data'] && typeof root['data'] === 'object'
        ? (root['data'] as Record<string, unknown>)
        : root;
    const value = payload[key];
    return typeof value === 'number' ? value : Number(value ?? 0);
  }

  /**
   * Retrieves payment/transaction details for a given booking ID.
   * Backed by GET /api/v1/bookings/:id — no mock data.
   */
  getPaymentDetails(id: string): Observable<PaymentDetails> {
    return this.bookingService.getBookingById(id).pipe(
      map(res => this.mapBookingToPaymentDetails(res.data.booking)),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Avatar updates are not persisted by the backend: there is no documented
   * endpoint to associate a Cloudinary URL with a booking/user from the
   * admin dashboard. This intentionally does NOT simulate success.
   */
  updateCustomerAvatar(_id: string, _avatarUrl: string): Observable<boolean> {
    return throwError(() => new Error('Updating the customer avatar is not supported by the backend yet.'));
  }

  /**
   * Refunds are processed via Stripe webhooks (charge.refunded), not a direct
   * admin API call. There is no documented endpoint to trigger a refund from
   * the dashboard, so this intentionally does NOT simulate success.
   */
  issueRefund(_id: string): Observable<boolean> {
    return throwError(() => new Error('Issuing refunds from the dashboard is not supported by the backend yet.'));
  }

  private mapBookingToPaymentDetails(booking: Booking): PaymentDetails {
    const status = this.mapStatus(booking.paymentStatus);
    const { date, time, timezone } = this.formatDateTime(booking.paidAt || booking.createdAt);

    const user = typeof booking.user === 'object' ? (booking.user as BookingUserRef) : null;
    const hotel = typeof booking.hotel === 'object' ? (booking.hotel as BookingHotelRef) : null;

    const hotelName = hotel?.name || 'Hotel Booking';
    const nights = this.diffNights(booking.checkIn, booking.checkOut);

    return {
      id: booking._id,
      status,
      amountPaid: booking.amountPaid || booking.totalPrice || 0,
      currency: booking.currency || 'USD',
      date,
      time,
      timezone,
      paymentMethod: {
        brand: booking.paymentIntentId ? 'CARD' : 'N/A',
        last4: booking.paymentIntentId ? booking.paymentIntentId.slice(-4) : '----'
      },
      lineItems: [
        {
          description: hotelName,
          qty: nights > 0 ? nights : 1,
          unitPrice: nights > 0 ? (booking.totalPrice || 0) / nights : (booking.totalPrice || 0),
          amount: booking.totalPrice || 0,
          reference: `Booking ID: ${booking._id} · ${booking.guests} guest${booking.guests === 1 ? '' : 's'}, ${booking.rooms} room${booking.rooms === 1 ? '' : 's'}`
        }
      ],
      customer: {
        id: user?._id || 'N/A',
        name: user?.name || 'Unknown Guest',
        email: user?.email || '',
        phone: '',
        billingAddress: '',
        avatar: ''
      },
      statusHistory: this.buildStatusHistory(booking)
    };
  }

  private mapStatus(paymentStatus: Booking['paymentStatus']): PaymentDetails['status'] {
    switch (paymentStatus) {
      case 'succeeded':
        return 'Paid';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      case 'processing':
      case 'pending':
      default:
        return 'Processing';
    }
  }

  private buildStatusHistory(booking: Booking): PaymentDetails['statusHistory'] {
    const history: PaymentDetails['statusHistory'] = [];

    if (booking.paymentStatus === 'refunded') {
      history.push({ status: 'Refund Issued', timestamp: this.formatTimestamp(booking.updatedAt || booking.createdAt) });
    }
    if (booking.paymentStatus === 'failed') {
      history.push({ status: 'Payment Failed', timestamp: this.formatTimestamp(booking.updatedAt || booking.createdAt) });
    }
    if (booking.paymentStatus === 'succeeded' && booking.paidAt) {
      history.push({
        status: 'Payment Succeeded',
        timestamp: this.formatTimestamp(booking.paidAt),
        description: booking.paymentIntentId ? `Stripe payment intent ${booking.paymentIntentId}` : undefined
      });
    }
    if (booking.paymentStatus === 'processing' || booking.paymentStatus === 'pending') {
      history.push({ status: 'Payment Processing', timestamp: this.formatTimestamp(booking.createdAt) });
    }

    history.push({ status: 'Booking Created', timestamp: this.formatTimestamp(booking.createdAt) });

    return history;
  }

  private formatTimestamp(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  private formatDateTime(dateStr?: string): { date: string; time: string; timezone: string } {
    if (!dateStr) return { date: '', time: '', timezone: '' };
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private diffNights(checkIn?: string, checkOut?: string): number {
    if (!checkIn || !checkOut) return 0;
    const inDate = new Date(checkIn).getTime();
    const outDate = new Date(checkOut).getTime();
    const diff = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }
}
