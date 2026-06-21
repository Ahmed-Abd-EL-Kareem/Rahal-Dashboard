import { Component, signal, computed, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Trip, TripQueryParams } from '../../../models/trip.model';
import { TripService } from '../../../core/services/trip.service';

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trips-list.component.html',
  styleUrl: './trips-list.component.scss'
})
export class TripsListComponent implements OnInit {
  private router = inject(Router);
  private tripService = inject(TripService);
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  // ── Signals ──────────────────────────────────────────────
  searchQuery = signal<string>('');
  selectedType = signal<'All' | 'AI' | 'Manual'>('All');
  selectedBudgetRange = signal<string>('All');

  // Pagination
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(1);
  isLoading = signal(false);

  // Deletion state
  showDeleteConfirm = signal<boolean>(false);
  tripToDeleteId = signal<string | null>(null);

  // Toast state
  toastMessage = signal<string | null>(null);
  toastIsError = signal<boolean>(false);

  // Trips from backend (current page)
  trips = this.tripService.templatesSignal;

  readonly statusOptions: Trip['status'][] = ['draft', 'saved', 'archived'];

  showingFrom = computed(() => {
    if (this.total() === 0) return 0;
    return (this.page() - 1) * this.limit() + 1;
  });

  showingTo = computed(() =>
    Math.min(this.page() * this.limit(), this.total())
  );

  canGoPrev = computed(() => this.page() > 1);
  canGoNext = computed(() => this.page() < this.totalPages());

  getUserInitials(trip: Trip): string {
    const name = trip.user && typeof trip.user === 'object' && trip.user.name
      ? trip.user.name
      : 'Client';
    return name.slice(0, 2).toUpperCase();
  }

  getUserName(trip: Trip): string {
    return trip.user && typeof trip.user === 'object' && trip.user.name
      ? trip.user.name
      : 'Client';
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.page.set(1);
        this.loadTrips();
      });

    this.loadTrips();
  }

  loadTrips(): void {
    this.isLoading.set(true);

    const params: TripQueryParams = {
      page: this.page(),
      limit: this.limit(),
    };

    const search = this.searchQuery().trim();
    if (search) params.search = search;

    const type = this.selectedType();
    if (type === 'AI') params.isAIGenerated = true;
    else if (type === 'Manual') params.isAIGenerated = false;

    const budgetRange = this.selectedBudgetRange();
    if (budgetRange !== 'All') params.budgetRange = budgetRange;

    this.tripService.getTemplates(params).subscribe({
      next: (res) => {
        this.total.set(res.pagination.total);
        this.totalPages.set(res.pagination.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  refreshData(): void {
    this.loadTrips();
  }

  // ── Search & Filters ──────────────────────────────────────
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.searchSubject.next(target.value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.page.set(1);
    this.loadTrips();
  }

  onTypeSelect(type: 'All' | 'AI' | 'Manual'): void {
    this.selectedType.set(type);
    this.page.set(1);
    this.loadTrips();
  }

  onBudgetRangeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedBudgetRange.set(target.value);
    this.page.set(1);
    this.loadTrips();
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedType.set('All');
    this.selectedBudgetRange.set('All');
    this.page.set(1);
    this.loadTrips();
  }

  prevPage(): void {
    if (this.canGoPrev()) {
      this.page.update(p => p - 1);
      this.loadTrips();
    }
  }

  nextPage(): void {
    if (this.canGoNext()) {
      this.page.update(p => p + 1);
      this.loadTrips();
    }
  }

  // ── Navigation ──────────────────────────────────────────
  navigateToDetails(id: string): void {
    this.router.navigate(['/dashboard/trips', id]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/dashboard/trips/create']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/dashboard/trips/edit', id]);
  }

  // ── Actions ──────────────────────────────────────────────
  triggerDelete(id: string): void {
    this.tripToDeleteId.set(id);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
    this.tripToDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.tripToDeleteId();
    if (id) {
      this.tripService.deleteTemplate(id).subscribe({
        next: () => {
          this.showToast('Trip deleted successfully');
          this.closeDeleteConfirm();
          this.refreshData();
        },
        error: (err) => {
          console.error('Error deleting trip', err);
          this.showToast('Failed to delete trip', true);
          this.closeDeleteConfirm();
        }
      });
    }
  }

  updateStatus(id: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as Trip['status'];
    const current = this.trips().find(t => t._id === id);
    if (!current || current.status === status) return;

    this.tripService.updateTripDetails(id, { status }).subscribe({
      next: () => {
        this.showToast('Status updated successfully');
      },
      error: () => {
        select.value = current.status;
        this.showToast('Failed to update status', true);
      },
    });
  }

  showToast(message: string, isError = false): void {
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }

  exportCsv(): void {
    const headers = 'Title,Destination,Budget,Duration,Status,Estimated Cost\n';
    const rows = this.trips().map(t =>
      `"${t.title}","${t.destination}","${t.budget}",${t.duration} Days,"${t.status}",$${t.estimatedTotalCost}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'rahal_trips_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
