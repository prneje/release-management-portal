import { Component, ChangeDetectionStrategy, output, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReleaseService } from '../../services/release.service';
import { Team } from '../../models/release.model';

@Component({
  selector: 'app-add-user-story',
  templateUrl: './add-user-story.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserStoryComponent {
  closeModal = output<void>();
  releaseId = input.required<string>();
  team = input.required<Team>();

  private fb = inject(FormBuilder);
  private releaseService = inject(ReleaseService);

  userStoryForm: FormGroup = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(10)]],
    componentIds: [[]],
  });

  get description() { return this.userStoryForm.get('description'); }

  onSubmit(): void {
    if (this.userStoryForm.valid) {
      this.releaseService.addUserStory(this.releaseId(), this.team().id, this.userStoryForm.value).subscribe({
        next: () => this.closeModal.emit(),
        error: (err) => console.error("Failed to add user story", err),
      });
    } else {
      this.userStoryForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
