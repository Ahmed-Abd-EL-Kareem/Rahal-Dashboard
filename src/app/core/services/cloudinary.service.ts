import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UploadStatus {
  secure_url: string;
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http = inject(HttpClient);

  /**
   * Uploads an image file to Cloudinary.
   * If 'cloudinary_cloud_name' and 'cloudinary_upload_preset' are set in localStorage,
   * it will attempt a real upload to Cloudinary. Otherwise, it will run a simulated
   * upload with progress updates.
   */
  uploadImage(file: File): Observable<UploadStatus> {
    const cloudName = localStorage.getItem('cloudinary_cloud_name');
    const uploadPreset = localStorage.getItem('cloudinary_upload_preset');

    if (cloudName && uploadPreset) {
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      return this.http.post<any>(url, formData, {
        reportProgress: true,
        observe: 'events'
      }).pipe(
        map((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
              return { secure_url: '', progress };
            case HttpEventType.Response:
              return { secure_url: event.body.secure_url, progress: 100 };
            default:
              return { secure_url: '', progress: 0 };
          }
        })
      );
    } else {
      // Simulated upload
      return new Observable<UploadStatus>(subscriber => {
        let progress = 0;
        subscriber.next({ secure_url: '', progress });
        
        const interval = setInterval(() => {
          progress += 20;
          if (progress >= 100) {
            clearInterval(interval);
            // Create a mock secure URL using a public image provider
            // We use standard Unsplash/UI Faces URLs to make it look premium
            const randomSeed = Math.floor(Math.random() * 100);
            const mockSecureUrl = `https://images.unsplash.com/photo-${1500000000000 + randomSeed * 10000}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`;
            subscriber.next({ secure_url: mockSecureUrl, progress: 100 });
            subscriber.complete();
          } else {
            subscriber.next({ secure_url: '', progress });
          }
        }, 300); // 300ms interval
      });
    }
  }
}
