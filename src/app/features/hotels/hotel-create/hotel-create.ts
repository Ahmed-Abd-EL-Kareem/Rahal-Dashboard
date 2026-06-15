
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HotelsService } from '../shared/hotels';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';

@Component({
  selector: 'app-hotel-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './hotel-create.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './hotel-create.css',
})
export class HotelCreateComponent {
  private hotelsService = inject(HotelsService);
  private router = inject(Router);
  private http = inject(HttpClient);

  currentStep = signal(1);
  saving = signal(false);
  aiGenerating = signal(false);
  uploadingImages = signal(false);

  readonly STEPS = [
    { n: 1, label: 'Basic Info' },
    { n: 2, label: 'Gallery' },
    { n: 3, label: 'Amenities' },
    { n: 4, label: 'Location' },
    { n: 5, label: 'Pricing & Inventory' },
  ];

  AMENITIES_LIST: string[] = [];
  CITIES: string[] = [];
  REGIONS: string[] = [];

  selectedAmenities = new Set<string>();
  selectedImages: string[] = [];
  selectedStars = 4;

  readonly CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/docv0n0wp/image/upload';
  readonly CLOUDINARY_PRESET = 'rahal_preset';

  // ─── Signals Forms ─────────────────────────────────────────────────────────

  basicModel = signal({
    nameEn: '',
    nameAr: '',
    type: '',
    descriptionEn: '',
    descriptionAr: '',
  });

  // FieldTree: basicForm.nameEn() ← الـ field مباشرة بدون .fields
  basicForm = form(
    this.basicModel,
    (d) => {
      required(d.nameEn, { message: 'Property name is required.' });
      required(d.type, { message: 'Property type is required.' });
      required(d.descriptionEn, { message: 'Description is required.' });
    },
  );

  locationModel = signal({
    city: '',
    region: '',
    addressEn: '',
    addressAr: '',
    lng: null as number | null,
    lat: null as number | null,
  });

  locationForm = form(
    this.locationModel,
    (d) => {
      required(d.city, { message: 'City is required.' });
    },
  );

  // ─── Validation helpers ────────────────────────────────────────────────────
  // basicForm لا تحتوي على .invalid() — نستخدم helper يدوي

  isBasicFormInvalid(): boolean {
    const m = this.basicModel();
    return !m.nameEn?.trim() || !m.type?.trim() || !m.descriptionEn?.trim();
  }

  isLocationFormInvalid(): boolean {
    return !this.locationModel().city?.trim();
  }

  // ─── Reactive Forms (FormArray) ────────────────────────────────────────────

  roomsForm = new FormGroup({
    currency: new FormControl('EGP', { nonNullable: true }),
    rooms: new FormArray([
      this.buildRoom('single', 800, 1),
      this.buildRoom('double', 1400, 2),
      this.buildRoom('suite', 3500, 2),
      this.buildRoom('family', 1100, 4),
    ]),
  });

  get rooms(): FormArray {
    return this.roomsForm.controls.rooms;
  }

  // ─── Constructor ───────────────────────────────────────────────────────────

  constructor() {
    this.hotelsService
      .getMeta()
      .pipe(takeUntilDestroyed())
      .subscribe((meta) => {
        this.CITIES = meta.cities || [];
        this.AMENITIES_LIST = meta.amenities || [];
        this.REGIONS = meta.regions || [];
      });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  buildRoom(type: string, price: number, cap: number) {
    return new FormGroup({
      type: new FormControl(type, { nonNullable: true }),
      pricePerNight: new FormControl(price, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      capacity: new FormControl(cap, { nonNullable: true }),
    });
  }

  progress() {
    return ((this.currentStep() - 1) / 4) * 100;
  }

  goStep(n: number) {
    if (n < 1 || n > 5) return;
    this.currentStep.set(n);
  }

  toggleAmenity(a: string) {
    this.selectedAmenities.has(a)
      ? this.selectedAmenities.delete(a)
      : this.selectedAmenities.add(a);
  }

  setStars(n: number) {
    this.selectedStars = n;
  }

  // ─── AI Generate ───────────────────────────────────────────────────────────

  generateWithAI() {
    if (!this.basicModel().nameEn) return;
    this.aiGenerating.set(true);
    setTimeout(() => {
      this.basicModel.update((m) => ({
        ...m,
        descriptionEn: `${m.nameEn} offers a premium hospitality experience combining comfort, luxury, and world-class service in Egypt.`,
      }));
      this.aiGenerating.set(false);
    }, 1200);
  }

  // ─── Image Upload ──────────────────────────────────────────────────────────

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.uploadFiles(Array.from(input.files));
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer || event.dataTransfer.files.length === 0) return;
    this.uploadFiles(Array.from(event.dataTransfer.files));
  }

  private uploadFiles(files: File[]) {
    this.uploadingImages.set(true);
    const uploads = files.map((file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.CLOUDINARY_PRESET);
      return this.http.post<any>(this.CLOUDINARY_UPLOAD_URL, formData);
    });

    forkJoin(uploads).subscribe({
      next: (results) => {
        results.forEach((res) => {
          if (res?.secure_url) this.selectedImages.push(res.secure_url);
        });
        this.uploadingImages.set(false);
      },
      error: (err) => {
        console.error('CLOUDINARY ERROR', err);
        this.uploadingImages.set(false);
      },
    });
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  // ─── Save / Publish ────────────────────────────────────────────────────────

  saveDraft() {
    this.publishHotel(false);
  }

  publishHotel(publish = true) {
    // ✅ isBasicFormInvalid() بدل basicForm.invalid() اللي مش موجودة في FieldTree
    if (this.isBasicFormInvalid()) {
      this.goStep(1);
      alert('من فضلك اكمل بيانات الفندق الأساسية أولاً');
      return;
    }

    this.saving.set(true);

    const v = this.basicModel();
    const lv = this.locationModel();
    const rv = this.roomsForm.getRawValue();

    const rooms = rv.rooms.map((r) => ({
      type: r.type,
      pricePerNight: +r.pricePerNight,
      capacity: +r.capacity,
    }));

    const avgPrice = rooms.length
      ? rooms.reduce((s, r) => s + r.pricePerNight, 0) / rooms.length
      : 0;

    const dto: any = {
      name: { en: v.nameEn, ar: v.nameAr || v.nameEn },
      description: { en: v.descriptionEn, ar: v.descriptionAr || v.descriptionEn },
      city: lv.city,
      region: lv.region,
      address: { en: lv.addressEn, ar: lv.addressAr },
      stars: this.selectedStars,
      amenities: Array.from(this.selectedAmenities),
      rooms,
      averagePricePerNight: Math.round(avgPrice),
      currency: rv.currency,
      isActive: publish,
      images: this.selectedImages,
      coverImage: this.selectedImages[0] ?? null,
      ...(lv.lng && lv.lat
        ? { location: { type: 'Point', coordinates: [+lv.lng, +lv.lat] } }
        : {}),
    };

    this.hotelsService.createHotel(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/dashboard/hotels']);
      },
      error: () => this.saving.set(false),
    });
  }

  back() {
    this.router.navigate(['/dashboard/hotels']);
  }

  starsArray(n: number) { return Array(n).fill(0); }
  emptyStars(n: number) { return Array(5 - n).fill(0); }
}
