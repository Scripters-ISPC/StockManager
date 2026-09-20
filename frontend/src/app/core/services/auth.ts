import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface UsuarioAuth {
  id: number;
  nombre: string;
  correo: string;
  password: string;
  rol: 'Administrador' | 'Operario';
  estado: 'Activo' | 'Inactivo';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = API_BASE_URL;

  /** Rol efectivo para guards y menú (puede ser operario si el admin usa vista simulada). */
  userRole = signal<string>('');
  usuarioActual = signal<UsuarioAuth | null>(null);
  /** Solo true cuando un administrador real activó "ver como operario". */
  vistaOperarioActiva = signal(false);

  rolEtiqueta = computed(() => {
    if (this.esAdministradorReal() && this.vistaOperarioActiva()) {
      return 'Administrador · vista operario';
    }
    return this.isAdmin() ? 'Administrador' : 'Operario';
  });

  loginConCredenciales(correo: string, password: string): Observable<UsuarioAuth | null> {
    return this.http.get<UsuarioAuth[]>(
      `${this.apiUrl}/usuarios?correo=${encodeURIComponent(correo)}&password=${encodeURIComponent(password)}&estado=Activo`
    ).pipe(
      map(usuarios => {
        if (usuarios.length > 0) {
          return usuarios[0];
        }
        return null;
      }),
      tap(u => {
        if (u) {
          this.establecerSesion(u);
        }
      }),
      catchError(() => of(null))
    );
  }

  private establecerSesion(u: UsuarioAuth) {
    const rol = u.rol === 'Administrador' ? 'admin' : 'operario';
    this.usuarioActual.set(u);
    this.vistaOperarioActiva.set(false);
    this.userRole.set(rol);
  }

  /** Solo administradores autenticados por API pueden simular la vista operario. */
  activarVistaOperario() {
    if (!this.esAdministradorReal()) {
      return;
    }
    this.vistaOperarioActiva.set(true);
    this.userRole.set('operario');
  }

  restaurarVistaAdministrador() {
    if (!this.esAdministradorReal()) {
      return;
    }
    this.vistaOperarioActiva.set(false);
    this.userRole.set('admin');
  }

  alternarVistaOperario() {
    if (this.vistaOperarioActiva()) {
      this.restaurarVistaAdministrador();
    } else {
      this.activarVistaOperario();
    }
  }

  esAdministradorReal(): boolean {
    return this.usuarioActual()?.rol === 'Administrador';
  }

  logout() {
    this.userRole.set('');
    this.usuarioActual.set(null);
    this.vistaOperarioActiva.set(false);
  }

  getRole() {
    return this.userRole();
  }

  isAdmin() {
    return this.userRole() === 'admin';
  }

  isOperario() {
    return this.userRole() === 'operario';
  }
}
