import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
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
  matCheckCircleOutline
} from '@ng-icons/material-icons/outline';

interface Transaction {
  id: string;
  category: 'flight' | 'hotel' | 'car' | 'activity';
  client: string;
  time: string;
  amount: number;
  status: 'Completed' | 'Processing' | 'Failed';
  icon: string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgIconComponent, BaseChartDirective],
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
      matCheckCircleOutline
    })
  ]
})
export class Payments {
  private fb = inject(FormBuilder);

  // ── State Signals ─────────────────────────────────────────
  timeframe = signal<'12M' | '6M' | '30D'>('12M');
  showAiInsights = signal<boolean>(true);
  showNewInvoiceModal = signal<boolean>(false);
  showAllTransactionsModal = signal<boolean>(false);
  
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

  // Recent Transactions
  transactions = signal<Transaction[]>([
    { id: 'TRX-9982-FL', category: 'flight', client: 'Sarah Jenkins', time: '2 mins ago', amount: 1250.00, status: 'Completed', icon: 'matFlightTakeoffOutline' },
    { id: 'TRX-9981-HT', category: 'hotel', client: 'Marcus Doe', time: '15 mins ago', amount: 845.50, status: 'Processing', icon: 'matHotelOutline' },
    { id: 'TRX-9980-CR', category: 'car', client: 'Elena Rostova', time: '1 hour ago', amount: 120.00, status: 'Completed', icon: 'matDirectionsCarOutline' },
    { id: 'TRX-9979-FL', category: 'flight', client: 'James Smith', time: '2 hours ago', amount: 2100.00, status: 'Failed', icon: 'matFlightTakeoffOutline' },
    { id: 'TRX-9978-AC', category: 'activity', client: 'Lisa Wong', time: '3 hours ago', amount: 350.00, status: 'Completed', icon: 'matLocalActivityOutline' }
  ]);

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
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = [60000, 82000, 75000, 90000, 110000, 95000, 120000, 115000, 105000, 142000, 125000, 138000];
    } else if (tf === '6M') {
      labels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = [120000, 115000, 105000, 142000, 125000, 138000];
    } else {
      labels = ['W1', 'W2', 'W3', 'W4'];
      data = [32000, 35000, 38000, 42000];
    }
    
    return {
      labels,
      datasets: [
        {
          data,
          label: 'Revenue ($)',
          backgroundColor: (context) => {
            const index = context.dataIndex;
            const isHighlight = (tf === '12M' && index === 9) || (tf === '6M' && index === 3) || (tf === '30D' && index === 3);
            return isHighlight ? '#005c55' : 'rgba(128, 213, 203, 0.4)'; 
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
    this.showToast('Generating CSV report... Your download will begin shortly.', 'info');
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

    const val = this.invoiceForm.value;
    const cat = val.category as 'flight' | 'hotel' | 'car' | 'activity';
    let iconName = 'matFlightTakeoffOutline';
    if (cat === 'hotel') iconName = 'matHotelOutline';
    else if (cat === 'car') iconName = 'matDirectionsCarOutline';
    else if (cat === 'activity') iconName = 'matLocalActivityOutline';

    const newTx: Transaction = {
      id: `TRX-${Math.floor(1000 + Math.random() * 9000)}-${cat.slice(0,2).toUpperCase()}`,
      category: cat,
      client: val.clientName ?? 'Unknown Client',
      time: 'Just now',
      amount: val.amount ?? 0,
      status: 'Processing',
      icon: iconName
    };

    // Add to top of transactions
    this.transactions.update(txs => [newTx, ...txs]);
    this.closeNewInvoiceModal();
    this.showToast(`Invoice generated successfully for $${newTx.amount.toLocaleString()}`);
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
