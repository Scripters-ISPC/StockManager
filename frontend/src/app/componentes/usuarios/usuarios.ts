import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './usuarios.css',
  templateUrl: './usuarios.html',
})
export class Usuarios {}