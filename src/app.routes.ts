import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReleaseDetailComponent } from './components/release-detail/release-detail.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './auth.guard';
import { ReleaseMetricsComponent } from './components/release-metrics/release-metrics.component';

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'metrics',
    component: ReleaseMetricsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'release/:id',
    component: ReleaseDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
