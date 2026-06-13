import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matPublicOutline,
  matAutoAwesomeOutline,
  matErrorOutline,
  matMailOutline,
  matLockOutline,
  matVisibilityOutline,
  matVisibilityOffOutline,
  matRefreshOutline,
  matArrowForwardOutline,
} from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  viewProviders: [
    provideIcons({
      matPublicOutline,
      matAutoAwesomeOutline,
      matErrorOutline,
      matMailOutline,
      matLockOutline,
      matVisibilityOutline,
      matVisibilityOffOutline,
      matRefreshOutline,
      matArrowForwardOutline,
    }),
  ],
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // ── Signals ──────────────────────────────────────────────
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  // ── Form ─────────────────────────────────────────────────
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // ── Validation helpers ────────────────────────────────────
  emailInvalid() {
    const ctrl = this.loginForm.get('email');
    return ctrl?.invalid && ctrl?.touched;
  }
  passwordInvalid() {
    const ctrl = this.loginForm.get('password');
    return ctrl?.invalid && ctrl?.touched;
  }

  // ── Submit ────────────────────────────────────────────────
  onSubmit(): void {
    // Mark all fields touched to show validation errors
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.auth.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.loading.set(false);
        // Redirect admin to dashboard, reject non-admins
        if (res.data.user.role !== 'admin') {
          this.errorMessage.set('Access denied. Admin credentials required.');
          this.auth.logout();
          return;
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
