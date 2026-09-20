import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedidosService } from '../../../core/services/pedidos';

@Component({
  selector: 'app-pedidos-formulario',
  standalone: true,
  imports: [RouterLink, FormsModule],
  styleUrl: './pedidos-formulario.css',
  templateUrl: './pedidos-formulario.html',
})
export class PedidosFormulario {
  private pedidosService = inject(PedidosService);
  private router = inject(Router);

  producto = '';
  cantidad = 1;
  proveedor = '';
  urgencia: 'baja' | 'media' | 'alta' = 'media';
  observaciones = '';

  onSubmit() {
    if (this.producto && this.cantidad > 0 && this.proveedor) {
      this.pedidosService.crearPedido({
        producto: this.producto,
        cantidad: this.cantidad,
        proveedor: this.proveedor,
        urgencia: this.urgencia,
        observaciones: this.observaciones
      });
      alert('¡Solicitud enviada con éxito!');
      this.router.navigate(['/dashboard/pedidos']);
    } else {
      alert('Por favor complete todos los campos requeridos.');
    }
  }
}
