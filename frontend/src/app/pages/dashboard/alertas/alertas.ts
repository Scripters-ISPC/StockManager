import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../../core/services/inventory';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './alertas.css',
  templateUrl: './alertas.html',
})
export class Alertas {
  inventoryService = inject(InventoryService);
}