
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {

  private handler = inject(HttpBackend);
  private http = new HttpClient(this.handler);

  uploadImage(file: File): Observable<string> {
    const cloudName = environment.cloudinaryCloudName;
    const preset = environment.cloudinaryUploadPreset;
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);

    return this.http.post<{ secure_url: string }>(url, formData).pipe(
      map(res => res.secure_url)
    );
  }
}
