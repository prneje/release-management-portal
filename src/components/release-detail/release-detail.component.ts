import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, ParamMap } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReleaseService } from '../../services/release.service';
import { Release, ScanStatus, SignOffStatus, Team, QAStatus, Component as ReleaseComponent, UserStory } from '../../models/release.model';
import { switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { AddComponentComponent } from '../add-component/add-component.component';
import { AddUserStoryComponent } from '../add-user-story/add-user-story.component';
import { AddTeamComponent } from '../add-team/add-team.component';

@Component({
  selector: 'app-release-detail',
  templateUrl: './release-detail.component.html',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AddComponentComponent, AddUserStoryComponent, AddTeamComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReleaseDetailComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private releaseService = inject(ReleaseService);
  private location = inject(Location);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  private release$ = this.route.paramMap.pipe(
    switchMap((params: ParamMap) => {
      const id = params.get('id');
      return this.releaseService.getReleaseById(id || '');
    })
  );

  release = toSignal<Release | undefined>(this.release$, { initialValue: undefined });
  scanOptions: ScanStatus[] = ['Pending', 'Passed', 'Failed'];
  qaStatusOptions: QAStatus[] = ['Pending', 'In Progress', 'Passed', 'Failed'];

  isAddComponentModalOpen = signal(false);
  selectedTeamForAddComponent = signal<Team | null>(null);
  isAddUserStoryModalOpen = signal(false);
  selectedTeamForAddUserStory = signal<Team | null>(null);
  isAddTeamModalOpen = signal(false);

  // Editing state signals
  editingRelease = signal(false);
  releaseForm!: FormGroup;
  editingComponentId = signal<string | null>(null);
  componentForm!: FormGroup;
  editingUserStoryId = signal<string | null>(null);
  userStoryForm!: FormGroup;
  editingTeamId = signal<string | null>(null);
  teamForm!: FormGroup;
  
  // Permissions
  canManageRelease = computed(() => this.authService.hasRole(['ReleaseManager']));
  canManageSignOffs = computed(() => this.authService.hasRole(['ReleaseManager']));
  canManageAppOwnerApproval = computed(() => this.authService.hasRole(['ApplicationOwner']));
  canExportReport = computed(() => this.authService.hasRole(['ReleaseManager', 'ApplicationOwner']));

  isAllProjectsApproved = computed(() => {
    const r = this.release();
    if (!r || !r.teams.length) return false;
    return r.teams.every(team => team.appOwnerSignedOff === 'Completed');
  });

  canEditTeam(teamId: string): boolean {
    // Only developers who are members of the team can edit team content.
    return this.authService.isMemberOfTeam(teamId);
  }

  goBack(): void {
    this.location.back();
  }

  // --- Release Edit Methods ---
  startEditRelease(): void {
    const r = this.release();
    if (!r) return;
    this.releaseForm = this.fb.group({
      name: [r.name, [Validators.required, Validators.minLength(3)]],
      version: [r.version, [Validators.required, Validators.pattern(/^\d+\.\d+\.\d+$/)]],
      releaseDate: [r.releaseDate, Validators.required],
    });
    this.editingRelease.set(true);
  }
  
  cancelEditRelease(): void {
    this.editingRelease.set(false);
  }
  
  saveRelease(): void {
    if (this.releaseForm.invalid) return;
    this.releaseService.updateReleaseDetails(this.release()!.id, this.releaseForm.value).subscribe(() => {
      this.editingRelease.set(false);
    });
  }

  // --- Team Edit Methods ---
  startEditTeam(team: Team): void {
    this.editingTeamId.set(team.id);
    this.teamForm = this.fb.group({
      name: [team.name, [Validators.required, Validators.minLength(3)]],
      productOwner: [team.productOwner, [Validators.required, Validators.minLength(3)]],
      teamDl: [team.teamDl, [Validators.required, Validators.email]],
    });
  }

  cancelEditTeam(): void {
    this.editingTeamId.set(null);
  }

  saveTeam(teamId: string): void {
    if (this.teamForm.invalid) return;
    this.releaseService.updateTeamDetails(this.release()!.id, teamId, this.teamForm.value);
    this.editingTeamId.set(null);
  }

  // --- Component Edit Methods ---
  startEditComponent(component: ReleaseComponent): void {
    this.editingComponentId.set(component.id);
    this.componentForm = this.fb.group({
        name: [component.name, [Validators.required, Validators.minLength(3)]],
        version: [component.version, [Validators.required, Validators.pattern(/^\d+\.\d+\.\d+$/)]],
    });
  }

  cancelEditComponent(): void {
    this.editingComponentId.set(null);
  }

  saveComponent(teamId: string, componentId: string): void {
    if (this.componentForm.invalid) return;
    this.releaseService.updateComponentDetails(this.release()!.id, teamId, componentId, this.componentForm.value);
    this.editingComponentId.set(null);
  }

  // --- User Story Edit Methods ---
  startEditUserStory(story: UserStory): void {
    this.editingUserStoryId.set(story.id);
    this.userStoryForm = this.fb.group({
      description: [story.description, [Validators.required, Validators.minLength(10)]],
    });
  }

  cancelEditUserStory(): void {
    this.editingUserStoryId.set(null);
  }

  saveUserStory(teamId: string, storyId: string): void {
    if (this.userStoryForm.invalid) return;
    this.releaseService.updateUserStoryDetails(this.release()!.id, teamId, storyId, this.userStoryForm.value);
    this.editingUserStoryId.set(null);
  }


  openAddTeamModal(): void {
    this.isAddTeamModalOpen.set(true);
  }

  closeAddTeamModal(): void {
    this.isAddTeamModalOpen.set(false);
  }

  deleteTeam(teamId: string): void {
    const releaseId = this.release()?.id;
    if (!releaseId) return;

    if (confirm('Are you sure you want to delete this team and all its components and user stories?')) {
      this.releaseService.deleteTeam(releaseId, teamId);
    }
  }

  openAddComponentModal(team: Team): void {
    this.selectedTeamForAddComponent.set(team);
    this.isAddComponentModalOpen.set(true);
  }

  closeAddComponentModal(): void {
    this.isAddComponentModalOpen.set(false);
    this.selectedTeamForAddComponent.set(null);
  }

  onDeleteComponent(teamId: string, componentId: string) {
    if (confirm('Are you sure you want to delete this component? This may affect related user stories.')) {
      this.releaseService.deleteComponent(this.release()!.id, teamId, componentId);
    }
  }

  openAddUserStoryModal(team: Team): void {
    this.selectedTeamForAddUserStory.set(team);
    this.isAddUserStoryModalOpen.set(true);
  }

  closeAddUserStoryModal(): void {
    this.isAddUserStoryModalOpen.set(false);
    this.selectedTeamForAddUserStory.set(null);
  }

  onDeleteUserStory(teamId: string, storyId: string) {
    if (confirm('Are you sure you want to delete this user story?')) {
      this.releaseService.deleteUserStory(this.release()!.id, teamId, storyId);
    }
  }

  getApprovalStatusColor(status: SignOffStatus): string {
     return status === 'Completed'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
      : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
  }
  
  getScanStatusColor(status: ScanStatus): string {
    switch (status) {
      case 'Passed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  }

  getQAStatusColor(status: QAStatus): string {
    switch (status) {
      case 'Passed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'In Progress': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300';
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  }

  updateScan(teamId: string, componentId: string, scanType: 'sonarQube' | 'nexusIq' | 'checkmarx', event: Event) {
    const releaseId = this.release()?.id;
    if (!releaseId) return;

    const selectElement = event.target as HTMLSelectElement;
    const status = selectElement.value as ScanStatus;
    this.releaseService.updateComponentScan(releaseId, teamId, componentId, scanType, status);
  }

  updateQAStatus(teamId: string, storyId: string, event: Event): void {
    const releaseId = this.release()?.id;
    if (!releaseId) return;

    const selectElement = event.target as HTMLSelectElement;
    const status = selectElement.value as QAStatus;
    this.releaseService.updateUserStoryQAStatus(releaseId, teamId, storyId, status);
  }

  toggleQASignOff(teamId: string, currentStatus: SignOffStatus) {
    const releaseId = this.release()?.id;
    if (!releaseId) return;
    const newStatus: SignOffStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    this.releaseService.updateTeamQASignOff(releaseId, teamId, newStatus);
  }

  toggleAppOwnerSignOff(teamId: string, currentStatus: SignOffStatus) {
    const releaseId = this.release()?.id;
    if (!releaseId) return;
    const newStatus: SignOffStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    this.releaseService.updateTeamAppOwnerSignOff(releaseId, teamId, newStatus);
  }
  
  toggleOverallReleaseSignOff(currentStatus: SignOffStatus) {
    const releaseId = this.release()?.id;
    if (!releaseId) return;
    const newStatus: SignOffStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    this.releaseService.updateOverallReleaseSignOff(releaseId, newStatus);
  }

  exportReleaseStatusAsCSV(): void {
    const release = this.release();
    if (!release) return;

    const csvRows = [];
    const headers = ['Category', 'Team', 'Item', 'Version/ID', 'Detail', 'Status'];
    csvRows.push(headers.join(','));

    // Helper to escape commas in strings for CSV compatibility
    const escapeCsv = (str: string | undefined): string => {
        if (!str) return '""';
        const newStr = str.replace(/"/g, '""');
        return `"${newStr}"`;
    };

    // Release Details
    csvRows.push(`"Release", "", ${escapeCsv(release.name)}, ${escapeCsv(release.version)}, "Target Date", ${escapeCsv(release.releaseDate)}`);
    csvRows.push(`"Release", "", ${escapeCsv(release.name)}, ${escapeCsv(release.version)}, "Overall Approval", ${escapeCsv(release.overallAppOwnerSignedOff)}`);
    
    // Team Details
    for (const team of release.teams) {
        csvRows.push(`"Team", ${escapeCsv(team.name)}, "QA Sign-off", "", "", ${escapeCsv(team.qaSignedOff)}`);
        csvRows.push(`"Team", ${escapeCsv(team.name)}, "Owner Approval", "", "", ${escapeCsv(team.appOwnerSignedOff)}`);
        
        // Components
        for (const component of team.components) {
            csvRows.push(`"Component", ${escapeCsv(team.name)}, ${escapeCsv(component.name)}, ${escapeCsv(component.version)}, "SonarQube", ${escapeCsv(component.sonarQube)}`);
            csvRows.push(`"Component", ${escapeCsv(team.name)}, ${escapeCsv(component.name)}, ${escapeCsv(component.version)}, "NexusIQ", ${escapeCsv(component.nexusIq)}`);
            csvRows.push(`"Component", ${escapeCsv(team.name)}, ${escapeCsv(component.name)}, ${escapeCsv(component.version)}, "Checkmarx", ${escapeCsv(component.checkmarx)}`);
        }

        // User Stories
        for (const story of team.userStories) {
            const componentNames = story.components.map(c => c.name).join(' | ');
            csvRows.push(`"User Story", ${escapeCsv(team.name)}, ${escapeCsv(story.description)}, ${escapeCsv(story.id)}, "Components", ${escapeCsv(componentNames)}`);
            csvRows.push(`"User Story", ${escapeCsv(team.name)}, ${escapeCsv(story.description)}, ${escapeCsv(story.id)}, "QA Status", ${escapeCsv(story.qaStatus)}`);
        }
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fileName = `release-status-${release.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}