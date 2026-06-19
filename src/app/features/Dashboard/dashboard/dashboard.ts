import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../dahboard.service';
import { DashboardData } from '../dashboard.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
private router = inject(Router);
  data = signal<DashboardData | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load dashboard data.');
        this.loading.set(false);
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return value.toString();
}

  formatCurrency(value: number): string {
    if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(2) + 'M';
    if (value >= 1_000) return '$' + (value / 1_000).toFixed(1) + 'K';
    return '$' + value;
  }

  growthClass(growth: number): string {
    return growth >= 0 ? 'text-emerald-500' : 'text-red-400';
  }

  growthIcon(growth: number): string {
    return growth >= 0 ? '↑' : '↓';
  }

  viewAllDestinations(): void {
  this.router.navigate(['/dashboard/destinations']);
}
  // ─── Revenue Chart bar height % ───────────────────────────────────────────
  maxRevenue(): number {
    const chart = this.data()?.bookings?.revenueChart ?? [];
    return chart.length ? Math.max(...chart.map((c) => c.revenue)) : 1;
  }
  exportReport(): void {
  const data = this.data();

  if (!data) {
    console.warn('No dashboard data found');
    return;
  }

  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], {
    type: 'application/json',
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;
  a.download = 'dashboard-report.json';

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);

  window.URL.revokeObjectURL(url);
}

barHeight(revenue: number): number {
  const max = this.maxRevenue();

  if (!max) return 10;

  return Math.max((revenue / max) * 100, 8);
}

  // ─── Booking Trends max ───────────────────────────────────────────────────
maxTrend(): number {
  const trends = this.data()?.bookings?.bookingTrends ?? [];
  return trends.length
    ? Math.max(...trends.map((t) => t.hotels))
    : 1;
}

 trendHeight(val: number): number {
  const max = this.maxTrend();
  if (!max) return 0;
  return Math.max(Math.round((val / max) * 100), val > 0 ? 4 : 0);
}

  // ─── Subscription donut segments ──────────────────────────────────────────
  tierColors: Record<string, string> = {
    Enterprise: '#0d9488',
    Pro: '#14b8a6',
    Basic: '#99f6e4',
  };

  tierColor(name: string): string {
    return this.tierColors[name] ?? '#cbd5e1';
  }

  // Build SVG arc path for donut chart
// Build SVG arc path for donut chart
  getDonutSegments(): { path: string; color: string; name: string; pct: number; rotate: number }[] {
    const tiers = this.data()?.subscriptions?.tiers ?? [];
    const r = 45;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    return tiers.map((tier) => {
      const dash = (tier.percentage / 100) * circumference;
      const gap = circumference - dash;
      const rotate = (offset / 100) * 360;
      offset += tier.percentage;

      return {
        path: `${dash} ${gap}`,
        color: this.tierColor(tier.name),
        name: tier.name,
        pct: tier.percentage,
        rotate,
      };
    });
  }
}