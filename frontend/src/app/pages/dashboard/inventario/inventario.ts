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
  mensajeAjuste = signal('');
  materialParaAjuste = signal<Material | null>(null);
  tipoAjuste = signal<'ingreso' | 'egreso'>('ingreso');
  cantidadAjuste = 1;
  motivoAjuste = '';
  errorAjuste = signal('');
  guardandoAjuste = signal(false);
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

    this.mensajeAjuste.set('');
    this.materialParaAjuste.set(item);
    this.tipoAjuste.set(cambio > 0 ? 'ingreso' : 'egreso');
    this.cantidadAjuste = 1;
    this.motivoAjuste = '';
    this.errorAjuste.set('');
  }

  cerrarAjusteStock() {
    if (this.guardandoAjuste()) {
      return;
    }
    this.materialParaAjuste.set(null);
    this.cantidadAjuste = 1;
    this.motivoAjuste = '';
    this.errorAjuste.set('');
  }

  confirmarAjusteStock() {
    const item = this.materialParaAjuste();
    const cantidad = Number(this.cantidadAjuste);
    const motivo = this.motivoAjuste.trim();
    const esIngreso = this.tipoAjuste() === 'ingreso';

    if (!item?.id || !Number.isInteger(cantidad) || cantidad < 1 ||
        (!esIngreso && cantidad > item.cantidadActual)) {
      this.errorAjuste.set(esIngreso
        ? 'Ingresá una cantidad entera mayor que cero.'
        : 'La cantidad debe ser mayor que cero y no superar el stock disponible.');
      return;
    }
    if (!motivo) {
      this.errorAjuste.set('Indicá el motivo del ajuste.');
      return;
    }

    const stockAnterior = item.cantidadActual;
    const stockNuevo = esIngreso
      ? stockAnterior + cantidad
      : stockAnterior - cantidad;
    const usuario = this.authService.usuarioActual()?.nombre ?? 'Administrador';
    this.guardandoAjuste.set(true);
    this.errorAjuste.set('');

    this.inventoryService.actualizarStock(item.id, stockNuevo).subscribe({
      next: () => {
        this.auditoriaService.registrar({
          materialId: item.id!,
          materialNombre: item.nombre,
          tipo: this.tipoAjuste(),
          cantidad,
          stockAnterior,
          stockNuevo,
          usuario,
          fecha: new Date().toISOString().split('T')[0],
          fechaHora: new Date().toISOString(),
          observacion: motivo,
        }).subscribe({
          next: () => {
            this.guardandoAjuste.set(false);
            this.cerrarAjusteStock();
            this.cargarMateriales();
          },
          error: () => {
            this.guardandoAjuste.set(false);
            this.materialParaAjuste.set(null);
            this.mensajeAjuste.set('El stock se actualizó, pero no se pudo guardar el registro de auditoría.');
            this.cargarMateriales();
          },
        });
      },
      error: () => {
        this.guardandoAjuste.set(false);
        this.errorAjuste.set('No se pudo actualizar el stock. Revisá la conexión e intentá nuevamente.');
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
