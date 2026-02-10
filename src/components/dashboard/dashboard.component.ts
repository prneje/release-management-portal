import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReleaseService } from '../../services/release.service';
import { CreateReleaseComponent } from '../create-release/create-release.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, RouterModule, CreateReleaseComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private releaseService = inject(ReleaseService);
  private authService = inject(AuthService);
  private router: Router = inject(Router);

  private readonly allReleases = this.releaseService.releases;
  readonly versionFilter = signal('');
  readonly startDateFilter = signal('');
  readonly endDateFilter = signal('');
  isCreateModalOpen = signal(false);

  readonly canCreateRelease = computed(() => this.authService.hasRole(['ReleaseManager']));

  readonly releases = computed(() => {
    const version = this.versionFilter().toLowerCase().trim();
    const startDate = this.startDateFilter();
    const endDate = this.endDateFilter();

    if (!version && !startDate && !endDate) {
      return this.allReleases();
    }

    return this.allReleases().filter(release => {
      const versionMatch = version ? release.version.toLowerCase().includes(version) : true;
      
      let dateMatch = true;
      // Simple string comparison works for 'YYYY-MM-DD'
      if (startDate && endDate) {
          dateMatch = release.releaseDate >= startDate && release.releaseDate <= endDate;
      } else if (startDate) {
          dateMatch = release.releaseDate >= startDate;
      } else if (endDate) {
          dateMatch = release.releaseDate <= endDate;
      }

      return versionMatch && dateMatch;
    });
  });

  getStatusColor(status: 'In Progress' | 'Completed' | 'Blocked'): string {
    switch (status) {
      case 'In Progress':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'Blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  }
  
  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  navigateToRelease(releaseId: string): void {
    this.router.navigate(['/release', releaseId]);
  }

  deleteRelease(releaseId: string, event: MouseEvent): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to permanently delete this release and all its associated data?')) {
      this.releaseService.deleteRelease(releaseId);
    }
  }
}