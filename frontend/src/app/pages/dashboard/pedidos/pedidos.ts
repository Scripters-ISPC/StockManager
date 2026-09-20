import { Component, inject, OnInit, signal } from '@angular/core';
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
export class Pedidos implements OnInit {
  private pedidosService = inject(PedidosService);
  authService = inject(AuthService);

  pedidos = signal<Pedido[]>([]);
  cargando = signal(true);

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando.set(true);
    this.pedidosService.getPedidos().subscribe({
      next: (lista) => {
        this.pedidos.set(lista);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  cambiarEstado(id: number, nuevoEstado: Pedido['estado']) {
    this.pedidosService.cambiarEstado(id, nuevoEstado).subscribe(() => {
      this.cargarPedidos();
    });
  }

  cancelar(id: number) {
    if (confirm('¿Desea cancelar este pedido?')) {
      this.pedidosService.cancelarPedido(id).subscribe(() => {
        this.cargarPedidos();
      });
    }
  }
}