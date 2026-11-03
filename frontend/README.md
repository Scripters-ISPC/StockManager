# Frontend de StockManager

Aplicación SPA desarrollada con Angular. Consume exclusivamente la API REST
de Django mediante `HttpClient`, servicios y Observables.

## Requisitos previos

- Node.js compatible con Angular 17 o superior.
- npm.
- Angular CLI.
- Backend Django ejecutándose en `http://localhost:8000/`.

Verificar las herramientas instaladas:

```powershell
node --version
npm --version
ng version
```

## Instalación paso a paso

Desde la carpeta `frontend/`:

```powershell
npm install
```

La URL base de la API se encuentra en:

```text
src/app/core/config/api.config.ts
```

Por defecto apunta a:

```text
http://localhost:8000/api/v1
```

## Ejecución del servidor

```powershell
ng serve
```

También puede utilizarse el script configurado en el proyecto:

```powershell
npm start
```

La aplicación estará disponible en:

```text
http://localhost:4200/
```

## Estructura de la SPA

La aplicación utiliza componentes standalone, rutas protegidas, formularios
reactivos y control de acceso por roles.

- **Landing Page:** página pública de inicio del sistema.
- **Quiénes Somos:** presentación institucional del proyecto.
- **Login:** autenticación mediante correo y contraseña con JWT.
- **Dashboard dinámico por roles:** navegación y acciones diferenciadas para
  administradores y operarios.
- **Inventario:** materiales, categorías, proveedores, stock y alertas.
- **Pedidos:** creación, aprobación, cancelación, seguimiento y confirmación
  de ingreso.
- **Auditoría e historial:** consulta de movimientos y pedidos registrados.
- **Página 404 personalizada:** respuesta visual para rutas inexistentes.

Para generar una compilación de producción:

```powershell
npm run build
```
