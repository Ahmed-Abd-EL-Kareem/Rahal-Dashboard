import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HotelsService {
  private http = inject(HttpClient);

  getAllHotels(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/hotels`).pipe(
      catchError((err) => {
        const msg = err.error?.message ?? 'Failed to fetch hotels.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
