import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuditoriaService, RegistroAuditoria } from '../../../core/services/auditoria';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [RouterLink, CommonModule],
  styleUrl: './auditoria.css',
  templateUrl: './auditoria.html',
})
export class Auditoria implements OnInit {
  private auditoriaService = inject(AuditoriaService);

  registros = signal<RegistroAuditoria[]>([]);
  cargando = signal(true);

  ngOnInit() {
    this.auditoriaService.getRegistros().subscribe({
      next: (lista) => {
        this.registros.set(
          [...lista].sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))
        );
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  etiquetaAccion(reg: RegistroAuditoria): string {
    const signo = reg.tipo === 'ingreso' ? '+' : '-';
    return `${reg.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} (${signo}${reg.cantidad})`;
  }
}
