import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface UsuarioAuth {
  id: number;
  nombre: string;
  correo: string;
  rol: 'Administrador' | 'Operario';
  estado: 'Activo' | 'Inactivo';
}

export interface LoginResponse {
  access: string;
  refresh: string;
  usuario: UsuarioAuth;
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

  constructor() {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser && localStorage.getItem('access_token')) {
      try {
        this.establecerSesion(JSON.parse(storedUser) as UsuarioAuth);
      } catch {
        this.limpiarSesion();
      }
    }
  }

  rolEtiqueta = computed(() => {
    if (this.esAdministradorReal() && this.vistaOperarioActiva()) {
      return 'Administrador · vista operario';
    }
    return this.isAdmin() ? 'Administrador' : 'Operario';
  });

  loginConCredenciales(correo: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/usuarios/login/`,
      { correo, password },
    ).pipe(
      tap((res) => {
        console.log('Respuesta Django:', res);
        const { access, refresh, usuario } = res;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this.establecerSesion(usuario);
      }),
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
    this.limpiarSesion();
    this.userRole.set('');
    this.usuarioActual.set(null);
    this.vistaOperarioActiva.set(false);
  }

  private limpiarSesion() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario');
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
