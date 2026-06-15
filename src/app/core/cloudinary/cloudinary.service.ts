import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

const CLOUD_NAME = 'ds4qifmha';
const UPLOAD_PRESET = 'angular_upload';

interface CloudinaryUploadResponse {
  secure_url: string;
  error?: { message: string };
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  /** Bypass auth/error interceptors — Cloudinary rejects extra headers and CORS breaks with Bearer. */
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    return this.http.post<CloudinaryUploadResponse>(this.uploadUrl, formData).pipe(
      map((response) => {
        if (!response.secure_url) {
          throw new Error(response.error?.message ?? 'Cloudinary upload failed');
        }
        return response.secure_url;
      })
    );
  }
}
