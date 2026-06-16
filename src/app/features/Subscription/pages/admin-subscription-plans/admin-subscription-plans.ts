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
  subscriptions    = signal<Subscription[]>([]);
  expiring         = signal<Subscription[]>([]);
  churnStats       = signal<ChurnStats | null>(null);
  loading          = signal(true);
  expiringLoading  = signal(true);
  churnLoading     = signal(true);
  actionUserId     = signal<string | null>(null);
  error            = signal<string | null>(null);
  successMessage   = signal<string | null>(null);
  statusFilter     = signal<string>('all');
  searchQuery      = signal<string>('');

  // ── Computed ──────────────────────────────────────────────────────────────
filtered = computed(() => {
  let list = this.subscriptions().filter(s => s.user != null); // ← السطر ده بس
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

  ngOnInit() {
    this.loadAll();
  }

  // ── Data ──────────────────────────────────────────────────────────────────

  loadAll() {
    this.loadSubscriptions();
    this.loadExpiring();
    this.loadChurnStats();
  }


  
  goToMySubscription(): void {
this.router.navigate(['/dashboard/admin-plans']);  }
  loadSubscriptions() {
    this.loading.set(true);
    this.svc.adminGetAllSubscriptions().subscribe({
      next: (res) => {
this.subscriptions.set(res.subscriptions ?? []);
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

  // ── Helpers ───────────────────────────────────────────────────────────────

goToPlans() {
  this.router.navigate(['/dashboard/subscription']);
}

  setFilter(status: string) {
    this.statusFilter.set(status);
  }

  setSearch(value: string) {
    this.searchQuery.set(value);
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

  private showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 4000);
  }
}