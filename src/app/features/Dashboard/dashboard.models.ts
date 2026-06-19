// ─── Users Stats ──────────────────────────────────────────────────────────────
export interface UserStats {
  totalUsers: number;
  usersGrowth: number;
  activeUsers: number;
  activeUsersGrowth: number;
  premiumUsers: number;
  premiumGrowth: number;
}

// ─── Trips Stats ──────────────────────────────────────────────────────────────
export interface TripStats {
  totalTrips: number;
  activeTripsNow: number;
}

// ─── Bookings / Revenue ───────────────────────────────────────────────────────
export interface RevenueChart {
  month: string;
  revenue: number;
}

export interface BookingTrend {
  day: string;
  hotels: number;
}

export interface BookingStats {
  totalRevenue: number;
  revenueGrowth: number;
  revenueChart: RevenueChart[];
  bookingTrends: BookingTrend[];
}

// ─── Destinations ─────────────────────────────────────────────────────────────
export interface Destination {
  rank: number;
  city: string;
  country: string;
  bookings: number;
  growth: number;
  image: string;
}

export interface DestinationsResponse {
  destinations: Destination[];
}

// ─── Hotels ───────────────────────────────────────────────────────────────────
export interface TopHotel {
  name: string;
  location: string;
  revenue: number;
  bookings: number;
  rating: number;
}
export interface HotelsResponse {
  hotels: TopHotel[];
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export interface SubscriptionTier {
  name: string;
  percentage: number;
}

export interface SubscriptionStats {
  total: number;
  tiers: SubscriptionTier[];
}

// ─── AI Stats ─────────────────────────────────────────────────────────────────
export interface AiStats {
  aiRequests: number;
  aiRequestsGrowth: number;
}

// ─── Combined Dashboard Data ──────────────────────────────────────────────────
export interface DashboardData {
  users: UserStats;
  trips: TripStats;
  bookings: BookingStats;
  destinations: DestinationsResponse;
  hotels: HotelsResponse;
  subscriptions: SubscriptionStats;
  ai: AiStats;
}