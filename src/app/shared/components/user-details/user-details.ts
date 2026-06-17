import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { UsersService } from '../../../core/users/users.service';
import { Booking, Trip, User, UserSubscription } from '../../../models/auth.models';

import {
  matSettingsOutline,
  matCloseOutline,
  matCheckCircleOutline,
  matStarOutline,
  matAutoAwesomeOutline,
  matCardMembershipOutline,
  matPaymentsOutline,
  matTravelExploreOutline,
  matMoreVertOutline,
  matChevronLeftOutline,
  matChevronRightOutline
} from '@ng-icons/material-icons/outline';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const TRIPS_PAGE_SIZE = 3;

@Component({
  selector: 'app-user-details',
  imports: [CommonModule, NgIconComponent],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
  viewProviders: [
    provideIcons({
      matSettingsOutline,
      matCloseOutline,
      matCheckCircleOutline,
      matStarOutline,
      matAutoAwesomeOutline,
      matCardMembershipOutline,
      matPaymentsOutline,
      matTravelExploreOutline,
      matMoreVertOutline,
      matChevronLeftOutline,
      matChevronRightOutline
    })
  ]
})
export class UserDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  user = signal<User | null>(null);
  subscription = signal<UserSubscription | null>(null);
  trips = signal<Trip[]>([]);
  bookings = signal<Booking[]>([]);
  tripsPage = signal(1);
  isLoading = signal(true);
  toast = signal<{ message: string; type: 'success' | 'danger' | 'warning' } | null>(null);

  readonly tripsPageSize = TRIPS_PAGE_SIZE;

  totalSpend = computed(() =>
    this.bookings()
      .filter(booking => !this.isCanceledBooking(booking))
      .reduce((sum, booking) => sum + this.getBookingAmount(booking), 0)
  );

  paginatedTrips = computed(() => {
    const start = (this.tripsPage() - 1) * TRIPS_PAGE_SIZE;
    return this.trips().slice(start, start + TRIPS_PAGE_SIZE);
  });

  totalTripsPages = computed(() =>
    Math.max(1, Math.ceil(this.trips().length / TRIPS_PAGE_SIZE))
  );

  maxTokens = computed(() => {
    const plan = this.subscription()?.planName;
    if (plan === 'pro') return 300_000;
    if (plan === 'enterprise') return 1_000_000;
    return 100_000;
  });

  tokenPercentage = computed(() => {
    const usage = this.subscription()?.usage;
    if (!usage) return 0;
    const used = usage.tokensUsedThisMonth ?? 0;
    return Math.min(100, Math.round((used / this.maxTokens()) * 100));
  });

  maxRequests = computed(() => {
    const plan = this.subscription()?.planName;
    if (plan === 'pro') return 200;
    if (plan === 'enterprise') return 1_000;
    return 10;
  });

  requestPercentage = computed(() => {
    const usage = this.subscription()?.usage;
    if (!usage) return 0;
    const used = usage.requestsToday ?? 0;
    return Math.min(100, Math.round((used / this.maxRequests()) * 100));
  });

  maxTrips = computed<number | null>(() => {
    const plan = this.subscription()?.planName;
    if (plan === 'pro' || plan === 'enterprise') return null;
    return 3;
  });

  tripsPercentage = computed(() => {
    const usage = this.subscription()?.usage;
    const max = this.maxTrips();
    if (!usage || max === null) return 0;
    const used = usage.tripsThisMonth ?? 0;
    return Math.min(100, Math.round((used / max) * 100));
  });

  totalTripsCount = computed(() => {
    const user = this.user();
    if (!user) return 0;
    const savedCount = user.savedTrips?.length ?? 0;
    return Math.max(savedCount, this.trips().length);
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id')?.trim() ?? ''),
      distinctUntilChanged(),
      switchMap(userId => {
        if (!OBJECT_ID_PATTERN.test(userId)) {
          this.showToast('Invalid user identifier', 'danger');
          void this.router.navigate(['/dashboard/users']);
          return EMPTY;
        }

        this.isLoading.set(true);
        return this.loadUserData(userId);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private loadUserData(userId: string) {
    return forkJoin({
      userRes: this.usersService.getUserById(userId).pipe(
        catchError(() => {
          this.showToast('Failed to load user profile', 'danger');
          return of(null);
        })
      ),
      tripsRes: this.usersService.getTrips({ user: userId, limit: 100 }).pipe(
        catchError(() => of({ data: [] as Trip[] }))
      ),
      bookingsRes: this.usersService.getBookings({ user: userId, limit: 100 }).pipe(
        catchError(() => of({ data: [] as Booking[] }))
      ),
      subsRes: this.usersService.getSubscriptions({ user: userId, limit: 100 }).pipe(
        catchError(() => of({ subscriptions: [] as UserSubscription[] }))
      )
    }).pipe(
      map(({ userRes, tripsRes, bookingsRes, subsRes }) => {
        const user = userRes?.data?.user;
        if (!user) {
          this.showToast('User not found', 'danger');
          this.isLoading.set(false);
          void this.router.navigate(['/dashboard/users']);
          return;
        }

        this.user.set(user);
        this.trips.set(tripsRes.data ?? []);
        this.bookings.set(bookingsRes.data ?? []);
        this.tripsPage.set(1);
        this.subscription.set(this.resolveSubscription(userId, user, subsRes.subscriptions ?? []));
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.showToast('Failed to load user details', 'danger');
        this.isLoading.set(false);
        void this.router.navigate(['/dashboard/users']);
        return of(void 0);
      })
    );
  }

  private resolveSubscription(
    userId: string,
    user: User,
    subscriptions: UserSubscription[]
  ): UserSubscription {
    const existing = subscriptions.find(sub =>
      (typeof sub.user === 'string' ? sub.user : sub.user?._id) === userId
    );

    if (existing) {
      return existing;
    }

    return {
      planName: user.subscription ?? 'free',
      status: 'active',
      startDate: user.createdAt,
      usage: {
        tokensUsedThisMonth: 0,
        requestsToday: 0,
        tripsThisMonth: user.savedTrips?.length ?? 0
      }
    };
  }

  getTierLabel(): string {
    const tier = this.user()?.subscription;
    if (tier === 'pro') return 'Traveler Pro';
    if (tier === 'enterprise') return 'Enterprise';
    return 'Explorer Free';
  }

  getDestinationImage(destination: string): string {
    const value = destination.toLowerCase();

    if (value.includes('tokyo') || value.includes('japan')) {
      return 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=300&q=80';
    }
    if (value.includes('bali') || value.includes('indonesia')) {
      return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=300&q=80';
    }
    if (value.includes('rome') || value.includes('italy')) {
      return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=300&q=80';
    }
    if (value.includes('cairo') || value.includes('egypt')) {
      return 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=300&q=80';
    }
    if (value.includes('luxor')) {
      return 'https://images.unsplash.com/photo-1600577916048-804c9191e36c?auto=format&fit=crop&w=300&q=80';
    }

    return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80';
  }

  getInitials(name: string): string {
    if (!name) return 'U';

    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  }

  formatBookingDates(checkInStr?: string, checkOutStr?: string): string {
    if (!checkInStr) return '—';

    const checkIn = new Date(checkInStr);
    const checkOut = checkOutStr ? new Date(checkOutStr) : null;

    if (Number.isNaN(checkIn.getTime())) return '—';

    const start = checkIn.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    if (!checkOut || Number.isNaN(checkOut.getTime())) return start;

    const end = checkOut.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    return `${start} - ${end}`;
  }

  getBookingAmount(booking: Booking): number {
    const amount = Number(booking.totalPrice ?? booking.amount ?? booking.price ?? 0);
    return Number.isFinite(amount) ? amount : 0;
  }

  private isCanceledBooking(booking: Booking): boolean {
    const status = booking.status?.toLowerCase() ?? '';
    return status === 'canceled' || status === 'cancelled';
  }

  nextTripsPage(): void {
    if (this.tripsPage() < this.totalTripsPages()) {
      this.tripsPage.update(page => page + 1);
    }
  }

  prevTripsPage(): void {
    if (this.tripsPage() > 1) {
      this.tripsPage.update(page => page - 1);
    }
  }

  private showToast(message: string, type: 'success' | 'danger' | 'warning'): void {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
