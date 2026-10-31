# StockManager — Frontend (Angular)

SPA de gestión de inventario. Evidencia 5: consume **json-server** como API de prueba en el puerto 3000.

## Requisitos

- Node.js 20+
- npm

## Instalación

```bash
npm install
```
## Ejecución
npm run server
```
```bash
npm start
npm run dev
```
Este comando abre el servidor en otra ventana y levanta Angular.

Verificar la API

Abrir:

http://localhost:3000/materiales

Debe devolver los datos de materiales en formato JSON.

Usuarios de prueba

Los usuarios se encuentran definidos en db.json.
| Correo                                                      | Contraseña  | Rol           |
| ----------------------------------------------------------- | ----------- | ------------- |
| [admin@stockmanager.com](mailto:admin@stockmanager.com)     | admin123    | Administrador |
| [hector@stockmanager.com](mailto:hector@stockmanager.com)   | admin123    | Administrador |
| [gerardo@stockmanager.com](mailto:gerardo@stockmanager.com) | operario123 | Operario      |
| [belen@stockmanager.com](mailto:belen@stockmanager.com)     | operario123 | Operario      |
| [luciana@stockmanager.com](mailto:luciana@stockmanager.com) | operario123 | Operario      |
Funcionalidades Clave
Control de Acceso por Roles

Rutas protegidas mediante AuthGuard y RoleGuard según el perfil del usuario.

Vista operario simulada

Solo si iniciaste sesión como Administrador, en la barra lateral del dashboard aparece el botón:

Ver como operario / Volver a vista administrador

Esta funcionalidad no reemplaza el login; cambia los permisos y el menú para simular la experiencia de un usuario operario.

Auditoría

Registro de eventos clave, entre ellos:

Alertas de bajo stock.
Movimientos.
Inicio de sesión.

Estos eventos son administrados desde el servicio de auditoría.

Estructura relevante
src/app/
├── core/
│   ├── config/api.config.ts        # URL base API (localhost:3000)
│   ├── services/                   # auth, inventory, pedidos, usuarios, auditoria
│   └── guards/                     # auth-guard, role-guard
├── layouts/                        # public-layout, dashboard-layout
└── pages/
    ├── public/                     # home, quienes-somos
    └── dashboard/                  # login, inventario, pedidos, alertas, auditoria
db.json                             # Datos json-server (usuarios, materiales, pedidos, auditoria)
Build

Para generar la versión de producción:

npm run build