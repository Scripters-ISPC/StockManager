import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService, Material } from '../../../core/services/inventory';
import { AuditoriaService, RegistroAuditoria } from '../../../core/services/auditoria';

@Component({
  selector: 'app-detalle-material',
  standalone: true,
  imports: [RouterLink, CommonModule],
  styleUrl: './detalle-material.css',
  templateUrl: './detalle-material.html',
})
export class DetalleMaterial implements OnInit {
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryService);
  private auditoriaService = inject(AuditoriaService);

  material = signal<Material | null>(null);
  historial = signal<RegistroAuditoria[]>([]);
  cargando = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.cargando.set(false);
      return;
    }

    this.inventoryService.getMaterialById(id).subscribe({
      next: (m) => {
        this.material.set(m);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });

    this.auditoriaService.getPorMaterial(id).subscribe({
      next: (lista) => this.historial.set(lista),
    });
  }

  esCritico(m: Material): boolean {
    return m.cantidadActual <= m.stockMinimo;
  }
}
