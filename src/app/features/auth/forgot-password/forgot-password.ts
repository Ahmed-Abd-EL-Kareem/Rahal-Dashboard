import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { email, form, FormField, required, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthCard } from '../../../shared/components/auth-card/auth-card';
import { ButtonComponent } from '../../../shared/components/button/button';
import { FormFieldComponent as AppFormField } from '../../../shared/components/form-field/form-field';

interface ForgotPasswordRequest {
  email: string;
}

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterLink, FormField, FormRoot, AuthCard, ButtonComponent, AppFormField],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private auth = inject(AuthService);
  private router = inject(Router);

  // ── Signals ──────────────────────────────────────────────
  errorMessage = signal<string | null>(null);

  // ── Form Model ───────────────────────────────────────────
  forgotModel = signal<ForgotPasswordRequest>({
    email: '',
  });

  forgotForm = form(
    this.forgotModel,
    (forgotData) => {
      required(forgotData.email, { message: 'Email is required.' });
      email(forgotData.email, { message: 'Please enter a valid email address.' });
    },
    {
      submission: {
        action: async (formSignal) => {
          const { email } = formSignal().value();
          this.errorMessage.set(null);

          try {
            await firstValueFrom(this.auth.forgotPassword(email!));
            
            // Navigate to step 2 (Verify OTP) with email parameter and success info
            await this.router.navigate(['/verify-otp'], {
              queryParams: { 
                email: email!,
                info: 'A verification code has been sent to your email.' 
              }
            });
          } catch (err: any) {
            this.errorMessage.set(err?.message ?? 'Failed to send reset link. Please try again.');
          }
        },
      },
    },
  );
}
