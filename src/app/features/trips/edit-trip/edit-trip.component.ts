import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TripService } from '../../../core/services/trip.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import {
  TRIP_CATEGORY_OPTIONS,
  createInterestsFormFields,
  getInterestsFromForm,
  patchInterestsForm,
} from '../../../core/utils/trip-interests-form.util';

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-trip.component.html',
  styleUrl: './edit-trip.component.scss'
})
export class EditTripComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);
  private cloudinaryService = inject(CloudinaryService);

  createForm: FormGroup;
  uploadingImage = signal<boolean>(false);
  tripId = signal<string>('');

  // Toast state
  toastMessage = signal<string | null>(null);
  toastIsError = signal<boolean>(false);

  readonly categoryOptions = TRIP_CATEGORY_OPTIONS;

  constructor() {
    const interestsFields = createInterestsFormFields();

    this.createForm = this.fb.group({
      title: ['', [Validators.required]],  
      destination: ['', [Validators.required]],
      duration: [7, [Validators.required, Validators.min(1)]],
      budget: ['mid-range', [Validators.required]],
      estimatedTotalCost: [1000, [Validators.required, Validators.min(0)]],
      travelers: [1, [Validators.required, Validators.min(1)]],
      category: [interestsFields.category],
      otherInterest: [interestsFields.otherInterest],
      language: ['en', [Validators.required]],
      imageUrl: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tripId.set(id);
      this.tripService.getTripDetails(id).subscribe({
        next: (trip) => {
          if (trip) {
            this.createForm.patchValue({
              title: trip.title,
              destination: trip.destination,
              duration: trip.duration,
              budget: trip.budget,
              estimatedTotalCost: trip.estimatedTotalCost,
              travelers: trip.travelers,
              language: trip.language || 'en',
              imageUrl: trip.imageUrl
            });
            patchInterestsForm(this.createForm, trip.interests);
          }
        },
        error: (err) => {
          console.error(err);
          this.showToast('Failed to load trip details', true);
        }
      });
    } else {
      this.goBack();
    }
  }

  // ── Cloudinary Image Upload ────────────────────────────────
  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.uploadingImage.set(true);
      
      this.cloudinaryService.uploadImage(file).subscribe({
        next: (cloudinaryUrl) => {
          this.createForm.patchValue({ imageUrl: cloudinaryUrl });
          this.uploadingImage.set(false);
          this.showToast('Cover image updated successfully');
        },
        error: (err) => {
          console.error('Error uploading cover image to Cloudinary', err);
          this.uploadingImage.set(false);
          this.showToast('Failed to upload cover image', true);
        }
      });
    }
  }

  submitTrip(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const val = this.createForm.value;
    const interestsArray = getInterestsFromForm(val);

    const updatedTripData = {
      title: val.title,
      destination: val.destination,
      duration: val.duration,
      budget: val.budget,
      estimatedTotalCost: val.estimatedTotalCost,
      travelers: val.travelers,
      interests: interestsArray,
      language: val.language,
      imageUrl: val.imageUrl
    };

    this.tripService.updateTripDetails(this.tripId(), updatedTripData).subscribe({
      next: () => {
        this.showToast('Trip updated successfully');
        setTimeout(() => {
          this.goBack();
        }, 1500);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Failed to update trip', true);
      }
    });
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
