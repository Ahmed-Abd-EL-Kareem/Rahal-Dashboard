import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UsersService } from '../../../core/users/users.service';
import { User } from '../../../models/auth.models';

import {
  matGroupOutline,
  matSearchOutline,
  matDownloadOutline,
  matAddOutline,
  matCheckCircleOutline,
  matDensityMediumOutline,
  matStarOutline,
  matChevronLeftOutline,
  matChevronRightOutline,
  matCloseOutline,
  matDeleteOutline,
  matCardMembershipOutline,
  matSettingsOutline,
  matPersonOutline,
  matMailOutline,
  matVpnKeyOutline,
  matVisibilityOutline,
  matTravelExploreOutline
} from '@ng-icons/material-icons/outline';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

@Component({
  selector: 'app-user',
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  styleUrl: './user.css',
  templateUrl: 'user.html',
  viewProviders: [
    provideIcons({
      matGroupOutline,
      matSearchOutline,
      matDownloadOutline,
      matAddOutline,
      matCheckCircleOutline,
      matDensityMediumOutline,
      matStarOutline,
      matChevronLeftOutline,
      matChevronRightOutline,
      matCloseOutline,
      matDeleteOutline,
      matCardMembershipOutline,
      matSettingsOutline,
      matPersonOutline,
      matMailOutline,
      matVpnKeyOutline,
      matVisibilityOutline,
      matTravelExploreOutline
    })
  ]
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  users = signal<User[]>([]);
  isLoading = signal(false);
  density = signal<'compact' | 'normal'>('compact');

  limit = signal(10);
  page = signal(1);
  searchQuery = signal('');
  roleFilter = signal('all');
  sortFilter = signal('-createdAt');

  selectedUser = signal<User | null>(null);
  showAddModal = signal(false);
  showDeleteModal = signal(false);
  toast = signal<{ message: string; type: 'success' | 'danger' | 'warning' } | null>(null);

  addForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_PATTERN)]]
  });

  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadUsers();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.searchQuery.set(value);
      this.page.set(1);
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);

    this.usersService.getUsers({
      search: this.searchQuery(),
      role: this.roleFilter(),
      sort: this.sortFilter(),
      limit: this.limit(),
      page: this.page()
    }).subscribe({
      next: res => {
        this.users.set(res.data.users ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.showToast('Failed to load users', 'danger');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  setRoleFilter(role: string): void {
    this.roleFilter.set(role);
    this.page.set(1);
    this.loadUsers();
  }

  setSortFilter(sort: string): void {
    this.sortFilter.set(sort);
    this.page.set(1);
    this.loadUsers();
  }

  nextPage(): void {
    this.page.update(current => current + 1);
    this.loadUsers();
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update(current => current - 1);
      this.loadUsers();
    }
  }

  setDensity(density: 'compact' | 'normal'): void {
    this.density.set(density);
  }

  openAddModal(): void {
    this.addForm.reset();
    this.showAddModal.set(true);
  }

  openDeleteModal(user: User): void {
    this.selectedUser.set(user);
    this.showDeleteModal.set(true);
  }

  closeAllModals(): void {
    this.showAddModal.set(false);
    this.showDeleteModal.set(false);
    this.selectedUser.set(null);
  }

  onSubmitAdd(): void {
    if (this.addForm.invalid) return;

    this.isLoading.set(true);
    this.usersService.createUser(this.addForm.value).subscribe({
      next: () => {
        this.showToast('User created successfully', 'success');
        this.closeAllModals();
        this.loadUsers();
      },
      error: err => {
        const errorMsg = err.error?.message ?? 'Failed to create user';
        this.showToast(errorMsg, 'danger');
        this.isLoading.set(false);
      }
    });
  }

  onConfirmDelete(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.isLoading.set(true);
    this.usersService.deleteUser(user._id).subscribe({
      next: () => {
        this.showToast('User deleted successfully', 'success');
        this.closeAllModals();
        this.loadUsers();
      },
      error: err => {
        const errorMsg = err.error?.message ?? 'Failed to delete user';
        this.showToast(errorMsg, 'danger');
        this.isLoading.set(false);
      }
    });
  }

  onExport(): void {
    const header = 'Name,Email,Role,Subscription,Saved Trips';
    const rows = this.users().map(user =>
      `"${user.name}","${user.email}","${user.role}","${user.subscription ?? 'free'}","${this.getUserTripsCount(user)}"`
    );
    const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows.join('\n')}`;

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('CSV export downloaded successfully', 'success');
  }

private generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-');
}

  viewUserDetails(user: User): void {
  const userSlug = this.generateSlug(user.name);

  void this.router.navigate(['/dashboard/users', userSlug], {
    state: { id: user._id }
  });
}

// viewUserDetails(user: User): void {
//     void this.router.navigate(['/dashboard/users', user._id]);
//   }

  getInitials(name: string): string {
    if (!name) return 'U';

    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  getUserTripsCount(user: User): number {
    return user.savedTrips?.length ?? 0;
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

  private showToast(message: string, type: 'success' | 'danger' | 'warning'): void {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
