import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { User, LoginRequest, AuthResponse } from '../../models/auth.models';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cookieService = inject(CookieService);

  private TOKEN_KEY = 'token';
  private USER_KEY = 'rahal_user';

  token = signal<string | null>(this.cookieService.get(this.TOKEN_KEY) || null);
  currentUser = signal<User | null>(this._loadUser());

  isAuthenticated = computed(() => !!this.token() || !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    // If a token is found in the cookies but user details aren't loaded, fetch them from backend
    if (this.token() && !this.currentUser()) {
      this.fetchCurrentUser().subscribe({
        error: () => this.logout()
      });
    }
  }

  fetchCurrentUser() {
    // Retrieve logged-in user profile, trying /users/me first and falling back to /auth/me
    return this.http.get<{ data: { user: User } }>(`${environment.apiUrl}/users/me`).pipe(
      tap((res) => {
        this.currentUser.set(res.data.user);
        this.cookieService.set(this.USER_KEY, JSON.stringify(res.data.user), 7, '/');
      }),
      catchError((err) => {
        return this.http.get<{ data: { user: User } }>(`${environment.apiUrl}/auth/me`).pipe(
          tap((res) => {
            this.currentUser.set(res.data.user);
            this.cookieService.set(this.USER_KEY, JSON.stringify(res.data.user), 7, '/');
          })
        );
      })
    );
  }

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials, { withCredentials: true }).pipe(
      tap((res) => {
        // Read the token from the response body and set it in memory
        const tokenVal = res.token;
        this.token.set(tokenVal);
        this.currentUser.set(res.data.user);

        // Save user details to cookies (expire in 7 days, path '/')
        // We do NOT write the token cookie from JS to avoid conflicting with the backend's HttpOnly cookie
        this.cookieService.set(this.USER_KEY, JSON.stringify(res.data.user), 7, '/');
      }),
      catchError((err) => {
        const msg = err.error?.message ?? 'Incorrect email or password.';
        return throwError(() => new Error(msg));
      }),
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.cookieService.delete(this.TOKEN_KEY, '/');
    this.cookieService.delete(this.USER_KEY, '/');
  }

  private _loadUser(): User | null {
    try {
      const r = this.cookieService.get(this.USER_KEY);
      return r ? JSON.parse(r) : null;
    } catch {
      return null;
    }
  }
}
