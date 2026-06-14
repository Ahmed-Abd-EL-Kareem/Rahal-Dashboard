export interface Attraction {
  name: {
    en: string;
    ar: string;
  };
  type: string;
  entryFee: number;
}

export interface Destination {
  _id?: string;
  name: {
    en: string;
    ar: string;
  };
  slug?: string;
  city: string;
  region: 'Upper Egypt' | 'Lower Egypt' | 'Sinai' | 'Red Sea' | 'Western Desert' | 'Delta' | 'Mediterranean';
  category: 'historical' | 'beach' | 'adventure' | 'cultural' | 'religious' | 'nature' | 'other' | 'landmark';
  description: {
    en: string;
    ar: string;
  };
  attractions: Attraction[];
  bestMonths: string[];
  averageBudgetPerDay: number;
  currency: 'EGP' | 'USD';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  images: string[];
  coverImage: string | null;
  isActive: boolean;
  pineconeIndexed?: boolean;
}
