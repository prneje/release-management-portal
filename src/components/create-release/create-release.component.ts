import { Component, ChangeDetectionStrategy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReleaseService } from '../../services/release.service';
import { Team } from '../../models/release.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-create-release',
  templateUrl: './create-release.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateReleaseComponent {
  closeModal = output<void>();

  private fb = inject(FormBuilder);
  private releaseService = inject(ReleaseService);

  allTeams = toSignal<Team[], Team[]>(this.releaseService.getAllTeams(), { initialValue: [] });

  releaseForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    version: ['', [Validators.required, Validators.pattern(/^\d+\.\d+\.\d+$/)]],
    releaseDate: ['', Validators.required],
    teamIds: [[]],
  });

  get name() { return this.releaseForm.get('name'); }
  get version() { return this.releaseForm.get('version'); }

  onSubmit(): void {
    if (this.releaseForm.valid) {
      this.releaseService.addRelease(this.releaseForm.value).subscribe({
        next: () => {
          this.closeModal.emit();
        },
        error: (err) => {
          console.error("Failed to create release", err);
          // Here you could set an error message signal to display in the UI
        }
      });
    } else {
      this.releaseForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
