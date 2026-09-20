import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './pedidos.css',
  templateUrl: './pedidos.html',
})
export class Pedidos {}