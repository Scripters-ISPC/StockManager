import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './pages/dashboard/header/header';
import { Footer } from './pages/dashboard/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'frontend';
}