import { Injectable, signal } from '@angular/core';

export interface Pedido {
  id: number;
  producto: string;
  cantidad: number;
  proveedor: string;
  urgencia: 'baja' | 'media' | 'alta';
  estado: 'Pendiente' | 'Aprobado' | 'En Camino' | 'Entregado' | 'Cancelado';
  fecha: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private pedidos = signal<Pedido[]>([
    { id: 101, producto: 'Resma Papel A4 - 500 hojas', cantidad: 30, proveedor: 'Papelera Central', urgencia: 'alta', estado: 'Pendiente', fecha: '2026-09-20', observaciones: 'Urgente para reposición de cajas.' },
    { id: 102, producto: 'Toner HP LaserJet Negro', cantidad: 5, proveedor: 'OfficeNet S.A.', urgencia: 'media', estado: 'Aprobado', fecha: '2026-09-19', observaciones: 'Requerido para contabilidad.' },
    { id: 103, producto: 'Lapiceras Azul - Caja x50', cantidad: 10, proveedor: 'Librería Mayorista', urgencia: 'baja', estado: 'Entregado', fecha: '2026-09-15' }
  ]);

  getPedidos = this.pedidos.asReadonly();

  crearPedido(nuevo: Omit<Pedido, 'id' | 'estado' | 'fecha'>) {
    const nextId = this.pedidos().length > 0 ? Math.max(...this.pedidos().map(p => p.id)) + 1 : 101;
    const fechaHoy = new Date().toISOString().split('T')[0];
    const pedidoCompleto: Pedido = {
      ...nuevo,
      id: nextId,
      estado: 'Pendiente',
      fecha: fechaHoy
    };
    this.pedidos.update(lista => [pedidoCompleto, ...lista]);
  }

  cambiarEstado(id: number, nuevoEstado: Pedido['estado']) {
    this.pedidos.update(lista =>
      lista.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p)
    );
  }

  cancelarPedido(id: number) {
    this.cambiarEstado(id, 'Cancelado');
  }
}
