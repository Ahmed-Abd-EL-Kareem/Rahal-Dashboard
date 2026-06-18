export interface PaymentRevenueResponse {
  totalRevenue: number;
}

export interface PaymentAveragePriceResponse {
  averageBookingPrice: number;
}

export interface PaymentCancelledBookingsResponse {
  cancelledBookings: number;
}

export interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
  reference?: string;
}

export interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  avatar: string;
}

export interface StatusHistoryItem {
  status: string;
  timestamp: string;
  description?: string;
}

export interface PaymentDetails {
  id: string;
  status: 'Paid' | 'Processing' | 'Failed' | 'Refunded';
  amountPaid: number;
  currency: string;
  date: string;
  time: string;
  timezone: string;
  paymentMethod: {
    brand: string;
    last4: string;
  };
  lineItems: LineItem[];
  customer: CustomerDetails;
  statusHistory: StatusHistoryItem[];
}
