import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (this.authService.getRole()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ingresarComo(rol: 'admin' | 'operario', event: Event) {
    event.preventDefault(); 
    this.authService.login(rol);
    this.router.navigate(['/dashboard']);
  }
}