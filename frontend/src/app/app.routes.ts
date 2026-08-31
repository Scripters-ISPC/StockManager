import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Productos } from './components/productos/productos';
import { QuienesSomos } from './components/quienes-somos/quienes-somos';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'productos', component: Productos },
  { path: 'quienes-somos', component: QuienesSomos}
];