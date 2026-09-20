import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Usamos Signals de Angular para mantener el estado reactivo del rol
  // Por defecto, iniciamos sin rol ('')
  userRole = signal<string>('');

  constructor() {}

  login(rol: 'admin' | 'operario') {
    this.userRole.set(rol);
  }

  logout() {
    this.userRole.set('');
  }

  getRole() {
    return this.userRole();
  }

  isAdmin() {
    return this.userRole() === 'admin';
  }

  isOperario() {
    return this.userRole() === 'operario';
  }
}