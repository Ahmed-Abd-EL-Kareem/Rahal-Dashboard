import { Component, signal, inject, computed, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DestinationsService } from '../../../core/services/destinations.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowBackOutline, matArrowForwardOutline, matCheckOutline, matDeleteOutline, matAddOutline, matAutoAwesomeOutline, matLocationOnOutline, matCloudUploadOutline, matInfoOutline } from '@ng-icons/material-icons/outline';

import { effect } from '@angular/core';

import * as L from 'leaflet';

// Configure default Leaflet marker icons using assets paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/assets/marker-icon-2x.png',
  iconUrl: '/assets/marker-icon.png',
  shadowUrl: '/assets/marker-shadow.png'
});

@Component({
  selector: 'app-destination-create',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgIconComponent],
  templateUrl: './destination-create.html',
  styleUrl: './destination-create.css',
  viewProviders: [
    provideIcons({
      matArrowBackOutline,
      matArrowForwardOutline,
      matCheckOutline,
      matDeleteOutline,
      matAddOutline,
      matAutoAwesomeOutline,
      matLocationOnOutline,
      matCloudUploadOutline,
      matInfoOutline
    })
  ]
})
export class DestinationCreateComponent {
  private fb = inject(FormBuilder);
  private destinationsService = inject(DestinationsService);
  private cloudinaryService = inject(CloudinaryService);
  private router = inject(Router);
  private http = inject(HttpClient);

  @ViewChild('map', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;
  private map!: L.Map;
  private marker!: L.Marker;
  currentStep = signal(1);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // ── Available Options ────────────────────────────────────
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

  regions = [
    'Upper Egypt',
    'Lower Egypt',
    'Sinai',
    'Red Sea',
    'Western Desert',
    'Delta',
    'Mediterranean'
  ];

  monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ── Dynamic Presets for Location Picker Mockup ─────────────
  locationPresets = [
    { name: 'Pyramids of Giza', lat: 29.9792, lng: 31.1342, city: 'Giza', region: 'Lower Egypt' },
    { name: 'Karnak Temple (Luxor)', lat: 25.7188, lng: 32.6573, city: 'Luxor', region: 'Upper Egypt' },
    { name: 'Sharm El Sheikh', lat: 27.9158, lng: 34.3299, city: 'Sharm El Sheikh', region: 'Sinai' },
    { name: 'Aswan High Dam', lat: 23.9700, lng: 32.8800, city: 'Aswan', region: 'Upper Egypt' },
    { name: 'Siwa Oasis', lat: 29.2032, lng: 25.5189, city: 'Siwa', region: 'Western Desert' }
  ];

  // ── Reactive Form Configuration ──────────────────────────
  destinationForm = this.fb.group({
    // Step 1: Basic Info
    nameEn: ['', Validators.required],
    nameAr: ['', Validators.required],
    category: ['', Validators.required],
    isActive: [true],
    taglineEn: ['', Validators.maxLength(60)],
    taglineAr: ['', Validators.maxLength(60)],

    // Step 2: Location
    city: ['', Validators.required],
    region: ['', Validators.required],
    latitude: [29.9792, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [31.1342, [Validators.required, Validators.min(-180), Validators.max(180)]],

    // Step 3: Content
    descriptionEn: ['', Validators.required],
    descriptionAr: ['', Validators.required],
    averageBudgetPerDay: [1200, [Validators.required, Validators.min(0)]],
    currency: ['EGP', Validators.required],
    bestMonths: this.fb.array<string>([]),
    attractions: this.fb.array([]),

    // Step 4: Media
    coverImage: ['']
  });

  // Step 4: Media URLs managed separately via arrays
  galleryUrls = signal<string[]>([]);
  galleryUploading = signal(false);

  // ── City Search (Nominatim) ───────────────────────────────
  citySearchResults = signal<any[]>([]);
  citySearchLoading = signal(false);
  citySearchOpen = signal(false);
  private cityDebounceTimer: any = null;

  onCityInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim();
    clearTimeout(this.cityDebounceTimer);
    this.citySearchResults.set([]);
    this.citySearchOpen.set(false);
    if (query.length < 2) return;
    this.citySearchLoading.set(true);
    this.cityDebounceTimer = setTimeout(() => {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&countrycodes=eg`;
      this.http.get<any[]>(url, { headers: { 'Accept-Language': 'en' } }).subscribe({
        next: (results) => {
          const priority = ['city', 'town', 'village', 'suburb', 'quarter'];
          const demote = ['administrative', 'boundary'];
          const rank = (r: any): number => {
            const t = r.addresstype || r.type || '';
            if (priority.includes(t)) return 0;
            if (demote.includes(t)) return 2;
            return 1;
          };
          const sortedResults = [...results].sort((a, b) => rank(a) - rank(b));
          this.citySearchResults.set(sortedResults);
          this.citySearchOpen.set(sortedResults.length > 0);
          this.citySearchLoading.set(false);
        },
        error: () => this.citySearchLoading.set(false)
      });
    }, 400);
  }

  selectCityResult(result: any): void {
    const cityName: string =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.address?.county ||
      result.name ||
      '';
    this.destinationForm.patchValue({
      city: cityName,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    });
    this.citySearchResults.set([]);
    this.citySearchOpen.set(false);
  }

  closeCityDropdown(): void {
    setTimeout(() => this.citySearchOpen.set(false), 200);
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.loading.set(true);
      this.errorMessage.set(null);
      this.cloudinaryService.uploadImage(file).subscribe({
        next: (url) => {
          this.loading.set(false);
          this.destinationForm.patchValue({ coverImage: url });
          this.successMessage.set('Cover image uploaded successfully!');
          setTimeout(() => this.successMessage.set(null), 2500);
        },
        error: (err: Error) => {
          this.loading.set(false);
          this.errorMessage.set('Failed to upload image: ' + err.message);
        }
      });
    }
  }

  onGalleryFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const files = Array.from(target.files);
    this.galleryUploading.set(true);
    this.errorMessage.set(null);

    let completed = 0;
    const total = files.length;

    files.forEach(file => {
      this.cloudinaryService.uploadImage(file).subscribe({
        next: (url) => {
          this.galleryUrls.update(prev => [...prev, url]);
          completed++;
          if (completed === total) {
            this.galleryUploading.set(false);
            this.successMessage.set(`${total} image(s) added to gallery!`);
            setTimeout(() => this.successMessage.set(null), 2500);
          }
        },
        error: (err: Error) => {
          completed++;
          if (completed === total) this.galleryUploading.set(false);
          this.errorMessage.set('Gallery upload failed: ' + err.message);
        }
      });
    });

    // Reset input so same file can be re-selected if needed
    target.value = '';
  }

  removeGalleryImage(index: number) {
    this.galleryUrls.update(prev => prev.filter((_, i) => i !== index));
  }

  // ── Form Array Getters ────────────────────────────────────
  get attractions(): FormArray {
    return this.destinationForm.get('attractions') as FormArray;
  }

  get bestMonthsArray(): FormArray {
    return this.destinationForm.get('bestMonths') as FormArray;
  }

  // ── Form Array Mutators ───────────────────────────────────
  addAttraction() {
    const attractionForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      type: ['', Validators.required],
      entryFee: [0, [Validators.required, Validators.min(0)]]
    });
    this.attractions.push(attractionForm);
  }

  removeAttraction(index: number) {
    this.attractions.removeAt(index);
  }

  toggleMonth(month: string) {
    const arr = this.bestMonthsArray.value as string[];
    const idx = arr.indexOf(month);
    if (idx > -1) {
      this.bestMonthsArray.removeAt(idx);
    } else {
      this.bestMonthsArray.push(this.fb.control(month));
    }
  }

  ngAfterViewInit(): void {
    // Initialize map when step 2 becomes active
    effect(() => {
      if (this.currentStep() === 2 && !this.map) {
        this.initMap();
      }
    });
  }

  private initMap(): void {
    const lat = Number(this.destinationForm.get('latitude')?.value) || 29.9792;
    const lng = Number(this.destinationForm.get('longitude')?.value) || 31.1342;
    this.map = L.map(this.mapContainer.nativeElement).setView(L.latLng(lat, lng), 13);
    this.map.invalidateSize();
    setTimeout(() => this.map.invalidateSize(), 0);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    const customIcon = L.icon({
      iconUrl: '/assets/marker-icon.png',
      iconRetinaUrl: '/assets/marker-icon-2x.png',
      shadowUrl: '/assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    this.marker = L.marker(L.latLng(lat, lng), { draggable: true, icon: customIcon }).addTo(this.map);
    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.destinationForm.patchValue({ latitude: pos.lat, longitude: pos.lng });
    });
    // sync marker when form changes
    this.destinationForm.get('latitude')?.valueChanges.subscribe(val => {
      const lngVal = this.destinationForm.get('longitude')?.value;
      const newLatLng = L.latLng(Number(val), Number(lngVal));
      this.marker.setLatLng(newLatLng);
      this.map.panTo(newLatLng);
    });
    this.destinationForm.get('longitude')?.valueChanges.subscribe(val => {
      const latVal = this.destinationForm.get('latitude')?.value;
      const newLatLng = L.latLng(Number(latVal), Number(val));
      this.marker.setLatLng(newLatLng);
      this.map.panTo(newLatLng);
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  applyPreset(preset: { lat: number; lng: number; city: string; region: string; name?: string }): void {
    this.destinationForm.patchValue({
      latitude: preset.lat,
      longitude: preset.lng,
      city: preset.city,
      region: preset.region
    });
    // No map initialization here. The map will be set up when step 2 becomes active.
  }

  isMonthSelected(month: string): boolean {
    const arr = this.bestMonthsArray.value as string[];
    return arr.includes(month);
  }

  // Recenter map to current form coordinates
  recenterMap(): void {
    const lat = this.destinationForm.get('latitude')?.value;
    const lng = this.destinationForm.get('longitude')?.value;
    if (this.map && lat != null && lng != null) {
      this.map.setView([lat, lng], this.map.getZoom());
      this.marker.setLatLng([lat, lng]);
    }
  }

  // ── Validation Helpers ────────────────────────────────────
  isStep1Valid(): boolean {
    const form = this.destinationForm;
    return !!(
      form.get('nameEn')?.valid &&
      form.get('nameAr')?.valid &&
      form.get('category')?.valid
    );
  }

  isStep2Valid(): boolean {
    const form = this.destinationForm;
    return !!(
      form.get('city')?.valid &&
      form.get('region')?.valid &&
      form.get('latitude')?.valid &&
      form.get('longitude')?.valid
    );
  }

  isStep3Valid(): boolean {
    const form = this.destinationForm;
    return !!(
      form.get('descriptionEn')?.valid &&
      form.get('descriptionAr')?.valid &&
      form.get('averageBudgetPerDay')?.valid &&
      form.get('currency')?.valid &&
      this.attractions.valid
    );
  }

  // ── Navigation Logic ──────────────────────────────────────


  prevStep() {
    const step = this.currentStep();
    if (step > 1) {
      this.currentStep.set(step - 1);
      this.errorMessage.set(null);
    }
  }
  nextStep(): void {
    const step = this.currentStep();
    this.errorMessage.set(null);

    if (step === 1) {
      if (this.isStep1Valid()) {
        this.currentStep.set(2);
        // Initialize map after the view for step 2 is rendered
        setTimeout(() => this.initMap(), 0);
      } else {
        this.destinationForm.get('nameEn')?.markAsTouched();
        this.destinationForm.get('nameAr')?.markAsTouched();
        this.destinationForm.get('category')?.markAsTouched();
        this.errorMessage.set('Please fill all required basic information.');
      }
    } else if (step === 2) {
      if (this.isStep2Valid()) {
        this.currentStep.set(3);
      } else {
        this.destinationForm.get('city')?.markAsTouched();
        this.destinationForm.get('region')?.markAsTouched();
        this.destinationForm.get('latitude')?.markAsTouched();
        this.destinationForm.get('longitude')?.markAsTouched();
        this.errorMessage.set('Please enter valid city, region, and coordinates.');
      }
    } else if (step === 3) {
      if (this.isStep3Valid()) {
        this.currentStep.set(4);
      } else {
        this.destinationForm.get('descriptionEn')?.markAsTouched();
        this.destinationForm.get('descriptionAr')?.markAsTouched();
        this.destinationForm.get('averageBudgetPerDay')?.markAsTouched();
        this.destinationForm.get('currency')?.markAsTouched();
        this.attractions.markAllAsTouched();
        this.errorMessage.set('Please complete the content details and resolve any attraction errors.');
      }
    }
  }

  // ── Form Submission ───────────────────────────────────────
  onSubmit() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // Validate preceding steps just in case
    if (!this.isStep1Valid()) {
      this.currentStep.set(1);
      this.errorMessage.set('Basic info is incomplete.');
      return;
    }
    if (!this.isStep2Valid()) {
      this.currentStep.set(2);
      this.errorMessage.set('Location details are invalid.');
      return;
    }
    if (!this.isStep3Valid()) {
      this.currentStep.set(3);
      this.errorMessage.set('Content parameters contain errors.');
      return;
    }

    this.loading.set(true);

    const fv = this.destinationForm.value;
    const payload = {
      name: {
        en: fv.nameEn || '',
        ar: fv.nameAr || ''
      },
      city: fv.city || '',
      region: fv.region as any,
      category: fv.category as any,
      description: {
        en: fv.taglineEn ? `${fv.taglineEn.trim()}. ${fv.descriptionEn || ''}` : (fv.descriptionEn || ''),
        ar: fv.taglineAr ? `${fv.taglineAr.trim()}. ${fv.descriptionAr || ''}` : (fv.descriptionAr || '')
      },
      attractions: (fv.attractions || []).map((att: any) => ({
        name: { en: att.nameEn, ar: att.nameAr },
        type: att.type,
        entryFee: Number(att.entryFee)
      })),
      bestMonths: fv.bestMonths as string[],
      averageBudgetPerDay: Number(fv.averageBudgetPerDay),
      currency: fv.currency as 'EGP' | 'USD',
      location: {
        type: 'Point' as const,
        coordinates: [Number(fv.longitude), Number(fv.latitude)] as [number, number]
      },
      images: this.galleryUrls(),
      coverImage: fv.coverImage || null,
      isActive: fv.isActive ?? true
    };

    this.destinationsService.createDestination(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set('Destination created successfully!');
        // Redirect to destinations list after a brief delay
        setTimeout(() => {
          this.router.navigate(['/dashboard/destinations']);
        }, 1500);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'An unexpected error occurred.');
      }
    });
  }


}
