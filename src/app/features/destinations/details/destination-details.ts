import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DestinationsService } from '../../../core/services/destinations.service';
import { HotelsService } from '../../../core/services/hotels.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matArrowBackOutline,
  matEditOutline,
  matAddOutline,
  matHotelOutline,
  matLocationOnOutline,
  matCheckOutline,
  matStarOutline,
  matLocalAtmOutline,
  matMapOutline,
  matScheduleOutline,
  matInfoOutline
} from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-destination-details',
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './destination-details.html',
  styleUrl: './destination-details.css',
  viewProviders: [
    provideIcons({
      matArrowBackOutline,
      matEditOutline,
      matAddOutline,
      matHotelOutline,
      matLocationOnOutline,
      matCheckOutline,
      matStarOutline,
      matLocalAtmOutline,
      matMapOutline,
      matScheduleOutline,
      matInfoOutline
    })
  ]
})
export class DestinationDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destinationsService = inject(DestinationsService);
  private hotelsService = inject(HotelsService);

  destination = signal<any>(null);
  hotels = signal<any[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Filtered hotels in the same city
  filteredHotels = signal<any[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchDetails(id);
      }
    });
  }

  fetchDetails(id: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.destinationsService.getDestinationById(id).subscribe({
      next: (res) => {
        const data = res.data || res.destination || res;
        this.destination.set(data);
        if (data && data.city) {
          this.fetchHotels(data.city);
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to fetch destination details.');
        this.loading.set(false);
      }
    });
  }

  fetchHotels(city: string): void {
    this.hotelsService.getAllHotels().subscribe({
      next: (res: any) => {
        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.data)) {
          list = res.data;
        } else if (res && Array.isArray(res.hotels)) {
          list = res.hotels;
        }

        this.hotels.set(list);
        if (city) {
          const matched = list.filter(h => h.city?.toLowerCase() === city.toLowerCase());
          this.filteredHotels.set(matched);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch hotels:', err);
        this.loading.set(false);
      }
    });
  }

  getBestMonthsText(): string {
    const months = this.destination()?.bestMonths;
    if (!months || months.length === 0) return 'Anytime';
    
    // If it's a standard list of months, format nicely (e.g. shorthand like Jan, Feb, Mar...)
    const shortMonths = months.map((m: string) => m.slice(0, 3));
    
    // Check if consecutive/range or just comma-separated
    return shortMonths.join(' - ');
  }
}
