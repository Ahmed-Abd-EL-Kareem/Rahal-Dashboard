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
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

  // Pagination states
  currentPage = signal(1);
  pageSize = signal(8);
  totalItems = signal(0);

  private searchSubject = new Subject<string>();

  // Computed properties for pagination UI
  totalPages = computed(() => {
    const total = this.totalItems();
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  pagesArray = computed(() => {
    const pages = this.totalPages();
    return Array.from({ length: pages }, (_, i) => i + 1);
  });

  showingFrom = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  // Computed list of filtered destinations (returned straight from server-side query results)
  filteredDestinations = computed(() => {
    return this.destinations();
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
    // Setup search input debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.fetchData();
    });

    this.fetchData();
  }

  fetchData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    // Fetch destinations from API using page, limit, search, status, and category
    this.destinationsService.getAllDestinations(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery(),
      this.selectedStatus(),
      this.selectedCategory()
    ).subscribe({
      next: (res) => {
        const data = res.data || res.destinations || res;
        if (Array.isArray(data)) {
          this.destinations.set(data);
          this.totalItems.set(res.pagination?.total ?? res.total ?? data.length);
        } else {
          this.destinations.set([]);
          this.totalItems.set(0);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to fetch destinations.');
        this.loading.set(false);
      }
    });

    // Fetch hotels to compute counts per city
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
    this.searchSubject.next(value);
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
    this.currentPage.set(1);
    this.fetchData();
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(value);
    this.currentPage.set(1);
    this.fetchData();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.fetchData();
    }
  }

  onLimitChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(value);
    this.currentPage.set(1);
    this.fetchData();
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

  onEdit(event: Event, slug: string): void {
    event.stopPropagation();
    this.activeDropdownId.set(null);
    this.router.navigate(['/dashboard/destinations/edit', slug]);
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
