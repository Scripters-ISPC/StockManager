import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PedidosService } from '../../../core/services/pedidos';
import { InventoryService, Material } from '../../../core/services/inventory';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-pedidos-formulario',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  styleUrl: './pedidos-formulario.css',
  templateUrl: './pedidos-formulario.html',
})
export class PedidosFormulario implements OnInit {
  private pedidosService = inject(PedidosService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private authService = inject(AuthService);

  materiales = signal<Material[]>([]);
  proveedores = signal<string[]>([]);
  cargandoCatalogo = signal(true);

  enviando = false;
  exito = false;

  pedidoForm = new FormGroup({
    producto: new FormControl('', [Validators.required, Validators.minLength(3)]),
    cantidad: new FormControl(1, [Validators.required, Validators.min(1)]),
    proveedor: new FormControl('', [Validators.required]),
    urgencia: new FormControl<'baja' | 'media' | 'alta'>('media', [Validators.required]),
    observaciones: new FormControl('')
  });

  ngOnInit() {
    this.inventoryService.getMateriales().subscribe({
      next: (lista) => {
        this.materiales.set(lista);
        const unicos = [...new Set(lista.map(m => m.proveedor).filter(Boolean))];
        this.proveedores.set(unicos);
        this.cargandoCatalogo.set(false);
      },
      error: () => this.cargandoCatalogo.set(false),
    });

    this.pedidoForm.get('producto')?.valueChanges.subscribe(nombre => {
      const material = this.materiales().find(m => m.nombre === nombre);
      if (material?.proveedor) {
        this.pedidoForm.patchValue({ proveedor: material.proveedor }, { emitEvent: false });
      }
    });
  }

  onSubmit() {
    if (this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched();
      return;
    }
    this.enviando = true;
    const vals = this.pedidoForm.getRawValue();
    const solicitante = this.authService.usuarioActual();

    this.pedidosService.crearPedido({
      producto: vals.producto!,
      cantidad: vals.cantidad!,
      proveedor: vals.proveedor!,
      urgencia: vals.urgencia!,
      observaciones: vals.observaciones || '',
      solicitanteId: solicitante?.id,
      solicitanteNombre: solicitante?.nombre
    }).subscribe({
      next: () => {
        this.enviando = false;
        this.exito = true;
        setTimeout(() => this.router.navigate(['/dashboard/pedidos']), 1500);
      },
      error: () => {
        this.enviando = false;
        alert('Error al registrar la solicitud. Verificá que el servidor esté activo.');
      }
    });
  }

  get productoCtrl() { return this.pedidoForm.get('producto'); }
  get cantidadCtrl() { return this.pedidoForm.get('cantidad'); }
  get proveedorCtrl() { return this.pedidoForm.get('proveedor'); }
}
