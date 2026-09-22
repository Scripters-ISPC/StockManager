# StockManager — Frontend (Angular)

SPA de gestión de inventario. Evidencia 5: consume **json-server** como API de prueba.

## Requisitos

- Node.js 20+
- npm

## Instalación

```bash
npm install
```

## Ejecución (dos terminales)

```bash
# Terminal 1 — API (puerto 3000)
npm run server

# Terminal 2 — Angular (puerto 4200)
npm start
```

Alternativa en Windows: `npm run dev` (abre el server en otra ventana y levanta Angular).

Verificá la API: [http://localhost:3000/materiales](http://localhost:3000/materiales) debe devolver JSON.

## Usuarios de prueba (`db.json`)

| Correo | Contraseña | Rol |
| :--- | :--- | :--- |
| admin@stockmanager.com | admin123 | Administrador |
| hector@stockmanager.com | admin123 | Administrador |
| gerardo@stockmanager.com | operario123 | Operario |
| belen@stockmanager.com | operario123 | Operario |
| luciana@stockmanager.com | operario123 | Operario |

## Vista operario simulada

Solo si iniciaste sesión como **Administrador**: en la barra lateral del dashboard, botón **Ver como operario** / **Volver a vista administrador**. No reemplaza el login; cambia permisos y menú como un operario real.

## Estructura relevante

```text
src/app/
├── core/
│   ├── config/api.config.ts    # URL base API (localhost:3000)
│   ├── services/               # auth, inventory, pedidos, usuarios, auditoria
│   └── guards/                 # auth-guard, role-guard
├── layouts/                    # public-layout, dashboard-layout
└── pages/
    ├── public/                 # home, quienes-somos
    └── dashboard/              # login, inventario, pedidos, etc.
db.json                         # Datos json-server (usuarios, materiales, pedidos, auditoria)
```

## Build

```bash
npm run build
```
