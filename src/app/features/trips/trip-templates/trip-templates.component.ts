import { Component, signal, computed, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Trip, TripQueryParams } from '../../../models/trip.model';
import { TripService } from '../../../core/services/trip.service';
import {
  interestMatchesCategory,
  normalizeInterest,
  TRIP_PREDEFINED_CATEGORIES,
} from '../../../core/utils/trip-interests.util';

@Component({
  selector: 'app-trip-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-templates.component.html',
  styleUrl: './trip-templates.component.scss'
})
export class TripTemplatesComponent implements OnInit {
  private router = inject(Router);
  private tripService = inject(TripService);
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  // ── Signals ──────────────────────────────────────────────
  selectedCategory = signal<string>('All');
  searchQuery = signal<string>('');

  // Pagination
  page = signal(1);
  limit = signal(12);
  total = signal(0);
  totalPages = signal(1);
  isLoading = signal(false);

  // Deletion confirmation state
  showDeleteConfirm = signal<boolean>(false);
  templateToDeleteId = signal<string | null>(null);

  // Toast state
  toastMessage = signal<string | null>(null);
  toastIsError = signal<boolean>(false);

  templates = this.tripService.templatesSignal;

  showingFrom = computed(() => {
    if (this.total() === 0) return 0;
    return (this.page() - 1) * this.limit() + 1;
  });

  showingTo = computed(() =>
    Math.min(this.page() * this.limit(), this.total())
  );

  canGoPrev = computed(() => this.page() > 1);
  canGoNext = computed(() => this.page() < this.totalPages());

  categories = [
    { name: 'All', icon: 'apps', label: 'All Templates' },
    { name: 'Family', icon: 'family_restroom', label: 'Family' },
    { name: 'Luxury', icon: 'diamond', label: 'Luxury' },
    { name: 'Adventure', icon: 'hiking', label: 'Adventure' },
    { name: 'Weekend', icon: 'weekend', label: 'Weekend' }
  ];

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.page.set(1);
        this.loadTemplates();
      });

    this.loadTemplates();
  }

  loadTemplates(): void {
    this.isLoading.set(true);

    const params: TripQueryParams = {
      page: this.page(),
      limit: this.limit(),
    };

    const search = this.searchQuery().trim();
    if (search) params.search = search;

    const category = this.selectedCategory();
    if (category !== 'All') params.category = category;

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
    this.loadTemplates();
  }

  // ── Actions ──────────────────────────────────────────────
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.searchSubject.next(target.value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.page.set(1);
    this.loadTemplates();
  }

  onCategorySelect(category: string): void {
    this.selectedCategory.set(category);
    this.page.set(1);
    this.loadTemplates();
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('All');
    this.page.set(1);
    this.loadTemplates();
  }

  prevPage(): void {
    if (this.canGoPrev()) {
      this.page.update(p => p - 1);
      this.loadTemplates();
    }
  }

  nextPage(): void {
    if (this.canGoNext()) {
      this.page.update(p => p + 1);
      this.loadTemplates();
    }
  }

  navigateToDetails(id: string): void {
    this.router.navigate(['/dashboard/trips', id]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/dashboard/trip-templates/create']);
  }

  navigateToEdit(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/dashboard/trip-templates/edit', id]);
  }

  getCategoryIcon(trip: Trip): string {
    if (!trip.interests?.length) return 'apps';
    const hasInterest = (val: string) =>
      trip.interests.some((interest) => interestMatchesCategory(interest, val));
    if (hasInterest('Family')) return 'family_restroom';
    if (hasInterest('Luxury')) return 'diamond';
    if (hasInterest('Adventure')) return 'hiking';
    if (hasInterest('Weekend')) return 'weekend';
    return 'apps';
  }

  getCategoryClass(trip: Trip): string {
    if (!trip.interests?.length) return 'category-family';
    const hasInterest = (val: string) =>
      trip.interests.some((interest) => interestMatchesCategory(interest, val));
    if (hasInterest('Family')) return 'category-family';
    if (hasInterest('Luxury')) return 'category-luxury';
    if (hasInterest('Adventure')) return 'category-adventure';
    if (hasInterest('Weekend')) return 'category-weekend';
    return 'category-family';
  }

  getCategoryName(trip: Trip): string {
    if (!trip.interests?.length) return 'Family';
    const found = trip.interests
      .map((interest) => normalizeInterest(interest))
      .find((interest) =>
        TRIP_PREDEFINED_CATEGORIES.some(
          (category) => category.toLowerCase() === interest?.toLowerCase()
        )
      );
    return found ?? 'Family';
  }

  triggerDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.templateToDeleteId.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const id = this.templateToDeleteId();
    if (id) {
      this.tripService.deleteTemplate(id).subscribe({
        next: () => {
          this.showToast('Template deleted successfully');
          this.closeDeleteConfirm();
          this.refreshData();
        },
        error: (err) => {
          console.error('Error deleting template', err);
          this.showToast('Failed to delete template', true);
          this.closeDeleteConfirm();
        }
      });
    }
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
    this.templateToDeleteId.set(null);
  }

  showToast(message: string, isError = false): void {
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
