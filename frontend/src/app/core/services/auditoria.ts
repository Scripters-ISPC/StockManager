import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface RegistroAuditoria {
  id?: number;
  materialId: number;
  materialNombre: string;
  tipo: 'ingreso' | 'egreso';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  usuario: string;
  fecha: string;
  fechaHora?: string;
  observacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/auditoria`;

  getRegistros(): Observable<RegistroAuditoria[]> {
    return this.http.get<RegistroAuditoria[]>(this.apiUrl);
  }

  getPorMaterial(materialId: number): Observable<RegistroAuditoria[]> {
    return this.http.get<RegistroAuditoria[]>(
      `${this.apiUrl}?materialId=${materialId}&_sort=fecha&_order=desc`
    );
  }

  registrar(registro: Omit<RegistroAuditoria, 'id'>): Observable<RegistroAuditoria> {
    return this.http.post<RegistroAuditoria>(this.apiUrl, registro);
  }
}
