import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MetricCard } from '../metric-card/metric-card';

@Component({
  selector: 'app-historial-pedidos',
  standalone: true,
  imports: [RouterLink, MetricCard],
  styleUrl: './historial-pedidos.css',
  templateUrl: './historial-pedidos.html',
})
export class HistorialPedidos {}
