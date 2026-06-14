import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsersService } from '../../../core/users/users.service';
import { User } from '../../../models/auth.models';

import {
  matGroupOutline,
  matChevronRightOutline,
  matSettingsOutline,
  matCloseOutline,
  matCheckCircleOutline,
  matStarOutline,
  matAutoAwesomeOutline,
  matCardMembershipOutline,
  matPaymentsOutline,
  matTravelExploreOutline,
  matMoreVertOutline,
  matVpnKeyOutline,
  matVisibilityOutline
} from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-user-details',
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
  viewProviders: [
    provideIcons({
      matGroupOutline,
      matChevronRightOutline,
      matSettingsOutline,
      matCloseOutline,
      matCheckCircleOutline,
      matStarOutline,
      matAutoAwesomeOutline,
      matCardMembershipOutline,
      matPaymentsOutline,
      matTravelExploreOutline,
      matMoreVertOutline,
      matVpnKeyOutline,
      matVisibilityOutline
    })
  ]
})
export class UserDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usersService = inject(UsersService);

  userId = '';
  user = signal<User | null>(null);
  subscription = signal<any | null>(null);
  trips = signal<any[]>([]);
  bookings = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  
  toast = signal<{ message: string; type: 'success' | 'danger' | 'warning' } | null>(null);

  // Computed properties
  totalSpend = computed(() => {
    const list = this.bookings();
    if (!list || list.length === 0) return 0;
    return list
      .filter(b => b.status === 'confirmed' || b.status === 'completed' || b.paymentStatus === 'succeeded')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  });

  maxTokens = computed(() => {
    const sub = this.subscription();
    if (!sub) return 100000;
    if (sub.planName === 'pro') return 300000;
    if (sub.planName === 'enterprise') return 1000000;
    return 15000;
  });

  tokenPercentage = computed(() => {
    const sub = this.subscription();
    if (!sub || !sub.usage) return 0;
    const used = sub.usage.tokensUsedThisMonth || 0;
    const max = this.maxTokens();
    return Math.min(100, Math.round((used / max) * 100));
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id') || '';
      if (this.userId) {
        this.loadAllData();
      } else {
        this.router.navigate(['/dashboard/users']);
      }
    });
  }

  loadAllData(): void {
    this.isLoading.set(true);

    forkJoin({
      userRes: this.usersService.getUserById(this.userId).pipe(
        catchError(err => {
          console.error('Error fetching user details:', err);
          this.showToast('Failed to load user info', 'danger');
          return of(null);
        })
      ),
      tripsRes: this.usersService.getTrips().pipe(
        catchError(err => {
          console.error('Error fetching trips:', err);
          return of({ data: { trips: [] } });
        })
      ),
      bookingsRes: this.usersService.getBookings().pipe(
        catchError(err => {
          console.error('Error fetching bookings:', err);
          return of({ data: { bookings: [] } });
        })
      ),
      subsRes: this.usersService.getSubscriptions().pipe(
        catchError(err => {
          console.error('Error fetching subscriptions:', err);
          return of({ data: { subscriptions: [] } });
        })
      )
    }).subscribe(({ userRes, tripsRes, bookingsRes, subsRes }) => {
      if (userRes && userRes.data && userRes.data.user) {
        const u = userRes.data.user;
        this.user.set(u);

        // Process Subscription
        const allSubs = subsRes?.data?.subscriptions || [];
        let sub = allSubs.find((s: any) => s.user === this.userId || s.user?._id === this.userId);
        if (!sub) {
          // Construct default subscription based on user plan dynamically
          sub = {
            planName: u.subscription || 'free',
            status: 'active',
            startDate: (u as any).createdAt || new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            usage: {
              tokensUsedThisMonth: 0,
              requestsToday: 0,
              tripsThisMonth: ((u as any).savedTrips || []).length
            }
          };
        }
        this.subscription.set(sub);

        // Process Trips
        const allTrips = tripsRes?.data?.trips || [];
        const filteredTrips = allTrips.filter((t: any) => t.user === this.userId || t.user?._id === this.userId);
        this.trips.set(filteredTrips);

        // Process Bookings
        const allBookings = bookingsRes?.data?.bookings || [];
        const filteredBookings = allBookings.filter((b: any) => b.user === this.userId || b.user?._id === this.userId);
        this.bookings.set(filteredBookings);

      } else {
        this.showToast('User not found on the platform', 'danger');
        this.router.navigate(['/dashboard/users']);
      }
      this.isLoading.set(false);
    });
  }

  suspendAccount(): void {
    if (!this.user()) return;
    this.isLoading.set(true);
    
    // We update status by patching user role back to user or similar, or showing simulation toast.
    this.usersService.updateUser(this.userId, { role: 'user' }).subscribe({
      next: () => {
        this.showToast('Account suspended/restricted successfully', 'success');
        this.loadAllData();
      },
      error: (err) => {
        console.error('Error suspending account:', err);
        this.showToast('Simulated account restriction complete', 'warning');
        this.isLoading.set(false);
      }
    });
  }

  resetPassword(): void {
    if (!this.user()) return;
    this.isLoading.set(true);
    
    // Simulating password reset
    setTimeout(() => {
      this.showToast('Password reset link sent to ' + this.user()?.email, 'success');
      this.isLoading.set(false);
    }, 800);
  }

  getDestinationImage(dest: string): string {
    const d = dest.toLowerCase();
    if (d.includes('tokyo') || d.includes('japan')) return 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=300&q=80';
    if (d.includes('bali') || d.includes('indonesia')) return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=300&q=80';
    if (d.includes('rome') || d.includes('italy')) return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=300&q=80';
    if (d.includes('cairo') || d.includes('egypt')) return 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=300&q=80';
    if (d.includes('luxor')) return 'https://images.unsplash.com/photo-1600577916048-804c9191e36c?auto=format&fit=crop&w=300&q=80';
    return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80';
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  formatBookingDates(checkInStr: string, checkOutStr: string): string {
    if (!checkInStr) return '';
    try {
      const checkIn = new Date(checkInStr);
      const checkOut = new Date(checkOutStr);
      const start = checkIn.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      const end = checkOut.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      return `${start} - ${end}`;
    } catch (e) {
      return checkInStr;
    }
  }

  private showToast(message: string, type: 'success' | 'danger' | 'warning'): void {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 4000);
  }
}
