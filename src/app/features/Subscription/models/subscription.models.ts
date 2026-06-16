// ─────────────────────────────────────────────────────────────────────────────
//  subscription.models.ts
//  Single source of truth for ALL subscription-related types
// ─────────────────────────────────────────────────────────────────────────────

// ── Plan Limits ───────────────────────────────────────────────────────────────
export interface PlanLimits {
  tokensPerMonth: number;
  requestsPerDay: number;
  tripsPerMonth: number | null;
  maxFileUploads: number;
  maxFileSizeMB: number;
  allowedModels: string[];
}

// ── Plan ──────────────────────────────────────────────────────────────────────
export interface Plan {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  price: { monthly: number; yearly: number };
  features: string[];
  limits: PlanLimits;
  popular?: boolean;
  activeCount?: number;
  isActive: boolean;
  sortOrder: number;
}

// ── Plan CRUD Bodies ──────────────────────────────────────────────────────────
export interface CreatePlanBody {
  name: string;
  displayName: string;
  description?: string;
  price: { monthly: number; yearly?: number };
  features?: string[];
  limits?: Partial<PlanLimits>;
  sortOrder?: number;
}

export type UpdatePlanBody = Partial<CreatePlanBody> & { isActive?: boolean };

// ── API Responses ─────────────────────────────────────────────────────────────
export interface GetPlansResponse {
  status: string;
  data: Plan[];
}

export interface PlanResponse {
  status: string;
  data: Plan;
}

// ── Subscription Status ───────────────────────────────────────────────────────
// ✅ متزامن مع الـ Backend enum
export type SubscriptionStatus =
  | 'active'
  | 'canceled'   // ← كان 'cancelled' (خطأ إملائي)
  | 'free'       // ← جديد
  | 'past_due'   // ← جديد
  | 'trial'
  | 'expired';

// ── Usage ─────────────────────────────────────────────────────────────────────
export interface SubscriptionUsage {
  tokensUsedThisMonth: number;
  requestsToday: number;
  tripsThisMonth: number;
  lastRequestDate: string | null;
  lastResetDate: string;
}

// ── User Subscription (للـ user نفسه) ────────────────────────────────────────
export interface MySubscription {
  _id: string;
  user: string;
  plan: Plan;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  canceledAt: string | null;
  usage: SubscriptionUsage;
}

export interface GetMySubscriptionResponse {
  status: string;
  data: MySubscription;
}

// ── Change / Upgrade Plan ─────────────────────────────────────────────────────
export interface ChangePlanResponse {
  status: string;
  message: string;
  data: MySubscription;
}

export interface UpgradeResponse {
  status: string;
  data: { url: string };
}

// ── Payment ───────────────────────────────────────────────────────────────────
export interface PaymentStatus {
  subscriptionId: string;
  status: string;
  paid: boolean;
  amount?: number;
  currency?: string;
}

export interface GetPaymentStatusResponse {
  status: string;
  data: { payment: PaymentStatus };
}

// ── Admin: Subscription (للـ admin — بيجي من getAllSubscriptions) ─────────────
export interface AdminSubscription {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  plan: {
    _id: string;
    name: string;
    displayName: string;
    price: { monthly: number; yearly: number };
    limits: PlanLimits;
  };
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  canceledAt: string | null;
  usage: SubscriptionUsage;
}

// ── Admin: Get All Subscriptions ──────────────────────────────────────────────
export interface GetAllSubscriptionsResponse {
  status: string;
  length: number;
  subscriptions: AdminSubscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ── Admin: Churn Stats ────────────────────────────────────────────────────────
export interface ChurnStats {
  total: number;
  active: number;
  free: number;
  canceled: number;
  past_due: number;
  churnRate: string;
}

export interface GetChurnStatsResponse {
  status: string;
  data: ChurnStats;
}

// ── Admin: Expiring Subscriptions ─────────────────────────────────────────────
export interface GetExpiringSubscriptionsResponse {
  status: string;
  length: number;
  data: AdminSubscription[];
}

// ── Admin: Plan Stats ─────────────────────────────────────────────────────────
export interface PlanStat {
  _id: string;
  name: string;
  displayName: string;
  price: { monthly: number };
  subscriberCount: number;
  activeCount: number;
}

export interface GetStatsResponse {
  status: string;
  data: PlanStat[];
}