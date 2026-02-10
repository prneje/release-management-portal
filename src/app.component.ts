import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { HealthCheckService } from './services/health-check.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, CommonModule],
  // FIX: Corrected typo from `Change-DetectionStrategy` to `ChangeDetectionStrategy`.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private authService = inject(AuthService);
  private healthCheckService = inject(HealthCheckService);
  // FIX: Explicitly type the injected Router to fix 'navigate does not exist on type unknown' error.
  private router: Router = inject(Router);

  currentUser = this.authService.currentUser;
  isLoggedIn = computed(() => !!this.currentUser());
  canViewMetrics = computed(() => this.authService.hasRole(['ReleaseManager', 'ApplicationOwner']));
  apiStatus = this.healthCheckService.apiStatus;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
