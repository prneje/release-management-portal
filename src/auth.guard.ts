import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  // FIX: Explicitly type the injected Router to fix 'parseUrl does not exist on type unknown' error.
  const router: Router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }

  // Redirect to the login page
  return router.parseUrl('/login');
};
