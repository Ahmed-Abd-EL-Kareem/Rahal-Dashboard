import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Trip, DayItinerary } from '../../../models/trip.model';
import { TripService } from '../../../core/services/trip.service';

interface UITimelineEvent {
  id: string;
  type: 'flight' | 'transfer' | 'hotel' | 'activity' | 'dining';
  time: string;
  title: string;
  subtitle: string;
  icon: string;
  rating?: number;
}

interface UITimelineDay {
  dayNumber: number;
  title: string;
  date: string;
  events: UITimelineEvent[];
}

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.scss'
})
export class TripDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tripService = inject(TripService);
  private fb = inject(FormBuilder);

  // ── Signals ──────────────────────────────────────────────
  isDetailedView = signal<boolean>(true);
  isEditingNotes = signal<boolean>(false);
  notesBackup = signal<string>('');

  // Loaded Trip States
  tripId = signal<string>('');
  trip = signal<Trip | null>(null);
  itinerary = signal<UITimelineDay[]>([]);

  // Toast state
  toastMessage = signal<string | null>(null);
  toastIsError = signal<boolean>(false);

  // Add Event Modal (Timeline additions still handled inline)
  showAddEventModal = signal<boolean>(false);
  targetDayForNewEvent = signal<number>(1);
  eventForm: FormGroup;

  // AI suggestion stored separately
  aiSuggestion = signal<UITimelineEvent>({
    id: 'ai-sug-1',
    type: 'dining',
    time: '12:30 PM - 14:00 PM',
    title: '9 Pyramids Lounge',
    subtitle: 'Suggested based on proximity and group size. Reservation recommended.',
    icon: 'restaurant'
  });
  aiSuggestionAdded = signal<boolean>(false);

  // Computed Donut Chart conic-gradient string
  chartGradient = computed(() => {
    const currentTrip = this.trip();
    if (!currentTrip || !currentTrip.estimatedTotalCost) {
      return 'conic-gradient(#0F766E 0% 100%)';
    }
    
    const total = currentTrip.estimatedTotalCost;
    const breakdown = [
      { label: 'Accommodation', amount: total * 0.5, color: '#0F766E' },
      { label: 'Activities & Tours', amount: total * 0.3, color: '#F59E0B' },
      { label: 'Transportation', amount: total * 0.2, color: '#3B82F6' }
    ];
    
    let accumulatedPercent = 0;
    const gradientStops = breakdown.map(item => {
      const percentage = (item.amount / total) * 100;
      const start = accumulatedPercent;
      accumulatedPercent += percentage;
      return `${item.color} ${start.toFixed(1)}% ${accumulatedPercent.toFixed(1)}%`;
    });
    
    return `conic-gradient(${gradientStops.join(', ')})`;
  });

  // Dynamic breakdown helper for display
  getDynamicBreakdown() {
    const total = this.trip()?.estimatedTotalCost || 0;
    return [
      { label: 'Accommodation', amount: total * 0.5, color: '#0F766E' },
      { label: 'Activities & Tours', amount: total * 0.3, color: '#F59E0B' },
      { label: 'Transportation', amount: total * 0.2, color: '#3B82F6' }
    ];
  }

  // ── Computed Lists of Hotels, Activities & Dates ──────────
  hotels = computed(() => {
    const t = this.trip();
    if (!t) return [];
    const hotelSet = new Set<string>();
    
    // Scan accommodations
    if (t.days) {
      t.days.forEach(day => {
        if (day.accommodation) {
          hotelSet.add(day.accommodation);
        }
      });
    }
    
    // Scan timeline events for hotel type
    this.itinerary().forEach(day => {
      day.events.forEach(ev => {
        if (ev.type === 'hotel' && ev.title) {
          hotelSet.add(ev.title);
        }
      });
    });
    
    return Array.from(hotelSet).filter(h => h.trim().length > 0);
  });

  activitiesList = computed(() => {
    const t = this.trip();
    if (!t) return [];
    const actList: string[] = [];
    
    if (t.days) {
      t.days.forEach(day => {
        if (day.activities) {
          day.activities.forEach(act => {
            // Remove time prefix if present (e.g. "09:00 AM - Activity Name")
            const cleaned = act.replace(/^(\d{1,2}:\d{2}\s*(?:AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?::|–|-)\s*/i, '').trim();
            if (cleaned && !actList.includes(cleaned)) {
              actList.push(cleaned);
            }
          });
        }
      });
    }
    
    // Scan timeline events
    this.itinerary().forEach(day => {
      day.events.forEach(ev => {
        if (ev.type === 'activity' && ev.title && !actList.includes(ev.title)) {
          actList.push(ev.title);
        }
      });
    });
    
    return actList;
  });

  formattedStartDate = computed(() => {
    const t = this.trip();
    if (!t) return '';
    if (t.startDate) return t.startDate;
    const baseDate = t.createdAt ? new Date(t.createdAt) : new Date('2026-06-15T00:00:00Z');
    return baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  formattedEndDate = computed(() => {
    const t = this.trip();
    if (!t) return '';
    if (t.endDate) return t.endDate;
    const baseDate = t.createdAt ? new Date(t.createdAt) : new Date('2026-06-15T00:00:00Z');
    const duration = t.duration || 5;
    const endDate = new Date(baseDate.getTime() + duration * 24 * 60 * 60 * 1000);
    return endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  constructor() {
    this.eventForm = this.fb.group({
      type: ['activity', [Validators.required]],
      time: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(50)]],
      subtitle: ['', [Validators.required, Validators.maxLength(150)]],
      rating: [null]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('tripId');
      if (id) {
        this.tripId.set(id);
        this.loadTripData(id);
      } else {
        this.router.navigate(['/dashboard/trips']);
      }
    });
  }

  private loadTripData(id: string): void {
    this.tripService.getTripDetails(id).subscribe(details => {
      this.trip.set(details);
      if (details.summary) {
        this.notesBackup.set(details.summary);
      }
      this.itinerary.set(this.mapDaysToUITimeline(details.days || [], details.duration));
    });
  }

  // ── Mappings between Backend and UI ───────────────────────
  private mapDaysToUITimeline(days: DayItinerary[], duration: number): UITimelineDay[] {
    const list: UITimelineDay[] = [];
    const count = Math.max(days.length, duration);
    
    for (let i = 1; i <= count; i++) {
      const dayData = days.find(d => d.day === i);
      const uiDay: UITimelineDay = {
        dayNumber: i,
        title: dayData?.title || 'Sightseeing & Exploration',
        date: `Day ${i}`,
        events: []
      };

      if (dayData) {
        let eventCounter = 1;

        if (dayData.accommodation) {
          uiDay.events.push({
            id: `${i}-hotel-${eventCounter++}`,
            type: 'hotel',
            time: 'Check-in: 15:00 PM',
            title: dayData.accommodation,
            subtitle: 'Overnight stay booked',
            icon: 'hotel',
            rating: 5
          });
        }

        if (dayData.activities) {
          dayData.activities.forEach(act => {
            let type: any = 'activity';
            let icon = 'tour';
            let time = '09:00 AM - 12:00 PM';
            let title = act;

            const timeRegex = /^(\d{1,2}:\d{2}\s*(?:AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?::|–|-)\s*(.*)$/i;
            const match = act.match(timeRegex);
            if (match) {
              time = match[1];
              title = match[2];
            }

            const lower = act.toLowerCase();
            if (lower.includes('flight') || lower.includes('airport')) {
              type = 'flight';
              icon = 'flight_land';
            } else if (lower.includes('transfer') || lower.includes('bus') || lower.includes('drive') || lower.includes('train')) {
              type = 'transfer';
              icon = 'directions_bus';
            }

            uiDay.events.push({
              id: `${i}-act-${eventCounter++}`,
              type,
              time,
              title,
              subtitle: 'Scheduled itinerary item',
              icon
            });
          });
        }

        if (dayData.meals) {
          dayData.meals.forEach(meal => {
            uiDay.events.push({
              id: `${i}-meal-${eventCounter++}`,
              type: 'dining',
              time: '13:00 PM - 14:30 PM',
              title: meal,
              subtitle: 'Culinary experience',
              icon: 'restaurant'
            });
          });
        }
      }

      list.push(uiDay);
    }
    return list;
  }

  private mapUITimelineToDays(uiDays: UITimelineDay[]): DayItinerary[] {
    return uiDays.map(ud => {
      const activities: string[] = [];
      const meals: string[] = [];
      let accommodation: string | null = null;

      ud.events.forEach(e => {
        if (e.type === 'hotel') {
          accommodation = e.title;
        } else if (e.type === 'dining') {
          meals.push(e.title);
        } else {
          activities.push(`${e.time} - ${e.title}`);
        }
      });

      return {
        day: ud.dayNumber,
        title: ud.title,
        activities,
        meals,
        accommodation,
        tips: null,
        estimatedCost: 0
      };
    });
  }

  // ── Notes Operations (maps to PATCH summary) ──────────────
  editNotes(): void {
    const currentTrip = this.trip();
    if (currentTrip) {
      this.notesBackup.set(currentTrip.summary || '');
      this.isEditingNotes.set(true);
    }
  }

  saveNotes(): void {
    const updatedNotes = this.notesBackup();
    const currentTrip = this.trip();
    if (currentTrip) {
      this.tripService.updateTripDetails(this.tripId(), { summary: updatedNotes }).subscribe({
        next: (updated) => {
          this.trip.set(updated);
          this.isEditingNotes.set(false);
          this.showToast('Notes saved successfully');
        },
        error: (err) => {
          console.error(err);
          this.showToast('Failed to save notes', true);
        }
      });
    }
  }

  cancelNotesEdit(): void {
    this.isEditingNotes.set(false);
  }

  // ── AI Suggestion Operation (saved to days via PATCH) ─────
  addAiSuggestion(): void {
    if (this.aiSuggestionAdded()) return;

    this.itinerary.update(current => {
      const updated = current.map(day => {
        if (day.dayNumber === 2) {
          const addedEvent: UITimelineEvent = {
            ...this.aiSuggestion(),
            id: `2-ai-suggestion-${Date.now()}`
          };
          return {
            ...day,
            events: [...day.events, addedEvent]
          };
        }
        return day;
      });
      
      const backendDays = this.mapUITimelineToDays(updated);
      this.tripService.updateTripDetails(this.tripId(), { days: backendDays }).subscribe({
        next: () => this.showToast('AI Suggestion added to itinerary'),
        error: () => this.showToast('Failed to save suggestion', true)
      });
      return updated;
    });

    this.aiSuggestionAdded.set(true);
  }

  // ── Event Operations (saved to days via PATCH) ────────────
  openAddEventModal(dayNumber: number): void {
    this.targetDayForNewEvent.set(dayNumber);
    this.eventForm.reset({
      type: 'activity',
      time: '',
      title: '',
      subtitle: '',
      rating: null
    });
    this.showAddEventModal.set(true);
  }

  closeAddEventModal(): void {
    this.showAddEventModal.set(false);
  }

  submitNewEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const val = this.eventForm.value;
    let icon = 'tour';
    if (val.type === 'flight') icon = 'flight_land';
    else if (val.type === 'transfer') icon = 'directions_bus';
    else if (val.type === 'hotel') icon = 'hotel';
    else if (val.type === 'dining') icon = 'restaurant';

    const newEvent: UITimelineEvent = {
      id: Date.now().toString(),
      type: val.type,
      time: val.time,
      title: val.title,
      subtitle: val.subtitle,
      icon,
      rating: val.type === 'hotel' ? Number(val.rating || 5) : undefined
    };

    const targetDay = this.targetDayForNewEvent();
    this.itinerary.update(current => {
      const updated = current.map(day => {
        if (day.dayNumber === targetDay) {
          return {
            ...day,
            events: [...day.events, newEvent]
          };
        }
        return day;
      });

      const backendDays = this.mapUITimelineToDays(updated);
      this.tripService.updateTripDetails(this.tripId(), { days: backendDays }).subscribe({
        next: () => this.showToast('Event added to itinerary'),
        error: () => this.showToast('Failed to save event', true)
      });
      return updated;
    });

    this.closeAddEventModal();
  }

  deleteEvent(dayNumber: number, eventId: string): void {
    this.itinerary.update(current => {
      const updated = current.map(day => {
        if (day.dayNumber === dayNumber) {
          return {
            ...day,
            events: day.events.filter(e => e.id !== eventId)
          };
        }
        return day;
      });

      const backendDays = this.mapUITimelineToDays(updated);
      this.tripService.updateTripDetails(this.tripId(), { days: backendDays }).subscribe({
        next: () => this.showToast('Event removed from itinerary'),
        error: () => this.showToast('Failed to remove event', true)
      });
      return updated;
    });
  }

  addDay(): void {
    this.itinerary.update(current => {
      const newDayNumber = current.length + 1;
      const newDay: UITimelineDay = {
        dayNumber: newDayNumber,
        title: 'New Day Itinerary',
        date: `Day ${newDayNumber}`,
        events: []
      };
      const updated = [...current, newDay];

      const backendDays = this.mapUITimelineToDays(updated);
      this.tripService.updateTripDetails(this.tripId(), { days: backendDays }).subscribe({
        next: () => this.showToast('Itinerary day added'),
        error: () => this.showToast('Failed to save changes', true)
      });
      return updated;
    });
  }

  // ── Sharing, Edit & Back Actions ───────────────────────────
  shareItinerary(): void {
    const shareUrl = `${window.location.origin}/dashboard/trips/${this.tripId()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      this.showToast('Itinerary link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      this.showToast('Failed to copy link. Please try again.', true);
    });
  }

  navigateToEdit(): void {
    this.router.navigate(['/dashboard/trips/edit', this.tripId()]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/trips']);
  }

  showToast(message: string, isError = false): void {
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
