import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { InventoryService, Material } from '../../../core/services/inventory';
import { AuditoriaService } from '../../../core/services/auditoria';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario implements OnInit {
  authService = inject(AuthService);
  private inventoryService = inject(InventoryService);
  private auditoriaService = inject(AuditoriaService);

  materiales = signal<Material[]>([]);
  cargando = signal(true);
  errorApi = signal(false);
  materialParaEgreso = signal<Material | null>(null);
  cantidadEgreso = 1;
  motivoEgreso = '';
  errorEgreso = signal('');

  ngOnInit() {
    this.cargarMateriales();
  }

  cargarMateriales() {
    this.cargando.set(true);
    this.inventoryService.getMateriales().subscribe({
      next: (lista) => {
        this.materiales.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.errorApi.set(true);
      }
    });
  }

  eliminar(id: number) {
    if (confirm('¿Está seguro de eliminar este material?')) {
      this.inventoryService.eliminarMaterial(id).subscribe(() => {
        this.cargarMateriales();
      });
    }
  }

  ajustarStock(item: Material, cambio: number) {
    if (!this.authService.isAdmin()) {
      return;
    }

    const stockAnterior = item.cantidadActual;
    const stockNuevo = Math.max(0, stockAnterior + cambio);
    if (stockNuevo === stockAnterior) {
      return;
    }

    const usuario =
      this.authService.usuarioActual()?.nombre ??
      (this.authService.isAdmin() ? 'Administrador' : 'Operario');

    this.inventoryService.actualizarStock(item.id!, stockNuevo).subscribe({
      next: () => {
        this.auditoriaService
          .registrar({
            materialId: item.id!,
            materialNombre: item.nombre,
            tipo: cambio > 0 ? 'ingreso' : 'egreso',
            cantidad: Math.abs(cambio),
            stockAnterior,
            stockNuevo,
            usuario,
            fecha: new Date().toISOString().split('T')[0],
            fechaHora: new Date().toISOString(),
            observacion: 'Ajuste manual desde inventario',
          })
          .subscribe({ complete: () => this.cargarMateriales() });
      },
    });
  }

  abrirRegistroEgreso(item: Material) {
    this.materialParaEgreso.set(item);
    this.cantidadEgreso = 1;
    this.motivoEgreso = '';
    this.errorEgreso.set('');
  }

  cerrarRegistroEgreso() {
    this.materialParaEgreso.set(null);
    this.cantidadEgreso = 1;
    this.motivoEgreso = '';
    this.errorEgreso.set('');
  }

  registrarEgreso() {
    const item = this.materialParaEgreso();
    const cantidad = Number(this.cantidadEgreso);
    const motivo = this.motivoEgreso.trim();

    if (!item?.id || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > item.cantidadActual) {
      this.errorEgreso.set('Ingresá una cantidad válida que no supere el stock disponible.');
      return;
    }
    if (!motivo) {
      this.errorEgreso.set('Indicá el motivo de la disminución.');
      return;
    }

    const stockAnterior = item.cantidadActual;
    const stockNuevo = stockAnterior - cantidad;
    const usuario = this.authService.usuarioActual()?.nombre ?? 'Operario';

    this.inventoryService.actualizarStock(item.id, stockNuevo).subscribe({
      next: () => {
        this.auditoriaService.registrar({
          materialId: item.id!,
          materialNombre: item.nombre,
          tipo: 'egreso',
          cantidad,
          stockAnterior,
          stockNuevo,
          usuario,
          fecha: new Date().toISOString().split('T')[0],
          fechaHora: new Date().toISOString(),
          observacion: motivo,
        }).subscribe({
          next: () => {
            this.cerrarRegistroEgreso();
            this.cargarMateriales();
          },
          error: () => this.errorEgreso.set('El stock se actualizó, pero no se pudo guardar el registro de auditoría.'),
        });
      },
      error: () => this.errorEgreso.set('No se pudo actualizar el stock.'),
    });
  }
}
