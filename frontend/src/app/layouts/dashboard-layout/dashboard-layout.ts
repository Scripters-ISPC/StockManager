import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  alternarVistaOperario() {
    this.authService.alternarVistaOperario();
    this.router.navigate(['/dashboard']);
  }
}
