// ─────────────────────────────────────────────────────────────────────────────
//  subscription.service.ts
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Plan,
  CreatePlanBody,
  UpdatePlanBody,
  GetPlansResponse,
  PlanResponse,
  GetMySubscriptionResponse,
  ChangePlanResponse,
  UpgradeResponse,
  GetPaymentStatusResponse,
  GetAllSubscriptionsResponse,
  GetStatsResponse,
} from '../models/subscription.models';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/subscriptions`;

  // ── Public ───────────────────────────────────────────────────────────────────

  getPlans(): Observable<GetPlansResponse> {
    return this.http.get<GetPlansResponse>(`${this.base}/plans`);
  }

  // ── User (protected) ─────────────────────────────────────────────────────────

  getMySubscription(): Observable<GetMySubscriptionResponse> {
    return this.http.get<GetMySubscriptionResponse>(
      `${this.base}/my`,
      { withCredentials: true }
    );
  }

  changePlan(planId: string): Observable<ChangePlanResponse> {
    return this.http.patch<ChangePlanResponse>(
      `${this.base}/change-plan`,
      { planId },
      { withCredentials: true }
    );
  }

  // ── Payments ─────────────────────────────────────────────────────────────────

  upgradeSubscription(planId: string): Observable<UpgradeResponse> {
    return this.http.post<UpgradeResponse>(
      `${this.base}/pay/upgrade`,
      { planId },
      { withCredentials: true }
    );
  }

  getPaymentStatus(subscriptionId: string): Observable<GetPaymentStatusResponse> {
    return this.http.get<GetPaymentStatusResponse>(
      `${this.base}/pay/status/${subscriptionId}`,
      { withCredentials: true }
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────────────────

  adminGetAllSubscriptions(): Observable<GetAllSubscriptionsResponse> {
    return this.http.get<GetAllSubscriptionsResponse>(
      `${this.base}/admin/all`,
      { withCredentials: true }
    );
  }

  adminGetStats(): Observable<GetStatsResponse> {
    return this.http.get<GetStatsResponse>(
      `${this.base}/admin/stats`,
      { withCredentials: true }
    );
  }

            // ── Quota: try usage fields, fallback 0 ──
          // ── Quota: try usage fields, fallback 0 ──


          adminChangePlan(userId: string, planName: string): Observable<any> {
  return this.http.patch(
    `${this.base}/admin/user/${userId}/plan`,
    { planName },        // ← صح
    { withCredentials: true }
  );
}

  // ✅ إنشاء subscription جديدة لأي user من قِبَل الـ admin
  
  adminCreateSubscription(body: { email: string; planName: string }): Observable<any> {
  return this.http.post(
    `${this.base}/admin/create`,
    body,
    { withCredentials: true }
  );
}

  // ── Admin: Plan CRUD ──────────────────────────────────────────────────────────

  createPlan(body: CreatePlanBody): Observable<PlanResponse> {
    return this.http.post<PlanResponse>(
      `${this.base}/admin/plans`,
      body,
      { withCredentials: true }
    );
  }

  updatePlan(planId: string, body: UpdatePlanBody): Observable<PlanResponse> {
    return this.http.patch<PlanResponse>(
      `${this.base}/admin/plans/${planId}`,
      body,
      { withCredentials: true }
    );
  }

  deletePlan(planId: string): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(
      `${this.base}/admin/plans/${planId}`,
      { withCredentials: true }
    );
  }
  // إلغاء اشتراك المستخدم نفسه
cancelSubscription(): Observable<any> {
  return this.http.patch(
    `${this.base}/cancel`,
    {},
    { withCredentials: true }
  );
}

// Admin: إلغاء اشتراك أي user
adminCancelSubscription(userId: string): Observable<any> {
  return this.http.patch(
    `${this.base}/admin/user/${userId}/cancel`,
    {},
    { withCredentials: true }
  );
}

adminGetExpiringSubscriptions(days = 7): Observable<any> {
  return this.http.get(
    `${this.base}/admin/expiring?days=${days}`,
    { withCredentials: true }
  );
}

// Admin: Churn Stats
adminGetChurnStats(): Observable<any> {
  return this.http.get(
    `${this.base}/admin/churn`,
    { withCredentials: true }
  );
}
}

