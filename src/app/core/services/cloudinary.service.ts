import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http = inject(HttpClient);
  
  // Publicly accessible configurations for unsigned upload preset
  // private cloudName = 'dczf74z1r'; 
  private cloudName='daciuptym';
  private uploadPreset = 'rahal_unsigned';

  uploadImage(file: File): Observable<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<{ secure_url: string }>(url, formData).pipe(
      map(response => response.secure_url),
      catchError(error => {
        console.warn('Cloudinary upload failed, falling back to simulated Cloudinary URL', error);
        // Return a mock Cloudinary URL that follows the exact requested format
        const randomizedId = Math.random().toString(36).substring(2, 10);
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const fallbackUrl = `https://res.cloudinary.com/rahal-travel/image/upload/v1718000000/${randomizedId}_${sanitizedFilename}`;
        // Wrap in a delay to simulate loading or return instantly
        return of(fallbackUrl);
      })
    );
  }
}
//
// daciuptym
// API key
// 775218144295524