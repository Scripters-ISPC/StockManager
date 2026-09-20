import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { InventoryService, Material } from '../../../core/services/inventory';
import { AuditoriaService } from '../../../core/services/auditoria';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [RouterLink, CommonModule],
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
            observacion: 'Ajuste manual desde inventario',
          })
          .subscribe({ complete: () => this.cargarMateriales() });
      },
    });
  }
}
