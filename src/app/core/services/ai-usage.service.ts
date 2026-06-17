import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AIUsageDashboardStats,
  AIUsageLog,
  AIModelStat,
  AIDestinationStat
} from '../../models/ai-usage.model';

@Injectable({
  providedIn: 'root'
})
export class AIUsageService {
  private http = inject(HttpClient);

  /**
   * Fetch overall dashboard stats
   */
  getDashboardStats(): Observable<AIUsageDashboardStats> {
    return this.http.get<{ message: string; data: AIUsageDashboardStats }>(
      `${environment.apiUrl}/ai-usage/dashboard`
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Fetch recent AI usage logs
   */
  getRecentLogs(limit: number = 10): Observable<AIUsageLog[]> {
    return this.http.get<{ message: string; length: number; data: AIUsageLog[] }>(
      `${environment.apiUrl}/ai-usage/recent?limit=${limit}`
    ).pipe(
      map(res => res.data || [])
    );
  }

  /**
   * Fetch most used AI models
   */
  getMostUsedModels(): Observable<AIModelStat[]> {
    return this.http.get<{ message: string; length: number; data: AIModelStat[] }>(
      `${environment.apiUrl}/ai-usage/models`
    ).pipe(
      map(res => res.data || [])
    );
  }

  /**
   * Fetch top generated destinations
   */
  getTopDestinations(limit: number = 10): Observable<AIDestinationStat[]> {
    return this.http.get<{ message: string; length: number; data: AIDestinationStat[] }>(
      `${environment.apiUrl}/ai-usage/top-destinations?limit=${limit}`
    ).pipe(
      map(res => res.data || [])
    );
  }
}
