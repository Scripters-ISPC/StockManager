import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface Material {
  id?: number;
  nombre: string;
  categoria: string;
  ubicacion: string;
  cantidadActual: number;
  stockMinimo: number;
  proveedor: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/inventario/materiales/`;

  getMateriales(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl);
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(
      `${API_BASE_URL}/inventario/categorias/`,
    );
  }

  getAlertasCriticas(): Observable<Material[]> {
    return this.getMateriales().pipe(
      map(lista => lista.filter(m => m.cantidadActual <= m.stockMinimo))
    );
  }

  getMaterialById(id: number): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}${id}/`);
  }

  agregarMaterial(nuevo: Omit<Material, 'id'>): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, nuevo);
  }

  actualizarStock(id: number, cantidadActual: number): Observable<Material> {
    return this.http.patch<Material>(`${this.apiUrl}${id}/`, { cantidadActual });
  }

  eliminarMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
