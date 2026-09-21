import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory';

@Component({
  selector: 'app-material-formulario',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  styleUrl: './material-formulario.css',
  templateUrl: './material-formulario.html',
})
export class MaterialFormulario {
  private inventoryService = inject(InventoryService);
  private router = inject(Router);

  enviando = signal(false);

  materialForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    categoria: new FormControl('', Validators.required),
    ubicacion: new FormControl(''),
    cantidadActual: new FormControl(10, [Validators.required, Validators.min(0)]),
    stockMinimo: new FormControl(5, [Validators.required, Validators.min(0)]),
    proveedor: new FormControl(''),
  });

  onSubmit() {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      return;
    }
    const vals = this.materialForm.getRawValue();
    this.enviando.set(true);

    this.inventoryService
      .agregarMaterial({
        nombre: vals.nombre!,
        categoria: vals.categoria!,
        ubicacion: vals.ubicacion || 'Depósito General',
        cantidadActual: vals.cantidadActual!,
        stockMinimo: vals.stockMinimo!,
        proveedor: vals.proveedor || 'Sin especificar',
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.router.navigate(['/dashboard/inventario']);
        },
        error: () => {
          this.enviando.set(false);
          alert('Error al guardar. Verificá que json-server esté activo (npm run server).');
        },
      });
  }

  get nombreCtrl() {
    return this.materialForm.get('nombre');
  }

  get categoriaCtrl() {
    return this.materialForm.get('categoria');
  }
}
