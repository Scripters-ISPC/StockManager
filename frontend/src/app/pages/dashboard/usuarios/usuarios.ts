import { Component, inject, OnInit, signal } from '@angular/core';
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
  cargando = signal(true);

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando.set(true);
    this.usuariosService.getUsuarios().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  toggleEstado(id: number, estadoActual: 'Activo' | 'Inactivo') {
    this.usuariosService.toggleEstado(id, estadoActual).subscribe(() => {
      this.cargarUsuarios();
    });
  }

  eliminar(id: number) {
    if (confirm('¿Desea eliminar este usuario?')) {
      this.usuariosService.eliminarUsuario(id).subscribe(() => {
        this.cargarUsuarios();
      });
    }
  }
}