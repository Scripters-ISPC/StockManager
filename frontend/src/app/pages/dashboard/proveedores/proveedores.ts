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
  telefono = '';
  correo = '';
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
    this.telefono = proveedor.telefono || '';
    this.correo = proveedor.correo || proveedor.email || '';
    this.contacto = proveedor.contacto || '';
    this.activo = proveedor.activo;
    this.error.set('');
  }

  cancelar() {
    this.editandoId = null;
    this.nombre = '';
    this.telefono = '';
    this.correo = '';
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

    const telefono = this.telefono.trim();
    if (telefono && !/^[+0-9\s()./-]{6,30}$/.test(telefono)) {
      this.error.set('El teléfono ingresado no tiene un formato válido (mínimo 6 dígitos).');
      return;
    }

    const correo = this.correo.trim().toLowerCase();
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      this.error.set('El correo electrónico ingresado no tiene un formato válido.');
      return;
    }

    this.guardando.set(true);
    const proveedor = {
      nombre,
      telefono,
      correo,
      email: correo,
      contacto: this.contacto.trim() || [telefono, correo].filter(Boolean).join(' | '),
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
