import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { InventoryService } from '../../../core/services/inventory';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario {
  authService = inject(AuthService);
  inventoryService = inject(InventoryService);

  eliminar(id: number) {
    if (confirm('¿Está seguro de eliminar este material?')) {
      this.inventoryService.eliminarMaterial(id);
    }
  }

  ajustarStock(id: number, cambio: number) {
    const item = this.inventoryService.getMaterialById(id);
    if (item) {
      this.inventoryService.actualizarStock(id, item.cantidadActual + cambio);
    }
  }
}