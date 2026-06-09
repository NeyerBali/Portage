import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/** Restreint une route à un ou plusieurs rôles (data.roles). Admin par défaut. */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles: string[] = route.data?.['roles'] ?? ['Admin'];
  if (auth.isLoggedIn() && auth.role && roles.includes(auth.role)) return true;
  return router.createUrlTree(['/']);
};
