<<<<<<< HEAD
import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Header } from './pages/dashboard/header/header';
import { Footer } from './pages/dashboard/footer/footer';
=======
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
>>>>>>> 392c9e55ae95a193b134d2dea6b2f340a7f22a93

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'frontend';
  router = inject(Router);

  isDashboardRoute(): boolean {
    return this.router.url.startsWith('/dashboard');
  }
}