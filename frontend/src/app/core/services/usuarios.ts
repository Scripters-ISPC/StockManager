import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface Usuario {
  id?: number;
  nombre: string;
  correo: string;
  password?: string;
  rol: 'Administrador' | 'Operario';
  estado: 'Activo' | 'Inactivo';
  fechaRegistro: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/usuarios`;

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  agregarUsuario(nuevo: { nombre: string; correo: string; password?: string; rol: 'Administrador' | 'Operario' }): Observable<Usuario> {
    const usuarioCompleto: Omit<Usuario, 'id'> = {
      ...nuevo,
      estado: 'Activo',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    return this.http.post<Usuario>(this.apiUrl, usuarioCompleto);
  }

  toggleEstado(id: number, estadoActual: 'Activo' | 'Inactivo'): Observable<Usuario> {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}`, { estado: nuevoEstado });
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
