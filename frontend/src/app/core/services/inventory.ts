import { Injectable, signal, computed } from '@angular/core';

export interface Material {
  id: number;
  nombre: string;
  categoria: string;
  ubicacion: string;
  cantidadActual: number;
  stockMinimo: number;
  proveedor: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private materiales = signal<Material[]>([
    { id: 1, nombre: 'Resma Papel A4 - 500 hojas', categoria: 'libreria', ubicacion: 'Pasillo 1 - Estante A', cantidadActual: 12, stockMinimo: 20, proveedor: 'Papelera Central' },
    { id: 2, nombre: 'Toner HP LaserJet Negro', categoria: 'insumos', ubicacion: 'Pasillo 3 - Estante B', cantidadActual: 2, stockMinimo: 5, proveedor: 'OfficeNet S.A.' },
    { id: 3, nombre: 'Lapiceras Azul - Caja x50', categoria: 'libreria', ubicacion: 'Pasillo 1 - Estante C', cantidadActual: 45, stockMinimo: 15, proveedor: 'Librería Mayorista' },
    { id: 4, nombre: 'Carpetas Clasificadoras A4', categoria: 'bazar-oficina', ubicacion: 'Pasillo 2 - Estante A', cantidadActual: 85, stockMinimo: 30, proveedor: 'Papelera Central' },
    { id: 5, nombre: 'Broches Abrochadora 24/6 - Caja', categoria: 'libreria', ubicacion: 'Pasillo 1 - Estante B', cantidadActual: 4, stockMinimo: 10, proveedor: 'Librería Mayorista' }
  ]);

  getMateriales = this.materiales.asReadonly();

  alertasCriticas = computed(() => {
    return this.materiales().filter(m => m.cantidadActual <= m.stockMinimo);
  });

  agregarMaterial(nuevo: Omit<Material, 'id'>) {
    const nextId = this.materiales().length > 0 ? Math.max(...this.materiales().map(m => m.id)) + 1 : 1;
    this.materiales.update(lista => [...lista, { ...nuevo, id: nextId }]);
  }

  eliminarMaterial(id: number) {
    this.materiales.update(lista => lista.filter(m => m.id !== id));
  }

  actualizarStock(id: number, cantidad: number) {
    this.materiales.update(lista =>
      lista.map(m => m.id === id ? { ...m, cantidadActual: Math.max(0, cantidad) } : m)
    );
  }

  getMaterialById(id: number) {
    return this.materiales().find(m => m.id === id);
  }
}
