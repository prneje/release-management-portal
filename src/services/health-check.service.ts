import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { API_BASE_URL } from '../config';

export type ApiStatus = 'Online' | 'Offline' | 'Checking...';

@Injectable({ providedIn: 'root' })
export class HealthCheckService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/health`;

  private apiStatusState = signal<ApiStatus>('Checking...');
  apiStatus = this.apiStatusState.asReadonly();

  constructor() {
    this.startHealthCheck();
  }

  private startHealthCheck(): void {
    timer(0, 10000) // Start immediately, then poll every 10 seconds
      .pipe(
        switchMap(() => 
          this.http.get(this.apiUrl, { responseType: 'text' }).pipe(
            tap(() => this.apiStatusState.set('Online')),
            catchError(() => {
              this.apiStatusState.set('Offline');
              return of(null); // Continue the timer even after an error
            })
          )
        )
      )
      .subscribe();
  }
}