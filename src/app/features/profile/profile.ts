import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../core/auth/auth.service';
import { CloudinaryService } from '../../core/cloudinary/cloudinary.service';
import { User } from '../../models/auth.models';

import {
  matCheckCircleOutline,
  matCloseOutline,
  matEditOutline,
  matLanguageOutline,
  matLockOutline,
  matMailOutline,
  matPersonOutline,
  matPhotoCameraOutline,
  matRefreshOutline,
  matSaveOutline,
  matSettingsOutline,
  matVisibilityOutline,
  matVisibilityOffOutline,
  matVpnKeyOutline
} from '@ng-icons/material-icons/outline';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('passwordConfirm')?.value;

  if (password && confirm && password !== confirm) {
    return { passwordMismatch: true };
  }

  return null;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  viewProviders: [
    provideIcons({
      matCheckCircleOutline,
      matCloseOutline,
      matEditOutline,
      matLanguageOutline,
      matLockOutline,
      matMailOutline,
      matPersonOutline,
      matPhotoCameraOutline,
      matRefreshOutline,
      matSaveOutline,
      matSettingsOutline,
      matVisibilityOutline,
      matVisibilityOffOutline,
      matVpnKeyOutline
    })
  ]
})
export class ProfileComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cloudinary = inject(CloudinaryService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  user = signal<User | null>(null);
  isLoading = signal(true);
  isSavingProfile = signal(false);
  isSavingPassword = signal(false);
  isUploadingImage = signal(false);
  showEditForm = signal(false);
  showPasswordForm = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  imagePreview = signal<string | null>(null);
  selectedImageFile = signal<File | null>(null);
  toast = signal<{ message: string; type: 'success' | 'danger' | 'warning' } | null>(null);

  isLocalProvider = computed(() => (this.user()?.provider ?? 'local') === 'local');

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    preferredLanguage: ['en' as 'en' | 'ar', Validators.required]
  });

  passwordForm = this.fb.group(
    {
      passwordCurrent: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_PATTERN)]],
      passwordConfirm: ['', [Validators.required]]
    },
    { validators: passwordMatchValidator }
  );

  ngOnInit(): void {
    this.auth.fetchCurrentUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.user.set(res.data.user);
        this.isLoading.set(false);
      },
      error: () => {
        const cached = this.auth.currentUser();
        if (cached) {
          this.user.set(cached);
        }
        this.isLoading.set(false);
        this.showToast('Could not refresh profile data', 'warning');
      }
    });
  }

  openEditForm(): void {
    const current = this.user();
    if (!current) return;

    this.profileForm.reset({
      name: current.name,
      preferredLanguage: current.preferredLanguage ?? 'en'
    });
    this.imagePreview.set(current.image ?? null);
    this.selectedImageFile.set(null);
    this.showPasswordForm.set(false);
    this.showEditForm.set(true);
  }

  closeEditForm(): void {
    this.showEditForm.set(false);
    this.imagePreview.set(null);
    this.selectedImageFile.set(null);
  }

  openPasswordForm(): void {
    if (!this.isLocalProvider()) return;

    this.passwordForm.reset();
    this.showEditForm.set(false);
    this.showPasswordForm.set(true);
  }

  closePasswordForm(): void {
    this.showPasswordForm.set(false);
    this.passwordForm.reset();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.showToast('Please upload a JPG, PNG, WEBP, or GIF image', 'danger');
      input.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      this.showToast(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`, 'danger');
      input.value = '';
      return;
    }

    this.selectedImageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
    input.value = '';
  }

  submitProfile(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid || this.isSavingProfile()) return;

    const current = this.user();
    if (!current) return;

    this.isSavingProfile.set(true);

    const { name, preferredLanguage } = this.profileForm.getRawValue();
    const file = this.selectedImageFile();

    const saveProfile = (image?: string) => {
      this.auth
        .updateProfile(current._id, {
          name: name!.trim(),
          preferredLanguage: preferredLanguage!,
          ...(image ? { image } : {})
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            this.user.set(res.data.user);
            this.isSavingProfile.set(false);
            this.closeEditForm();
            this.showToast('Profile updated successfully', 'success');
          },
          error: (err) => {
            this.isSavingProfile.set(false);
            this.showToast(err.error?.message ?? 'Failed to update profile', 'danger');
          }
        });
    };

    if (file) {
      this.isUploadingImage.set(true);
      this.cloudinary
        .uploadImage(file)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (url) => {
            this.isUploadingImage.set(false);
            saveProfile(url);
          },
          error: (err) => {
            this.isUploadingImage.set(false);
            this.isSavingProfile.set(false);
            const message =
              err?.error?.error?.message ??
              err?.error?.message ??
              err?.message ??
              'Failed to upload image';
            this.showToast(message, 'danger');
          }
        });
      return;
    }

    saveProfile();
  }

  submitPassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid || this.isSavingPassword()) return;

    const current = this.user();
    if (!current) return;

    this.isSavingPassword.set(true);
    const { passwordCurrent, password } = this.passwordForm.getRawValue();

    this.auth
      .changePassword({
        currentPassword: passwordCurrent!,
        newPassword: password!
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isSavingPassword.set(false);
          this.closePasswordForm();
          this.auth.logout();
          this.router.navigate(['/login'], {
            state: { message: res.message ?? 'Password updated successfully. Please sign in with your new password.' }
          });
        },
        error: (err) => {
          this.isSavingPassword.set(false);
          this.showToast(err.error?.message ?? 'Failed to update password', 'danger');
        }
      });
  }

  getInitials(name: string): string {
    if (!name) return 'U';

    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  }

  formatLanguage(language?: string): string {
    if (language === 'ar') return 'Arabic';
    if (language === 'en') return 'English';
    return 'English';
  }

  formatRole(role?: string): string {
    if (role === 'admin') return 'Administrator';
    return 'User';
  }

  isInvalid(controlName: 'name' | 'preferredLanguage'): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control?.invalid && control.touched);
  }

  isPasswordInvalid(controlName: 'passwordCurrent' | 'password' | 'passwordConfirm'): boolean {
    const control = this.passwordForm.get(controlName);
    return !!(control?.invalid && control.touched);
  }

  passwordMismatch(): boolean {
    return !!(
      this.passwordForm.errors?.['passwordMismatch'] &&
      this.passwordForm.get('passwordConfirm')?.touched
    );
  }

  private showToast(message: string, type: 'success' | 'danger' | 'warning'): void {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
