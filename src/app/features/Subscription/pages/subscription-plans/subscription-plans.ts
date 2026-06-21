import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  HostListener
} from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../../services/subscription.service';
import {
  AdminSubscription,
  ChurnStats,
  SubscriptionStatus,
  Plan,
} from '../../models/subscription.models';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-plans.html',
})
export class SubscriptionsComponent implements OnInit {
  private svc = inject(SubscriptionService);
  private router = inject(Router);

  // ── State ──────────────────────────────────────────────────────────────────
  subscriptions = signal<AdminSubscription[]>([]);
  stats         = signal<ChurnStats | null>(null);
  plans         = signal<Plan[]>([]);

  loading = signal(true);
  error   = signal<string | null>(null);

  statusFilter = signal<SubscriptionStatus | 'all'>('all');
  planFilter   = signal<string>('all');
  searchQuery  = signal('');

  // ── Pagination ─────────────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = 10;

  // ── Dropdown menu ──────────────────────────────────────────────────────────
  openMenuId = signal<string | null>(null);

  // ── Detail Modal ───────────────────────────────────────────────────────────
  showDetailModal = signal(false);
  selectedSub     = signal<AdminSubscription | null>(null);

  // ── Edit Plan Modal ────────────────────────────────────────────────────────
  showEditModal    = signal(false);
  editingPlanName  = signal('');
  isEditingPlan    = signal(false);

  // ── New Subscription Modal ─────────────────────────────────────────────────
  showCreateModal = signal(false);
  isCreating      = signal(false);
  createError     = signal<string | null>(null);

  newEmail     = signal('');
  newPlanType  = signal('');
  newStatus    = signal<'active' | 'trial'>('active');
  newStartDate = signal(new Date().toISOString().split('T')[0]);
  newRenewDate = signal(
    new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  );

  // ── Computed ───────────────────────────────────────────────────────────────
  filtered = computed(() => {
    let list = this.subscriptions().filter(s => s.user != null);
    const q  = this.searchQuery().toLowerCase();
    const sf = this.statusFilter();
    const pf = this.planFilter();

    if (q)
      list = list.filter(s =>
        s.user?.name?.toLowerCase().includes(q) ||
        s.user?.email?.toLowerCase().includes(q)
      );
    if (sf !== 'all') list = list.filter(s => s.status === sf);
    if (pf !== 'all') list = list.filter(s => s.planName === pf);

    return list;
  });

  totalPages = computed(() => Math.ceil(this.filtered().length / this.pageSize));

  paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  displayEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.filtered().length)
  );

  uniquePlanTypes = computed(() =>
    [...new Set(this.subscriptions().map(s => s.planName))]
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadAll();
  }

  // ── Host listener: close dropdown on outside click ─────────────────────────
  @HostListener('document:click')
  closeMenus() {
    this.openMenuId.set(null);
  }

  
  goToMySubscription(): void {
this.router.navigate(['/dashboard/subscriptions']);  }
  // ── Load ───────────────────────────────────────────────────────────────────
  private loadAll() {
    this.loading.set(true);

    this.svc.adminGetChurnStats().subscribe({
      next: (res: any) => this.stats.set(res.data ?? null),
      error: () => {},
    });

    this.svc.getPlans().subscribe({
      next: (res: any) => this.plans.set(res.data ?? []),
    });

    this.svc.adminGetAllSubscriptions().subscribe({
      next: (res: any) => {
        this.subscriptions.set(res.subscriptions ?? []);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  refresh() { this.loadAll(); }

  setPage(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p);
  }

  setStatusFilter(v: string) {
    this.statusFilter.set(v as SubscriptionStatus | 'all');
    this.currentPage.set(1);
  }

  setPlanFilter(v: string) {
    this.planFilter.set(v);
    this.currentPage.set(1);
  }

  onSearch(v: string) {
    this.searchQuery.set(v);
    this.currentPage.set(1);
  }

  upgradePlan(userId: string, planName: string) {
    this.svc.adminChangePlan(userId, planName).subscribe({
      next: () => this.loadAll(),
      error: (err: any) => this.error.set(err.message),
    });
  }

  cancelSubscription(userId: string) {
    if (!confirm('Cancel this subscription?')) return;
    this.svc.adminCancelSubscription(userId).subscribe({
      next: () => this.loadAll(),
      error: (err: any) => this.error.set(err.message),
    });
  }

  exportCsv() {
    const rows    = this.filtered();
    const headers = ['Name', 'Email', 'Plan', 'Status', 'Renewal Date', 'Tokens Used', 'Requests Today'];
    const csv     = [
      headers.join(','),
      ...rows.map(r => [
        r.user?.name ?? '',
        r.user?.email ?? '',
        r.plan?.displayName ?? r.planName,
        r.status,
        r.endDate ?? '',
        r.usage?.tokensUsedThisMonth ?? 0,
        r.usage?.requestsToday ?? 0,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'subscriptions.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Dropdown ───────────────────────────────────────────────────────────────
  toggleMenu(id: string, event: Event) {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  // ── View Details Modal ─────────────────────────────────────────────────────
  viewDetails(sub: AdminSubscription) {
    this.selectedSub.set(sub);
    this.showDetailModal.set(true);
    this.openMenuId.set(null);
  }


  openEditFromDetail(): void {
  const sub = this.selectedSub();
  if (!sub) return;
  this.closeDetailModal();
  this.editPlan(sub);
}
  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedSub.set(null);
  }

  // ── Edit Plan Modal ────────────────────────────────────────────────────────
  editPlan(sub: AdminSubscription) {
    this.selectedSub.set(sub);
    this.editingPlanName.set(sub.planName);
    this.showEditModal.set(true);
    this.openMenuId.set(null);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedSub.set(null);
    this.editingPlanName.set('');
  }

  submitEditPlan() {
    const sub      = this.selectedSub();
    const planName = this.editingPlanName();
    if (!sub || !planName) return;

    this.isEditingPlan.set(true);
    this.svc.adminChangePlan(sub.user._id, planName).subscribe({
      next: () => {
        this.isEditingPlan.set(false);
        this.closeEditModal();
        this.loadAll();
      },
      error: (err: any) => {
        this.error.set(err.error?.message ?? 'Failed to change plan.');
        this.isEditingPlan.set(false);
      },
    });
  }

  // ── New Subscription Modal ─────────────────────────────────────────────────
  openCreateModal() {
    this.newEmail.set('');
    this.newPlanType.set('');
    this.newStatus.set('active');
    this.newStartDate.set(new Date().toISOString().split('T')[0]);
    this.newRenewDate.set(
      new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
    );
    this.createError.set(null);
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.createError.set(null);
  }

  submitCreate() {
    const email    = this.newEmail().trim();
    const planName = this.newPlanType();

    if (!email)    { this.createError.set('Email is required.');     return; }
    if (!planName) { this.createError.set('Please select a plan.');  return; }

    this.isCreating.set(true);
    this.createError.set(null);

    this.svc.adminCreateSubscription({ email, planName }).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.showCreateModal.set(false);
        this.loadAll();
      },
      error: (err: any) => {
        this.createError.set(err.error?.message ?? err.message ?? 'Something went wrong.');
        this.isCreating.set(false);
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getInitials(sub: AdminSubscription): string {
    const source = sub?.user?.name ?? sub?.user?.email ?? '??';
    return source.slice(0, 2).toUpperCase();
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

  quotaPercent(used: number, limit: number | null | undefined): number {
    if (!limit || limit === -1) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  }

  getQuotaColor(percent: number): string {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 60) return 'bg-amber-400';
    return 'bg-emerald-500';
  }

  isExpired(date: string | null): boolean {
    return !!date && new Date(date) < new Date();
  }

  statusClass(status: SubscriptionStatus | string): string {
    return ({
      active:   'bg-emerald-100 text-emerald-700',
      free:     'bg-gray-100 text-gray-600',
      trial:    'bg-amber-100 text-amber-700',
      expired:  'bg-red-100 text-red-600',
      canceled: 'bg-gray-100 text-gray-500',
      past_due: 'bg-orange-100 text-orange-600',
    } as Record<string, string>)[status] ?? 'bg-gray-100 text-gray-500';
  }
}