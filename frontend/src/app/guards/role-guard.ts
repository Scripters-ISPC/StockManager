import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si es Administrador, lo deja pasar (true)
  if (authService.isAdmin()) {
    return true; 
  } else {
    // Si es Operario, lo patea de vuelta al inicio del panel (false)
    router.navigate(['/dashboard']); 
    return false;
  }
};