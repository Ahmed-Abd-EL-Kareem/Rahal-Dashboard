export interface DayItinerary {
  day: number;
  title: string | null;
  activities: string[];
  meals: string[];
  accommodation: string | null;
  tips: string | null;
  estimatedCost: number;
}

export interface Trip {
  _id: string;
  user?: any;
  title: string;
  destination: string;
  imageUrl: string | null;
  duration: number;
  budget: 'budget' | 'mid-range' | 'luxury';
  travelers: number;
  interests: string[];
  days: DayItinerary[];
  summary: string | null;
  estimatedTotalCost: number;
  currency: 'EGP' | 'USD';
  language: 'en' | 'ar';
  status: 'draft' | 'saved' | 'archived';
  isAIGenerated: boolean;
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
}
