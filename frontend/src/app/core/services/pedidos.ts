import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface Pedido {
  id?: number;
  producto: string;
  materialId: number;
  materialNombre?: string;
  cantidad: number;
  proveedor: string | null;
  urgencia: 'baja' | 'media' | 'alta';
  estado: 'Pendiente' | 'Aprobado' | 'En Camino' | 'Entregado' | 'Cancelado';
  fecha: string;
  comentario?: string;
  solicitanteId?: number | null;
  solicitanteNombre?: string;
  comentarioResolucion?: string;
  comentarioIngreso?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/pedidos/`;
  private pedidos$: Observable<Pedido[]> | null = null;

  getPedidos(): Observable<Pedido[]> {
    if (!this.pedidos$) {
      this.pedidos$ = this.http.get<Pedido[]>(this.apiUrl).pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.pedidos$;
  }

  private invalidarPedidos(): void {
    this.pedidos$ = null;
  }

  getPedidoById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}${id}/`);
  }

  crearPedido(nuevo: Omit<Pedido, 'id' | 'estado' | 'fecha'>): Observable<Pedido> {
    const pedidoCompleto: Omit<Pedido, 'id'> = {
      ...nuevo,
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0]
    };
    return this.http.post<Pedido>(this.apiUrl, pedidoCompleto).pipe(
      tap(() => this.invalidarPedidos()),
    );
  }

  cambiarEstado(id: number, estado: Pedido['estado'], comentarioResolucion = ''): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}${id}/`, { estado, comentarioResolucion }).pipe(
      tap(() => this.invalidarPedidos()),
    );
  }

  confirmarIngreso(id: number, comentarioIngreso = ''): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}${id}/`, { estado: 'Entregado', comentarioIngreso }).pipe(
      tap(() => this.invalidarPedidos()),
    );
  }
}
