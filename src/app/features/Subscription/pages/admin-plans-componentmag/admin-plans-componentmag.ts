// ─────────────────────────────────────────────────────────────────────────────
//  admin-plans.ts
//  PAGE: Admin → Manage Plans
//  Create / edit subscription plans
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from '@angular/router';

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../../services/subscription.service';
import { Plan } from '../../models/subscription.models';

interface PlanForm {
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  features: string[];
  tokensPerMonth: number;
  requestsPerDay: number;
  tripsPerMonth: number | null;
  maxFileUploads: number;
  maxFileSizeMB: number;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm = (): PlanForm => ({
  name: '',
  displayName: '',
  description: '',
  monthlyPrice: 0,
  features: [''],
  tokensPerMonth: 0,
  requestsPerDay: 0,
  tripsPerMonth: null,
  maxFileUploads: 0,
  maxFileSizeMB: 0,
  isActive: true,
  sortOrder: 0,
});

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-plans-componentmag.html',
})
export class AdminPlansComponent implements OnInit {
  private svc = inject(SubscriptionService);
  private router=inject(Router)

  // ── State ──────────────────────────────────────────────────────────────────
  plans   = signal<Plan[]>([]);
  loading = signal(true);
  saving  = signal(false);
  error   = signal<string | null>(null);
  success = signal<string | null>(null);

  // ── Modal ──────────────────────────────────────────────────────────────────
  showModal   = signal(false);
  editingPlan = signal<Plan | null>(null);
  form        = signal<PlanForm>(emptyForm());

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() { this.loadPlans(); }

  loadPlans() {
    this.loading.set(true);
    this.svc.getPlans().subscribe({
      next: (res: any) => {
        this.plans.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  
  goToMySubscription(): void {
this.router.navigate(['/dashboard/subscriptions']);  }
  // ── Open Modals ────────────────────────────────────────────────────────────
  openCreate() {
    this.editingPlan.set(null);
    this.form.set(emptyForm());
    this.error.set(null);
    this.showModal.set(true);
  }

  openEdit(plan: Plan) {
    this.editingPlan.set(plan);
    this.form.set({
      name:           plan.name,
      displayName:    plan.displayName,
      description:    plan.description ?? '',
      monthlyPrice:   plan.price?.monthly ?? 0,
      features:       plan.features?.length ? [...plan.features] : [''],
      tokensPerMonth: plan.limits?.tokensPerMonth ?? 0,
      requestsPerDay: plan.limits?.requestsPerDay ?? 0,
      tripsPerMonth:  plan.limits?.tripsPerMonth ?? null,
      maxFileUploads: plan.limits?.maxFileUploads ?? 0,
      maxFileSizeMB:  plan.limits?.maxFileSizeMB ?? 0,
      isActive:       plan.isActive ?? true,
      sortOrder:      plan.sortOrder ?? 0,
    });
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingPlan.set(null);
  }

  // ── Features helpers ───────────────────────────────────────────────────────
  addFeature() {
    const f = this.form();
    this.form.set({ ...f, features: [...f.features, ''] });
  }

  removeFeature(i: number) {
    const f = this.form();
    const features = f.features.filter((_, idx) => idx !== i);
    this.form.set({ ...f, features: features.length ? features : [''] });
  }

  updateFeature(i: number, value: string) {
    const f = this.form();
    const features = [...f.features];
    features[i] = value;
    this.form.set({ ...f, features });
  }

  updateForm(patch: Partial<PlanForm>) {
    this.form.set({ ...this.form(), ...patch });
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  save() {
    const f = this.form();
    if (!f.name || !f.displayName) {
      this.error.set('Name and Display Name are required.');
      return;
    }

    const body = {
      name:        f.name,
      displayName: f.displayName,
      description: f.description,
      currency:    'usd',
      price:       { monthly: f.monthlyPrice, yearly: 0 },
      features:    f.features.filter(x => x.trim()),
      limits: {
        tokensPerMonth: f.tokensPerMonth,
        requestsPerDay: f.requestsPerDay,
        tripsPerMonth:  f.tripsPerMonth,
        maxFileUploads: f.maxFileUploads,
        maxFileSizeMB:  f.maxFileSizeMB,
        allowedModels:  [],
      },
      isActive:  f.isActive,
      sortOrder: f.sortOrder,
    };

    this.saving.set(true);
    this.error.set(null);

    const editing = this.editingPlan();
    const req$    = editing
      ? this.svc.updatePlan(editing._id, body)
      : this.svc.createPlan(body);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.success.set(editing ? 'Plan updated successfully.' : 'Plan created successfully.');
        this.loadPlans();
        setTimeout(() => this.success.set(null), 4000);
      },
      error: (err: any) => {
        this.error.set(err.error?.message ?? 'Something went wrong.');
        this.saving.set(false);
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  limitLabel(val: number | null | undefined): string {
    if (val === null || val === undefined || val === -1) return 'Unlimited';
    return val.toLocaleString();
  }

  trackByIndex = (i: number) => i;
}