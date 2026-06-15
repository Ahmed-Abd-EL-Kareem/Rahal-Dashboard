export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  image?: string;
  provider?: 'local' | 'google';
  subscription?: SubscriptionPlan | string;
  createdAt?: string;
  savedTrips?: string[];
  preferredLanguage?: 'en' | 'ar';
  preferredCurrency?: 'USD' | 'EGP';
}

export interface UpdateProfileRequest {
  name?: string;
  image?: string;
  preferredLanguage?: 'en' | 'ar';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SubscriptionUsage {
  tokensUsedThisMonth?: number;
  requestsToday?: number;
  tripsThisMonth?: number;
}

export interface UserSubscription {
  planName: SubscriptionPlan | string;
  status: string;
  startDate?: string;
  usage?: SubscriptionUsage;
  user?: string | { _id: string };
}

export interface Trip {
  _id: string;
  title: string;
  destination: string;
  duration: number;
  budget: string;
  status?: string;
  user?: string | { _id: string };
}

export interface Booking {
  _id: string;
  totalPrice?: number;
  amount?: number;
  price?: number;
  status: string;
  paymentStatus?: string;
  checkIn?: string;
  checkOut?: string;
  destination?: string;
  hotel?: {
    city?: string;
    name?: { en?: string };
  };
  user?: string | { _id: string };
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface AuthResponse {
  status: string;
  message: string;
  token: string;
  data: { user: User };
}
