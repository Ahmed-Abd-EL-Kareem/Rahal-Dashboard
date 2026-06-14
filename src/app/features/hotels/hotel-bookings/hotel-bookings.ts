import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HotelsService } from '../shared/hotels';

@Component({
  selector: 'app-hotel-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './hotel-bookings.html',
  styleUrl: './hotel-bookings.css',
})
export class HotelBookingsComponent implements OnInit {
  private hotelsService = inject(HotelsService);
  Math = Math;

  // ─── State ─────────────────────────────────────────────────────────────────
  loading = signal(true);
  bookings = signal<any[]>([]);

  // pagination (server-side)
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(1);

  // filters
  searchTerm = signal('');
  statusFilter = signal<'all' | 'pending' | 'confirmed' | 'completed' | 'canceled'>('all');

  readonly STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' },
  ] as const;

  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadBookings();
  }

  // ─── Data ──────────────────────────────────────────────────────────────────
  loadBookings(): void {
    this.loading.set(true);

    const filters: any = {
      page: this.page(),
      limit: this.limit(),
    };
    if (this.statusFilter() !== 'all') {
      filters.status = this.statusFilter();
    }

    this.hotelsService.getAllBookings(filters).subscribe({
      next: (res: any) => {
        this.bookings.set(res.data ?? []);
        this.total.set(res.pagination?.total ?? 0);
        this.totalPages.set(res.pagination?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: () => {
        this.bookings.set([]);
        this.loading.set(false);
      },
    });
  }

  // ─── Filtering (client-side search on top of server page) ────────────────
  filteredBookings = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.bookings();

    return this.bookings().filter((b) => {
      const guestName = b.user?.name?.toLowerCase() ?? '';
      const guestEmail = b.user?.email?.toLowerCase() ?? '';
      const hotelName = (b.hotel?.name?.en ?? b.hotel?.name ?? '').toLowerCase();
      const bookingId = b._id?.toLowerCase() ?? '';
      return (
        guestName.includes(term) ||
        guestEmail.includes(term) ||
        hotelName.includes(term) ||
        bookingId.includes(term)
      );
    });
  });

  // ─── Stats (derived from current page data) ───────────────────────────────
  totalRevenue = computed(() =>
    this.bookings()
      .filter((b) => b.paymentStatus === 'succeeded' || b.paymentStatus === 'processing')
      .reduce((s, b) => s + (b.totalPrice ?? 0), 0),
  );

  confirmedCount = computed(
    () =>
      this.bookings().filter((b) => b.status === 'confirmed' || b.status === 'completed').length,
  );

  pendingCount = computed(() => this.bookings().filter((b) => b.status === 'pending').length);

  canceledCount = computed(() => this.bookings().filter((b) => b.status === 'canceled').length);

  avgPerBooking = computed(() => {
    const paid = this.bookings().filter(
      (b) => b.paymentStatus === 'succeeded' || b.paymentStatus === 'processing',
    );
    if (!paid.length) return 0;
    return Math.round(paid.reduce((s, b) => s + b.totalPrice, 0) / paid.length);
  });

  occupancyRate = computed(() => {
    const totalCount = this.bookings().length;
    if (!totalCount) return 0;
    return Math.round((this.confirmedCount() / totalCount) * 100);
  });

  // ─── Actions ───────────────────────────────────────────────────────────────
  setStatusFilter(status: typeof this.STATUS_OPTIONS[number]['value']): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadBookings();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadBookings();
  }

  nextPage(): void {
    this.goToPage(this.page() + 1);
  }

  prevPage(): void {
    this.goToPage(this.page() - 1);
  }

  updatePaymentStatus(id: string, paymentStatus: string): void {
  this.hotelsService.updateBookingStatus(id, { paymentStatus }).subscribe({
    next: () => this.loadBookings(),
  });
}


updateBookingStatus(id: string, status: string): void {
  this.hotelsService.updateBookingStatus(id, { status }).subscribe({
    next: () => this.loadBookings(),
  });
}

  // ─── Display helpers ───────────────────────────────────────────────────────
  hotelName(b: any): string {
    return b.hotel?.name?.en ?? b.hotel?.name ?? '—';
  }

  guestName(b: any): string {
    return b.user?.name ?? 'Guest';
  }

  guestEmail(b: any): string {
    return b.user?.email ?? '—';
  }

  guestInitials(b: any): string {
    const name = this.guestName(b);
    return name
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en', { month: 'short', day: '2-digit' });
  }

  pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.page();
    const pages: number[] = [];
    const start = Math.max(1, current - 1);
    const end = Math.min(total, start + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}