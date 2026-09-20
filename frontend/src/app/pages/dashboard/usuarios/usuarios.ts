import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../../core/services/usuarios';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './usuarios.css',
  templateUrl: './usuarios.html',
})
export class Usuarios {
  usuariosService = inject(UsuariosService);

  toggleEstado(id: number) {
    this.usuariosService.toggleEstado(id);
  }

  eliminar(id: number) {
    if (confirm('¿Desea eliminar este usuario?')) {
      this.usuariosService.eliminarUsuario(id);
    }
  }
}