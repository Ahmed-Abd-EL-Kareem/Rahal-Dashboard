
export interface HotelName {
  en: string;
  ar: string;
}

export interface HotelRoom {
  type: 'single' | 'double' | 'suite' | 'family';
  pricePerNight: number;
  capacity: number;
}

export interface HotelLocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface Hotel {
  _id: string;
  name: HotelName;
  slug: string;
  city: string;
  address?: HotelName;
  description: HotelName;
  stars: 1 | 2 | 3 | 4 | 5;
  amenities: string[];
  rooms: HotelRoom[];
  averagePricePerNight: number;
  currency: 'EGP' | 'USD';
  location: HotelLocation;
  images: string[];
  coverImage: string | null;
  isActive: boolean;
}

export interface HotelListResponse {
  status: string;
  message: string;
  data: Hotel[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  length: number;
}

export interface HotelResponse {
  status: string;
  data: { hotel: Hotel };
}

export interface Booking {
  _id: string;
  user: { _id: string; name: string; email: string; image?: string };
  hotel: { _id: string; name: HotelName; city: string };
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  currency: 'EGP' | 'USD';
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  paymentStatus: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  amountPaid: number;
  paidAt?: string;
  specialRequests?: string;
  createdAt: string;
}

export interface BookingListResponse {
  status: string;
  results: number;
  data: { bookings: Booking[] };
}

export interface HotelFilters {
  city?: string;
  stars?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateHotelDto {
  name: HotelName;
  city: string;
  address?: HotelName;
  description: HotelName;
  stars: number;
  amenities: string[];
  rooms: HotelRoom[];
  currency: 'EGP' | 'USD';
  location?: HotelLocation;
  isActive: boolean;
  images?: string[];
  coverImage?: string | null;
}

