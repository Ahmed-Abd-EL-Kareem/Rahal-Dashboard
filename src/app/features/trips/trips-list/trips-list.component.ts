import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Trip } from '../../../models/trip.model';
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

  // ── Signals ──────────────────────────────────────────────
  searchQuery = signal<string>('');
  selectedType = signal<'All' | 'AI' | 'Manual'>('All');
  selectedBudgetRange = signal<string>('All');

  // Deletion state
  showDeleteConfirm = signal<boolean>(false);
  tripToDeleteId = signal<string | null>(null);

  // Toast state
  toastMessage = signal<string | null>(null);
  toastIsError = signal<boolean>(false);

  // Trips from backend
  trips = this.tripService.templatesSignal;

  // Derived filter computation (Search and filters combined reactively)
  filteredTrips = computed(() => {
    let list = this.trips();
    const query = this.searchQuery().toLowerCase().trim();
    const type = this.selectedType();
    const budgetRange = this.selectedBudgetRange();

    // 1. Search Query (Case-insensitive matching title/name, destination, status)
    if (query) {
      list = list.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.destination.toLowerCase().includes(query) ||
        t.status.toLowerCase().includes(query)
      );
    }

    // 2. Type Filter (AI vs Manual)
    if (type !== 'All') {
      if (type === 'AI') {
        list = list.filter(t => t.isAIGenerated);
      } else {
        list = list.filter(t => !t.isAIGenerated);
      }
    }

    // 3. Budget Range Filter
    if (budgetRange !== 'All') {
      if (budgetRange === 'under2000') {
        list = list.filter(t => t.estimatedTotalCost < 2000);
      } else if (budgetRange === '2000to5000') {
        list = list.filter(t => t.estimatedTotalCost >= 2000 && t.estimatedTotalCost <= 5000);
      } else if (budgetRange === 'over5000') {
        list = list.filter(t => t.estimatedTotalCost > 5000);
      }
    }

    return list;
  });

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
    this.refreshData();
  }

  refreshData(): void {
    this.tripService.getTemplates().subscribe();
  }

  // ── Search & Filters ──────────────────────────────────────
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onTypeSelect(type: 'All' | 'AI' | 'Manual'): void {
    this.selectedType.set(type);
  }

  onBudgetRangeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedBudgetRange.set(target.value);
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

  showToast(message: string, isError = false): void {
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }

  exportCsv(): void {
    const headers = 'Title,Destination,Budget,Duration,Status,Estimated Cost\n';
    const rows = this.filteredTrips().map(t => 
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
//   updateStatus(id: string, event: Event) {
//   const status = (event.target as HTMLSelectElement).value;

//   this.tripService.updateTripDetails(id, { status }).subscribe({
//     next: () => {
//       this.showToast('Status updated');
//       this.refreshData();
//     },
//     error: () => {
//       this.showToast('Failed to update status', true);
//     }
//   });
// }
}
