import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [],
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.css'
})
export class MetricCard {

  @Input() titulo: string = '';
  @Input() valor: string = '';
  @Input() tendencia: string = ''; 
  @Input() descripcion: string = ''; 
}