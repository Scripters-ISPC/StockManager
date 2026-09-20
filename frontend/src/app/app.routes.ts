import { Routes } from '@angular/router';

import { PublicLayout } from './layouts/public-layout/public-layout';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';

import { Home } from './pages/public/home/home';
import { QuienesSomos } from './pages/public/quienes-somos/quienes-somos';

import { Login } from './pages/dashboard/login/login';
import { DashboardHome } from './pages/dashboard/home/home'; // <-- Verifica que la ruta coincida con tu carpeta dashboard-inicio
import { Inventario } from './pages/dashboard/inventario/inventario';
import { Alertas } from './pages/dashboard/alertas/alertas';
import { Pedidos } from './pages/dashboard/pedidos/pedidos';
import { Usuarios } from './pages/dashboard/usuarios/usuarios';
import { Auditoria } from './pages/dashboard/auditoria/auditoria';
import { MaterialFormulario } from './pages/dashboard/material-formulario/material-formulario';
import { PedidosFormulario } from './pages/dashboard/pedidos-formulario/pedidos-formulario';
import { UsuariosFormulario } from './pages/dashboard/usuarios-formulario/usuarios-formulario';
import { HistorialPedidos } from './pages/dashboard/historial-pedidos/historial-pedidos';
import { DetalleMaterial } from './pages/dashboard/detalle-material/detalle-material';

import { NotFound } from './shared/not-found/not-found';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            { path: '', component: Home },
            { path: 'quienes-somos', component: QuienesSomos }
        ]
    },

    { path: 'login', component: Login },

    { 
        path: 'dashboard', 
        component: DashboardLayout,
        children: [
            { path: '', component: DashboardHome}, 
            { path: 'inventario', component: Inventario },
            { path: 'alertas', component: Alertas },
            { path: 'pedidos', component: Pedidos },
            { path: 'usuarios', component: Usuarios, canActivate: [roleGuard] },
            { path: 'auditoria', component: Auditoria },
            { path: 'material-formulario', component: MaterialFormulario, canActivate: [roleGuard] },
            { path: 'pedidos-formulario', component: PedidosFormulario },
            { path: 'usuarios-formulario', component: UsuariosFormulario, canActivate: [roleGuard] },
            { path: 'historial-pedidos', component: HistorialPedidos },
            { path: 'detalle-material', component: DetalleMaterial }
        ]
    },

    { path: '**', component: NotFound }
];
