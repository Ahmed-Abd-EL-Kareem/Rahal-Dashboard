
// import {
//   Component,
//   inject,
//   signal,
//   computed,
//   OnInit,
//   ChangeDetectionStrategy,
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router, ActivatedRoute } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { HotelsService } from '../shared/hotels';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { forkJoin } from 'rxjs';
// import { email, form, FormField, minLength, required, FormRoot } from '@angular/forms/signals';

// // ─── Sub-model signals ────────────────────────────────────────────────────────

// interface BasicModel {
//   nameEn: string;
//   nameAr: string;
//   type: string;
//   descriptionEn: string;
//   descriptionAr: string;
// }

// interface LocationModel {
//   city: string;
//   region: string;
//   addressEn: string;
//   addressAr: string;
//   lng: string;
//   lat: string;
// }

// interface RoomModel {
//   type: string;
//   pricePerNight: string;
//   capacity: string;
// }

// @Component({
//   selector: 'app-hotel-detail',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormField, FormRoot],
//   templateUrl: './hotel-detail.html',
//   changeDetection: ChangeDetectionStrategy.Eager,
//   styleUrl: './hotel-detail.css',
// })
// export class HotelDetailComponent implements OnInit {
//   private hotelsService = inject(HotelsService);
//   private router = inject(Router);
//   private route = inject(ActivatedRoute);
//   private http = inject(HttpClient);

//   // ─── UI State ──────────────────────────────────────────────────────────────
//   hotel = signal<any>(null);
//   loading = signal(true);
//   saving = signal(false);
//   editMode = signal(false);
//   activeTab = signal<'overview' | 'gallery' | 'amenities' | 'location' | 'pricing'>('overview');
//   uploadingImages = signal(false);
//   aiGenerating = signal(false);

//   readonly TABS = [
//     { key: 'overview', label: 'Overview' },
//     { key: 'gallery', label: 'Gallery' },
//     { key: 'amenities', label: 'Amenities' },
//     { key: 'location', label: 'Location' },
//     { key: 'pricing', label: 'Pricing' },
//   ] as const;

//   AMENITIES_LIST: string[] = [];
//   CITIES: string[] = [];
//   REGIONS: string[] = [];
//   ROOM_TYPES = ['single', 'double', 'suite', 'family'];

//   selectedAmenities = new Set<string>();
//   selectedImages: string[] = [];
//   selectedStars = 4;
//   hotelId = '';

//   readonly CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/docv0n0wp/image/upload';
//   readonly CLOUDINARY_PRESET = 'rahal_preset';

//   // ─── Stats State ───────────────────────────────────────────────────────────
//   bookings = signal<any[]>([]);
//   loadingStats = signal(false);
//   statsRange = signal<'7' | '30' | '90'>('30');

//   // ─── Signal Form Models ────────────────────────────────────────────────────
//   basicModel = signal<BasicModel>({
//     nameEn: '',
//     nameAr: '',
//     type: '',
//     descriptionEn: '',
//     descriptionAr: '',
//   });

//   locationModel = signal<LocationModel>({
//     city: '',
//     region: '',
//     addressEn: '',
//     addressAr: '',
//     lng: '',
//     lat: '',
//   });

//   // Rooms as array of signals (one per room)
//   roomModels = signal<ReturnType<typeof signal<RoomModel>>[]>([]);

//   currency = signal('EGP');

//   // ─── Signal Forms (Official API) ───────────────────────────────────────────
//   basicForm = form(this.basicModel, (d) => {
//     required(d.nameEn, { message: 'Property name is required.' });
//     required(d.type, { message: 'Property type is required.' });
//     required(d.descriptionEn, { message: 'Description is required.' });
//   });

//   locationForm = form(this.locationModel, (d) => {
//     required(d.city, { message: 'City is required.' });
//   });
//   readonly STATS_RANGES: { v: '7' | '30' | '90'; l: string }[] = [
//   { v: '7', l: '7D' },
//   { v: '30', l: '30D' },
//   { v: '90', l: '90D' },
// ];

//   // ─── Constructor ───────────────────────────────────────────────────────────
//   constructor() {
//     this.hotelsService
//       .getMeta()
//       .pipe(takeUntilDestroyed())
//       .subscribe((meta) => {
//         this.CITIES = meta.cities || [];
//         this.AMENITIES_LIST = meta.amenities || [];
//         this.REGIONS = meta.regions || [];
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
//     this.loadStats();
//   }

//   // ─── Data ──────────────────────────────────────────────────────────────────
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
//     // Basic Signal Model
//     this.basicModel.set({
//       nameEn: h.name?.en ?? h.nameEn ?? '',
//       nameAr: h.name?.ar ?? h.nameAr ?? '',
//       type: h.type ?? '',
//       descriptionEn: h.description?.en ?? h.descriptionEn ?? '',
//       descriptionAr: h.description?.ar ?? h.descriptionAr ?? '',
//     });

//     // Location Signal Model
//     this.locationModel.set({
//       city: h.city ?? '',
//       region: h.region ?? '',
//       addressEn: h.address?.en ?? '',
//       addressAr: h.address?.ar ?? '',
//       lng: h.location?.coordinates?.[0]?.toString() ?? '',
//       lat: h.location?.coordinates?.[1]?.toString() ?? '',
//     });

//     // Stars
//     this.selectedStars = h.stars ?? 4;

//     // Amenities
//     this.selectedAmenities = new Set<string>(h.amenities ?? []);

//     // Images
//     this.selectedImages = [...(h.images ?? [])];

//     // Currency
//     this.currency.set(h.currency ?? 'EGP');

//     // Rooms — array of individual signals
//     const roomsData: any[] = h.rooms?.length
//       ? h.rooms
//       : [
//           { type: 'single', pricePerNight: 800, capacity: 1 },
//           { type: 'double', pricePerNight: 1400, capacity: 2 },
//           { type: 'suite', pricePerNight: 3500, capacity: 2 },
//           { type: 'family', pricePerNight: 1100, capacity: 4 },
//         ];

//     this.roomModels.set(
//       roomsData.map((r) =>
//         signal<RoomModel>({
//           type: r.type,
//           pricePerNight: r.pricePerNight?.toString() ?? '0',
//           capacity: r.capacity?.toString() ?? '1',
//         }),
//       ),
//     );
//   }

//   // ─── Stats ─────────────────────────────────────────────────────────────────
// loadStats(): void {
//   this.loadingStats.set(true);
//   this.hotelsService.getAllBookings({ limit: 200 }).subscribe({
//   next: (res) => {
//     console.log('RESPONSE FULL:', res);
//     console.log('res.data type:', Array.isArray((res as any).data) ? 'array' : typeof (res as any).data);

//     const all = (res as any).data ?? [];
//     console.log('كل البوكينجز:', all);
//     console.log('الـ hotelId الحالي:', this.hotelId);
//     const filtered = all.filter((b: any) => (b.hotel?._id ?? b.hotel)?.toString() === this.hotelId);
//     console.log('بعد الفلترة:', filtered);
//     this.bookings.set(filtered);
//     this.loadingStats.set(false);
//   },
//   error: () => this.loadingStats.set(false),
// });
// }

//   setStatsRange(r: '7' | '30' | '90'): void {
//     this.statsRange.set(r);
//   }

//   filteredBookings = computed(() => {
//     const days = +this.statsRange();
//     const cutoff = new Date();
//     cutoff.setDate(cutoff.getDate() - days);
//     return this.bookings().filter((b) => new Date(b.createdAt) >= cutoff);
//   });
// // totalRevenue = computed(() =>
// //   this.filteredBookings()
// //     .filter((b) => b.paymentStatus === 'succeeded' || b.paymentStatus === 'processing')
// //     .reduce((s, b) => s + (b.totalPrice ?? 0), 0),
// // );
// totalRevenue = computed(() =>
//   this.filteredBookings()
//     .filter((b) => b.paymentStatus === 'succeeded' || b.paymentStatus === 'processing')
//     .reduce((s, b) => s + (b.totalPrice ?? 0), 0),
// );

//   occupancyRate = computed(() => {
//     const total = this.filteredBookings().length;
//     if (!total) return 0;
//     const confirmed = this.filteredBookings().filter(
//       (b) => b.status === 'confirmed' || b.status === 'completed',
//     ).length;
//     return Math.round((confirmed / total) * 100);
//   });

//   // avgPerBooking = computed(() => {
//   //   const paid = this.filteredBookings().filter((b) => b.paymentStatus === 'succeeded');
//   //   if (!paid.length) return 0;
//   //   return Math.round(paid.reduce((s, b) => s + b.totalPrice, 0) / paid.length);
//   // });
//   avgPerBooking = computed(() => {
//   const paid = this.filteredBookings().filter(
//     (b) => b.paymentStatus === 'succeeded' || b.paymentStatus === 'processing'
//   );
//   if (!paid.length) return 0;
//   return Math.round(paid.reduce((s, b) => s + b.totalPrice, 0) / paid.length);
// });

//   totalBookings = computed(() => this.filteredBookings().length);
//   confirmedCount = computed(
//     () =>
//       this.filteredBookings().filter((b) => b.status === 'confirmed' || b.status === 'completed')
//         .length,
//   );
//   canceledCount = computed(
//     () => this.filteredBookings().filter((b) => b.status === 'canceled').length,
//   );
//   pendingCount = computed(
//     () => this.filteredBookings().filter((b) => b.status === 'pending').length,
//   );

//   // dailyRevenueChart = computed(() => {
//   //   return Array.from({ length: 7 }, (_, i) => {
//   //     const d = new Date();
//   //     d.setDate(d.getDate() - (6 - i));
//   //     const label = d.toLocaleDateString('en', { weekday: 'short' });
//   //     const value = this.bookings()
//   //       .filter((b) => {
//   //         const bd = new Date(b.createdAt);
//   //         return b.paymentStatus === 'succeeded' && bd.toDateString() === d.toDateString();
//   //       })
//   //       .reduce((s, b) => s + b.totalPrice, 0);
//   //     return { label, value };
//   //   });
//   // });
  
// dailyRevenueChart = computed(() => {
//   console.log('اليوم:', new Date().toDateString());
//   return Array.from({ length: 7 }, (_, i) => {
//     const d = new Date();
//     d.setDate(d.getDate() - (6 - i));
//     console.log('يوم في الشارت:', d.toDateString());
//     const label = d.toLocaleDateString('en', { weekday: 'short' });
//     const value = this.bookings()
//       .filter((b) => {
//         const bd = new Date(b.createdAt);
//         return (b.paymentStatus === 'succeeded' || b.paymentStatus === 'processing')
//           && bd.toDateString() === d.toDateString();
//       })
//       .reduce((s, b) => s + b.totalPrice, 0);
//     return { label, value };
//   });
// });

//   maxChartValue = computed(() => Math.max(...this.dailyRevenueChart().map((d) => d.value), 1));

//   // ─── Room Helpers ──────────────────────────────────────────────────────────
//   getRoomValue(idx: number): RoomModel {
//     return this.roomModels()[idx]();
//   }

//   updateRoom(idx: number, field: keyof RoomModel, value: string): void {
//     const s = this.roomModels()[idx];
//     s.set({ ...s(), [field]: value });
//   }

//   // ─── Amenities / Stars ─────────────────────────────────────────────────────
//   toggleAmenity(a: string): void {
//     this.selectedAmenities.has(a)
//       ? this.selectedAmenities.delete(a)
//       : this.selectedAmenities.add(a);
//   }

//   setStars(n: number): void {
//     this.selectedStars = n;
//   }

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
//     const name = this.basicModel().nameEn;
//     if (!name) return;
//     this.aiGenerating.set(true);
//     setTimeout(() => {
//       this.basicModel.update((m) => ({
//         ...m,
//         descriptionEn: `${name} offers a premium hospitality experience combining comfort, luxury, and world-class service in Egypt.`,
//       }));
//       this.aiGenerating.set(false);
//     }, 1200);
//   }

//   // ─── Image Upload ──────────────────────────────────────────────────────────
//   onFileSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (!input.files?.length) return;
//     this.uploadFiles(Array.from(input.files));
//   }

//   onFileDropped(event: DragEvent): void {
//     event.preventDefault();
//     if (!event.dataTransfer?.files.length) return;
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
//         results.forEach((r) => {
//           if (r?.secure_url) this.selectedImages.push(r.secure_url);
//         });
//         this.uploadingImages.set(false);
//       },
//       error: () => this.uploadingImages.set(false),
//     });
//   }

//   removeImage(idx: number): void {
//     this.selectedImages.splice(idx, 1);
//   }

//   // ─── Save ──────────────────────────────────────────────────────────────────
//   saveChanges(): void {
//     // manual validity check (Signal Forms validation)
//     const bv = this.basicModel();
//     if (!bv.nameEn.trim() || !bv.type || !bv.descriptionEn.trim()) {
//       this.activeTab.set('overview');
//       alert('من فضلك اكمل بيانات الفندق الأساسية أولاً');
//       return;
//     }
//     const lv = this.locationModel();
//     if (!lv.city) {
//       this.activeTab.set('location');
//       alert('من فضلك اختار المدينة');
//       return;
//     }

//     this.saving.set(true);

//     const rooms = this.roomModels().map((s) => ({
//       type: s().type,
//       pricePerNight: +s().pricePerNight,
//       capacity: +s().capacity,
//     }));

//     const avgPrice = rooms.length
//       ? rooms.reduce((sum, r) => sum + r.pricePerNight, 0) / rooms.length
//       : 0;

//     const dto: any = {
//       name: { en: bv.nameEn, ar: bv.nameAr || bv.nameEn },
//       description: { en: bv.descriptionEn, ar: bv.descriptionAr || bv.descriptionEn },
//       type: bv.type,
//       city: lv.city,
//       region: lv.region,
//       address: { en: lv.addressEn, ar: lv.addressAr },
//       stars: this.selectedStars,
//       amenities: Array.from(this.selectedAmenities),
//       rooms,
//       averagePricePerNight: Math.round(avgPrice),
//       currency: this.currency(),
//       images: this.selectedImages,
//       coverImage: this.selectedImages[0] ?? null,
//       ...(lv.lng && lv.lat ? { location: { type: 'Point', coordinates: [+lv.lng, +lv.lat] } } : {}),
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
//         this.hotel.set((res as any).data ?? res);
//       },
//     });
//   }

//   // ─── Utils ─────────────────────────────────────────────────────────────────
//   starsArray(n: number) {
//     return Array(n).fill(0);
//   }
//   emptyStars(n: number) {
//     return Array(5 - n).fill(0);
//   }
// }
import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HotelsService } from '../shared/hotels';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { email, form, FormField, minLength, required, FormRoot } from '@angular/forms/signals';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './hotel-detail.css',
})
export class HotelDetailComponent implements OnInit {
  private hotelsService = inject(HotelsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private location = inject(Location);

  // ─── UI State ──────────────────────────────────────────────────────────────
  hotel = signal<any>(null);
  loading = signal(true);
  saving = signal(false);
  editMode = signal(false);
  activeTab = signal<'overview' | 'gallery' | 'amenities' | 'location' | 'pricing'>('overview');
  uploadingImages = signal(false);
  aiGenerating = signal(false);

  readonly TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'amenities', label: 'Amenities' },
    { key: 'location', label: 'Location' },
    { key: 'pricing', label: 'Pricing' },
  ] as const;

  AMENITIES_LIST: string[] = [];
  CITIES: string[] = [];
  REGIONS: string[] = [];
  ROOM_TYPES = ['single', 'double', 'suite', 'family'];

  selectedAmenities = new Set<string>();
  selectedImages: string[] = [];
  selectedStars = 4;

  // The raw param from the URL (could be an id OR a slug)
  hotelParam = '';
  // The real DB id, once we know it (used for update calls)
  hotelId = '';

  readonly CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/docv0n0wp/image/upload';
  readonly CLOUDINARY_PRESET = 'rahal_preset';

  // ─── Stats State ───────────────────────────────────────────────────────────
  bookings = signal<any[]>([]);
  loadingStats = signal(false);
  statsRange = signal<'7' | '30' | '90'>('30');

  // ─── Signal Form Models ────────────────────────────────────────────────────
  basicModel = signal<BasicModel>({
    nameEn: '',
    nameAr: '',
    type: '',
    descriptionEn: '',
    descriptionAr: '',
  });

  locationModel = signal<LocationModel>({
    city: '',
    region: '',
    addressEn: '',
    addressAr: '',
    lng: '',
    lat: '',
  });

  // Rooms as array of signals (one per room)
  roomModels = signal<ReturnType<typeof signal<RoomModel>>[]>([]);

  currency = signal('EGP');

  // ─── Signal Forms (Official API) ───────────────────────────────────────────
  basicForm = form(this.basicModel, (d) => {
    required(d.nameEn, { message: 'Property name is required.' });
    required(d.type, { message: 'Property type is required.' });
    required(d.descriptionEn, { message: 'Description is required.' });
  });

  locationForm = form(this.locationModel, (d) => {
    required(d.city, { message: 'City is required.' });
  });

  readonly STATS_RANGES: { v: '7' | '30' | '90'; l: string }[] = [
    { v: '7', l: '7D' },
    { v: '30', l: '30D' },
    { v: '90', l: '90D' },
  ];

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

  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  // ngOnInit(): void {
  //   this.hotelParam = this.route.snapshot.paramMap.get('id') ?? '';
  //   if (!this.hotelParam) {
  //     this.router.navigate(['/dashboard/hotels']);
  //     return;
  //   }
  //   // Use the param as the id for the initial fetch (id or slug — backend should support both)
  //   this.hotelId = this.hotelParam;
  //   this.loadHotel();
  //   this.loadStats();
  // }
  ngOnInit(): void {
  this.hotelParam = this.route.snapshot.paramMap.get('id') ?? '';
  if (!this.hotelParam) {
    this.router.navigate(['/dashboard/hotels']);
    return;
  }
  this.hotelId = this.hotelParam;
  this.loadHotel();
  this.loadStats();

  if (this.route.snapshot.queryParamMap.get('edit') === 'true') {
    this.editMode.set(true);
    this.activeTab.set('overview');
  }
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

        // Keep the real DB id for update/save calls
        if (h._id) this.hotelId = h._id;

        // Replace the URL with the slug (without reloading the component)
        const slug = h.slug ?? this.slugify(h.name?.en ?? h.nameEn ?? '');
        if (slug && slug !== this.hotelParam) {
  this.hotelParam = slug;
  this.router.navigate(['/dashboard/hotels', slug], { replaceUrl: true });
}
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard/hotels']);
      },
    });
  }

  /** Fallback slug generator from the hotel's English name, in case backend doesn't provide one */
  private slugify(text: string): string {
    return text
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  private patchForms(h: any): void {
    // Basic Signal Model
    this.basicModel.set({
      nameEn: h.name?.en ?? h.nameEn ?? '',
      nameAr: h.name?.ar ?? h.nameAr ?? '',
      type: h.type ?? '',
      descriptionEn: h.description?.en ?? h.descriptionEn ?? '',
      descriptionAr: h.description?.ar ?? h.descriptionAr ?? '',
    });

    // Location Signal Model
    this.locationModel.set({
      city: h.city ?? '',
      region: h.region ?? '',
      addressEn: h.address?.en ?? '',
      addressAr: h.address?.ar ?? '',
      lng: h.location?.coordinates?.[0]?.toString() ?? '',
      lat: h.location?.coordinates?.[1]?.toString() ?? '',
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
          { type: 'single', pricePerNight: 800, capacity: 1 },
          { type: 'double', pricePerNight: 1400, capacity: 2 },
          { type: 'suite', pricePerNight: 3500, capacity: 2 },
          { type: 'family', pricePerNight: 1100, capacity: 4 },
        ];

    this.roomModels.set(
      roomsData.map((r) =>
        signal<RoomModel>({
          type: r.type,
          pricePerNight: r.pricePerNight?.toString() ?? '0',
          capacity: r.capacity?.toString() ?? '1',
        }),
      ),
    );
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────
  loadStats(): void {
    this.loadingStats.set(true);
    this.hotelsService.getAllBookings({ limit: 200 }).subscribe({
      next: (res) => {
        const all = (res as any).data ?? [];
        const filtered = all.filter(
          (b: any) => (b.hotel?._id ?? b.hotel)?.toString() === this.hotelId,
        );
        this.bookings.set(filtered);
        this.loadingStats.set(false);
      },
      error: () => this.loadingStats.set(false),
    });
  }

  setStatsRange(r: '7' | '30' | '90'): void {
    this.statsRange.set(r);
  }

  filteredBookings = computed(() => {
    const days = +this.statsRange();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this.bookings().filter((b) => new Date(b.createdAt) >= cutoff);
  });

  totalRevenue = computed(() =>
    this.filteredBookings()
      .filter((b) => b.paymentStatus === 'succeeded' || b.paymentStatus === 'processing')
      .reduce((s, b) => s + (b.totalPrice ?? 0), 0),
  );

  occupancyRate = computed(() => {
    const total = this.filteredBookings().length;
    if (!total) return 0;
    const confirmed = this.filteredBookings().filter(
      (b) => b.status === 'confirmed' || b.status === 'completed',
    ).length;
    return Math.round((confirmed / total) * 100);
  });

  avgPerBooking = computed(() => {
    const paid = this.filteredBookings().filter(
      (b) => b.paymentStatus === 'succeeded' || b.paymentStatus === 'processing',
    );
    if (!paid.length) return 0;
    return Math.round(paid.reduce((s, b) => s + b.totalPrice, 0) / paid.length);
  });

  totalBookings = computed(() => this.filteredBookings().length);
  confirmedCount = computed(
    () =>
      this.filteredBookings().filter((b) => b.status === 'confirmed' || b.status === 'completed')
        .length,
  );
  canceledCount = computed(
    () => this.filteredBookings().filter((b) => b.status === 'canceled').length,
  );
  pendingCount = computed(
    () => this.filteredBookings().filter((b) => b.status === 'pending').length,
  );

  dailyRevenueChart = computed(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString('en', { weekday: 'short' });
      const value = this.bookings()
        .filter((b) => {
          const bd = new Date(b.createdAt);
          return (
            (b.paymentStatus === 'succeeded' || b.paymentStatus === 'processing') &&
            bd.toDateString() === d.toDateString()
          );
        })
        .reduce((s, b) => s + b.totalPrice, 0);
      return { label, value };
    });
  });

  maxChartValue = computed(() => Math.max(...this.dailyRevenueChart().map((d) => d.value), 1));

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

  setStars(n: number): void {
    this.selectedStars = n;
  }

  // ─── Edit Mode ─────────────────────────────────────────────────────────────
  enterEdit(): void {
    this.editMode.set(true);
    this.activeTab.set('overview');
  }
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
      next: (results) => {
        results.forEach((r) => {
          if (r?.secure_url) this.selectedImages.push(r.secure_url);
        });
        this.uploadingImages.set(false);
      },
      error: () => this.uploadingImages.set(false),
    });
  }

  removeImage(idx: number): void {
    this.selectedImages.splice(idx, 1);
  }

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
      type: s().type,
      pricePerNight: +s().pricePerNight,
      capacity: +s().capacity,
    }));

    const avgPrice = rooms.length
      ? rooms.reduce((sum, r) => sum + r.pricePerNight, 0) / rooms.length
      : 0;

    const dto: any = {
      name: { en: bv.nameEn, ar: bv.nameAr || bv.nameEn },
      description: { en: bv.descriptionEn, ar: bv.descriptionAr || bv.descriptionEn },
      type: bv.type,
      city: lv.city,
      region: lv.region,
      address: { en: lv.addressEn, ar: lv.addressAr },
      stars: this.selectedStars,
      amenities: Array.from(this.selectedAmenities),
      rooms,
      averagePricePerNight: Math.round(avgPrice),
      currency: this.currency(),
      images: this.selectedImages,
      coverImage: this.selectedImages[0] ?? null,
      ...(lv.lng && lv.lat ? { location: { type: 'Point', coordinates: [+lv.lng, +lv.lat] } } : {}),
    };

    this.hotelsService.updateHotel(this.hotelId, dto).subscribe({
      next: (res) => {
        const h = (res as any).data ?? res;
        this.hotel.set(h);
        this.saving.set(false);
        this.editMode.set(false);

        // Update slug in URL in case the name (and thus slug) changed
     // Update slug in URL in case the name (and thus slug) changed
const slug = h.slug ?? this.slugify(h.name?.en ?? h.nameEn ?? '');
if (slug && slug !== this.hotelParam) {
  this.hotelParam = slug;
  this.router.navigate(['/dashboard/hotels', slug], { replaceUrl: true });
}
      },
      error: () => this.saving.set(false),
    });
  }

  // ─── Navigation ────────────────────────────────────────────────────────────
  back(): void {
    this.router.navigate(['/dashboard/hotels']);
  }

  viewLive(): void {
    const h = this.hotel();
    const slug = h?.slug ?? this.slugify(h?.name?.en ?? h?.nameEn ?? '');
    if (slug) window.open(`/hotels/${slug}`, '_blank');
  }

  toggleActive(): void {
    const h = this.hotel();
    if (!h) return;
    this.hotelsService.updateHotel(this.hotelId, { isActive: !h.isActive } as any).subscribe({
      next: (res) => {
        this.hotel.set((res as any).data ?? res);
      },
    });
  }

  // ─── Utils ─────────────────────────────────────────────────────────────────
  starsArray(n: number) {
    return Array(n).fill(0);
  }
  emptyStars(n: number) {
    return Array(5 - n).fill(0);
  }
}