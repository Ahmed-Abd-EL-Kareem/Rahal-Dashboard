// import { Injectable, signal, computed, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { tap, catchError } from 'rxjs/operators';
// import { throwError } from 'rxjs';
// import { User, LoginRequest, AuthResponse } from '../../models/auth.models';
// import { environment } from '../../../environments/environment';
// import { CookieService } from 'ngx-cookie-service';

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private http = inject(HttpClient);
//   private router = inject(Router);
//   private cookieService = inject(CookieService);

//   private TOKEN_KEY = 'token';
//   private USER_KEY = 'rahal_user';

//   token = signal<string | null>(this.cookieService.get(this.TOKEN_KEY) || null);
//   currentUser = signal<User | null>(this._loadUser());

//   isAuthenticated = computed(() => !!this.token() || !!this.currentUser());
//   isAdmin = computed(() => this.currentUser()?.role === 'admin');

//   constructor() {
//     // If a token is found in the cookies but user details aren't loaded, fetch them from backend
//     if (this.token() && !this.currentUser()) {
//       this.fetchCurrentUser().subscribe({
//         error: () => this.logout()
//       });
//     }
//   }

//   fetchCurrentUser() {
//     // Retrieve logged-in user profile, trying /users/me first and falling back to /auth/me
//     return this.http.get<{ data: { user: User } }>(`${environment.apiUrl}/users/me`).pipe(
//       tap((res) => {
//         this.currentUser.set(res.data.user);
//         this.cookieService.set(this.USER_KEY, JSON.stringify(res.data.user), 7, '/');
//       }),
//       catchError((err) => {
//         return this.http.get<{ data: { user: User } }>(`${environment.apiUrl}/auth/me`).pipe(
//           tap((res) => {
//             this.currentUser.set(res.data.user);
//             this.cookieService.set(this.USER_KEY, JSON.stringify(res.data.user), 7, '/');
//           })
//         );
//       })
//     );
//   }

//   login(credentials: LoginRequest) {
//     return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials,{ withCredentials: true }).pipe(
//       tap((res) => {
//         // Read the token from the response body and set it in memory
//         const tokenVal = res.token;
//         this.token.set(tokenVal);
//         this.cookieService.set(this.TOKEN_KEY, tokenVal, 7, '/');

//         this.currentUser.set(res.data.user);
//         console.log(res);
//         // Save user details to cookies (expire in 7 days, path '/')
//         // We do NOT write the token cookie from JS to avoid conflicting with the backend's HttpOnly cookie
//         this.cookieService.set(this.USER_KEY, JSON.stringify(res.data.user), 7, '/');
//       }),
//       catchError((err) => {
//         const msg = err.error?.message ?? 'Incorrect email or password.';
//         return throwError(() => new Error(msg));
//       }),
//     );

//   }

//   logout(): void {
//     this.token.set(null);
//     this.currentUser.set(null);
//     this.cookieService.delete(this.TOKEN_KEY, '/');
//     this.cookieService.delete(this.USER_KEY, '/');
//   }

//   private _loadUser(): User | null {
//     try {
//       const r = this.cookieService.get(this.USER_KEY);
//       return r ? JSON.parse(r) : null;
//     } catch {
//       return null;
//     }
//   }
// }
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { User, LoginRequest, AuthResponse, UpdateProfileRequest, ChangePasswordRequest } from '../../models/auth.models';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cookieService = inject(CookieService);

  private TOKEN_KEY = 'token';
  private USER_KEY = 'rahal_user';

  // الحالة في الذاكرة
  token = signal<string | null>(null);
  currentUser = signal<User | null>(this._loadUser());

  isAuthenticated = computed(() => !!this.token() || !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    // تحميل التوكن من الكوكي عند بداية التطبيق
    const savedToken = this.cookieService.get(this.TOKEN_KEY);
    if (savedToken) {
      this.token.set(savedToken);
    }

    // لو فيه token ومفيش user نجيب بياناته
    if (this.getToken() && !this.currentUser()) {
      this.fetchCurrentUser().subscribe({
        error: () => this.logout()
      });
    }
  }

  // ✅ GETTER مهم جدًا
  getToken(): string | null {
    return this.cookieService.get(this.TOKEN_KEY) || this.token();
  }

  fetchCurrentUser() {
    const userId = this.currentUser()?._id ?? this._getUserIdFromToken();
    if (!userId) {
      return throwError(() => new Error('No user ID available'));
    }

    return this.http.get<{ data: { user: User } }>(`${environment.apiUrl}/users/${userId}`).pipe(
      tap((res) => {
        this.currentUser.set(res.data.user);
        this.cookieService.set(this.USER_KEY, JSON.stringify(res.data.user), 7, '/');
      })
    );
  }

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials, { withCredentials: true }).pipe(
      tap((res) => {
        const tokenVal = res.token;

        // حفظ التوكن
        this.token.set(tokenVal);
        this.cookieService.set(this.TOKEN_KEY, tokenVal, 7, '/');

        // حفظ user
        this.currentUser.set(res.data.user);

        // Save user details to cookies (expire in 7 days, path '/')
        // We do NOT write the token cookie from JS to avoid conflicting with the backend's HttpOnly cookie
        this.cookieService.set(this.USER_KEY, JSON.stringify(res.data.user), 7, '/');

        console.log('LOGIN RESPONSE:', res);
      }),
      catchError((err) => {
        const msg = err.error?.message ?? 'Incorrect email or password.';
        return throwError(() => new Error(msg));
      })
    );
  }

  forgotPassword(email: string) {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email }).pipe(
      catchError((err) => {
        const msg = err.error?.message ?? 'Could not send reset link. Please try again.';
        return throwError(() => new Error(msg));
      })
    );
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post(`${environment.apiUrl}/auth/verify-otp`, { email, otp }).pipe(
      catchError((err) => {
        const msg = err.error?.message ?? 'Invalid or expired OTP. Please try again.';
        return throwError(() => new Error(msg));
      })
    );
  }

  resetPassword(data: { email: string; newPassword: string; otp: string }) {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, data).pipe(
      catchError((err) => {
        const msg = err.error?.message ?? 'Failed to reset password. Please check the OTP and try again.';
        return throwError(() => new Error(msg));
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.cookieService.delete(this.TOKEN_KEY, '/');
    this.cookieService.delete(this.USER_KEY, '/');

    this.router.navigate(['/login']);
  }

  updateProfile(userId: string, data: UpdateProfileRequest) {
    return this.http.patch<{ data: { user: User } }>(`${environment.apiUrl}/users/${userId}`, data).pipe(
      tap((res) => {
        this.currentUser.set(res.data.user);
        this.cookieService.set(this.USER_KEY, JSON.stringify(res.data.user), 7, '/');
      })
    );
  }

  changePassword(data: ChangePasswordRequest) {
    return this.http.patch<{ status: string; message: string }>(
      `${environment.apiUrl}/users/change-password`,
      data
    );
  }

  private _getUserIdFromToken(): string | null {
    const token = this.token();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id ?? null;
    } catch {
      return null;
    }
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
