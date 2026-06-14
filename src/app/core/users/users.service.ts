import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/auth.models';
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

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private http: HttpClient) {}
  private baseUrl = `${environment.apiUrl}/users`;

  /**
   * Get all users (filtered)
   */
  getUsers(params: {
    search?: string;
    limit?: number;
    role?: string;
    sort?: string;
  } = {}): Observable<UsersResponse> {
    let httpParams = new HttpParams();

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    if (params.role && params.role !== 'all') {
      httpParams = httpParams.set('role', params.role);
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<UsersResponse>(this.baseUrl, { params: httpParams });
  }

  /**
   * Create an admin user
   */
  createUser(userData: Partial<User> & { password?: string }): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.baseUrl, userData);
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Update user details
   */
  updateUser(id: string, userData: Partial<User>): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.baseUrl}/${id}`, userData);
  }

  /**
   * Get all trips (admin view)
   */
  getTrips(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/trips/admin/all`);
  }

  /**
   * Get all bookings (admin view)
   */
  getBookings(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/bookings/admin/all`);
  }

  /**
   * Get all subscriptions (admin view)
   */
  getSubscriptions(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/subscriptions/admin/all`);
  }
}
