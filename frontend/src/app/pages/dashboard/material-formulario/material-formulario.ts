import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventoryService, Material, Proveedor } from '../../../core/services/inventory';

@Component({
  selector: 'app-material-formulario',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  styleUrl: './material-formulario.css',
  templateUrl: './material-formulario.html',
})
export class MaterialFormulario implements OnInit {
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  enviando = signal(false);
  editando = signal(false);
  cargandoMaterial = signal(false);
  errorCarga = signal('');
  categorias = signal<string[]>([]);
  proveedores = signal<Proveedor[]>([]);
  private materialId: number | null = null;

  materialForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    categoria: new FormControl('', Validators.required),
    ubicacion: new FormControl(''),
    cantidadActual: new FormControl(10, [Validators.required, Validators.min(0)]),
    stockMinimo: new FormControl(5, [Validators.required, Validators.min(0)]),
    proveedor: new FormControl(''),
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam !== null) {
      const id = Number(idParam);
      if (!Number.isInteger(id) || id < 1) {
        this.errorCarga.set('El identificador del material no es válido.');
        return;
      }

      this.materialId = id;
      this.editando.set(true);
      this.cargandoMaterial.set(true);
      this.inventoryService.getMaterialById(id).subscribe({
        next: (material) => {
          this.materialForm.patchValue({
            nombre: material.nombre,
            categoria: material.categoria,
            ubicacion: material.ubicacion,
            cantidadActual: material.cantidadActual,
            stockMinimo: material.stockMinimo,
            proveedor: material.proveedor ?? '',
          });
          if (material.categoria && !this.categorias().includes(material.categoria)) {
            this.categorias.update(categorias => [...categorias, material.categoria]);
          }
          this.cargandoMaterial.set(false);
        },
        error: () => {
          this.errorCarga.set('No se pudo cargar el material. Verificá que exista e intentá nuevamente.');
          this.cargandoMaterial.set(false);
        },
      });
    }

    this.inventoryService.getCategorias().subscribe({
      next: (categorias) => {
        const nombres = categorias.map(categoria => categoria.nombre);
        const categoriaActual = this.materialForm.controls.categoria.value;
        if (categoriaActual && !nombres.includes(categoriaActual)) {
          nombres.push(categoriaActual);
        }
        this.categorias.set(nombres);
      },
      error: () => this.categorias.set([]),
    });
    this.inventoryService.getProveedores().subscribe({
      next: (proveedores) => this.proveedores.set(
        this.editando() ? proveedores : proveedores.filter(proveedor => proveedor.activo),
      ),
      error: () => this.proveedores.set([]),
    });
  }

  onSubmit() {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      return;
    }
    const vals = this.materialForm.getRawValue();
    this.enviando.set(true);
    const material: Omit<Material, 'id'> = {
      nombre: vals.nombre!,
      categoria: vals.categoria!,
      ubicacion: vals.ubicacion || 'Depósito General',
      cantidadActual: vals.cantidadActual!,
      stockMinimo: vals.stockMinimo!,
      proveedor: vals.proveedor || null,
    };
    const solicitud = this.materialId
      ? this.inventoryService.actualizarMaterial(this.materialId, material)
      : this.inventoryService.agregarMaterial(material);

    solicitud.subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/dashboard/inventario']);
      },
      error: () => {
        this.enviando.set(false);
        alert('No se pudo guardar el material. Verificá que la API de Django esté disponible.');
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
