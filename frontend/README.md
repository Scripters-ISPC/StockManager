# StockManager — Frontend

Aplicación SPA de gestión de inventario desarrollada con Angular. El
frontend consume exclusivamente la API REST de Django.

## Requisitos

- Node.js 20+
- npm
- Backend Django ejecutándose en `http://localhost:8000`

## Instalación y ejecución

```bash
npm install
npm start
```

La aplicación estará disponible en `http://localhost:4200`.

La URL base de la API se configura en
`src/app/core/config/api.config.ts`:

```typescript
export const API_BASE_URL = 'http://localhost:8000/api/v1';
```

## Endpoints utilizados

- `POST /api/v1/usuarios/login/`
- `/api/v1/usuarios/`
- `/api/v1/inventario/materiales/`
- `/api/v1/pedidos/`
- `/api/v1/auditoria/`

El access token JWT se guarda en `localStorage` como `access_token` y el
interceptor Angular lo envía automáticamente como `Bearer`.

## Usuarios

Las cuentas se crean desde Django mediante un superusuario:

```bash
cd ../backend
python manage.py createsuperuser
```

Los usuarios administradores pueden crear cuentas operarias desde el panel.

## Build

```bash
npm run build
```
