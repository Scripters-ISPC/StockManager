import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  ingresarComo(rol: 'admin' | 'operario', event: Event) {
    event.preventDefault(); 
    this.authService.login(rol);
    this.router.navigate(['/dashboard']);
  }
}