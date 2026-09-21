import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditoriaService, RegistroAuditoria } from '../../../core/services/auditoria';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  styleUrl: './auditoria.css',
  templateUrl: './auditoria.html',
})
export class Auditoria implements OnInit {
  private auditoriaService = inject(AuditoriaService);

  registros = signal<RegistroAuditoria[]>([]);
  cargando = signal(true);
  filtroMaterial = signal('');
  filtroUsuario = signal('');
  filtroTipo = signal<'todos' | RegistroAuditoria['tipo']>('todos');
  filtroFecha = signal('');
  orden = signal<'recientes' | 'antiguos'>('recientes');

  materiales = computed(() => [...new Set(this.registros().map((reg) => reg.materialNombre))].sort());
  usuarios = computed(() => [...new Set(this.registros().map((reg) => reg.usuario))].sort());
  registrosVisibles = computed(() => {
    const material = this.filtroMaterial();
    const usuario = this.filtroUsuario();
    const tipo = this.filtroTipo();
    const fecha = this.filtroFecha();

    return this.registros()
      .filter((reg) =>
        (!material || reg.materialNombre === material) &&
        (!usuario || reg.usuario === usuario) &&
        (tipo === 'todos' || reg.tipo === tipo) &&
        (!fecha || reg.fecha === fecha)
      )
      .sort((a, b) => {
        const diferencia = this.fechaMovimiento(b) - this.fechaMovimiento(a);
        return this.orden() === 'recientes' ? diferencia : -diferencia;
      });
  });

  ngOnInit() {
    this.auditoriaService.getRegistros().subscribe({
      next: (lista) => {
        this.registros.set(lista);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  etiquetaAccion(reg: RegistroAuditoria): string {
    const signo = reg.tipo === 'ingreso' ? '+' : '-';
    return `${reg.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} (${signo}${reg.cantidad})`;
  }

  fechaMovimiento(reg: RegistroAuditoria): number {
    return new Date(reg.fechaHora || (reg.fecha + 'T00:00:00')).getTime();
  }

  mostrarFecha(reg: RegistroAuditoria): string {
    if (!reg.fechaHora) {
      return reg.fecha;
    }
    return new Date(reg.fechaHora).toLocaleDateString('es-AR');
  }

  mostrarHora(reg: RegistroAuditoria): string {
    return reg.fechaHora
      ? new Date(reg.fechaHora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '—';
  }

  limpiarFiltros() {
    this.filtroMaterial.set('');
    this.filtroUsuario.set('');
    this.filtroTipo.set('todos');
    this.filtroFecha.set('');
    this.orden.set('recientes');
  }
}
