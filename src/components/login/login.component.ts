import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);
  // FIX: Explicitly type the injected Router to fix 'navigate does not exist on type unknown' error.
  private router: Router = inject(Router);

  loginAs(role: Role): void {
    this.authService.login(role);
    this.router.navigate(['/dashboard']);
  }
}
