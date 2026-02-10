import { Component, ChangeDetectionStrategy, output, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReleaseService } from '../../services/release.service';

@Component({
  selector: 'app-add-team',
  templateUrl: './add-team.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTeamComponent {
  closeModal = output<void>();
  releaseId = input.required<string>();

  private fb = inject(FormBuilder);
  private releaseService = inject(ReleaseService);

  teamForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    teamDl: ['', [Validators.required, Validators.email]],
    productOwner: ['', [Validators.required, Validators.minLength(3)]],
  });

  get name() { return this.teamForm.get('name'); }
  get teamDl() { return this.teamForm.get('teamDl'); }
  get productOwner() { return this.teamForm.get('productOwner'); }

  onSubmit(): void {
    if (this.teamForm.valid) {
      this.releaseService.addTeam(this.releaseId(), this.teamForm.value).subscribe({
        next: () => this.closeModal.emit(),
        error: (err) => console.error("Failed to add team", err),
      });
    } else {
      this.teamForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
