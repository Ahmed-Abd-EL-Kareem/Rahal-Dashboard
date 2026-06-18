export interface BookingUserRef {
  _id: string;
  name?: string;
  email?: string;
}

export interface BookingHotelRef {
  _id: string;
  name?: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'canceled' | 'completed';

export interface Booking {
  _id: string;
  user: string | BookingUserRef;
  hotel: string | BookingHotelRef;
  trip?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  currency: 'EGP' | 'USD';
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  amountPaid: number;
  paidAt?: string;
  specialRequests?: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingsAdminQuery {
  page?: number;
  limit?: number;
  sort?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

export interface BookingsAdminResponse {
  status: string;
  message?: string;
  results?: number;
  total?: number;
  page?: number;
  limit?: number;
  data: {
    bookings: Booking[];
  };
}
