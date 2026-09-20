import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory';

@Component({
  selector: 'app-material-formulario',
  standalone: true,
  imports: [RouterLink, FormsModule],
  styleUrl: './material-formulario.css',
  templateUrl: './material-formulario.html',
})
export class MaterialFormulario {
  private inventoryService = inject(InventoryService);
  private router = inject(Router);

  nombre = '';
  categoria = '';
  ubicacion = '';
  cantidadActual = 10;
  stockMinimo = 5;
  proveedor = '';

  onSubmit() {
    if (this.nombre && this.categoria) {
      this.inventoryService.agregarMaterial({
        nombre: this.nombre,
        categoria: this.categoria,
        ubicacion: this.ubicacion || 'Depósito General',
        cantidadActual: this.cantidadActual,
        stockMinimo: this.stockMinimo,
        proveedor: this.proveedor || 'Sin especificar'
      });
      alert('¡Material guardado en inventario!');
      this.router.navigate(['/dashboard/inventario']);
    } else {
      alert('Por favor complete los campos obligatorios.');
    }
  }
}
