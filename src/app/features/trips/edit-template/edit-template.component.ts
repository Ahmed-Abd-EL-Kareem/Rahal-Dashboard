import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TripService } from '../../../core/services/trip.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';

@Component({
  selector: 'app-edit-template',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-template.component.html',
  styleUrl: './edit-template.component.scss'
})
export class EditTemplateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);
  private cloudinaryService = inject(CloudinaryService);

  templateForm: FormGroup;
  uploadingImage = signal<boolean>(false);
  templateId = signal<string>('');

  // Toast state
  toastMessage = signal<string | null>(null);
  toastIsError = signal<boolean>(false);

  constructor() {
    this.templateForm = this.fb.group({
      title: ['', [Validators.required]],           
      destination: ['', [Validators.required]],
      duration: [7, [Validators.required, Validators.min(1), Validators.max(90)]],
      budget: ['mid-range', [Validators.required]],
      estimatedTotalCost: [1000, [Validators.required, Validators.min(0)]],
      travelers: [1, [Validators.required, Validators.min(1)]],
      status: ['draft', Validators.required],
      interestsInput: ['', [Validators.required]],
      language: ['en', [Validators.required]],
      imageUrl: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.templateId.set(id);
      this.tripService.getTripDetails(id).subscribe({
        next: (template) => {
          if (template) {
            this.templateForm.patchValue({
              title: template.title,
              destination: template.destination,
              duration: template.duration,
              budget: template.budget,
              estimatedTotalCost: template.estimatedTotalCost,
              travelers: template.travelers,
              status: template.status,
              interestsInput: template.interests ? template.interests.join(', ') : '',
              language: template.language || 'en',
              imageUrl: template.imageUrl
            });
          }
        },
        error: (err) => {
          console.error(err);
          this.showToast('Failed to load template details', true);
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
          this.templateForm.patchValue({ imageUrl: cloudinaryUrl });
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

  submitTemplate(): void {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      return;
    }

    const val = this.templateForm.value;
    const interestsArray = val.interestsInput
      ? val.interestsInput.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : [];

    const updatedTemplateData = {
      title: val.title,   
      destination: val.destination,
      duration: val.duration,
      budget: val.budget,
      estimatedTotalCost: val.estimatedTotalCost,
      travelers: val.travelers,
      status: val.status,
      interests: interestsArray,
      language: val.language,
      imageUrl: val.imageUrl
    };

    this.tripService.updateTripDetails(this.templateId(), updatedTemplateData).subscribe({
      next: () => {
        this.showToast('Template updated successfully');
        setTimeout(() => {
          this.goBack();
        }, 1500);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Failed to update template', true);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/trip-templates']);
  }

  showToast(message: string, isError = false): void {
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
