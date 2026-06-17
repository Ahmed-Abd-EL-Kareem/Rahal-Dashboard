export interface AIUsageDashboardStats {
  totalAITrips: number;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number; // in milliseconds
  successRate: number; // percentage, e.g., 99.8
  requestsToday: number;
}

export interface AIUsageUser {
  _id: string;
  name: string;
  email: string;
}

export interface AIUsageTrip {
  _id: string;
  title: string;
  destination: string;
}

export interface AIUsageLog {
  _id: string;
  user?: AIUsageUser;
  trip: AIUsageTrip | null;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens: number;
  success: boolean;
  cost: number;
  responseTime: number; // in milliseconds
  createdAt: string;
}

export interface AIModelStat {
  model: string;
  count: number;
}

export interface AIDestinationStat {
  destination: string;
  count: number;
}
