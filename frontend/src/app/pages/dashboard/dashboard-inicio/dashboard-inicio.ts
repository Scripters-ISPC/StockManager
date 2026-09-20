import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../../core/services/inventory';
import { PedidosService } from '../../../core/services/pedidos';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-dashboard-inicio',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './dashboard-inicio.css',
  templateUrl: './dashboard-inicio.html',
})
export class DashboardInicio {
  inventoryService = inject(InventoryService);
  pedidosService = inject(PedidosService);
  authService = inject(AuthService);

  totalProductos = computed(() => this.inventoryService.getMateriales().length);
  productosBajoStock = computed(() => this.inventoryService.alertasCriticas().length);
  pedidosPendientes = computed(() => 
    this.pedidosService.getPedidos().filter(p => p.estado === 'Pendiente').length
  );
  pedidosTotales = computed(() => this.pedidosService.getPedidos().length);
}
