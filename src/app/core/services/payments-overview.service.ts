import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BookingService } from './booking.service';
import { Booking } from '../../models/booking.models';

export interface PaymentTransaction {
  id: string;
  category: 'flight' | 'hotel' | 'car' | 'activity';
  client: string;
  time: string;
  amount: number;
  status: 'Completed' | 'Processing' | 'Failed';
  icon: string;
  currency: string;
}

export interface RevenueSeries {
  labels: string[];
  data: number[];
}

export interface PaymentsOverviewData {
  totalRevenue: number;
  avgTransactionValue: number;
  refundRate: number; // percentage 0-100
  transactions: PaymentTransaction[];
  revenueByMonth: RevenueSeries;
  revenueByWeek: RevenueSeries;
}

const PAGE_LIMIT = 200; // pull a representative page of bookings for overview aggregation

@Injectable({
  providedIn: 'root'
})
export class PaymentsOverviewService {
  private bookingService = inject(BookingService);

  /**
   * Loads bookings (admin) and derives the data needed for the
   * Payments Overview page: KPI totals, revenue chart series, and
   * a recent-transactions feed.
   *
   * Backed by GET /api/v1/bookings/admin/all
   */
  // getOverview(): Observable<PaymentsOverviewData> {
  //   return this.bookingService
  //     .getAllBookings({ limit: PAGE_LIMIT, sort: '-createdAt' })
  //     .pipe(map(res => this.mapBookingsToOverview(res.data?.bookings ?? [])));
  // }
  getOverview(): Observable<PaymentsOverviewData> {
    return this.bookingService
      .getAllBookings({ limit: PAGE_LIMIT, sort: '-createdAt' })
      .pipe(map(res => this.mapBookingsToOverview(this.resolveBookings(res))));
  }

  private resolveBookings(res: { data?: Booking[] | { bookings?: Booking[] } }): Booking[] {
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return res.data?.bookings ?? [];
  }

  private mapBookingsToOverview(bookings: Booking[]): PaymentsOverviewData {
    const succeeded = bookings.filter(b => b.paymentStatus === 'succeeded');
    const revenueBookings = succeeded.length > 0
      ? succeeded
      : bookings.filter(b => this.bookingAmount(b) > 0);
    const revenueByMonth = this.buildSeries(revenueBookings, 'month');
    const revenueByWeek = this.buildSeries(revenueBookings, 'week');

    console.log('[PaymentsOverview] bookings count:', bookings.length);
    console.log('[PaymentsOverview] paymentStatus values:', [...new Set(bookings.map(b => b.paymentStatus))]);
    console.log('[PaymentsOverview] succeeded count:', succeeded.length);
    console.log('[PaymentsOverview] revenueBookings count:', revenueBookings.length);
    console.log('[PaymentsOverview] revenueByMonth:', revenueByMonth);
    console.log('[PaymentsOverview] revenueByWeek:', revenueByWeek);
    const refunded = bookings.filter(b => b.paymentStatus === 'refunded');
    const paidOrRefunded = bookings.filter(b =>
      b.paymentStatus === 'succeeded' || b.paymentStatus === 'refunded'
    );

    const totalRevenue = succeeded.reduce((sum, b) => sum + (b.amountPaid || b.totalPrice || 0), 0);
    const avgTransactionValue = succeeded.length > 0 ? totalRevenue / succeeded.length : 0;
    const refundRate = paidOrRefunded.length > 0
      ? (refunded.length / paidOrRefunded.length) * 100
      : 0;

    return {
      totalRevenue,
      avgTransactionValue,
      refundRate,
      transactions: bookings.slice(0, 20).map(b => this.toTransaction(b)),
      revenueByMonth,
      revenueByWeek
    };
  }

  private toTransaction(b: Booking): PaymentTransaction {
    const status: PaymentTransaction['status'] =
      b.paymentStatus === 'succeeded' ? 'Completed'
        : b.paymentStatus === 'failed' ? 'Failed'
          : 'Processing';

    const clientName = typeof b.user === 'object' && b.user?.name ? b.user.name : 'Guest';

    return {
      id: b._id,
      category: 'hotel',
      client: clientName,
      time: this.formatRelativeTime(b.createdAt),
      amount: b.amountPaid || b.totalPrice || 0,
      status,
      icon: 'matHotelOutline',
      currency: b.currency || 'USD'
    };
  }

  private formatRelativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  /**
   * Builds revenue series for either the last 12 months or the last 4 weeks
   * from a list of "succeeded" bookings, bucketed by amountPaid/totalPrice.
   */
  private buildSeries(bookings: Booking[], mode: 'month' | 'week'): RevenueSeries {
    if (mode === 'month') {
      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const buckets: number[] = new Array(12).fill(0);
      const labels: string[] = [];

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(monthLabels[d.getMonth()]);
      }

      for (const b of bookings) {
        const d = new Date(b.paidAt || b.createdAt);
        const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        if (monthsAgo >= 0 && monthsAgo < 12) {
          const idx = 11 - monthsAgo;
          buckets[idx] += this.bookingAmount(b);
        }
      }

      return { labels, data: buckets };
    }

    // Last 4 weeks
    const labels = ['W1', 'W2', 'W3', 'W4'];
    const buckets: number[] = new Array(4).fill(0);
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    for (const b of bookings) {
      const d = new Date(b.paidAt || b.createdAt).getTime();
      const weeksAgo = Math.floor((now - d) / weekMs);
      if (weeksAgo >= 0 && weeksAgo < 4) {
        const idx = 3 - weeksAgo;
        buckets[idx] += this.bookingAmount(b);
      }
    }

    return { labels, data: buckets };
  }

  private bookingAmount(b: Booking): number {
    const amount = b.amountPaid || b.totalPrice || 0;
    return typeof amount === 'number' ? amount : Number(amount) || 0;
  }
}
