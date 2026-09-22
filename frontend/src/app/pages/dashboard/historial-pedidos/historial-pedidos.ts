import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PedidosService, Pedido } from '../../../core/services/pedidos';

@Component({
  selector: 'app-historial-pedidos',
  standalone: true,
  imports: [RouterLink, CommonModule],
  styleUrl: './historial-pedidos.css',
  templateUrl: './historial-pedidos.html',
})
export class HistorialPedidos implements OnInit {
  private pedidosService = inject(PedidosService);

  pedidos = signal<Pedido[]>([]);
  cargando = signal(true);

  ngOnInit() {
    this.pedidosService.getPedidos().subscribe({
      next: (lista) => {
        this.pedidos.set(
          [...lista].sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))
        );
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  totalPedidos(): number {
    return this.pedidos().length;
  }

  pedidosEntregados(): number {
    return this.pedidos().filter(p => p.estado === 'Entregado').length;
  }

  pedidosPendientes(): number {
    return this.pedidos().filter(p => p.estado === 'Pendiente').length;
  }

  urgenciaBadge(urgencia: Pedido['urgencia']): string {
    if (urgencia === 'alta') return 'badge-critical';
    if (urgencia === 'media') return 'badge-warning';
    return 'badge-ok';
  }
}
