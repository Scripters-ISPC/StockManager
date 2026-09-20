import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PedidosService, Pedido } from '../../../core/services/pedidos';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [RouterLink, CommonModule],
  styleUrl: './pedidos.css',
  templateUrl: './pedidos.html',
})
export class Pedidos {
  pedidosService = inject(PedidosService);
  authService = inject(AuthService);

  cambiarEstado(id: number, nuevoEstado: Pedido['estado']) {
    this.pedidosService.cambiarEstado(id, nuevoEstado);
  }

  cancelar(id: number) {
    if (confirm('¿Desea cancelar este pedido?')) {
      this.pedidosService.cancelarPedido(id);
    }
  }
}