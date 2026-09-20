import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {}
