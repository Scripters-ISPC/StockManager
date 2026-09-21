import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface Pedido {
  id?: number;
  producto: string;
  cantidad: number;
  proveedor: string;
  urgencia: 'baja' | 'media' | 'alta';
  estado: 'Pendiente' | 'Aprobado' | 'En Camino' | 'Entregado' | 'Cancelado';
  fecha: string;
  observaciones?: string;
  solicitanteId?: number;
  solicitanteNombre?: string;
  comentarioResolucion?: string;
  comentarioIngreso?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/pedidos`;

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  getPedidoById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  crearPedido(nuevo: Omit<Pedido, 'id' | 'estado' | 'fecha'>): Observable<Pedido> {
    const pedidoCompleto: Omit<Pedido, 'id'> = {
      ...nuevo,
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0]
    };
    return this.http.post<Pedido>(this.apiUrl, pedidoCompleto);
  }

  cambiarEstado(id: number, estado: Pedido['estado'], comentarioResolucion = ''): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}`, { estado, comentarioResolucion });
  }

  confirmarIngreso(id: number, comentarioIngreso = ''): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}`, { estado: 'Entregado', comentarioIngreso });
  }
}
