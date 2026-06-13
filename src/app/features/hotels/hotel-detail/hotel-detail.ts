// import { Component, inject, signal, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router, ActivatedRoute } from '@angular/router';
// import { ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { HotelsService } from '../shared/hotels';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { forkJoin } from 'rxjs';

// @Component({
//   selector: 'app-hotel-edit',
//   standalone: true,
//   imports: [CommonModule, RouterModule, ReactiveFormsModule],
//   templateUrl: './hotel-edit.html',
//   styleUrl: './hotel-edit.css',
// })
// export class HotelEditComponent implements OnInit {
//   private hotelsService = inject(HotelsService);
//   private router        = inject(Router);
//   private route         = inject(ActivatedRoute);
//   private http          = inject(HttpClient);

//   hotelId      = signal<string | null>(null);
//   loading      = signal(true);
//   saving       = signal(false);
//   aiGenerating = signal(false);
//   uploadingImages = signal(false);

//   currentStep = signal(1);

//   readonly STEPS = [
//     { n: 1, label: 'Basic Info' },
//     { n: 2, label: 'Gallery' },
//     { n: 3, label: 'Amenities' },
//     { n: 4, label: 'Location' },
//     { n: 5, label: 'Pricing & Inventory' },
//   ];

//   AMENITIES_LIST: string[] = [];
//   CITIES: string[] = [];
//   REGIONS: string[] = [];

//   selectedAmenities = new Set<string>();
//   selectedImages: string[] = [];
//   selectedStars = 4;

//   readonly CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/docv0n0wp/image/upload';
//   readonly CLOUDINARY_PRESET = 'rahal_preset';

//   // ── Signal Forms ──────────────────────────────────────────────────────────

//   basicForm = new FormGroup({
//     nameEn:        new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     nameAr:        new FormControl('', { nonNullable: true }),
//     type:          new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     descriptionEn: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     descriptionAr: new FormControl('', { nonNullable: true }),
//   });

//   locationForm = new FormGroup({
//     city:      new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     region:    new FormControl('', { nonNullable: true }),
//     addressEn: new FormControl('', { nonNullable: true }),
//     addressAr: new FormControl('', { nonNullable: true }),
//     lng:       new FormControl<number | null>(null),
//     lat:       new FormControl<number | null>(null),
//   });

//   roomsForm = new FormGroup({
//     currency: new FormControl('EGP', { nonNullable: true }),
//     rooms: new FormArray<any>([]),
//   });

//   get rooms(): FormArray { return this.roomsForm.controls.rooms; }

//   // ── Constructor ───────────────────────────────────────────────────────────

//   constructor() {
//     this.hotelsService.getMeta()
//       .pipe(takeUntilDestroyed())
//       .subscribe(meta => {
//         this.CITIES         = meta.cities    || [];
//         this.AMENITIES_LIST = meta.amenities || [];
//         this.REGIONS        = meta.regions   || [];
//       });
//   }

//   // ── OnInit: load hotel & patch forms ─────────────────────────────────────

//   ngOnInit() {
//     const id = this.route.snapshot.paramMap.get('id');
//     if (!id) { this.router.navigate(['/dashboard/hotels']); return; }
//     this.hotelId.set(id);

//     this.hotelsService.getHotelById(id).subscribe({
//       next: (res: any) => {
//         const h = res.data ?? res;
//         this.patchForms(h);
//         this.loading.set(false);
//       },
//       error: () => {
//         this.loading.set(false);
//         this.router.navigate(['/dashboard/hotels']);
//       },
//     });
//   }

//   private patchForms(h: any) {
//     // Basic
//     this.basicForm.patchValue({
//       nameEn:        h.name?.en   || h.name || '',
//       nameAr:        h.name?.ar   || '',
//       type:          h.type       || '',
//       descriptionEn: h.description?.en || h.description || '',
//       descriptionAr: h.description?.ar || '',
//     });

//     // Stars
//     this.selectedStars = h.stars || 4;

//     // Location
//     this.locationForm.patchValue({
//       city:      h.city       || '',
//       region:    h.region     || '',
//       addressEn: h.address?.en || '',
//       addressAr: h.address?.ar || '',
//       lng: h.location?.coordinates?.[0] ?? null,
//       lat: h.location?.coordinates?.[1] ?? null,
//     });

//     // Amenities
//     this.selectedAmenities = new Set<string>(h.amenities || []);

//     // Images
//     this.selectedImages = [...(h.images || [])];

//     // Rooms — clear array then repopulate
//     while (this.rooms.length) this.rooms.removeAt(0);
//     (h.rooms || []).forEach((r: any) =>
//       this.rooms.push(this.buildRoom(r.type, r.pricePerNight, r.capacity))
//     );
//     // fallback default rooms if none
//     if (!this.rooms.length) {
//       [
//         this.buildRoom('single', 800,  1),
//         this.buildRoom('double', 1400, 2),
//         this.buildRoom('suite',  3500, 2),
//         this.buildRoom('family', 1100, 4),
//       ].forEach(r => this.rooms.push(r));
//     }

//     this.roomsForm.controls.currency.setValue(h.currency || 'EGP');
//   }

//   // ── Helpers ───────────────────────────────────────────────────────────────

//   buildRoom(type: string, price: number, cap: number) {
//     return new FormGroup({
//       type:          new FormControl(type,  { nonNullable: true }),
//       pricePerNight: new FormControl(price, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
//       capacity:      new FormControl(cap,   { nonNullable: true }),
//     });
//   }

//   progress() { return ((this.currentStep() - 1) / 4) * 100; }
//   goStep(n: number) { if (n >= 1 && n <= 5) this.currentStep.set(n); }

//   toggleAmenity(a: string) {
//     this.selectedAmenities.has(a)
//       ? this.selectedAmenities.delete(a)
//       : this.selectedAmenities.add(a);
//   }

//   setStars(n: number) { this.selectedStars = n; }

//   generateWithAI() {
//     if (!this.basicForm.controls.nameEn.value) return;
//     this.aiGenerating.set(true);
//     setTimeout(() => {
//       this.basicForm.controls.descriptionEn.setValue(
//         `${this.basicForm.controls.nameEn.value} offers a premium hospitality experience combining comfort, luxury, and world-class service in Egypt.`
//       );
//       this.aiGenerating.set(false);
//     }, 1200);
//   }

//   // ── Image Upload ──────────────────────────────────────────────────────────

//   onFileSelected(event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (!input.files?.length) return;
//     this.uploadFiles(Array.from(input.files));
//   }

//   onFileDropped(event: DragEvent) {
//     event.preventDefault();
//     if (!event.dataTransfer?.files.length) return;
//     this.uploadFiles(Array.from(event.dataTransfer.files));
//   }

//   private uploadFiles(files: File[]) {
//     this.uploadingImages.set(true);
//     const uploads = files.map(file => {
//       const fd = new FormData();
//       fd.append('file', file);
//       fd.append('upload_preset', this.CLOUDINARY_PRESET);
//       return this.http.post<any>(this.CLOUDINARY_UPLOAD_URL, fd);
//     });

//     forkJoin(uploads).subscribe({
//       next: (results) => {
//         results.forEach(res => { if (res?.secure_url) this.selectedImages.push(res.secure_url); });
//         this.uploadingImages.set(false);
//       },
//       error: (err) => { console.error(err); this.uploadingImages.set(false); },
//     });
//   }

//   removeImage(index: number) { this.selectedImages.splice(index, 1); }

//   // ── Save ──────────────────────────────────────────────────────────────────

//   saveChanges() {
//     if (!this.basicForm.valid) {
//       this.goStep(1);
//       alert('من فضلك اكمل بيانات الفندق الأساسية أولاً');
//       return;
//     }

//     this.saving.set(true);

//     const v  = this.basicForm.getRawValue();
//     const lv = this.locationForm.getRawValue();
//     const rv = this.roomsForm.getRawValue();

//     const rooms = rv.rooms.map((r: any) => ({
//       type: r.type, pricePerNight: +r.pricePerNight, capacity: +r.capacity,
//     }));

//     const avgPrice = rooms.length
//       ? rooms.reduce((s: number, r: any) => s + r.pricePerNight, 0) / rooms.length : 0;

//     const dto: any = {
//       name:        { en: v.nameEn, ar: v.nameAr || v.nameEn },
//       description: { en: v.descriptionEn, ar: v.descriptionAr || v.descriptionEn },
//       city:        lv.city,
//       region:      lv.region,
//       address:     { en: lv.addressEn, ar: lv.addressAr },
//       stars:       this.selectedStars,
//       amenities:   Array.from(this.selectedAmenities),
//       rooms,
//       averagePricePerNight: Math.round(avgPrice),
//       currency:    rv.currency,
//       images:      this.selectedImages,
//       coverImage:  this.selectedImages[0] ?? null,
//       ...(lv.lng && lv.lat
//         ? { location: { type: 'Point', coordinates: [+lv.lng, +lv.lat] } } : {}),
//     };

//     this.hotelsService.updateHotel(this.hotelId()!, dto).subscribe({
//       next: () => {
//         this.saving.set(false);
//         this.router.navigate(['/dashboard/hotels', this.hotelId()]);
//       },
//       error: () => this.saving.set(false),
//     });
//   }

//   back() { this.router.navigate(['/dashboard/hotels', this.hotelId()]); }

//   starsArray(n: number) { return Array(n).fill(0); }
//   emptyStars(n: number) { return Array(5 - n).fill(0); }
// }
// import { Component, inject, signal, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router, ActivatedRoute } from '@angular/router';
// import {
//   ReactiveFormsModule,
//   FormGroup,
//   FormControl,
//   FormArray,
//   Validators,
// } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { HotelsService } from '../shared/hotels';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { forkJoin } from 'rxjs';

// @Component({
//   selector: 'app-hotel-details',
//   standalone: true,
//   imports: [CommonModule, RouterModule, ReactiveFormsModule],
//   templateUrl: './hotel-detail.html',
//   styleUrl: './hotel-detail.css',
// })
// export class HotelDetailsComponent implements OnInit {
//   private hotelsService = inject(HotelsService);
//   private router = inject(Router);
//   private route = inject(ActivatedRoute);
//   private http = inject(HttpClient);

//   // ─── State ─────────────────────────────────────────────────────────────────

//   hotel = signal<any>(null);
//   loading = signal(true);
//   saving = signal(false);
//   editMode = signal(false);
//   activeTab = signal<'overview' | 'gallery' | 'amenities' | 'location' | 'pricing'>('overview');
//   uploadingImages = signal(false);
//   aiGenerating = signal(false);

//   readonly TABS = [
//     { key: 'overview',   label: 'Overview'   },
//     { key: 'gallery',    label: 'Gallery'    },
//     { key: 'amenities',  label: 'Amenities'  },
//     { key: 'location',   label: 'Location'   },
//     { key: 'pricing',    label: 'Pricing'    },
//   ] as const;

//   AMENITIES_LIST: string[] = [];
//   CITIES: string[]          = [];
//   REGIONS: string[]         = [];

//   selectedAmenities = new Set<string>();
//   selectedImages: string[]  = [];
//   selectedStars             = 4;
//   hotelId                   = '';

//   readonly CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/docv0n0wp/image/upload';
//   readonly CLOUDINARY_PRESET     = 'rahal_preset';

//   // ─── Forms (identical pattern to hotel-create) ─────────────────────────────

//   basicForm = new FormGroup({
//     nameEn:        new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     nameAr:        new FormControl('', { nonNullable: true }),
//     type:          new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     descriptionEn: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     descriptionAr: new FormControl('', { nonNullable: true }),
//   });

//   locationForm = new FormGroup({
//     city:      new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     region:    new FormControl('', { nonNullable: true }),
//     addressEn: new FormControl('', { nonNullable: true }),
//     addressAr: new FormControl('', { nonNullable: true }),
//     lng:       new FormControl<number | null>(null),
//     lat:       new FormControl<number | null>(null),
//   });

//   roomsForm = new FormGroup({
//     currency: new FormControl('EGP', { nonNullable: true }),
//     rooms: new FormArray<FormGroup>([]),
//   });

//   get rooms(): FormArray<FormGroup> {
//     return this.roomsForm.controls.rooms;
//   }

//   // ─── Constructor ───────────────────────────────────────────────────────────

//   constructor() {
//     this.hotelsService
//       .getMeta()
//       .pipe(takeUntilDestroyed())
//       .subscribe((meta) => {
//         this.CITIES         = meta.cities    || [];
//         this.AMENITIES_LIST = meta.amenities || [];
//         this.REGIONS        = meta.regions   || [];
//       });
//   }

//   // ─── Lifecycle ─────────────────────────────────────────────────────────────

//   ngOnInit(): void {
//     this.hotelId = this.route.snapshot.paramMap.get('id') ?? '';
//     if (!this.hotelId) {
//       this.router.navigate(['/dashboard/hotels']);
//       return;
//     }
//     this.loadHotel();
//   }

//   // ─── Data Loading ──────────────────────────────────────────────────────────

//   loadHotel(): void {
//     this.loading.set(true);
//     this.hotelsService.getHotelById(this.hotelId).subscribe({
//       next: (res) => {
//         const h = (res as any).data ?? res;
//         this.hotel.set(h);
//         this.patchForms(h);
//         this.loading.set(false);
//       },
//       error: () => {
//         this.loading.set(false);
//         this.router.navigate(['/dashboard/hotels']);
//       },
//     });
//   }

//   private patchForms(h: any): void {
//     // Basic
//     this.basicForm.patchValue({
//       nameEn:        h.name?.en        ?? h.nameEn        ?? '',
//       nameAr:        h.name?.ar        ?? h.nameAr        ?? '',
//       type:          h.type            ?? '',
//       descriptionEn: h.description?.en ?? h.descriptionEn ?? '',
//       descriptionAr: h.description?.ar ?? h.descriptionAr ?? '',
//     });

//     // Stars
//     this.selectedStars = h.stars ?? 4;

//     // Location
//     this.locationForm.patchValue({
//       city:      h.city                            ?? '',
//       region:    h.region                          ?? '',
//       addressEn: h.address?.en ?? h.addressEn      ?? '',
//       addressAr: h.address?.ar ?? h.addressAr      ?? '',
//       lng:       h.location?.coordinates?.[0]      ?? null,
//       lat:       h.location?.coordinates?.[1]      ?? null,
//     });

//     // Amenities
//     this.selectedAmenities = new Set<string>(h.amenities ?? []);

//     // Images
//     this.selectedImages = [...(h.images ?? [])];

//     // Rooms
//     this.rooms.clear();
//     const roomsData: any[] = h.rooms?.length
//       ? h.rooms
//       : [
//           { type: 'single', pricePerNight: 800,  capacity: 1 },
//           { type: 'double', pricePerNight: 1400, capacity: 2 },
//           { type: 'suite',  pricePerNight: 3500, capacity: 2 },
//           { type: 'family', pricePerNight: 1100, capacity: 4 },
//         ];
//     roomsData.forEach((r) => this.rooms.push(this.buildRoom(r.type, r.pricePerNight, r.capacity)));

//     this.roomsForm.controls.currency.setValue(h.currency ?? 'EGP');
//   }

//   // ─── Helpers ───────────────────────────────────────────────────────────────

//   buildRoom(type: string, price: number, cap: number): FormGroup {
//     return new FormGroup({
//       type:          new FormControl(type,  { nonNullable: true }),
//       pricePerNight: new FormControl(price, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
//       capacity:      new FormControl(cap,   { nonNullable: true }),
//     });
//   }

//   toggleAmenity(a: string): void {
//     this.selectedAmenities.has(a)
//       ? this.selectedAmenities.delete(a)
//       : this.selectedAmenities.add(a);
//   }

//   setStars(n: number): void {
//     this.selectedStars = n;
//   }

//   setTab(tab: typeof this.activeTab extends ReturnType<infer R> ? never : any): void {
//     this.activeTab.set(tab);
//   }

//   starsArray(n: number)  { return Array(n).fill(0); }
//   emptyStars(n: number)  { return Array(5 - n).fill(0); }

//   // ─── Edit Mode ─────────────────────────────────────────────────────────────

//   enterEdit(): void {
//     this.editMode.set(true);
//     this.activeTab.set('overview');
//   }

//   cancelEdit(): void {
//     const h = this.hotel();
//     if (h) this.patchForms(h);
//     this.editMode.set(false);
//   }

//   // ─── AI Generate ───────────────────────────────────────────────────────────

//   generateWithAI(): void {
//     if (!this.basicForm.controls.nameEn.value) return;
//     this.aiGenerating.set(true);
//     setTimeout(() => {
//       this.basicForm.controls.descriptionEn.setValue(
//         `${this.basicForm.controls.nameEn.value} offers a premium hospitality experience combining comfort, luxury, and world-class service in Egypt.`
//       );
//       this.aiGenerating.set(false);
//     }, 1200);
//   }

//   // ─── Image Upload ──────────────────────────────────────────────────────────

//   onFileSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (!input.files || input.files.length === 0) return;
//     this.uploadFiles(Array.from(input.files));
//   }

//   onFileDropped(event: DragEvent): void {
//     event.preventDefault();
//     if (!event.dataTransfer || event.dataTransfer.files.length === 0) return;
//     this.uploadFiles(Array.from(event.dataTransfer.files));
//   }

//   private uploadFiles(files: File[]): void {
//     this.uploadingImages.set(true);
//     const uploads = files.map((file) => {
//       const fd = new FormData();
//       fd.append('file', file);
//       fd.append('upload_preset', this.CLOUDINARY_PRESET);
//       return this.http.post<any>(this.CLOUDINARY_UPLOAD_URL, fd);
//     });

//     forkJoin(uploads).subscribe({
//       next: (results) => {
//         results.forEach((res) => {
//           if (res?.secure_url) this.selectedImages.push(res.secure_url);
//         });
//         this.uploadingImages.set(false);
//       },
//       error: (err) => {
//         console.error('CLOUDINARY ERROR', err);
//         this.uploadingImages.set(false);
//       },
//     });
//   }

//   removeImage(index: number): void {
//     this.selectedImages.splice(index, 1);
//   }

//   // ─── Save ──────────────────────────────────────────────────────────────────

//   saveChanges(): void {
//     if (!this.basicForm.valid) {
//       this.activeTab.set('overview');
//       alert('من فضلك اكمل بيانات الفندق الأساسية أولاً');
//       return;
//     }

//     this.saving.set(true);

//     const v  = this.basicForm.getRawValue();
//     const lv = this.locationForm.getRawValue();
//     const rv = this.roomsForm.getRawValue();

//     const rooms = rv.rooms.map((r: any) => ({
//       type:          r.type,
//       pricePerNight: +r.pricePerNight,
//       capacity:      +r.capacity,
//     }));

//     const avgPrice = rooms.length
//       ? rooms.reduce((s: number, r: any) => s + r.pricePerNight, 0) / rooms.length
//       : 0;

//     const dto: any = {
//       name:        { en: v.nameEn, ar: v.nameAr || v.nameEn },
//       description: { en: v.descriptionEn, ar: v.descriptionAr || v.descriptionEn },
//       type:        v.type,
//       city:        lv.city,
//       region:      lv.region,
//       address:     { en: lv.addressEn, ar: lv.addressAr },
//       stars:       this.selectedStars,
//       amenities:   Array.from(this.selectedAmenities),
//       rooms,
//       averagePricePerNight: Math.round(avgPrice),
//       currency:    rv.currency,
//       images:      this.selectedImages,
//       coverImage:  this.selectedImages[0] ?? null,
//       ...(lv.lng && lv.lat
//         ? { location: { type: 'Point', coordinates: [+lv.lng, +lv.lat] } }
//         : {}),
//     };

//     this.hotelsService.updateHotel(this.hotelId, dto).subscribe({
//       next: (res) => {
//         const h = (res as any).data ?? res;
//         this.hotel.set(h);
//         this.saving.set(false);
//         this.editMode.set(false);
//       },
//       error: () => this.saving.set(false),
//     });
//   }

//   // ─── Navigation ────────────────────────────────────────────────────────────

//   back(): void {
//     this.router.navigate(['/dashboard/hotels']);
//   }

//   viewLive(): void {
//     const h = this.hotel();
//     if (h?._id) window.open(`/hotels/${h._id}`, '_blank');
//   }

//   toggleActive(): void {
//     const h = this.hotel();
//     if (!h) return;
//     this.hotelsService.updateHotel(this.hotelId, { isActive: !h.isActive } as any).subscribe({
//       next: (res) => {
//         const updated = (res as any).data ?? res;
//         this.hotel.set(updated);
//       },
//     });
//   }
// }
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HotelsService } from '../shared/hotels';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import {
  email,
  form,
  FormField,
  minLength,
  required,
  FormRoot,
} from '@angular/forms/signals';

// ─── Sub-model signals ────────────────────────────────────────────────────────

interface BasicModel {
  nameEn: string;
  nameAr: string;
  type: string;
  descriptionEn: string;
  descriptionAr: string;
}

interface LocationModel {
  city: string;
  region: string;
  addressEn: string;
  addressAr: string;
  lng: string;
  lat: string;
}

interface RoomModel {
  type: string;
  pricePerNight: string;
  capacity: string;
}

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormField, FormRoot],
  templateUrl: './hotel-detail.html',
  styleUrl:    './hotel-detail.css',
})
export class HotelDetailComponent implements OnInit {
  private hotelsService = inject(HotelsService);
  private router        = inject(Router);
  private route         = inject(ActivatedRoute);
  private http          = inject(HttpClient);

  // ─── UI State ──────────────────────────────────────────────────────────────
  hotel          = signal<any>(null);
  loading        = signal(true);
  saving         = signal(false);
  editMode       = signal(false);
  activeTab      = signal<'overview' | 'gallery' | 'amenities' | 'location' | 'pricing'>('overview');
  uploadingImages = signal(false);
  aiGenerating   = signal(false);

  readonly TABS = [
    { key: 'overview',  label: 'Overview'  },
    { key: 'gallery',   label: 'Gallery'   },
    { key: 'amenities', label: 'Amenities' },
    { key: 'location',  label: 'Location'  },
    { key: 'pricing',   label: 'Pricing'   },
  ] as const;

  AMENITIES_LIST: string[] = [];
  CITIES: string[]         = [];
  REGIONS: string[]        = [];
  ROOM_TYPES               = ['single', 'double', 'suite', 'family'];

  selectedAmenities = new Set<string>();
  selectedImages: string[]  = [];
  selectedStars             = 4;
  hotelId                   = '';

  readonly CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/docv0n0wp/image/upload';
  readonly CLOUDINARY_PRESET     = 'rahal_preset';

  // ─── Stats State ───────────────────────────────────────────────────────────
  bookings     = signal<any[]>([]);
  loadingStats = signal(false);
  statsRange   = signal<'7' | '30' | '90'>('30');

  // ─── Signal Form Models ────────────────────────────────────────────────────
  basicModel = signal<BasicModel>({
    nameEn:        '',
    nameAr:        '',
    type:          '',
    descriptionEn: '',
    descriptionAr: '',
  });

  locationModel = signal<LocationModel>({
    city:      '',
    region:    '',
    addressEn: '',
    addressAr: '',
    lng:       '',
    lat:       '',
  });

  // Rooms as array of signals (one per room)
  roomModels = signal<ReturnType<typeof signal<RoomModel>>[]>([]);

  currency = signal('EGP');

  // ─── Signal Forms (Official API) ───────────────────────────────────────────
  basicForm = form(
    this.basicModel,
    (d) => {
      required(d.nameEn,        { message: 'Property name is required.' });
      required(d.type,          { message: 'Property type is required.' });
      required(d.descriptionEn, { message: 'Description is required.'   });
    },
  );

  locationForm = form(
    this.locationModel,
    (d) => {
      required(d.city, { message: 'City is required.' });
    },
  );

  // ─── Constructor ───────────────────────────────────────────────────────────
  constructor() {
    this.hotelsService
      .getMeta()
      .pipe(takeUntilDestroyed())
      .subscribe((meta) => {
        this.CITIES         = meta.cities    || [];
        this.AMENITIES_LIST = meta.amenities || [];
        this.REGIONS        = meta.regions   || [];
      });
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.hotelId) { this.router.navigate(['/dashboard/hotels']); return; }
    this.loadHotel();
    this.loadStats();
  }

  // ─── Data ──────────────────────────────────────────────────────────────────
  loadHotel(): void {
    this.loading.set(true);
    this.hotelsService.getHotelById(this.hotelId).subscribe({
      next: (res) => {
        const h = (res as any).data ?? res;
        this.hotel.set(h);
        this.patchForms(h);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard/hotels']);
      },
    });
  }

  private patchForms(h: any): void {
    // Basic Signal Model
    this.basicModel.set({
      nameEn:        h.name?.en        ?? h.nameEn        ?? '',
      nameAr:        h.name?.ar        ?? h.nameAr        ?? '',
      type:          h.type            ?? '',
      descriptionEn: h.description?.en ?? h.descriptionEn ?? '',
      descriptionAr: h.description?.ar ?? h.descriptionAr ?? '',
    });

    // Location Signal Model
    this.locationModel.set({
      city:      h.city              ?? '',
      region:    h.region            ?? '',
      addressEn: h.address?.en       ?? '',
      addressAr: h.address?.ar       ?? '',
      lng:       h.location?.coordinates?.[0]?.toString() ?? '',
      lat:       h.location?.coordinates?.[1]?.toString() ?? '',
    });

    // Stars
    this.selectedStars = h.stars ?? 4;

    // Amenities
    this.selectedAmenities = new Set<string>(h.amenities ?? []);

    // Images
    this.selectedImages = [...(h.images ?? [])];

    // Currency
    this.currency.set(h.currency ?? 'EGP');

    // Rooms — array of individual signals
    const roomsData: any[] = h.rooms?.length
      ? h.rooms
      : [
          { type: 'single', pricePerNight: 800,  capacity: 1 },
          { type: 'double', pricePerNight: 1400, capacity: 2 },
          { type: 'suite',  pricePerNight: 3500, capacity: 2 },
          { type: 'family', pricePerNight: 1100, capacity: 4 },
        ];

    this.roomModels.set(
      roomsData.map((r) =>
        signal<RoomModel>({
          type:          r.type,
          pricePerNight: r.pricePerNight?.toString() ?? '0',
          capacity:      r.capacity?.toString()      ?? '1',
        })
      )
    );
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────
  loadStats(): void {
    this.loadingStats.set(true);
    this.hotelsService.getAllBookings({ limit: 200 }).subscribe({
      next: (res) => {
        const all = (res as any).data ?? [];
        const filtered = all.filter(
          (b: any) => (b.hotel?._id ?? b.hotel) === this.hotelId
        );
        this.bookings.set(filtered);
        this.loadingStats.set(false);
      },
      error: () => this.loadingStats.set(false),
    });
  }

  setStatsRange(r: '7' | '30' | '90'): void { this.statsRange.set(r); }

  filteredBookings = computed(() => {
    const days   = +this.statsRange();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this.bookings().filter((b) => new Date(b.createdAt) >= cutoff);
  });

  totalRevenue = computed(() =>
    this.filteredBookings()
      .filter((b) => b.paymentStatus === 'succeeded')
      .reduce((s, b) => s + (b.totalPrice ?? 0), 0)
  );

  occupancyRate = computed(() => {
    const total = this.filteredBookings().length;
    if (!total) return 0;
    const confirmed = this.filteredBookings().filter(
      (b) => b.status === 'confirmed' || b.status === 'completed'
    ).length;
    return Math.round((confirmed / total) * 100);
  });

  avgPerBooking = computed(() => {
    const paid = this.filteredBookings().filter((b) => b.paymentStatus === 'succeeded');
    if (!paid.length) return 0;
    return Math.round(paid.reduce((s, b) => s + b.totalPrice, 0) / paid.length);
  });

  totalBookings    = computed(() => this.filteredBookings().length);
  confirmedCount   = computed(() => this.filteredBookings().filter((b) => b.status === 'confirmed' || b.status === 'completed').length);
  canceledCount    = computed(() => this.filteredBookings().filter((b) => b.status === 'canceled').length);
  pendingCount     = computed(() => this.filteredBookings().filter((b) => b.status === 'pending').length);

  dailyRevenueChart = computed(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString('en', { weekday: 'short' });
      const value = this.bookings()
        .filter((b) => {
          const bd = new Date(b.createdAt);
          return b.paymentStatus === 'succeeded' && bd.toDateString() === d.toDateString();
        })
        .reduce((s, b) => s + b.totalPrice, 0);
      return { label, value };
    });
  });

  maxChartValue = computed(() =>
    Math.max(...this.dailyRevenueChart().map((d) => d.value), 1)
  );

  // ─── Room Helpers ──────────────────────────────────────────────────────────
  getRoomValue(idx: number): RoomModel {
    return this.roomModels()[idx]();
  }

  updateRoom(idx: number, field: keyof RoomModel, value: string): void {
    const s = this.roomModels()[idx];
    s.set({ ...s(), [field]: value });
  }

  // ─── Amenities / Stars ─────────────────────────────────────────────────────
  toggleAmenity(a: string): void {
    this.selectedAmenities.has(a)
      ? this.selectedAmenities.delete(a)
      : this.selectedAmenities.add(a);
  }

  setStars(n: number): void { this.selectedStars = n; }

  // ─── Edit Mode ─────────────────────────────────────────────────────────────
  enterEdit(): void  { this.editMode.set(true); this.activeTab.set('overview'); }
  cancelEdit(): void {
    const h = this.hotel();
    if (h) this.patchForms(h);
    this.editMode.set(false);
  }

  // ─── AI Generate ───────────────────────────────────────────────────────────
  generateWithAI(): void {
    const name = this.basicModel().nameEn;
    if (!name) return;
    this.aiGenerating.set(true);
    setTimeout(() => {
      this.basicModel.update((m) => ({
        ...m,
        descriptionEn: `${name} offers a premium hospitality experience combining comfort, luxury, and world-class service in Egypt.`,
      }));
      this.aiGenerating.set(false);
    }, 1200);
  }

  // ─── Image Upload ──────────────────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadFiles(Array.from(input.files));
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    if (!event.dataTransfer?.files.length) return;
    this.uploadFiles(Array.from(event.dataTransfer.files));
  }

  private uploadFiles(files: File[]): void {
    this.uploadingImages.set(true);
    const uploads = files.map((file) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', this.CLOUDINARY_PRESET);
      return this.http.post<any>(this.CLOUDINARY_UPLOAD_URL, fd);
    });
    forkJoin(uploads).subscribe({
      next:  (results) => { results.forEach((r) => { if (r?.secure_url) this.selectedImages.push(r.secure_url); }); this.uploadingImages.set(false); },
      error: () => this.uploadingImages.set(false),
    });
  }

  removeImage(idx: number): void { this.selectedImages.splice(idx, 1); }

  // ─── Save ──────────────────────────────────────────────────────────────────
  saveChanges(): void {
    // manual validity check (Signal Forms validation)
    const bv = this.basicModel();
    if (!bv.nameEn.trim() || !bv.type || !bv.descriptionEn.trim()) {
      this.activeTab.set('overview');
      alert('من فضلك اكمل بيانات الفندق الأساسية أولاً');
      return;
    }
    const lv = this.locationModel();
    if (!lv.city) {
      this.activeTab.set('location');
      alert('من فضلك اختار المدينة');
      return;
    }

    this.saving.set(true);

    const rooms = this.roomModels().map((s) => ({
      type:          s().type,
      pricePerNight: +s().pricePerNight,
      capacity:      +s().capacity,
    }));

    const avgPrice = rooms.length
      ? rooms.reduce((sum, r) => sum + r.pricePerNight, 0) / rooms.length
      : 0;

    const dto: any = {
      name:        { en: bv.nameEn, ar: bv.nameAr || bv.nameEn },
      description: { en: bv.descriptionEn, ar: bv.descriptionAr || bv.descriptionEn },
      type:        bv.type,
      city:        lv.city,
      region:      lv.region,
      address:     { en: lv.addressEn, ar: lv.addressAr },
      stars:       this.selectedStars,
      amenities:   Array.from(this.selectedAmenities),
      rooms,
      averagePricePerNight: Math.round(avgPrice),
      currency:    this.currency(),
      images:      this.selectedImages,
      coverImage:  this.selectedImages[0] ?? null,
      ...(lv.lng && lv.lat
        ? { location: { type: 'Point', coordinates: [+lv.lng, +lv.lat] } }
        : {}),
    };

    this.hotelsService.updateHotel(this.hotelId, dto).subscribe({
      next: (res) => {
        const h = (res as any).data ?? res;
        this.hotel.set(h);
        this.saving.set(false);
        this.editMode.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  // ─── Navigation ────────────────────────────────────────────────────────────
  back(): void { this.router.navigate(['/dashboard/hotels']); }

  viewLive(): void {
    const h = this.hotel();
    if (h?._id) window.open(`/hotels/${h._id}`, '_blank');
  }

  toggleActive(): void {
    const h = this.hotel();
    if (!h) return;
    this.hotelsService.updateHotel(this.hotelId, { isActive: !h.isActive } as any).subscribe({
      next: (res) => { this.hotel.set((res as any).data ?? res); },
    });
  }

  // ─── Utils ─────────────────────────────────────────────────────────────────
  starsArray(n: number) { return Array(n).fill(0); }
  emptyStars(n: number) { return Array(5 - n).fill(0); }
}