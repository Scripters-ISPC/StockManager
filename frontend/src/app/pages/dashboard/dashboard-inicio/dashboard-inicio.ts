import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService, Material } from '../../../core/services/inventory';
import { PedidosService, Pedido } from '../../../core/services/pedidos';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-dashboard-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule],
  styleUrl: './dashboard-inicio.css',
  templateUrl: './dashboard-inicio.html',
})
export class DashboardInicio implements OnInit {
  private inventoryService = inject(InventoryService);
  private pedidosService = inject(PedidosService);
  authService = inject(AuthService);

  materiales = signal<Material[]>([]);
  pedidos = signal<Pedido[]>([]);
  cargando = signal(true);

  ngOnInit() {
    this.inventoryService.getMateriales().subscribe({
      next: (lista) => this.materiales.set(lista),
    });
    this.pedidosService.getPedidos().subscribe({
      next: (lista) => {
        this.pedidos.set(lista);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  alertasCriticas(): Material[] {
    return this.materiales().filter(m => m.cantidadActual <= m.stockMinimo);
  }

  totalProductos(): number {
    return this.materiales().length;
  }

  productosBajoStock(): number {
    return this.alertasCriticas().length;
  }

  pedidosPendientes(): number {
    return this.pedidos().filter(p => p.estado === 'Pendiente').length;
  }

  pedidosTotales(): number {
    return this.pedidos().length;
  }

  ultimosPedidos(): Pedido[] {
    return [...this.pedidos()]
      .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))
      .slice(0, 4);
  }
}
