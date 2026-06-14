import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaymentDetails } from '../../models/payment.models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // In-memory state database of payment details
  private payments = signal<Record<string, PaymentDetails>>({
    'INV-2023-8942': {
      id: 'INV-2023-8942',
      status: 'Paid',
      amountPaid: 4250.00,
      currency: 'USD',
      date: 'Oct 24, 2023',
      time: '14:32',
      timezone: 'GST',
      paymentMethod: {
        brand: 'VISA',
        last4: '4242'
      },
      lineItems: [
        { description: 'Nile Cruise Package - Premium', qty: 2, unitPrice: 1500.00, amount: 3000.00, reference: 'Booking Ref: BKG-7721' },
        { description: 'Private Transfer - CAI to Hotel', qty: 1, unitPrice: 150.00, amount: 150.00, reference: 'Executive SUV' },
        { description: 'Guided Tour - Pyramids of Giza', qty: 2, unitPrice: 400.00, amount: 800.00, reference: 'Full day, English speaking guide' }
      ],
      customer: {
        id: 'CUST-88291',
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        phone: '+1 (555) 019-2834',
        billingAddress: '1234 Corporate Way\nSuite 500\nSan Francisco, CA 94111\nUnited States',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      statusHistory: [
        { status: 'Payment Succeeded', timestamp: 'Oct 24, 2023 · 14:32 GST', description: 'Stripe charge ch_3Nl... succeeded.' },
        { status: 'Payment Processing', timestamp: 'Oct 24, 2023 · 14:31 GST' },
        { status: 'Invoice Sent', timestamp: 'Oct 23, 2023 · 09:00 GST' },
        { status: 'Invoice Created', timestamp: 'Oct 22, 2023 · 16:45 GST' }
      ]
    },
    'TRX-9982-FL': {
      id: 'TRX-9982-FL',
      status: 'Paid',
      amountPaid: 1250.00,
      currency: 'USD',
      date: 'Oct 24, 2023',
      time: '14:32',
      timezone: 'GST',
      paymentMethod: {
        brand: 'VISA',
        last4: '4242'
      },
      lineItems: [
        { description: 'Flight - Cairo to Luxor (Return)', qty: 1, unitPrice: 1250.00, amount: 1250.00, reference: 'Booking Ref: FLT-9982' }
      ],
      customer: {
        id: 'CUST-88291',
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        phone: '+1 (555) 019-2834',
        billingAddress: '1234 Corporate Way\nSuite 500\nSan Francisco, CA 94111\nUnited States',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      statusHistory: [
        { status: 'Payment Succeeded', timestamp: 'Oct 24, 2023 · 14:32 GST', description: 'Stripe charge ch_FL98... succeeded.' },
        { status: 'Payment Processing', timestamp: 'Oct 24, 2023 · 14:31 GST' }
      ]
    }
  });

  /**
   * Retrieves the payment details for a given transaction ID.
   * If not present in the pre-populated database, it dynamically creates a realistic mock object.
   */
  getPaymentDetails(id: string): Observable<PaymentDetails> {
    const list = this.payments();
    if (list[id]) {
      return of(list[id]);
    }

    // Dynamic generation fallback
    const isFailed = id.endsWith('-FL') && id.includes('9979');
    const isProcessing = id.endsWith('-HT') && id.includes('9981');
    const status = isFailed ? 'Failed' : (isProcessing ? 'Processing' : 'Paid');
    const clientName = id.includes('9981') ? 'Marcus Doe' : (id.includes('9980') ? 'Elena Rostova' : (id.includes('9979') ? 'James Smith' : 'Lisa Wong'));
    const category = id.includes('9981') ? 'hotel' : (id.includes('9980') ? 'car' : (id.includes('9979') ? 'flight' : 'activity'));
    const amount = id.includes('9981') ? 845.50 : (id.includes('9980') ? 120.00 : (id.includes('9979') ? 2100.00 : 350.00));

    const mockPayment: PaymentDetails = {
      id: id,
      status: status,
      amountPaid: amount,
      currency: 'USD',
      date: 'Oct 24, 2023',
      time: '12:15',
      timezone: 'GST',
      paymentMethod: {
        brand: category === 'flight' ? 'VISA' : 'MASTERCARD',
        last4: '4567'
      },
      lineItems: [
        { 
          description: `${category.charAt(0).toUpperCase() + category.slice(1)} Booking for ${clientName}`, 
          qty: 1, 
          unitPrice: amount, 
          amount: amount, 
          reference: `Booking Ref: BKG-${id.split('-')[1] || '8839'}` 
        }
      ],
      customer: {
        id: `CUST-${Math.floor(10000 + Math.random() * 90000)}`,
        name: clientName,
        email: `${clientName.toLowerCase().replace(' ', '.')}@example.com`,
        phone: '+1 (555) 019-3388',
        billingAddress: '789 Enterprise Way\nCairo Heights, Egypt',
        avatar: id.includes('9981') 
          ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
          : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      statusHistory: [
        ...(status === 'Paid' ? [{ status: 'Payment Succeeded', timestamp: 'Oct 24, 2023 · 12:15 GST', description: 'Stripe charge succeeded.' }] : []),
        { status: 'Payment Processing', timestamp: 'Oct 24, 2023 · 12:14 GST' },
        { status: 'Invoice Created', timestamp: 'Oct 24, 2023 · 10:00 GST' }
      ]
    };

    return of(mockPayment);
  }

  /**
   * Updates the avatar image of the customer associated with the transaction ID.
   */
  updateCustomerAvatar(id: string, avatarUrl: string): Observable<boolean> {
    const currentList = this.payments();
    const updatedPayment = currentList[id] 
      ? {
          ...currentList[id],
          customer: {
            ...currentList[id].customer,
            avatar: avatarUrl
          }
        }
      : null;

    if (updatedPayment) {
      this.payments.update(prev => ({
        ...prev,
        [id]: updatedPayment
      }));
    }
    return of(true);
  }

  /**
   * Issues a refund for the transaction ID, updating its status.
   */
  issueRefund(id: string): Observable<boolean> {
    const currentList = this.payments();
    const updatedPayment = currentList[id]
      ? {
          ...currentList[id],
          status: 'Refunded' as const,
          statusHistory: [
            { status: 'Refund Issued', timestamp: 'Just now', description: 'Simulated refund processed successfully.' },
            ...currentList[id].statusHistory
          ]
        }
      : null;

    if (updatedPayment) {
      this.payments.update(prev => ({
        ...prev,
        [id]: updatedPayment
      }));
    }
    return of(true);
  }
}
