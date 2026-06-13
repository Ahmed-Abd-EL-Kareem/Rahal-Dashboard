import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
// import {
//   matSearchOutline, matFilterListOutline, matAddOutline,
//   matFileDownloadOutline, matLocationOnOutline, matStarOutline,
//   matStar, matChevronLeftOutline, matChevronRightOutline,
//   matDeleteOutline, matEditOutline, matVisibilityOutline,
// } from '@ng-icons/material-icons';
import {
  matStarOutline,
  matSearchOutline,
  matFilterListOutline,
  matAddOutline,
  matFileDownloadOutline,
  matLocationOnOutline,
  matChevronLeftOutline,
  matChevronRightOutline,
  matDeleteOutline,
  matEditOutline,
  matVisibilityOutline,
} from '@ng-icons/material-icons/outline';

import { HotelsService } from '../shared/hotels'
import { Hotel, HotelFilters } from '../shared/hotel.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hotels-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  viewProviders: [
    provideIcons({
      matSearchOutline, matFilterListOutline, matAddOutline,
      matFileDownloadOutline, matLocationOnOutline, matStarOutline,
       matChevronLeftOutline, matChevronRightOutline,
      matDeleteOutline, matEditOutline, matVisibilityOutline,
    }),
  ],
  templateUrl: './hotels-list.component.html',
})
export class HotelsListComponent implements OnInit {
  private hotelsService = inject(HotelsService);
  private router = inject(Router);

  hotels   = signal<Hotel[]>([]);
  loading  = signal(false);
  total    = signal(0);

  // ── Dynamic from API ──────────────────────────────────────────────
  cities           = signal<string[]>([]);
  availableStars   = signal<number[]>([]);
  loadingFilters   = signal(false);

  filters: HotelFilters = { page: 1, limit: 10, sort: '-createdAt' };
  searchQuery  = '';
  cityFilter   = '';
  starsFilter  = '';
  priceFilter  = '';
  statusFilter = '';

  totalPages = computed(() => Math.ceil(this.total() / (this.filters.limit ?? 10)));
  pages      = computed(() => Array.from({ length: Math.min(this.totalPages(), 5) }, (_, i) => i + 1));

  readonly Math = Math;

  ngOnInit() {
    // جيب الـ hotels + filter options بالتوازي
    this.loadingFilters.set(true);
    forkJoin({
      cities: this.hotelsService.getCities(),
      stars:  this.hotelsService.getAvailableStars(),
    }).subscribe({
      next: ({ cities, stars }) => {
        this.cities.set(cities);
        this.availableStars.set(stars);
        this.loadingFilters.set(false);
      },
      error: () => this.loadingFilters.set(false),
    });

    this.loadHotels();
  }

  loadHotels() {
    this.loading.set(true);
    const f: HotelFilters = { ...this.filters };
    if (this.cityFilter)  f.city   = this.cityFilter;
    if (this.starsFilter) f.stars  = +this.starsFilter;
    if (this.searchQuery) f.search = this.searchQuery;
    if (this.priceFilter === 'low')  { f.minPrice = 0;     f.maxPrice = 3000; }
    if (this.priceFilter === 'mid')  { f.minPrice = 3000;  f.maxPrice = 10000; }
    if (this.priceFilter === 'high') { f.minPrice = 10000; }

    this.hotelsService.getHotels(f).subscribe({
      next: res => {
        this.hotels.set(res.data);
        this.total.set(res.pagination?.total ?? res.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilters() { this.filters.page = 1; this.loadHotels(); }

  clearFilters() {
    this.cityFilter = ''; this.starsFilter = '';
    this.priceFilter = ''; this.statusFilter = '';
    this.searchQuery = '';
    this.applyFilters();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.filters.page = p;
    this.loadHotels();
  }

  viewHotel(id: string)  { this.router.navigate(['/dashboard/hotels', id]); }
  editHotel(id: string)  { this.router.navigate(['/dashboard/hotels', id, 'edit']); }
  createHotel()          { this.router.navigate(['/dashboard/hotels/create']); }

  exportHotels() {
    const data = this.hotels();
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    const headers = ['Hotel ID', 'Hotel Name', 'City', 'Rating', 'Avg Price Per Night', 'Currency', 'Availability', 'Status'];
    const rows = data.map(hotel => [
      this.getShortId(hotel._id),
      hotel.name.en,
      hotel.city,
      hotel.stars.toFixed(1),
      hotel.averagePricePerNight,
      hotel.currency,
      this.availabilityLabel(hotel),
      hotel.isActive ? 'Active' : 'Inactive'
    ]);
    const csvContent = "\ufeff" + [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hotels_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  deleteHotel(id: string, event: Event) {
    event.stopPropagation();
    if (!confirm('Delete this hotel?')) return;
    this.hotelsService.deleteHotel(id).subscribe(() => this.loadHotels());
  }

  starsArray(n: number)  { return Array(n).fill(0); }
  emptyStars(n: number)  { return Array(5 - n).fill(0); }

  getShortId(mongoId: string): string {
    if (!mongoId) return 'HTL-00000';
    return `HTL-${mongoId.substring(mongoId.length - 5).toUpperCase()}`;
  }

  availabilityLabel(hotel: Hotel): string {
    if (!hotel.isActive) return 'N/A';
    
    const price = hotel.averagePricePerNight;
    if (hotel.currency === 'USD') {
      if (price >= 250) return 'High';
      if (price >= 150) return 'Medium';
      if (price >= 80) return 'Low';
      return 'N/A';
    } else {
      // EGP or others
      if (price >= 12500) return 'High';
      if (price >= 7500) return 'Medium';
      if (price >= 4000) return 'Low';
      return 'N/A';
    }
  }

  formatPrice(hotel: Hotel): string {
    const symbol = hotel.currency === 'USD' ? '$' : 'EGP ';
    return `${symbol}${hotel.averagePricePerNight.toLocaleString()}`;
  }
}
