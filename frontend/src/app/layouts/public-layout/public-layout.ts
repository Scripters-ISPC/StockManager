import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-public-layout',
  styleUrl: './public-layout.css',
  templateUrl: './public-layout.html',
})
export class PublicLayout {

  authService = inject(AuthService);
    private router = inject(Router);

    logout(event: Event) {
      event.preventDefault();
      this.authService.logout();
      this.router.navigate(['/login'], { replaceUrl: true });
    }

}