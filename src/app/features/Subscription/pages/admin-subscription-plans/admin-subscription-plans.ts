// import { Component, OnInit, inject, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { SubscriptionService } from '../../services/subscription.service';

// interface Subscription {
//   _id: string;
//   user: { _id: string; name: string; email: string };
//   plan: { _id: string; name: string; displayName: string; price: { monthly: number }; limits?: any };
//   planName: string;
//   status: 'active' | 'canceled' | 'free' | 'past_due' | 'trial' | 'expired';
//   startDate: string;
//   endDate: string | null;
//   canceledAt: string | null;
//   usage: {
//     tokensUsedThisMonth: number;
//     requestsToday: number;
//     tripsThisMonth: number;
//   };
// }

// interface ChurnStats {
//   total: number;
//   active: number;
//   free: number;
//   canceled: number;
//   past_due: number;
//   churnRate: string;
// }

// @Component({
//   selector: 'app-admin-subscriptions',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './admin-subscription-plans.html',
// })
// export class AdminSubscriptionsComponent implements OnInit {
//   private svc    = inject(SubscriptionService);
//   private router = inject(Router);

//   // ── State ─────────────────────────────────────────────────────────────────
//   subscriptions    = signal<Subscription[]>([]);
//   expiring         = signal<Subscription[]>([]);
//   churnStats       = signal<ChurnStats | null>(null);
//   loading          = signal(true);
//   expiringLoading  = signal(true);
//   churnLoading     = signal(true);
//   actionUserId     = signal<string | null>(null);
//   error            = signal<string | null>(null);
//   successMessage   = signal<string | null>(null);
//   statusFilter     = signal<string>('all');
//   searchQuery      = signal<string>('');

//   // ── Computed ──────────────────────────────────────────────────────────────
// filtered = computed(() => {
//   let list = this.subscriptions().filter(s => s.user != null); // ← السطر ده بس
//   if (this.statusFilter() !== 'all')
//     list = list.filter(s => s.status === this.statusFilter());
//   const q = this.searchQuery().toLowerCase().trim();
//   if (q)
//     list = list.filter(s =>
//       s.user.name.toLowerCase().includes(q) ||
//       s.user.email.toLowerCase().includes(q)
//     );
//   return list;
// });

//   ngOnInit() {
//     this.loadAll();
//   }

//   // ── Data ──────────────────────────────────────────────────────────────────

//   loadAll() {
//     this.loadSubscriptions();
//     this.loadExpiring();
//     this.loadChurnStats();
//   }


  
//   goToMySubscription(): void {
// this.router.navigate(['/dashboard/admin-plans']);  }
//   loadSubscriptions() {
//     this.loading.set(true);
//     this.svc.adminGetAllSubscriptions().subscribe({
//       next: (res) => {
// this.subscriptions.set(res.subscriptions ?? []);
//         this.loading.set(false);
//       },
//       error: () => this.loading.set(false),
//     });
//   }

//   loadExpiring() {
//     this.expiringLoading.set(true);
//     this.svc.adminGetExpiringSubscriptions(7).subscribe({
//       next: (res) => {
//         this.expiring.set(res.data ?? []);
//         this.expiringLoading.set(false);
//       },
//       error: () => this.expiringLoading.set(false),
//     });
//   }

//   loadChurnStats() {
//     this.churnLoading.set(true);
//     this.svc.adminGetChurnStats().subscribe({
//       next: (res) => {
//         this.churnStats.set(res.data);
//         this.churnLoading.set(false);
//       },
//       error: () => this.churnLoading.set(false),
//     });
//   }

//   // ── Actions ───────────────────────────────────────────────────────────────

//   changePlan(sub: Subscription, planName: string) {
//     if (!planName || sub.planName === planName) return;
//     this.actionUserId.set(sub.user._id);
//     this.error.set(null);
//     this.svc.adminChangePlan(sub.user._id, planName).subscribe({
//       next: () => {
//         this.showSuccess('Plan updated successfully.');
//         this.loadSubscriptions();
//         this.actionUserId.set(null);
//       },
//       error: (err) => {
//         this.error.set(err.error?.message ?? 'Failed to change plan.');
//         this.actionUserId.set(null);
//       },
//     });
//   }

//   cancelSubscription(sub: Subscription) {
//     if (!confirm(`Cancel subscription for ${sub.user.name}?`)) return;
//     this.actionUserId.set(sub.user._id);
//     this.error.set(null);
//     this.svc.adminCancelSubscription(sub.user._id).subscribe({
//       next: () => {
//         this.showSuccess('Subscription canceled.');
//         this.loadSubscriptions();
//         this.actionUserId.set(null);
//       },
//       error: (err) => {
//         this.error.set(err.error?.message ?? 'Failed to cancel subscription.');
//         this.actionUserId.set(null);
//       },
//     });
//   }

//   // ── Helpers ───────────────────────────────────────────────────────────────

// goToPlans() {
//   this.router.navigate(['/dashboard/subscription']);
// }

//   setFilter(status: string) {
//     this.statusFilter.set(status);
//   }

//   setSearch(value: string) {
//     this.searchQuery.set(value);
//   }

//   daysUntilExpiry(endDate: string | null): number {
//     if (!endDate) return 0;
//     return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));
//   }

//   formatDate(dateStr: string | null): string {
//     if (!dateStr) return '—';
//     return new Date(dateStr).toLocaleDateString('en-US', {
//       year: 'numeric', month: 'short', day: 'numeric',
//     });
//   }

//   quotaPercent(used: number, limit: number | undefined): number {
//     if (!limit || limit === -1) return 0;
//     return Math.min(100, Math.round((used / limit) * 100));
//   }

//   statusClass(status: string): string {
//     const map: Record<string, string> = {
//       active:   'bg-emerald-100 text-emerald-700',
//       free:     'bg-gray-100 text-gray-600',
//       canceled: 'bg-red-100 text-red-600',
//       past_due: 'bg-orange-100 text-orange-600',
//       trial:    'bg-blue-100 text-blue-600',
//       expired:  'bg-red-100 text-red-500',
//     };
//     return map[status] ?? 'bg-gray-100 text-gray-500';
//   }

//   isActing(userId: string): boolean {
//     return this.actionUserId() === userId;
//   }

//   private showSuccess(msg: string) {
//     this.successMessage.set(msg);
//     setTimeout(() => this.successMessage.set(null), 4000);
//   }
// }

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';

interface Subscription {
  _id: string;
  user: { _id: string; name: string; email: string };
  plan: { _id: string; name: string; displayName: string; price: { monthly: number }; limits?: any };
  planName: string;
  status: 'active' | 'canceled' | 'free' | 'past_due' | 'trial' | 'expired';
  startDate: string;
  endDate: string | null;
  canceledAt: string | null;
  usage: {
    tokensUsedThisMonth: number;
    requestsToday: number;
    tripsThisMonth: number;
  };
}

interface ChurnStats {
  total: number;
  active: number;
  free: number;
  canceled: number;
  past_due: number;
  churnRate: string;
}

@Component({
  selector: 'app-admin-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-subscription-plans.html',
})
export class AdminSubscriptionsComponent implements OnInit {
  private svc    = inject(SubscriptionService);
  private router = inject(Router);

  // ── State ─────────────────────────────────────────────────────────────────
  subscriptions   = signal<Subscription[]>([]);
  expiring        = signal<Subscription[]>([]);
  churnStats      = signal<ChurnStats | null>(null);
  loading         = signal(true);
  expiringLoading = signal(true);
  churnLoading    = signal(true);
  actionUserId    = signal<string | null>(null);
  error           = signal<string | null>(null);
  successMessage  = signal<string | null>(null);
  statusFilter    = signal<string>('all');
  searchQuery     = signal<string>('');

  // ── Pagination ────────────────────────────────────────────────────────────
  currentPage = signal<number>(1);
  pageSize    = signal<number>(10);

  // ── Computed ──────────────────────────────────────────────────────────────
 // ضيف ده مؤقتاً
filtered = computed(() => {
  let list = this.subscriptions().filter(s => s.user != null);
  
  if (this.statusFilter() !== 'all')
    list = list.filter(s => s.status === this.statusFilter());
  
  const q = this.searchQuery().toLowerCase().trim();
  if (q)
    list = list.filter(s =>
      s.user.name.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q)
    );
  
  return list;
});
  totalPages = computed(() => Math.ceil(this.filtered().length / this.pageSize()) || 1);

  paginatedList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [];

    pages.push(1);

    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end   = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');

    pages.push(total);

    return pages;
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadAll();
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  loadAll() {
    this.loadSubscriptions();
    this.loadExpiring();
    this.loadChurnStats();
  }
loadSubscriptions() {
  this.loading.set(true);
  this.svc.adminGetAllSubscriptions().subscribe({
    next: (res) => {
      const all = res.subscriptions ?? [];
      console.log('Total from API:', all.length);
      console.log('With null user:', all.filter((s: any) => !s.user).length);
      this.subscriptions.set(all);
      this.loading.set(false);
    },
    error: () => this.loading.set(false),
  });
}

  loadExpiring() {
    this.expiringLoading.set(true);
    this.svc.adminGetExpiringSubscriptions(7).subscribe({
      next: (res) => {
        this.expiring.set(res.data ?? []);
        this.expiringLoading.set(false);
      },
      error: () => this.expiringLoading.set(false),
    });
  }

  loadChurnStats() {
    this.churnLoading.set(true);
    this.svc.adminGetChurnStats().subscribe({
      next: (res) => {
        this.churnStats.set(res.data);
        this.churnLoading.set(false);
      },
      error: () => this.churnLoading.set(false),
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  changePlan(sub: Subscription, planName: string) {
    if (!planName || sub.planName === planName) return;
    this.actionUserId.set(sub.user._id);
    this.error.set(null);
    this.svc.adminChangePlan(sub.user._id, planName).subscribe({
      next: () => {
        this.showSuccess('Plan updated successfully.');
        this.loadSubscriptions();
        this.actionUserId.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to change plan.');
        this.actionUserId.set(null);
      },
    });
  }

  cancelSubscription(sub: Subscription) {
    if (!confirm(`Cancel subscription for ${sub.user.name}?`)) return;
    this.actionUserId.set(sub.user._id);
    this.error.set(null);
    this.svc.adminCancelSubscription(sub.user._id).subscribe({
      next: () => {
        this.showSuccess('Subscription canceled.');
        this.loadSubscriptions();
        this.actionUserId.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to cancel subscription.');
        this.actionUserId.set(null);
      },
    });
  }

  // ── Pagination Methods ────────────────────────────────────────────────────
  nextPage() {
    if (this.currentPage() < this.totalPages())
      this.currentPage.update(p => p + 1);
  }

  prevPage() {
    if (this.currentPage() > 1)
      this.currentPage.update(p => p - 1);
  }

  goToPage(page: number | '...') {
    if (typeof page === 'number') this.currentPage.set(page);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  goToPlans() {
    this.router.navigate(['/dashboard/subscription']);
  }

  goToMySubscription(): void {
    this.router.navigate(['/dashboard/admin-plans']);
  }

  setFilter(status: string) {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  setSearch(value: string) {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  daysUntilExpiry(endDate: string | null): number {
    if (!endDate) return 0;
    return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  quotaPercent(used: number, limit: number | undefined): number {
    if (!limit || limit === -1) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active:   'bg-emerald-100 text-emerald-700',
      free:     'bg-gray-100 text-gray-600',
      canceled: 'bg-red-100 text-red-600',
      past_due: 'bg-orange-100 text-orange-600',
      trial:    'bg-blue-100 text-blue-600',
      expired:  'bg-red-100 text-red-500',
    };
    return map[status] ?? 'bg-gray-100 text-gray-500';
  }

  isActing(userId: string): boolean {
    return this.actionUserId() === userId;
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  isEllipsis(page: number | '...'): boolean {
    return page === '...';
  }

  private showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 4000);
  }
}