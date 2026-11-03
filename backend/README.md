# Backend de StockManager

API REST modular desarrollada con Django REST Framework. Gestiona usuarios,
inventario, pedidos y auditoría sobre una base de datos relacional MySQL.

## Requisitos previos

- Python 3.10 o superior.
- MySQL Server 8.4 o superior.
- Git.

## Instalación paso a paso

Desde la carpeta `backend/`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configurar las variables de conexión en `backend/.env`:

```env
DB_NAME=stockmanager_db
DB_USER=root
DB_PASSWORD=tu_clave
DB_HOST=127.0.0.1
DB_PORT=3306
```

La base puede crearse previamente ejecutando `database/init_db.sql` desde
MySQL.

## Configuración e inicialización

Con el entorno virtual activo y ubicados en `backend/`:

```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py loaddata initial_data.json
python manage.py runserver
```

La API estará disponible en `http://localhost:8000/`.

El fixture debe cargarse una sola vez sobre una base limpia. Si la base ya
contiene los mismos registros, eliminarla y recrearla antes de ejecutar
`loaddata`.

La documentación interactiva de la API está disponible en:

- Swagger UI: `http://localhost:8000/api/v1/docs/`
- Esquema OpenAPI: `http://localhost:8000/api/schema/`

## Estructura relacional

La carpeta `backend/database/` contiene:

- `init_db.sql`: crea la base MySQL y describe la inicialización del entorno.
- `schema.sql`: documenta el diseño físico completo, incluyendo tablas,
  claves primarias, índices, claves foráneas y reglas `ON DELETE`.

Las migraciones de Django son la fuente operativa recomendada para construir
el esquema. Los scripts SQL se incluyen para la auditoría docente del diseño
relacional.

## Credenciales de prueba

Todas las cuentas del fixture utilizan la contraseña `Admin123!`.

| Usuario | Rol | Contraseña |
|---|---|---|
| `admin@stockmanager.com` | Administrador | `Admin123!` |
| `admin2@stockmanager.com` | Administrador | `Admin123!` |
| `operario@stockmanager.com` | Operario | `Admin123!` |
| `operario2@stockmanager.com` | Operario | `Admin123!` |
| `operario3@stockmanager.com` | Operario | `Admin123!` |
| `operario4@stockmanager.com` | Operario | `Admin123!` |
