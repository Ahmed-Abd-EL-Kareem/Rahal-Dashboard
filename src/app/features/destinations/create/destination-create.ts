
import {
  Component,
  signal,
  inject,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DestinationsService } from '../../../core/services/destinations.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matArrowBackOutline,
  matArrowForwardOutline,
  matCheckOutline,
  matDeleteOutline,
  matAddOutline,
  matAutoAwesomeOutline,
  matLocationOnOutline,
  matCloudUploadOutline,
  matInfoOutline,
} from '@ng-icons/material-icons/outline';

import { effect } from '@angular/core';
import * as L from 'leaflet';

L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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
      matInfoOutline,
    }),
  ],
})
export class DestinationCreateComponent implements AfterViewInit, OnDestroy {
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

  categories = [
    { value: 'historical', label: 'Historical' },
    { value: 'beach', label: 'Beach & Resort' },
    { value: 'adventure', label: 'Adventure & Safari' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'religious', label: 'Religious' },
    { value: 'nature', label: 'Nature & Eco' },
    { value: 'landmark', label: 'Landmark' },
    { value: 'other', label: 'Other' },
  ];

  regions = [
    'Upper Egypt',
    'Lower Egypt',
    'Sinai',
    'Red Sea',
    'Western Desert',
    'Delta',
    'Mediterranean',
  ];

  monthsList = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  egyptianGovernorates = [
    { nameEn: 'Cairo', nameAr: 'القاهرة', lat: 30.0444, lng: 31.2357, region: 'Lower Egypt' },
    { nameEn: 'Giza', nameAr: 'الجيزة', lat: 30.0131, lng: 31.2089, region: 'Lower Egypt' },
    { nameEn: 'Alexandria', nameAr: 'الإسكندرية', lat: 31.2001, lng: 29.9187, region: 'Mediterranean' },
    { nameEn: 'Luxor', nameAr: 'الأقصر', lat: 25.6872, lng: 32.6396, region: 'Upper Egypt' },
    { nameEn: 'Aswan', nameAr: 'أسوان', lat: 24.0889, lng: 32.8998, region: 'Upper Egypt' },
    { nameEn: 'Sohag', nameAr: 'سوهاج', lat: 26.5592, lng: 31.6957, region: 'Upper Egypt' },
    { nameEn: 'Qena', nameAr: 'قنا', lat: 26.1551, lng: 32.7160, region: 'Upper Egypt' },
    { nameEn: 'Asyut', nameAr: 'أسيوط', lat: 27.1783, lng: 31.1859, region: 'Upper Egypt' },
    { nameEn: 'Minya', nameAr: 'المنيا', lat: 28.0871, lng: 30.7618, region: 'Upper Egypt' },
    { nameEn: 'Beni Suef', nameAr: 'بني سويف', lat: 29.0744, lng: 31.0978, region: 'Upper Egypt' },
    { nameEn: 'Fayoum', nameAr: 'الفيوم', lat: 29.3084, lng: 30.8428, region: 'Upper Egypt' },
    { nameEn: 'Qalyubia', nameAr: 'القليوبية', lat: 30.4100, lng: 31.1800, region: 'Delta' },
    { nameEn: 'Monufia', nameAr: 'المنوفية', lat: 30.5200, lng: 30.9900, region: 'Delta' },
    { nameEn: 'Gharbia', nameAr: 'الغربية', lat: 30.7900, lng: 31.0000, region: 'Delta' },
    { nameEn: 'Dakahlia', nameAr: 'الدقهلية', lat: 31.0500, lng: 31.3800, region: 'Delta' },
    { nameEn: 'Sharqia', nameAr: 'الشرقية', lat: 30.5900, lng: 31.5000, region: 'Delta' },
    { nameEn: 'Beheira', nameAr: 'البحيرة', lat: 31.0400, lng: 30.4700, region: 'Lower Egypt' },
    { nameEn: 'Damietta', nameAr: 'دمياط', lat: 31.4175, lng: 31.8144, region: 'Mediterranean' },
    { nameEn: 'Port Said', nameAr: 'بورسعيد', lat: 31.2653, lng: 32.3019, region: 'Mediterranean' },
    { nameEn: 'Ismailia', nameAr: 'الإسماعيلية', lat: 30.6044, lng: 32.2742, region: 'Red Sea' },
    { nameEn: 'Suez', nameAr: 'السويس', lat: 29.9668, lng: 32.5498, region: 'Red Sea' },
    { nameEn: 'Red Sea', nameAr: 'البحر الأحمر', lat: 26.7292, lng: 33.9365, region: 'Red Sea' },
    { nameEn: 'Matrouh', nameAr: 'مطروح', lat: 31.3543, lng: 27.2373, region: 'Western Desert' },
    { nameEn: 'New Valley', nameAr: 'الوادي الجديد', lat: 25.4514, lng: 30.5487, region: 'Western Desert' },
    { nameEn: 'North Sinai', nameAr: 'شمال سيناء', lat: 30.8000, lng: 33.8000, region: 'Sinai' },
    { nameEn: 'South Sinai', nameAr: 'جنوب سيناء', lat: 29.3000, lng: 34.0000, region: 'Sinai' },
    { nameEn: 'Kafr El Sheikh', nameAr: 'كفر الشيخ', lat: 31.1100, lng: 30.9400, region: 'Delta' },
  ];

  locationPresets = [
    { name: 'Pyramids of Giza', lat: 29.9792, lng: 31.1342, city: 'Giza', region: 'Lower Egypt' },
    { name: 'Karnak Temple (Luxor)', lat: 25.7188, lng: 32.6573, city: 'Luxor', region: 'Upper Egypt' },
    { name: 'Sharm El Sheikh', lat: 27.9158, lng: 34.3299, city: 'Sharm El Sheikh', region: 'Sinai' },
    { name: 'Aswan High Dam', lat: 23.97, lng: 32.88, city: 'Aswan', region: 'Upper Egypt' },
    { name: 'Siwa Oasis', lat: 29.2032, lng: 25.5189, city: 'Siwa', region: 'Western Desert' },
  ];

  destinationForm = this.fb.group({
    nameEn: ['', Validators.required],
    nameAr: ['', Validators.required],
    category: ['', Validators.required],
    isActive: [true],
    taglineEn: ['', Validators.maxLength(60)],
    taglineAr: ['', Validators.maxLength(60)],

    city: ['', Validators.required],
    region: ['', Validators.required],
    latitude: [29.9792, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [31.1342, [Validators.required, Validators.min(-180), Validators.max(180)]],

    descriptionEn: ['', Validators.required],
    descriptionAr: ['', Validators.required],
    averageBudgetPerDay: [1200, [Validators.required, Validators.min(0)]],
    currency: ['EGP', Validators.required],
    bestMonths: this.fb.array<string>([]),
    attractions: this.fb.array([]),
    coverImage: [''],
  });

  galleryUrls = signal<string[]>([]);
  galleryUploading = signal(false);

  citySearchResults = signal<typeof this.egyptianGovernorates>([]);
  citySearchOpen = signal(false);

  onCityInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (query.length < 1) {
      this.citySearchResults.set([]);
      this.citySearchOpen.set(false);
      return;
    }

    const filtered = this.egyptianGovernorates.filter(
      (gov) =>
        gov.nameEn.toLowerCase().startsWith(query) ||
        gov.nameAr.startsWith(query)
    );

    this.citySearchResults.set(filtered);
    this.citySearchOpen.set(filtered.length > 0);
  }

  selectCityResult(gov: (typeof this.egyptianGovernorates)[0]): void {
    this.destinationForm.patchValue({
      city: gov.nameEn,
      latitude: gov.lat,
      longitude: gov.lng,
      region: gov.region,
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
        },
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

    files.forEach((file) => {
      this.cloudinaryService.uploadImage(file).subscribe({
        next: (url) => {
          this.galleryUrls.update((prev) => [...prev, url]);
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
        },
      });
    });

    target.value = '';
  }

  removeGalleryImage(index: number) {
    this.galleryUrls.update((prev) => prev.filter((_, i) => i !== index));
  }

  get attractions(): FormArray {
    return this.destinationForm.get('attractions') as FormArray;
  }

  get bestMonthsArray(): FormArray {
    return this.destinationForm.get('bestMonths') as FormArray;
  }

  addAttraction() {
    const attractionForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      type: ['historical', Validators.required],
      entryFee: [0, [Validators.required, Validators.min(0)]],
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
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    this.marker = L.marker(L.latLng(lat, lng), { draggable: true, icon: customIcon }).addTo(
      this.map,
    );
    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.destinationForm.patchValue({ latitude: pos.lat, longitude: pos.lng });
    });
    this.destinationForm.get('latitude')?.valueChanges.subscribe((val) => {
      const lngVal = this.destinationForm.get('longitude')?.value;
      const newLatLng = L.latLng(Number(val), Number(lngVal));
      this.marker.setLatLng(newLatLng);
      this.map.panTo(newLatLng);
    });
    this.destinationForm.get('longitude')?.valueChanges.subscribe((val) => {
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

  applyPreset(preset: {
    lat: number;
    lng: number;
    city: string;
    region: string;
    name?: string;
  }): void {
    this.destinationForm.patchValue({
      latitude: preset.lat,
      longitude: preset.lng,
      city: preset.city,
      region: preset.region,
    });
  }

  isMonthSelected(month: string): boolean {
    const arr = this.bestMonthsArray.value as string[];
    return arr.includes(month);
  }

  recenterMap(): void {
    const lat = this.destinationForm.get('latitude')?.value;
    const lng = this.destinationForm.get('longitude')?.value;
    if (this.map && lat != null && lng != null) {
      this.map.setView([lat, lng], this.map.getZoom());
      this.marker.setLatLng([lat, lng]);
    }
  }

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
        this.errorMessage.set(
          'Please complete the content details and resolve any attraction errors.',
        );
      }
    }
  }

  onSubmit() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

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

    const generatedSlug = (fv.nameEn || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const payload = {
      name: {
        en: fv.nameEn || '',
        ar: fv.nameAr || '',
      },
      slug: generatedSlug,
      city: fv.city || '',
      region: fv.region as any,
      category: fv.category as any,
      description: {
        en: fv.taglineEn
          ? `${fv.taglineEn.trim()}. ${fv.descriptionEn || ''}`
          : fv.descriptionEn || '',
        ar: fv.taglineAr
          ? `${fv.taglineAr.trim()}. ${fv.descriptionAr || ''}`
          : fv.descriptionAr || '',
      },
      attractions: (fv.attractions || []).map((att: any) => ({
        name: {
          en: att.nameEn || '',
          ar: att.nameAr || null,
        },
        type: att.type,
        entryFee: Number(att.entryFee) || 0,
      })),
      bestMonths: fv.bestMonths as string[],
      averageBudgetPerDay: Number(fv.averageBudgetPerDay),
      currency: fv.currency as 'EGP' | 'USD',
      location: {
        type: 'Point' as const,
        coordinates: [Number(fv.longitude), Number(fv.latitude)] as [number, number],
      },
      images: this.galleryUrls(),
      coverImage: fv.coverImage || null,
      isActive: fv.isActive ?? true,
    };

    this.destinationsService.createDestination(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set('Destination created successfully!');
        setTimeout(() => {
          this.router.navigate(['/dashboard/destinations']);
        }, 1500);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || err.message || 'An unexpected error occurred.');
      },
    });
  }
}



