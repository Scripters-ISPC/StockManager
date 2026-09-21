import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosService, Pedido } from '../../../core/services/pedidos';
import { AuthService } from '../../../core/services/auth';
import { InventoryService } from '../../../core/services/inventory';
import { AuditoriaService } from '../../../core/services/auditoria';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  styleUrl: './pedidos.css',
  templateUrl: './pedidos.html',
})
export class Pedidos implements OnInit {
  private pedidosService = inject(PedidosService);
  private inventoryService = inject(InventoryService);
  private auditoriaService = inject(AuditoriaService);
  authService = inject(AuthService);

  pedidos = signal<Pedido[]>([]);
  cargando = signal(true);
  accionPendiente = signal<{ pedido: Pedido; tipo: 'aprobar' | 'cancelar' | 'confirmarIngreso' } | null>(null);
  comentarioAccion = '';
  errorAccion = signal('');

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

  puedeAprobar(pedido: Pedido): boolean {
    return this.authService.isAdmin() && pedido.estado === 'Pendiente';
  }

  puedeCancelar(pedido: Pedido): boolean {
    const esPropio = pedido.solicitanteId === this.authService.usuarioActual()?.id;
    return pedido.estado === 'Pendiente' && (this.authService.isAdmin() || esPropio);
  }

  puedeConfirmarIngreso(pedido: Pedido): boolean {
    return pedido.estado === 'Aprobado';
  }

  abrirAccion(pedido: Pedido, tipo: 'aprobar' | 'cancelar' | 'confirmarIngreso') {
    this.comentarioAccion = '';
    this.errorAccion.set('');
    this.accionPendiente.set({ pedido, tipo });
  }

  cerrarAccion() {
    this.accionPendiente.set(null);
    this.comentarioAccion = '';
    this.errorAccion.set('');
  }

  confirmarAccion() {
    const accion = this.accionPendiente();
    if (!accion?.pedido.id) {
      return;
    }

    if (accion.tipo === 'confirmarIngreso') {
      this.confirmarIngreso(accion.pedido);
      return;
    }

    const estado: Pedido['estado'] = accion.tipo === 'aprobar' ? 'Aprobado' : 'Cancelado';
    this.pedidosService.cambiarEstado(accion.pedido.id, estado, this.comentarioAccion.trim()).subscribe(() => {
      this.cerrarAccion();
      this.cargarPedidos();
    });
  }

  private confirmarIngreso(pedido: Pedido) {
    this.inventoryService.getMateriales().subscribe({
      next: (materiales) => {
        const material = materiales.find((item) => item.nombre === pedido.producto);
        if (!material?.id) {
          this.errorAccion.set('No se encontró el material solicitado en el inventario.');
          return;
        }

        const stockAnterior = material.cantidadActual;
        const stockNuevo = stockAnterior + pedido.cantidad;
        const usuario = this.authService.usuarioActual()?.nombre ?? 'Usuario';
        const observacion = this.comentarioAccion.trim() || 'Ingreso confirmado desde la solicitud #' + pedido.id;

        this.inventoryService.actualizarStock(material.id, stockNuevo).subscribe({
          next: () => {
            this.auditoriaService.registrar({
              materialId: material.id!,
              materialNombre: material.nombre,
              tipo: 'ingreso',
              cantidad: pedido.cantidad,
              stockAnterior,
              stockNuevo,
              usuario,
              fecha: new Date().toISOString().split('T')[0],
              fechaHora: new Date().toISOString(),
              observacion,
            }).subscribe({
              next: () => {
                this.pedidosService.confirmarIngreso(pedido.id!, this.comentarioAccion.trim()).subscribe({
                  next: () => {
                    this.cerrarAccion();
                    this.cargarPedidos();
                  },
                  error: () => this.errorAccion.set('El stock se actualizó, pero no se pudo confirmar el pedido.'),
                });
              },
              error: () => this.errorAccion.set('El stock se actualizó, pero no se pudo registrar la auditoría.'),
            });
          },
          error: () => this.errorAccion.set('No se pudo actualizar el stock del material.'),
        });
      },
      error: () => this.errorAccion.set('No se pudo consultar el inventario.'),
    });
  }
}
