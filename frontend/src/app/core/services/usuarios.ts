import { Injectable, signal } from '@angular/core';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'Administrador' | 'Operario';
  estado: 'Activo' | 'Inactivo';
  fechaRegistro: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private usuarios = signal<Usuario[]>([
    { id: 1, nombre: 'Hector Marcelo Murua', correo: 'hector@stockmanager.com', rol: 'Administrador', estado: 'Activo', fechaRegistro: '2026-01-15' },
    { id: 2, nombre: 'Luis Gerardo Catalas', correo: 'gerardo@stockmanager.com', rol: 'Operario', estado: 'Activo', fechaRegistro: '2026-02-10' },
    { id: 3, nombre: 'Belen Angelo', correo: 'belen@stockmanager.com', rol: 'Operario', estado: 'Activo', fechaRegistro: '2026-03-05' },
    { id: 4, nombre: 'Luciana Mazur', correo: 'luciana@stockmanager.com', rol: 'Operario', estado: 'Activo', fechaRegistro: '2026-04-12' }
  ]);

  getUsuarios = this.usuarios.asReadonly();

  agregarUsuario(nuevo: Omit<Usuario, 'id' | 'estado' | 'fechaRegistro'>) {
    const nextId = this.usuarios().length > 0 ? Math.max(...this.usuarios().map(u => u.id)) + 1 : 1;
    const fecha = new Date().toISOString().split('T')[0];
    this.usuarios.update(lista => [...lista, { ...nuevo, id: nextId, estado: 'Activo', fechaRegistro: fecha }]);
  }

  toggleEstado(id: number) {
    this.usuarios.update(lista =>
      lista.map(u => u.id === id ? { ...u, estado: u.estado === 'Activo' ? 'Inactivo' : 'Activo' } : u)
    );
  }

  eliminarUsuario(id: number) {
    this.usuarios.update(lista => lista.filter(u => u.id !== id));
  }
}
