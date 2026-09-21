import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
