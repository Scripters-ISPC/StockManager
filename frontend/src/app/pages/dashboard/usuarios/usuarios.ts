import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuariosService, Usuario } from '../../../core/services/usuarios';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [RouterLink, CommonModule],
  styleUrl: './usuarios.css',
  templateUrl: './usuarios.html',
})
export class Usuarios implements OnInit {
  private usuariosService = inject(UsuariosService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal<boolean>(true);
  errorMensaje = signal<string | null>(null);
  filtroRol = signal<string>('TODOS');

  usuariosFiltrados = computed(() => {
    const rol = this.filtroRol();
    const lista = this.usuarios();
    return rol === 'TODOS' ? lista : lista.filter(u => u.rol === rol);
  });

  totalActivos = computed(() => 
    this.usuarios().filter(u => u.estado === 'Activo').length
  );

  totalInactivos = computed(() => 
    this.usuarios().filter(u => u.estado === 'Inactivo').length
  );

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    this.usuariosService.getUsuarios().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorMensaje.set('No se pudo cargar la lista de usuarios. Reintente más tarde.');
        this.cargando.set(false);
        console.error('Error al obtener usuarios:', err);
      }
    });
  }

  cambiarFiltroRol(rol: string): void {
    this.filtroRol.set(rol);
  }

  toggleEstado(id: number, estadoActual: 'Activo' | 'Inactivo'): void {
    this.usuariosService.toggleEstado(id, estadoActual).subscribe({
      next: () => {
       
        this.usuarios.update(actuales =>
          actuales.map(u => 
            u.id === id ? { ...u, estado: estadoActual === 'Activo' ? 'Inactivo' : 'Activo' } : u
          )
        );
      },
      error: (err) => {
        this.errorMensaje.set('Error al actualizar el estado del usuario.');
        console.error(err);
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Desea eliminar este usuario de forma permanente?')) return;

    this.usuariosService.eliminarUsuario(id).subscribe({
      next: () => {
       
        this.usuarios.update(actuales => actuales.filter(u => u.id !== id));
      },
      error: (err) => {
        this.errorMensaje.set('Error al intentar eliminar el usuario.');
        console.error(err);
      }
    });
  }
}