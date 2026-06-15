import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matPublicOutline, matAutoAwesomeOutline, matErrorOutline, matMailOutline, matLockOutline, matVisibilityOutline, matVisibilityOffOutline, matRefreshOutline, matArrowForwardOutline } from '@ng-icons/material-icons/outline';
import { email, form, FormField, minLength, required, submit, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, FormField, FormRoot, RouterLink],
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
  // loginForm = this.fb.group({
  //   email: ['', [Validators.required, Validators.email]],
  //   password: ['', [Validators.required, Validators.minLength(6)]],
  // });
  loginModel = signal<LoginRequest>({
    email: '',
    password: '',
  });
  loginForm = form(
    this.loginModel,
    (loginData) => {
      required(loginData.email, { message: 'Email is required.' });
      email(loginData.email, { message: 'Please enter a valid email address.' });
      required(loginData.password, { message: 'Password is required.' });
      minLength(loginData.password, 8, { message: 'Password must be at least 8 characters.' });
    },
    {
      submission: {
        action: async (form) => {
          const { email, password } = form().value();
          this.errorMessage.set(null);

          try {
            const res = await firstValueFrom(
              this.auth.login({ email: email!, password: password! }),
            );

            if (res.data.user.role !== 'admin') {
              this.errorMessage.set('Access denied. Admin credentials required.');
              this.auth.logout();
              return;
            }

            await this.router.navigate(['/dashboard']);
          } catch (err: any) {
            this.errorMessage.set(err?.message ?? 'Login failed');
          }
        },
      },
    },
  );
  // loginForm = form(this.loginModel,
  //   (loginData)=>{
  //   required(loginData.email,{message:"Email is required."});
  //   email(loginData.email,{message:"Please enter a valid email address."});
  //   required(loginData.password,{message:"Password is required."});
  //   minLength(loginData.password,8,{message:"Password must be at least 8 characters."});
  // },
  //  {
  //   submission: {
  //     action: async (fields) => {
  //       console.log(fields().value());
  //       const { email, password } = fields().value();
  //       // this.loading.set(true);
  //       // this.errorMessage.set(null);

  //       this.auth.login({ email: email!, password: password! }).subscribe({
  //         next: (res) => {
  //           // this.loading.set(false);
  //           if (res.data.user.role !== 'admin') {
  //             this.errorMessage.set('Access denied. Admin credentials required.');
  //             this.auth.logout();
  //             return;
  //           }
  //           this.router.navigate(['/dashboard']);
  //         },
  //         error: (err: Error) => {
  //           this.loading.set(false);
  //           this.errorMessage.set(err.message);
  //         },
  //       });
  //     },
  //   },
  // });
  // ── Validation helpers ────────────────────────────────────
  // emailInvalid() {
  //   const ctrl = this.loginForm.email();
  //   return ctrl?.invalid() && ctrl?.touched();
  // }
  // passwordInvalid() {
  //   const ctrl = this.loginForm.password();
  //   return ctrl?.invalid() && ctrl?.touched();
  // }

  // ── Submit ────────────────────────────────────────────────
  // onSubmit(event: Event): void {
  //   event?.preventDefault();
  //   // Mark all fields touched to show validation errors
  //   // this.loginForm.markAllAsTouched();

  //   if (this.loading()) return;

  //   this.loading.set(true);
  //   this.errorMessage.set(null);
  //   submit(this.loginForm,{
  //     action: async()=> {
  //       const { email, password } = this.loginModel();
  //           this.auth.login({ email: email!, password: password! }).subscribe({
  //             next: (res) => {
  //               this.loading.set(false);
  //               // Redirect admin to dashboard, reject non-admins
  //               if (res.data.user.role !== 'admin') {
  //                 this.errorMessage.set('Access denied. Admin credentials required.');
  //                 this.auth.logout();
  //                 return;
  //               }
  //               this.router.navigate(['/dashboard']);
  //             },
  //             error: (err: Error) => {
  //               this.loading.set(false);
  //               this.errorMessage.set(err.message);
  //             },
  //           });
  //     },
  //   });
  //   // const { email, password } = this.loginForm.value;
  //   // const { email, password } = this.loginModel();
  //   // this.auth.login({ email: email!, password: password! }).subscribe({
  //   //   next: (res) => {
  //   //     this.loading.set(false);
  //   //     // Redirect admin to dashboard, reject non-admins
  //   //     if (res.data.user.role !== 'admin') {
  //   //       this.errorMessage.set('Access denied. Admin credentials required.');
  //   //       this.auth.logout();
  //   //       return;
  //   //     }
  //   //     this.router.navigate(['/dashboard']);
  //   //   },
  //   //   error: (err: Error) => {
  //   //     this.loading.set(false);
  //   //     this.errorMessage.set(err.message);
  //   //   },
  //   // });
  // }
}
