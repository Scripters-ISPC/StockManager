import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Categoria, InventoryService } from '../../../core/services/inventory';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias implements OnInit {
  private inventoryService = inject(InventoryService);

  categorias = signal<Categoria[]>([]);
  nombre = '';
  editandoId: number | null = null;
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.inventoryService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las categorías.');
        this.cargando.set(false);
      },
    });
  }

  editar(categoria: Categoria) {
    this.editandoId = categoria.id;
    this.nombre = categoria.nombre;
    this.error.set('');
  }

  cancelar() {
    this.editandoId = null;
    this.nombre = '';
    this.error.set('');
  }

  guardar() {
    const nombre = this.nombre.trim();
    if (!nombre) {
      this.error.set('Ingresá un nombre de categoría.');
      return;
    }

    this.guardando.set(true);
    const request = this.editandoId === null
      ? this.inventoryService.crearCategoria(nombre)
      : this.inventoryService.actualizarCategoria(this.editandoId, nombre);

    request.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cancelar();
        this.cargar();
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar la categoría.');
      },
    });
  }

  eliminar(categoria: Categoria) {
    if (!confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
      return;
    }

    this.inventoryService.eliminarCategoria(categoria.id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo eliminar la categoría.'),
    });
  }
}
