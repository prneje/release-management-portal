import { Component, ChangeDetectionStrategy, output, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReleaseService } from '../../services/release.service';
import { Team } from '../../models/release.model';

@Component({
  selector: 'app-add-component',
  templateUrl: './add-component.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddComponentComponent {
  closeModal = output<void>();
  releaseId = input.required<string>();
  team = input.required<Team>();

  private fb = inject(FormBuilder);
  private releaseService = inject(ReleaseService);

  componentForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    version: ['', [Validators.required, Validators.pattern(/^\d+\.\d+\.\d+$/)]],
  });

  get name() { return this.componentForm.get('name'); }
  get version() { return this.componentForm.get('version'); }

  onSubmit(): void {
    if (this.componentForm.valid) {
      this.releaseService.addTeamComponent(this.releaseId(), this.team().id, this.componentForm.value).subscribe({
        next: () => {
          this.closeModal.emit();
        },
        error: (err) => {
          console.error("Failed to add component", err);
        }
      });
    } else {
      this.componentForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
