import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Productos } from './components/productos/productos';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'productos', component: Productos },
];