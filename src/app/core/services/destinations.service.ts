import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Destination } from '../../models/destinations.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DestinationsService {
  private http = inject(HttpClient);

  createDestination(payload: Destination): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/destinations`, payload).pipe(
      catchError((err) => {
        const msg = err.error?.message ?? 'Failed to create destination. Please check your parameters.';
        return throwError(() => new Error(msg));
      })
    );
  }

  getDestinations(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/destinations`).pipe(
      catchError((err) => {
        const msg = err.error?.message ?? 'Failed to fetch destinations.';
        return throwError(() => new Error(msg));
      })
    );
  }

  getAllDestinations(): Observable<any> {
    return this.getDestinations();
  }

  getDestinationById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/destinations/${id}`).pipe(
      catchError((err) => {
        const msg = err.error?.message ?? 'Failed to fetch destination details.';
        return throwError(() => new Error(msg));
      })
    );
  }

  updateDestination(id: string, payload: Destination): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/destinations/${id}`, payload).pipe(
      catchError((err) => {
        const msg = err.error?.message ?? 'Failed to update destination.';
        return throwError(() => new Error(msg));
      })
    );
  }

  deleteDestination(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/destinations/${id}`).pipe(
      catchError((err) => {
        const msg = err.error?.message ?? 'Failed to delete destination.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
