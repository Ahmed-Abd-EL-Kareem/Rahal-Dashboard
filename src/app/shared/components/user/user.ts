import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { Subject, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { UsersService } from '../../../core/users/users.service';
import { User } from '../../../models/auth.models';

import {
  matGroupOutline,
  matSearchOutline,
  matDownloadOutline,
  matAddOutline,
  matFilterListOutline,
  matDateRangeOutline,
  matCheckCircleOutline,
  matDensitySmallOutline,
  matDensityMediumOutline,
  matStarOutline,
  matMoreVertOutline,
  matChevronLeftOutline,
  matChevronRightOutline,
  matCloseOutline,
  matEditOutline,
  matDeleteOutline,
  matCardMembershipOutline,
  matSettingsOutline,
  matPersonOutline,
  matMailOutline,
  matVpnKeyOutline,
  matVisibilityOutline,
  matTravelExploreOutline
} from '@ng-icons/material-icons/outline';

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
      matFilterListOutline,
      matDateRangeOutline,
      matCheckCircleOutline,
      matDensitySmallOutline,
      matDensityMediumOutline,
      matStarOutline,
      matMoreVertOutline,
      matChevronLeftOutline,
      matChevronRightOutline,
      matCloseOutline,
      matEditOutline,
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

  // --- Signals for Data & State ---
  users = signal<User[]>([]);
  allTrips = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  density = signal<'compact' | 'normal'>('compact');

  // --- Filters ---
  limit = signal<number>(20);
  searchQuery = signal<string>('');
  roleFilter = signal<string>('all');
  sortFilter = signal<string>('-createdAt');

  // --- UI Action Modals ---
  selectedUser = signal<User | null>(null);
  showAddModal = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);

  // --- Forms ---
  addForm!: FormGroup;

  // --- Search Input Debouncing ---
  public searchSubject = new Subject<string>();

  // --- Toast Notifications ---
  toast = signal<{ message: string; type: 'success' | 'danger' | 'warning' } | null>(null);

  constructor(
    private usersService: UsersService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadUsers();

    // Set up search debouncing
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchQuery.set(value);
      this.loadUsers();
    });
  }

  private initForms(): void {
    this.addForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
        ]
      ],
    });
  }

  // // --- API Actions ---
  loadUsers(): void {
    this.isLoading.set(true);
    forkJoin({
      usersRes: this.usersService.getUsers({
        search: this.searchQuery(),
        role: this.roleFilter(),
        sort: this.sortFilter(),
        limit: this.limit()
      }),
      tripsRes: this.usersService.getTrips().pipe(
        catchError(err => {
          console.error('Error loading trips for user list:', err);
          return of({ data: { trips: [] } });
        })
      )
    }).subscribe({
      next: ({ usersRes, tripsRes }) => {
        this.users.set(usersRes.data.users || []);
        this.allTrips.set(tripsRes?.data?.trips || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.showToast('Failed to load users from server', 'danger');
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
    this.loadUsers();
  }

  setSortFilter(sort: string): void {
    this.sortFilter.set(sort);
    this.loadUsers();
  }

  setDensity(density: 'compact' | 'normal'): void {
    this.density.set(density);
  }

  // --- Modal Control Functions ---
  openAddModal(): void {
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

  // --- Form Submit Operations ---
  onSubmitAdd(): void {
    if (this.addForm.invalid) return;

    this.isLoading.set(true);
    this.usersService.createUser(this.addForm.value).subscribe({
      next: () => {
        this.showToast('User created successfully', 'success');
        this.closeAllModals();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message ?? 'Failed to create user';
        this.showToast(errorMsg, 'danger');
        this.isLoading.set(false);
      }
    });
  }

  onConfirmDelete(): void {
    if (!this.selectedUser()) return;

    this.isLoading.set(true);
    const userId = this.selectedUser()?._id!;

    this.usersService.deleteUser(userId).subscribe({
      next: () => {
        this.showToast('User deleted successfully', 'success');
        this.closeAllModals();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message ?? 'Failed to delete user';
        this.showToast(errorMsg, 'danger');
        this.isLoading.set(false);
      }
    });
  }

  // --- Export Table Data ---
  onExport(): void {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Name,Email,Role,Subscription"].join(",") + "\n"
      + this.users().map(u => `"${u.name}","${u.email}","${u.role}","${u.subscription || 'free'}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('CSV export downloaded successfully', 'success');
  }

  // --- Notification Toast Helpers ---
  private showToast(message: string, type: 'success' | 'danger' | 'warning'): void {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 4000);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  viewUserDetails(userId: string): void {
    this.router.navigate(['/dashboard/users', userId]);
  }

  getUserTripsCount(userId: string, user: User): number {
    const savedCount = (user as any).savedTrips?.length ?? 0;
    const fetchedCount = this.allTrips().filter(t => t.user === userId || t.user?._id === userId).length;
    return Math.max(savedCount, fetchedCount);
  }
}
