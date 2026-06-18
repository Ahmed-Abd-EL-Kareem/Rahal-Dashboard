import { Component, signal, computed, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { forkJoin } from 'rxjs';
import {
  matAccountBalanceWalletOutline,
  matReceiptLongOutline,
  matAssignmentReturnOutline,
  matDownloadOutline,
  matAddOutline,
  matTrendingUpOutline,
  matTrendingDownOutline,
  matFlightTakeoffOutline,
  matHotelOutline,
  matDirectionsCarOutline,
  matLocalActivityOutline,
  matAutoAwesomeOutline,
  matCloseOutline,
  matCheckCircleOutline,
  matErrorOutline
} from '@ng-icons/material-icons/outline';
import { PaymentsOverviewService, PaymentTransaction } from '../../core/services/payments-overview.service';
import { PaymentService } from '../../core/services/payment.service';

type Transaction = PaymentTransaction;

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, BaseChartDirective],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
  viewProviders: [
    provideIcons({
      matAccountBalanceWalletOutline,
      matReceiptLongOutline,
      matAssignmentReturnOutline,
      matDownloadOutline,
      matAddOutline,
      matTrendingUpOutline,
      matTrendingDownOutline,
      matFlightTakeoffOutline,
      matHotelOutline,
      matDirectionsCarOutline,
      matLocalActivityOutline,
      matAutoAwesomeOutline,
      matCloseOutline,
      matCheckCircleOutline,
      matErrorOutline
    })
  ]
})
export class Payments implements OnInit {
  private fb = inject(FormBuilder);
  private overviewService = inject(PaymentsOverviewService);
  private paymentService = inject(PaymentService);

  @ViewChild(BaseChartDirective) private chart?: BaseChartDirective;

  // ── State Signals ─────────────────────────────────────────
  timeframe = signal<'12M' | '6M' | '30D'>('12M');
  showAiInsights = signal<boolean>(true);
  showNewInvoiceModal = signal<boolean>(false);
  showAllTransactionsModal = signal<boolean>(false);

  // Loading / error state for the Overview API call
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Toast notifications
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'info'>('success');

  // New Invoice Form
  invoiceForm = this.fb.group({
    clientName: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(1)]],
    category: ['flight', Validators.required],
    description: ['']
  });

  // ── KPI Signals (populated from /payments/admin/*) ─────────
  totalRevenue = signal<number>(0);
  avgTransactionValue = signal<number>(0);
  refundRate = signal<number>(0);

  // Revenue series, keyed by timeframe
  private revenueByMonth = signal<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  private revenueByWeek = signal<{ labels: string[]; data: number[] }>({ labels: [], data: [] });

  // Recent Transactions (from real bookings)
  transactions = signal<Transaction[]>([]);

  ngOnInit() {
    this.loadOverview();
  }

  loadOverview() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      revenue: this.paymentService.getRevenue(),
      avgPrice: this.paymentService.getAveragePrice(),
      cancelled: this.paymentService.getCancelledBookings(),
      overview: this.overviewService.getOverview()
    }).subscribe({
      next: ({ revenue, avgPrice, cancelled, overview }) => {
        this.totalRevenue.set(revenue.totalRevenue);
        this.avgTransactionValue.set(avgPrice.averageBookingPrice);
        this.refundRate.set(cancelled.cancelledBookings);
        this.transactions.set(overview.transactions);
        this.revenueByMonth.set(overview.revenueByMonth);
        this.revenueByWeek.set(overview.revenueByWeek);
        this.loading.set(false);
        console.log('[Payments] revenueByMonth signal:', overview.revenueByMonth);
        console.log('[Payments] revenueByWeek signal:', overview.revenueByWeek);
        console.log('[Payments] chartData:', this.chartData());
        queueMicrotask(() => this.chart?.update());
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load payments overview data.');
        this.showToast('Failed to load payments overview data.', 'info');
      }
    });
  }

  // ── Chart.js Configurations ────────────────────────────────
  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#213145',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const y = context.parsed.y;
            return ` Revenue: $${y !== null && y !== undefined ? y.toLocaleString() : 0}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6e7977',
          font: {
            family: 'Inter',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(110, 121, 119, 0.15)',
        },
        ticks: {
          color: '#6e7977',
          font: {
            family: 'Inter',
            size: 11
          },
          callback: (value) => `$${Number(value) / 1000}k`
        }
      }
    }
  };

  chartData = computed<ChartData<'bar'>>(() => {
    const tf = this.timeframe();
    let labels: string[] = [];
    let data: number[] = [];

    if (tf === '12M') {
      ({ labels, data } = this.revenueByMonth());
    } else if (tf === '6M') {
      const full = this.revenueByMonth();
      labels = full.labels.slice(-6);
      data = full.data.slice(-6);
    } else {
      ({ labels, data } = this.revenueByWeek());
    }

    return {
      labels,
      datasets: [
        {
          data,
          label: 'Revenue ($)',
          backgroundColor: (context) => {
            const index = context.dataIndex;
            const isLast = index === data.length - 1;
            return isLast ? '#005c55' : 'rgba(128, 213, 203, 0.4)';
          },
          hoverBackgroundColor: '#005c55',
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    };
  });

  // ── Actions ───────────────────────────────────────────────
  setTimeframe(tf: '12M' | '6M' | '30D') {
    this.timeframe.set(tf);
  }

  showToast(message: string, type: 'success' | 'info' = 'success') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }

  exportCsv() {
    // No CSV export endpoint is documented for the backend yet.
    this.showToast('CSV export is not supported by the backend yet.', 'info');
  }

  openNewInvoiceModal() {
    this.invoiceForm.reset({
      category: 'flight'
    });
    this.showNewInvoiceModal.set(true);
  }

  closeNewInvoiceModal() {
    this.showNewInvoiceModal.set(false);
  }

  submitNewInvoice() {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    // No endpoint exists yet to create an ad-hoc invoice/transaction from the
    // admin dashboard (POST /bookings requires a real hotel/trip context).
    // Avoid fabricating a transaction in the list.
    this.closeNewInvoiceModal();
    this.showToast('Creating invoices from the dashboard is not supported by the backend yet.', 'info');
  }

  dismissAiInsights() {
    this.showAiInsights.set(false);
  }

  openAllTransactions() {
    this.showAllTransactionsModal.set(true);
  }

  closeAllTransactions() {
    this.showAllTransactionsModal.set(false);
  }
}
