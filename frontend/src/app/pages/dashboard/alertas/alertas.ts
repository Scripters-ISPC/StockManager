import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService, Material } from '../../../core/services/inventory';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [RouterLink, CommonModule],
  styleUrl: './alertas.css',
  templateUrl: './alertas.html',
})
export class Alertas implements OnInit {
  private inventoryService = inject(InventoryService);

  alertasCriticas = signal<Material[]>([]);
  cargando = signal(true);

  ngOnInit() {
    this.inventoryService.getAlertasCriticas().subscribe({
      next: (lista) => {
        this.alertasCriticas.set(lista);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}