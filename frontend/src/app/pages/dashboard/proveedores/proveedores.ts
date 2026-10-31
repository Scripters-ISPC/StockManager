import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { InventoryService, Proveedor } from '../../../core/services/inventory';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css',
})
export class Proveedores implements OnInit {
  private inventoryService = inject(InventoryService);

  proveedores = signal<Proveedor[]>([]);
  nombre = '';
  contacto = '';
  activo = true;
  editandoId: number | null = null;
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.inventoryService.getProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores.set(proveedores);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los proveedores.');
        this.cargando.set(false);
      },
    });
  }

  editar(proveedor: Proveedor) {
    this.editandoId = proveedor.id;
    this.nombre = proveedor.nombre;
    this.contacto = proveedor.contacto;
    this.activo = proveedor.activo;
    this.error.set('');
  }

  cancelar() {
    this.editandoId = null;
    this.nombre = '';
    this.contacto = '';
    this.activo = true;
    this.error.set('');
  }

  guardar() {
    const nombre = this.nombre.trim();
    if (!nombre) {
      this.error.set('Ingresá un nombre de proveedor.');
      return;
    }

    this.guardando.set(true);
    const proveedor = {
      nombre,
      contacto: this.contacto.trim(),
      activo: this.activo,
    };
    const request = this.editandoId === null
      ? this.inventoryService.crearProveedor(proveedor)
      : this.inventoryService.actualizarProveedor(this.editandoId, proveedor);

    request.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cancelar();
        this.cargar();
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar el proveedor.');
      },
    });
  }

  eliminar(proveedor: Proveedor) {
    if (!confirm(`¿Eliminar el proveedor "${proveedor.nombre}"?`)) {
      return;
    }

    this.inventoryService.eliminarProveedor(proveedor.id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo eliminar el proveedor.'),
    });
  }
}
