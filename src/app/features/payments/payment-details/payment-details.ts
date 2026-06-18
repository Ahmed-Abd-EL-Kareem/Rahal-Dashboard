import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentDetails as PaymentDetailsModel } from '../../../models/payment.models';
import {
  matChevronRightOutline,
  matCheckCircleOutline,
  matDownloadOutline,
  matUndoOutline,
  matMoreHorizOutline,
  matContentCopyOutline,
  matAutoAwesomeOutline,
  matArrowBackOutline,
  matPhotoCameraOutline,
  matErrorOutline,
  matCloseOutline
} from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './payment-details.html',
  styleUrl: './payment-details.css',
  viewProviders: [
    provideIcons({
      matChevronRightOutline,
      matCheckCircleOutline,
      matDownloadOutline,
      matUndoOutline,
      matMoreHorizOutline,
      matContentCopyOutline,
      matAutoAwesomeOutline,
      matArrowBackOutline,
      matPhotoCameraOutline,
      matErrorOutline,
      matCloseOutline
    })
  ]
})
export class PaymentDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);

  // Component states
  paymentId = signal<string>('');
  payment = signal<PaymentDetailsModel | null>(null);
  loading = signal<boolean>(true);

  // Toast notifications
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'info' | 'error'>('success');

  // Customer avatar: backend has no avatar field for bookings/users yet,
  // so fall back to a generated initials avatar instead of a broken image.
  customerAvatarUrl = computed(() => {
    const avatar = this.payment()?.customer.avatar;
    if (avatar) return avatar;
    const name = this.payment()?.customer.name || 'Guest';
    const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="#0f766e"/><text x="50%" y="50%" dy=".1em" fill="#ffffff" font-family="Inter, sans-serif" font-size="18" font-weight="600" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`
    )}`;
  });

  subtotal = computed(() => this.payment()?.lineItems.reduce((acc, curr) => acc + curr.amount, 0) ?? 0);
  taxes = computed(() => this.payment() ? (this.payment()!.amountPaid - this.subtotal()) : 0);
  total = computed(() => this.payment()?.amountPaid ?? 0);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.paymentId.set(id);
      this.loadDetails(id);
    }
  }

  loadDetails(id: string) {
    this.loading.set(true);
    this.paymentService.getPaymentDetails(id).subscribe({
      next: (details) => {
        this.payment.set(details);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showToast('Failed to load transaction details.', 'error');
      }
    });
  }

  issueRefund() {
    const id = this.paymentId();
    if (!id || this.payment()?.status === 'Refunded') return;

    this.showToast('Processing refund request...', 'info');
    this.paymentService.issueRefund(id).subscribe({
      next: (success) => {
        if (success) {
          // Re-load details to update state
          this.loadDetails(id);
          this.showToast('Refund issued successfully.', 'success');
        }
      },
      error: (err) => {
        this.showToast(err?.message || 'Failed to process refund.', 'error');
      }
    });
  }

  downloadInvoice() {
    // No invoice-generation endpoint is documented for the backend yet.
    this.showToast('Invoice download is not supported by the backend yet.', 'info');
  }

  copyEmail(email: string) {
    if (!email) return;
    navigator.clipboard.writeText(email).then(() => {
      this.showToast('Email address copied to clipboard.', 'success');
    }).catch(() => {
      this.showToast('Failed to copy email address.', 'error');
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Avatar persistence is not supported by the backend yet (no endpoint to
    // associate a Cloudinary URL with a booking/user). Inform the user instead
    // of running a fake upload.
    this.showToast('Customer avatar updates are not supported by the backend yet.', 'info');
    event.target.value = '';
  }

  showToast(message: string, type: 'success' | 'info' | 'error' = 'success') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
