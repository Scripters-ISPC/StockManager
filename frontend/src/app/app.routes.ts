import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';
import { QuienesSomos } from './componentes/quienes-somos/quienes-somos';
import { Login } from './componentes/login/login';
import { Dashboard } from './componentes/dashboard/dashboard';
import { DashboardInicio } from './componentes/dashboard-inicio/dashboard-inicio';
import { Inventario } from './componentes/inventario/inventario';
import { Alertas } from './componentes/alertas/alertas';
import { Pedidos } from './componentes/pedidos/pedidos';
import { Usuarios } from './componentes/usuarios/usuarios';
import { Auditoria } from './componentes/auditoria/auditoria';
import { MaterialFormulario } from './componentes/material-formulario/material-formulario';
import { PedidosFormulario } from './componentes/pedidos-formulario/pedidos-formulario';
import { UsuariosFormulario } from './componentes/usuarios-formulario/usuarios-formulario';
import { HistorialPedidos } from './componentes/historial-pedidos/historial-pedidos';
import { DetalleMaterial } from './componentes/detalle-material/detalle-material';
import { NotFound } from './componentes/not-found/not-found';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'quienes-somos', component: QuienesSomos },
    { path: 'login', component: Login },
    { 
        path: 'dashboard', 
        component: Dashboard,
        children: [
            { path: '', component: DashboardInicio },
            { path: 'inventario', component: Inventario },
            { path: 'alertas', component: Alertas },
            { path: 'pedidos', component: Pedidos },
            { path: 'usuarios', component: Usuarios },
            { path: 'auditoria', component: Auditoria },
            { path: 'material-formulario', component: MaterialFormulario },
            { path: 'pedidos-formulario', component: PedidosFormulario },
            { path: 'usuarios-formulario', component: UsuariosFormulario },
            { path: 'historial-pedidos', component: HistorialPedidos },
            { path: 'detalle-material', component: DetalleMaterial }
        ]
    },
    { path: '**', component: NotFound }
];