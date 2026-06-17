import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AIUsageService } from '../../core/services/ai-usage.service';
import {
  AIUsageDashboardStats,
  AIUsageLog,
  AIModelStat,
  AIDestinationStat
} from '../../models/ai-usage.model';

@Component({
  selector: 'app-ai-usage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-usage.component.html',
  styleUrl: './ai-usage.component.css'
})
export class AIUsageComponent implements OnInit {
  private aiUsageService = inject(AIUsageService);

  // Signals for component state
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Data signals
  stats = signal<AIUsageDashboardStats | null>(null);
  recentLogs = signal<AIUsageLog[]>([]);
  modelStats = signal<AIModelStat[]>([]);
  destinationStats = signal<AIDestinationStat[]>([]);

  // Period filter
  selectedPeriod = signal<string>('Last 24 Hours');

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      stats: this.aiUsageService.getDashboardStats(),
      recentLogs: this.aiUsageService.getRecentLogs(10),
      modelStats: this.aiUsageService.getMostUsedModels(),
      destinationStats: this.aiUsageService.getTopDestinations(10)
    }).subscribe({
      next: (results) => {
        this.stats.set(results.stats);
        this.recentLogs.set(results.recentLogs);
        this.modelStats.set(results.modelStats);
        this.destinationStats.set(results.destinationStats);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching AI Usage data:', err);
        this.error.set('Failed to load dashboard data. Please try again.');
        this.loading.set(false);
      }
    });
  }

  // Format Helper Methods
  formatTokens(tokens: number): string {
    if (!tokens) return '0';
    if (tokens >= 1000000) {
      return (tokens / 1000000).toFixed(1) + 'M';
    }
    if (tokens >= 1000) {
      return (tokens / 1000).toFixed(1) + 'K';
    }
    return tokens.toString();
  }

  formatCost(cost: number): string {
    if (cost === undefined || cost === null) return '$0.00';
    return '$' + cost.toFixed(4);
  }

  formatLatency(ms: number): string {
    if (!ms) return '0.0s';
    return (ms / 1000).toFixed(2) + 's';
  }

  onPeriodChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedPeriod.set(value);
  }
}
