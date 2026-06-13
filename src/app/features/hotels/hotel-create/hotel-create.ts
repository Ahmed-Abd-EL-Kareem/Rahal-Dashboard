// // import { Component, inject, signal } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { RouterModule, Router } from '@angular/router';
// // import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
// // import { HotelsService } from '../shared/hotels';

// // @Component({
// //   selector: 'app-hotel-create',
// //   standalone: true,
// //   imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
// //   templateUrl: './hotel-create.html',
// //   styleUrl: './hotel-create.css',
// // })
// // export class HotelCreateComponent {
// //   private fb = inject(FormBuilder);
// //   private hotelsService = inject(HotelsService);
// //   private router = inject(Router);

// //   currentStep = signal(1);
// //   saving = signal(false);
// //   aiGenerating = signal(false);

// //   readonly STEPS = [
// //     { n: 1, label: 'Basic Info' },
// //     { n: 2, label: 'Gallery' },
// //     { n: 3, label: 'Amenities' },
// //     { n: 4, label: 'Location' },
// //     { n: 5, label: 'Pricing & Inventory' },
// //   ];

// //   // readonly AMENITIES_LIST = [
// //   //   'Free WiFi', 'Swimming Pool', 'Gym', 'Spa', 'Restaurant', 'Bar',
// //   //   'Room Service', 'Parking', 'Airport Shuttle', 'Business Center',
// //   //   'Kids Club', 'Beach Access', 'Concierge', 'Laundry Service',
// //   //   'Tennis Court', '24/7 Reception',
// //   // ];

// //   // readonly CITIES = ['Cairo', 'Sharm El-Sheikh', 'Luxor', 'Hurghada', 'Alexandria', 'Aswan', 'Dahab'];
// //   // readonly REGIONS = ['Upper Egypt','Lower Egypt','Sinai','Red Sea','Western Desert','Delta','Mediterranean'];
// //   AMENITIES_LIST: string[] = [];
// // CITIES: string[] = [];
// // REGIONS: string[] = [];

// //   selectedAmenities = new Set<string>();
// //   selectedImages: string[] = [];
// //   selectedStars = 4;
// // constructor() {
// //   this.hotelsService.getMeta().subscribe(meta => {
// //     this.CITIES         = meta.cities;
// //     this.AMENITIES_LIST = meta.amenities;
// //   });
// // }
// //   basicForm: FormGroup = this.fb.group({
// //     nameEn:      ['', Validators.required],
// //     nameAr:      [''],
// //     type:        ['', Validators.required],
// //     descriptionEn: ['', Validators.required],
// //     descriptionAr: [''],
// //   });

// //   locationForm: FormGroup = this.fb.group({
// //     city:    ['', Validators.required],
// //     region:  [''],
// //     addressEn: [''],
// //     addressAr: [''],
// //     lng: [null],
// //     lat: [null],
// //   });

// //   roomsForm: FormGroup = this.fb.group({
// //     currency: ['EGP'],
// //     rooms: this.fb.array([
// //       this.buildRoom('single', 800, 1),
// //       this.buildRoom('double', 1400, 2),
// //       this.buildRoom('suite',  3500, 2),
// //       this.buildRoom('family', 1100, 4),
// //     ]),
// //   });

// //   get rooms(): FormArray { return this.roomsForm.get('rooms') as FormArray; }
// //   buildRoom(type: string, price: number, cap: number) {
// //     return this.fb.group({ type, pricePerNight: [price, [Validators.required, Validators.min(0)]], capacity: [cap] });
// //   }

// //   progress() { return ((this.currentStep() - 1) / 4) * 100; }

// //   goStep(n: number) {
// //     if (n < 1 || n > 5) return;
// //     this.currentStep.set(n);
// //   }

// //   toggleAmenity(a: string) {
// //     if (this.selectedAmenities.has(a)) this.selectedAmenities.delete(a);
// //     else this.selectedAmenities.add(a);
// //   }

// //   setStars(n: number) { this.selectedStars = n; }

// //   generateWithAI() {
// //     if (!this.basicForm.value.nameEn) return;
// //     this.aiGenerating.set(true);
// //     setTimeout(() => {
// //       this.basicForm.patchValue({
// //         descriptionEn: `${this.basicForm.value.nameEn} offers an unparalleled luxury experience combining world-class amenities with authentic Egyptian hospitality. Nestled in the heart of the destination, guests enjoy stunning views, exquisite dining, and personalized service that creates lasting memories.`,
// //       });
// //       this.aiGenerating.set(false);
// //     }, 1200);
// //   }

// //   saveDraft() { this.publishHotel(false); }

// //   publishHotel(publish = true) {
// //     this.saving.set(true);
// //     const v = this.basicForm.value;
// //     const lv = this.locationForm.value;
// //     const rv = this.roomsForm.value;
// //     const rooms = rv.rooms.map((r: any) => ({ type: r.type, pricePerNight: +r.pricePerNight, capacity: +r.capacity }));
// //     const avgPrice = rooms.reduce((s: number, r: any) => s + r.pricePerNight, 0) / rooms.length;

// //     const dto: any = {
// //       name:        { en: v.nameEn, ar: v.nameAr || v.nameEn },
// //       description: { en: v.descriptionEn, ar: v.descriptionAr || v.descriptionEn },
// //       city:        lv.city,
// //       address:     { en: lv.addressEn, ar: lv.addressAr },
// //       stars:       this.selectedStars,
// //       amenities:   Array.from(this.selectedAmenities),
// //       rooms,
// //       averagePricePerNight: Math.round(avgPrice),
// //       currency:    rv.currency,
// //       isActive:    publish,
// //       ...(lv.lng && lv.lat ? { location: { type: 'Point', coordinates: [+lv.lng, +lv.lat] } } : {}),
// //     };

// //     this.hotelsService.createHotel(dto).subscribe({
// //       next: () => { this.saving.set(false); this.router.navigate(['/dashboard/hotels']); },
// //       error: () => this.saving.set(false),
// //     });
// //   }

// //   back() { this.router.navigate(['/dashboard/hotels']); }

// //   starsArray(n: number) { return Array(n).fill(0); }
// //   emptyStars(n: number) { return Array(5 - n).fill(0); }
// // }
// import { Component, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { HotelsService } from '../shared/hotels';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { forkJoin } from 'rxjs';

// @Component({
//   selector: 'app-hotel-create',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
//   templateUrl: './hotel-create.html',
//   styleUrl: './hotel-create.css',
// })
// export class HotelCreateComponent {
//   private fb = inject(FormBuilder);
//   private hotelsService = inject(HotelsService);
//   private router = inject(Router);
//   private http = inject(HttpClient);

//   currentStep = signal(1);
//   saving = signal(false);
//   aiGenerating = signal(false);
//   uploadingImages = signal(false);

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

//   // readonly CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dwskdl1qy/image/upload';
//   // readonly CLOUDINARY_PRESET = 'rahal_preset';
//   readonly CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/docv0n0wp/image/upload';
// readonly CLOUDINARY_PRESET = 'rahal_preset';
//   constructor() {
//     this.hotelsService.getMeta()
//       .pipe(takeUntilDestroyed())
//       .subscribe(meta => {
//         this.CITIES = meta.cities || [];
//         this.AMENITIES_LIST = meta.amenities || [];
//         this.REGIONS = meta.regions || [];
//       });
//   }

//   basicForm: FormGroup = this.fb.group({
//     nameEn: ['', Validators.required],
//     nameAr: [''],
//     type: ['', Validators.required],
//     descriptionEn: ['', Validators.required],
//     descriptionAr: [''],
//   });

//   locationForm: FormGroup = this.fb.group({
//     city: ['', Validators.required],
//     region: [''],
//     addressEn: [''],
//     addressAr: [''],
//     lng: [null],
//     lat: [null],
//   });

//   roomsForm: FormGroup = this.fb.group({
//     currency: ['EGP'],
//     rooms: this.fb.array([
//       this.buildRoom('single', 800, 1),
//       this.buildRoom('double', 1400, 2),
//       this.buildRoom('suite', 3500, 2),
//       this.buildRoom('family', 1100, 4),
//     ]),
//   });

//   get rooms(): FormArray {
//     return this.roomsForm.get('rooms') as FormArray;
//   }

//   buildRoom(type: string, price: number, cap: number) {
//     return this.fb.group({
//       type,
//       pricePerNight: [price, [Validators.required, Validators.min(0)]],
//       capacity: [cap],
//     });
//   }
  

//   progress() {
//     return ((this.currentStep() - 1) / 4) * 100;
//   }

//   goStep(n: number) {
//     if (n < 1 || n > 5) return;
//     this.currentStep.set(n);
//   }

//   toggleAmenity(a: string) {
//     if (this.selectedAmenities.has(a)) {
//       this.selectedAmenities.delete(a);
//     } else {
//       this.selectedAmenities.add(a);
//     }
//   }

//   setStars(n: number) {
//     this.selectedStars = n;
//   }

//   generateWithAI() {
//     if (!this.basicForm.value.nameEn) return;

//     this.aiGenerating.set(true);

//     setTimeout(() => {
//       this.basicForm.patchValue({
//         descriptionEn: `${this.basicForm.value.nameEn} offers a premium hospitality experience combining comfort, luxury, and world-class service in Egypt.`,
//       });
//       this.aiGenerating.set(false);
//     }, 1200);
//   }
// onFileSelected(event: Event) {
//   console.log('onFileSelected fired');

//   const input = event.target as HTMLInputElement;

//   console.log('files:', input.files);

//   if (!input.files || input.files.length === 0) {
//     console.log('no files');
//     return;
//   }

//   this.uploadFiles(Array.from(input.files));
// }

//   onFileDropped(event: DragEvent) {
//     event.preventDefault();
//     if (!event.dataTransfer || event.dataTransfer.files.length === 0) return;
//     this.uploadFiles(Array.from(event.dataTransfer.files));
//   }

//   // private uploadFiles(files: File[]) {
//   //     console.log('CLOUD UPLOAD URL:', this.CLOUDINARY_UPLOAD_URL);
//   // console.log('PRESET:', this.CLOUDINARY_PRESET);
//   // console.log('FILES:', files);

//   //   this.uploadingImages.set(true);
//   //   const uploads = files.map(file => {
//   //     const formData = new FormData();
//   //     formData.append('file', file);
//   //     formData.append('upload_preset', this.CLOUDINARY_PRESET);
//   //     return this.http.post<any>(this.CLOUDINARY_UPLOAD_URL, formData);
//   //   });
//   private uploadFiles(files: File[]) {
//   console.log('uploadFiles called');

//   this.uploadingImages.set(true);

//   const uploads = files.map(file => {
//     console.log('creating request for', file.name);

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('upload_preset', this.CLOUDINARY_PRESET);

//     return this.http.post<any>(
//       this.CLOUDINARY_UPLOAD_URL,
//       formData
//     );
//   });

//   forkJoin(uploads).subscribe({
//     next: (results) => {
//       console.log('SUCCESS', results);

//       results.forEach(res => {
//         if (res?.secure_url) {
//           this.selectedImages.push(res.secure_url);
//         }
//       });

//       this.uploadingImages.set(false);
//     },
//     error: (err) => {
//       console.error('CLOUDINARY ERROR', err);
//       this.uploadingImages.set(false);
//     }
//   });
// }
// //     forkJoin(uploads).subscribe({
// //       next: (results) => {
// //         results.forEach(res => {
// //           if (res && res.secure_url) {
// //             this.selectedImages.push(res.secure_url);
// //           }
// //         });
// //         this.uploadingImages.set(false);
// //       },
// //       error: (err) => {
// //   console.log('FULL CLOUDINARY ERROR:', err);
// //   console.log('STATUS:', err.status);
// //   console.log('MESSAGE:', err.error);
// //   this.uploadingImages.set(false);
// //   alert('Upload failed');
// // }
       
// //     });
// //   }

//   removeImage(index: number) {
//     this.selectedImages.splice(index, 1);
//   }

//   saveDraft() {
//     this.publishHotel(false);
//   }

//  publishHotel(publish = true) {
//   if (!this.basicForm.valid) {
//     this.goStep(1);
//     alert('من فضلك اكمل بيانات الفندق الأساسية أولاً');
//     return;
//   }

//   this.saving.set(true);

//     const v = this.basicForm.value;
//     const lv = this.locationForm.value;
//     const rv = this.roomsForm.value;

//     const rooms = rv.rooms.map((r: any) => ({
//       type: r.type,
//       pricePerNight: +r.pricePerNight,
//       capacity: +r.capacity,
//     }));

//     const avgPrice = rooms.length
//       ? rooms.reduce((s: number, r: any) => s + r.pricePerNight, 0) / rooms.length
//       : 0;

//     const dto: any = {
//       name: { en: v.nameEn, ar: v.nameAr || v.nameEn },
// description: { en: v.descriptionEn || '', ar: v.descriptionAr || v.descriptionEn || '' },
//       city: lv.city,
//       region: lv.region,
//       address: { en: lv.addressEn, ar: lv.addressAr },
//       stars: this.selectedStars,
//       amenities: Array.from(this.selectedAmenities),
//       rooms,
//       averagePricePerNight: Math.round(avgPrice),
//       currency: rv.currency,
//       isActive: publish,
//       images: this.selectedImages,
//       coverImage: this.selectedImages.length > 0 ? this.selectedImages[0] : null,
//       ...(lv.lng && lv.lat
//         ? { location: { type: 'Point', coordinates: [+lv.lng, +lv.lat] } }
//         : {}),
//     };

//     this.hotelsService.createHotel(dto).subscribe({
//       next: () => {
//         this.saving.set(false);
//         this.router.navigate(['/dashboard/hotels']);
//       },
//       error: () => this.saving.set(false),
//     });
//   }

//   back() {
//     this.router.navigate(['/dashboard/hotels']);
//   }

//   starsArray(n: number) {
//     return Array(n).fill(0);
//   }

//   emptyStars(n: number) {
//     return Array(5 - n).fill(0);
//   }
// }

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HotelsService } from '../shared/hotels';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hotel-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './hotel-create.html',
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

  // ─── Signal-based Forms ────────────────────────────────────────────────────

  basicForm = new FormGroup({
    nameEn:        new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nameAr:        new FormControl('', { nonNullable: true }),
    type:          new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descriptionEn: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descriptionAr: new FormControl('', { nonNullable: true }),
  });

  locationForm = new FormGroup({
    city:      new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    region:    new FormControl('', { nonNullable: true }),
    addressEn: new FormControl('', { nonNullable: true }),
    addressAr: new FormControl('', { nonNullable: true }),
    lng:       new FormControl<number | null>(null),
    lat:       new FormControl<number | null>(null),
  });

  roomsForm = new FormGroup({
    currency: new FormControl('EGP', { nonNullable: true }),
    rooms: new FormArray([
      this.buildRoom('single', 800,  1),
      this.buildRoom('double', 1400, 2),
      this.buildRoom('suite',  3500, 2),
      this.buildRoom('family', 1100, 4),
    ]),
  });

  // ─── Getters ───────────────────────────────────────────────────────────────

  get rooms(): FormArray { return this.roomsForm.controls.rooms; }

  // قراءة قيم الفورم كـ signals
  get basicValue()    { return this.basicForm.value; }
  get locationValue() { return this.locationForm.value; }
  get roomsValue()    { return this.roomsForm.value; }

  // ─── Constructor ───────────────────────────────────────────────────────────

  constructor() {
    this.hotelsService.getMeta()
      .pipe(takeUntilDestroyed())
      .subscribe(meta => {
        this.CITIES         = meta.cities    || [];
        this.AMENITIES_LIST = meta.amenities || [];
        this.REGIONS        = meta.regions   || [];
      });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  buildRoom(type: string, price: number, cap: number) {
    return new FormGroup({
      type:          new FormControl(type,  { nonNullable: true }),
      pricePerNight: new FormControl(price, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
      capacity:      new FormControl(cap,   { nonNullable: true }),
    });
  }

  progress() { return ((this.currentStep() - 1) / 4) * 100; }

  goStep(n: number) {
    if (n < 1 || n > 5) return;
    this.currentStep.set(n);
  }

  toggleAmenity(a: string) {
    this.selectedAmenities.has(a)
      ? this.selectedAmenities.delete(a)
      : this.selectedAmenities.add(a);
  }

  setStars(n: number) { this.selectedStars = n; }

  // ─── AI Generate ───────────────────────────────────────────────────────────

  generateWithAI() {
    if (!this.basicForm.controls.nameEn.value) return;
    this.aiGenerating.set(true);
    setTimeout(() => {
      this.basicForm.controls.descriptionEn.setValue(
        `${this.basicForm.controls.nameEn.value} offers a premium hospitality experience combining comfort, luxury, and world-class service in Egypt.`
      );
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
    const uploads = files.map(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.CLOUDINARY_PRESET);
      return this.http.post<any>(this.CLOUDINARY_UPLOAD_URL, formData);
    });

    forkJoin(uploads).subscribe({
      next: (results) => {
        results.forEach(res => {
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

  removeImage(index: number) { this.selectedImages.splice(index, 1); }

  // ─── Save / Publish ────────────────────────────────────────────────────────

  saveDraft() { this.publishHotel(false); }

  publishHotel(publish = true) {
    if (!this.basicForm.valid) {
      this.goStep(1);
      alert('من فضلك اكمل بيانات الفندق الأساسية أولاً');
      return;
    }

    this.saving.set(true);

    // قراءة القيم مباشرة من controls (nonNullable → no undefined)
    const v  = this.basicForm.getRawValue();
    const lv = this.locationForm.getRawValue();
    const rv = this.roomsForm.getRawValue();

    const rooms = rv.rooms.map(r => ({
      type:          r.type,
      pricePerNight: +r.pricePerNight,
      capacity:      +r.capacity,
    }));

    const avgPrice = rooms.length
      ? rooms.reduce((s, r) => s + r.pricePerNight, 0) / rooms.length
      : 0;

    const dto: any = {
      name:        { en: v.nameEn, ar: v.nameAr || v.nameEn },
      description: { en: v.descriptionEn, ar: v.descriptionAr || v.descriptionEn },
      city:        lv.city,
      region:      lv.region,
      address:     { en: lv.addressEn, ar: lv.addressAr },
      stars:       this.selectedStars,
      amenities:   Array.from(this.selectedAmenities),
      rooms,
      averagePricePerNight: Math.round(avgPrice),
      currency:    rv.currency,
      isActive:    publish,
      images:      this.selectedImages,
      coverImage:  this.selectedImages[0] ?? null,
      ...(lv.lng && lv.lat
        ? { location: { type: 'Point', coordinates: [+lv.lng, +lv.lat] } }
        : {}),
    };

    this.hotelsService.createHotel(dto).subscribe({
      next:  () => { this.saving.set(false); this.router.navigate(['/dashboard/hotels']); },
      error: ()  => this.saving.set(false),
    });
  }

  back() { this.router.navigate(['/dashboard/hotels']); }

  starsArray(n: number)  { return Array(n).fill(0); }
  emptyStars(n: number)  { return Array(5 - n).fill(0); }
}