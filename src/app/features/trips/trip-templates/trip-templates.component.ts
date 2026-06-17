import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Trip } from '../../../models/trip.model';
import { TripService } from '../../../core/services/trip.service';

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

  // ── Signals ──────────────────────────────────────────────
  selectedCategory = signal<string>('All');
  searchQuery = signal<string>('');
  
  // Deletion confirmation state
  showDeleteConfirm = signal<boolean>(false);
  templateToDeleteId = signal<string | null>(null);

  // Toast state
  toastMessage = signal<string | null>(null);
  toastIsError = signal<boolean>(false);

  // Reference the templates signal from TripService
  templates = this.tripService.templatesSignal;

  // Derived filter computation (Signals reactive chain, combining search & categories)
  filteredTemplates = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    let list = this.templates();

    // 1. Category Filter
    if (cat !== 'All') {
      list = list.filter((t: Trip) => 
        t.interests && t.interests.some(i => i.toLowerCase() === cat.toLowerCase())
      );
    }

    // 2. Search Query (Case-insensitive matching title, destination, summary, status, interests)
    if (query) {
      list = list.filter((t: Trip) => 
        t.title.toLowerCase().includes(query) || 
        (t.summary && t.summary.toLowerCase().includes(query)) ||
        t.destination.toLowerCase().includes(query) ||
        (t.status && t.status.toLowerCase().includes(query)) ||
        (t.interests && t.interests.some((interest: string) => interest.toLowerCase().includes(query)))
      );
    }

    return list;
  });

  categories = [
    { name: 'All', icon: 'apps', label: 'All Templates' },
    { name: 'Family', icon: 'family_restroom', label: 'Family' },
    { name: 'Luxury', icon: 'diamond', label: 'Luxury' },
    { name: 'Adventure', icon: 'hiking', label: 'Adventure' },
    { name: 'Weekend', icon: 'weekend', label: 'Weekend' }
  ];

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.tripService.getTemplates().subscribe();
  }

  // ── Actions ──────────────────────────────────────────────
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onCategorySelect(category: string): void {
    this.selectedCategory.set(category);
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

  // Helper method to get icon based on interests
  getCategoryIcon(trip: Trip): string {
    if (!trip.interests) return 'apps';
    const hasInterest = (val: string) => trip.interests.some(i => i.toLowerCase() === val.toLowerCase());
    if (hasInterest('Family')) return 'family_restroom';
    if (hasInterest('Luxury')) return 'diamond';
    if (hasInterest('Adventure')) return 'hiking';
    if (hasInterest('Weekend')) return 'weekend';
    return 'apps';
  }

  // Helper to get budget category class
  getCategoryClass(trip: Trip): string {
    if (!trip.interests) return 'category-family';
    const hasInterest = (val: string) => trip.interests.some(i => i.toLowerCase() === val.toLowerCase());
    if (hasInterest('Family')) return 'category-family';
    if (hasInterest('Luxury')) return 'category-luxury';
    if (hasInterest('Adventure')) return 'category-adventure';
    if (hasInterest('Weekend')) return 'category-weekend';
    return 'category-family';
  }

  // Helper to format category name
  getCategoryName(trip: Trip): string {
    if (!trip.interests || trip.interests.length === 0) return 'Family';
    const valid = ['Family', 'Luxury', 'Adventure', 'Weekend'];
    const found = trip.interests.find(i => valid.some(v => v.toLowerCase() === i.toLowerCase()));
    return found ? found.charAt(0).toUpperCase() + found.slice(1).toLowerCase() : 'Family';
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
