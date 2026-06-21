import { SubscriptionPlan, User } from '../../models/auth.models';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export function getUserPlanName(user: Pick<User, 'subscription'>): SubscriptionPlan | string {
  const subscription = user.subscription;

  if (!subscription) {
    return 'free';
  }

  if (typeof subscription === 'object') {
    return subscription.planName ?? 'free';
  }

  if (OBJECT_ID_PATTERN.test(subscription)) {
    return 'free';
  }

  return subscription;
}

export function getSubscriptionLabel(plan: SubscriptionPlan | string): string {
  if (plan === 'pro') return 'Traveler (Pro)';
  return 'Explorer (Free)';
}

export function isPremiumPlan(plan: SubscriptionPlan | string): boolean {
  return plan === 'pro';
}
