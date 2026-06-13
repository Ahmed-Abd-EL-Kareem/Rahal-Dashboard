import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthCard } from '../../../shared/components/auth-card/auth-card';
import { ButtonComponent } from '../../../shared/components/button/button';
import { OTPInputComponent } from '../../../shared/components/otp-input/otp-input';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, RouterLink, AuthCard, ButtonComponent, OTPInputComponent],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css',
})
export class VerifyOtp implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = signal<string>('');
  infoMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  otpCode = signal<string>('');
  loading = signal(false);

  // Resend timer
  resendCountdown = signal<number>(60);
  private timerInterval: any;

  canResend = computed(() => this.resendCountdown() === 0);
  disableVerify = computed(() => this.otpCode().length !== 6);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email.set(params['email'] || '');
      this.infoMessage.set(params['info'] || null);
    });

    this.startResendTimer();
  }

  ngOnDestroy() {
    this.clearResendTimer();
  }

  startResendTimer() {
    this.resendCountdown.set(60);
    this.clearResendTimer();
    this.timerInterval = setInterval(() => {
      if (this.resendCountdown() > 0) {
        this.resendCountdown.update(c => c - 1);
      } else {
        this.clearResendTimer();
      }
    }, 1000);
  }

  clearResendTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  onOtpChange(code: string) {
    this.otpCode.set(code);
  }

  async verifyCode() {
    if (this.disableVerify()) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      if (!this.email()) {
        this.errorMessage.set('Email is missing. Please restart the forgot password process.');
        this.loading.set(false);
        return;
      }

      // Verify OTP with backend first
      await firstValueFrom(this.auth.verifyOtp(this.email(), this.otpCode()));
      
      // Navigate to step 3 (New Password) carrying over the verified email and code
      await this.router.navigate(['/reset-password'], {
        queryParams: {
          email: this.email(),
          otp: this.otpCode()
        }
      });
    } catch (err: any) {
      this.errorMessage.set(err?.message ?? 'Verification failed.');
    } finally {
      this.loading.set(false);
    }
  }

  resendCode() {
    if (!this.canResend()) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    this.auth.forgotPassword(this.email()).subscribe({
      next: () => {
        this.infoMessage.set('A new verification code has been sent to your email.');
        this.loading.set(false);
        this.startResendTimer();
      },
      error: (err: any) => {
        this.errorMessage.set(err?.message ?? 'Failed to resend code.');
        this.loading.set(false);
      }
    });
  }
}
