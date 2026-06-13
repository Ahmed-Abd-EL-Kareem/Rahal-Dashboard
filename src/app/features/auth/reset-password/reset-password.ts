import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { form, FormField, minLength, required, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthCard } from '../../../shared/components/auth-card/auth-card';
import { ButtonComponent } from '../../../shared/components/button/button';
import { FormFieldComponent as AppFormField } from '../../../shared/components/form-field/form-field';
import { PasswordStrengthComponent } from '../../../shared/components/password-strength/password-strength';

interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    RouterLink,
    FormField,
    FormRoot,
    AuthCard,
    ButtonComponent,
    AppFormField,
    PasswordStrengthComponent
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ── Signals ──────────────────────────────────────────────
  errorMessage = signal<string | null>(null);
  successMode = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // ── Form Model ───────────────────────────────────────────
  resetModel = signal<ResetPasswordRequest>({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  resetForm = form(
    this.resetModel,
    (resetData) => {
      required(resetData.newPassword, { message: 'Password is required.' });
      minLength(resetData.newPassword, 8, { message: 'Password must be at least 8 characters.' });
      required(resetData.confirmPassword, { message: 'Please confirm your password.' });
    },
    {
      submission: {
        action: async (formSignal) => {
          const { email, otp, newPassword, confirmPassword } = formSignal().value();
          this.errorMessage.set(null);

          // 1. Password validation criteria
          if (!newPassword || newPassword.length < 8) {
            this.errorMessage.set('Password must be at least 8 characters long.');
            return;
          }
          if (!/[A-Z]/.test(newPassword)) {
            this.errorMessage.set('Password must contain at least one uppercase letter.');
            return;
          }
          if (!/[a-z]/.test(newPassword)) {
            this.errorMessage.set('Password must contain at least one lowercase letter.');
            return;
          }
          if (!/[0-9]/.test(newPassword)) {
            this.errorMessage.set('Password must contain at least one number.');
            return;
          }
          if (!/[^A-Za-z0-9]/.test(newPassword)) {
            this.errorMessage.set('Password must contain at least one special character.');
            return;
          }

          // 2. Matching validation
          if (newPassword !== confirmPassword) {
            this.errorMessage.set('Passwords do not match.');
            return;
          }

          // 3. Email and OTP check
          if (!email || !otp) {
            this.errorMessage.set('Verification code or email is missing. Please restart the process.');
            return;
          }

          try {
            await firstValueFrom(
              this.auth.resetPassword({
                email: email,
                otp: otp,
                newPassword: newPassword,
              })
            );
            this.successMode.set(true);
          } catch (err: any) {
            this.errorMessage.set(err?.message ?? 'Failed to reset password. Please check the code and try again.');
          }
        },
      },
    },
  );

  constructor() {
    this.route.queryParams.subscribe(params => {
      const emailVal = params['email'] || '';
      const otpVal = params['otp'] || '';
      
      this.resetModel.update(m => ({
        ...m,
        email: emailVal,
        otp: otpVal
      }));

      if (!emailVal || !otpVal) {
        this.errorMessage.set('Verification code or email is missing. Please verify your OTP first.');
      }
    });
  }
}
