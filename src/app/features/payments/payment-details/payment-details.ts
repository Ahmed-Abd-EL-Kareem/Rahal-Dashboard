import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { PaymentService } from '../../../core/services/payment.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
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
export class PaymentDetailsComponent implements OnInit {  
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);
  private cloudinaryService = inject(CloudinaryService);

  // Component states
  paymentId = signal<string>('');
payment = signal<PaymentDetailsModel | null>(null);
  loading = signal<boolean>(true);
  uploading = signal<boolean>(false);
  uploadProgress = signal<number>(0);

  // Toast notifications
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'info' | 'error'>('success');

  // Customer Avatar Cloudinary Variable (initially bound dynamically to data)
  customerAvatarUrl = computed(() => this.payment()?.customer.avatar ?? '');

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
      error: () => {
        this.showToast('Failed to process refund.', 'error');
      }
    });
  }

  downloadInvoice() {
    this.showToast('Generating invoice download... Please wait.', 'info');
    setTimeout(() => {
      this.showToast('Invoice downloaded successfully.', 'success');
    }, 1500);
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

    // Verify it is an image file
    if (!file.type.startsWith('image/')) {
      this.showToast('Invalid file format. Please select an image.', 'error');
      return;
    }

    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.showToast('Uploading customer avatar...', 'info');

    this.cloudinaryService.uploadImage(file).subscribe({
      next: (status) => {
        this.uploadProgress.set(status.progress);
        if (status.secure_url) {
          // Send secure_url to backend only (simulated by updating payment service)
          this.paymentService.updateCustomerAvatar(this.paymentId(), status.secure_url).subscribe({
            next: () => {
              this.uploading.set(false);
              this.loadDetails(this.paymentId());
              this.showToast('Customer avatar uploaded and updated successfully.', 'success');
            },
            error: () => {
              this.uploading.set(false);
              this.showToast('Failed to update avatar in the database.', 'error');
            }
          });
        }
      },
      error: () => {
        this.uploading.set(false);
        this.showToast('Upload to Cloudinary failed.', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'info' | 'error' = 'success') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
