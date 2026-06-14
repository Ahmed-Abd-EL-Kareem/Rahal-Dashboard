import { Component, signal, inject, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DestinationsService } from '../../../core/services/destinations.service';
import { HotelsService } from '../../../core/services/hotels.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matAddOutline,
  matAutoAwesomeOutline,
  matHotelOutline,
  matSearchOutline,
  matMapOutline,
  matMoreVertOutline
} from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-destination-list',
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './destination-list.html',
  styleUrl: './destination-list.css',
  viewProviders: [
    provideIcons({
      matAddOutline,
      matAutoAwesomeOutline,
      matHotelOutline,
      matSearchOutline,
      matMapOutline,
      matMoreVertOutline
    })
  ]
})
export class DestinationListComponent implements OnInit {
  private destinationsService = inject(DestinationsService);
  private hotelsService = inject(HotelsService);
  private router = inject(Router);

  activeDropdownId = signal<string | null>(null);

  destinations = signal<any[]>([]);
  hotels = signal<any[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Search and Filter states
  searchQuery = signal('');
  selectedCategory = signal('all');
  selectedStatus = signal('all');

  // Computed list of filtered destinations
  filteredDestinations = computed(() => {
    let list = this.destinations();
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const status = this.selectedStatus();

    if (query) {
      list = list.filter(
        d =>
          d.name?.en?.toLowerCase().includes(query) ||
          d.name?.ar?.toLowerCase().includes(query) ||
          d.city?.toLowerCase().includes(query)
      );
    }

    if (cat !== 'all') {
      list = list.filter(d => d.category === cat);
    }

    if (status !== 'all') {
      list = list.filter(d => {
        if (status === 'active') return d.isActive === true;
        if (status === 'inactive') return d.isActive === false;
        return true;
      });
    }

    return list;
  });

  categories = [
    { value: 'historical', label: 'Historical' },
    { value: 'beach', label: 'Beach & Resort' },
    { value: 'adventure', label: 'Adventure & Safari' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'religious', label: 'Religious' },
    { value: 'nature', label: 'Nature & Eco' },
    { value: 'landmark', label: 'Landmark' },
    { value: 'other', label: 'Other' }
  ];

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    // Fetch destinations
    this.destinationsService.getAllDestinations().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.destinations.set(data);
        } else if (data && Array.isArray(data.data)) {
          this.destinations.set(data.data);
        } else if (data && Array.isArray(data.destinations)) {
          this.destinations.set(data.destinations);
        } else {
          this.destinations.set([]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to fetch destinations.');
        this.loading.set(false);
      }
    });

    // Fetch hotels
    this.hotelsService.getAllHotels().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.hotels.set(data);
        } else if (data && Array.isArray(data.data)) {
          this.hotels.set(data.data);
        } else if (data && Array.isArray(data.hotels)) {
          this.hotels.set(data.hotels);
        } else {
          this.hotels.set([]);
        }
      },
      error: (err) => {
        console.error('Failed to fetch hotels:', err);
      }
    });
  }

  getHotelsCount(city: string): number {
    if (!city) return 0;
    return this.hotels().filter(h => h.city?.toLowerCase() === city?.toLowerCase()).length;
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(value);
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event): void {
    this.activeDropdownId.set(null);
  }

  toggleDropdown(event: Event, id: string): void {
    event.stopPropagation();
    if (this.activeDropdownId() === id) {
      this.activeDropdownId.set(null);
    } else {
      this.activeDropdownId.set(id);
    }
  }

  onEdit(event: Event, id: string): void {
    event.stopPropagation();
    this.activeDropdownId.set(null);
    this.router.navigate(['/dashboard/destinations/edit', id]);
  }

  onDelete(event: Event, id: string): void {
    event.stopPropagation();
    this.activeDropdownId.set(null);
    if (confirm('Are you sure you want to delete this destination?')) {
      this.destinationsService.deleteDestination(id).subscribe({
        next: () => {
          this.fetchData();
        },
        error: (err) => {
          this.errorMessage.set(err.message || 'Failed to delete destination.');
        }
      });
    }
  }
}
