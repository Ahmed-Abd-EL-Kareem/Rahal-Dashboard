import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, Trip, User, UserSubscription } from '../../models/auth.models';
import { environment } from '../../../environments/environment';

export interface UsersResponse {
  data: {
    users: User[];
  };
}

export interface UserResponse {
  data: {
    user: User;
  };
}

export interface TripsResponse {
  data: Trip[];
}

export interface BookingsResponse {
  data: Booking[];
}

export interface SubscriptionsResponse {
  subscriptions: UserSubscription[];
}

export interface UserQueryParams {
  search?: string;
  limit?: number;
  page?: number;
  role?: string;
  sort?: string;
}

export interface UserScopedQueryParams {
  user?: string;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getUsers(params: UserQueryParams = {}): Observable<UsersResponse> {
    let httpParams = new HttpParams();

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.role && params.role !== 'all') {
      httpParams = httpParams.set('role', params.role);
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<UsersResponse>(this.baseUrl, { params: httpParams });
  }

  createUser(userData: Partial<User> & { password?: string }): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.baseUrl, userData);
  }

  deleteUser(id: string): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(`${this.baseUrl}/${id}`);
  }

  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/${id}`);
  }

  updateUser(id: string, userData: Partial<User>): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.baseUrl}/${id}`, userData);
  }

  getTrips(params: UserScopedQueryParams = {}): Observable<TripsResponse> {
    return this.http.get<TripsResponse>(`${environment.apiUrl}/trips/admin/all`, {
      params: this.buildScopedParams(params),
    });
  }

  getBookings(params: UserScopedQueryParams = {}): Observable<BookingsResponse> {
    return this.http.get<BookingsResponse>(`${environment.apiUrl}/bookings/admin/all`, {
      params: this.buildScopedParams(params),
    });
  }

  getSubscriptions(params: UserScopedQueryParams = {}): Observable<SubscriptionsResponse> {
    return this.http.get<SubscriptionsResponse>(`${environment.apiUrl}/subscriptions/admin/all`, {
      params: this.buildScopedParams(params),
    });
  }

  getSubscriptionByUserId(userId: string): Observable<SubscriptionsResponse> {
    return this.http.get<SubscriptionsResponse>(`${environment.apiUrl}/subscriptions/admin/all`, {
      params: new HttpParams().set('user', userId),
    });
  }

  private buildScopedParams(params: UserScopedQueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params.user) {
      httpParams = httpParams.set('user', params.user);
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return httpParams;
  }
}
