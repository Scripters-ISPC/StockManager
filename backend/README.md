# Backend de StockManager

## Requisitos

- Python 3.14 recomendado (Python 3.12+ compatible).
- Django 6.1.2.
- Django REST Framework 3.18.3.
- MySQL 8.0 o superior.

## Instalación rápida

Desde la carpeta `backend/`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configurar las variables de conexión a MySQL en `backend/.env` (`DB_NAME`,
`DB_USER`, `DB_PASSWORD`, `DB_HOST` y `DB_PORT`). La base puede prepararse con
`database/init_db.sql`.

## Configuración, migraciones y datos de prueba

```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py loaddata initial_data.json
python manage.py runserver
```

El fixture debe cargarse una sola vez sobre una base limpia. Si se reutiliza
una base con los mismos identificadores, limpiar los datos o recrear la base
antes de ejecutar `loaddata`.

## Documentación de la base de datos

La carpeta `backend/database/` contiene:

- `init_db.sql`: crea la base MySQL y describe el orden de inicialización.
- `schema.sql`: documenta las tablas, claves primarias, claves foráneas,
  índices y reglas `ON DELETE` del diseño relacional.

Las migraciones de Django son la fuente operativa recomendada para crear el
esquema, mientras que `schema.sql` permite auditarlo directamente en SQL.

## Credenciales de prueba

Todas las contraseñas del fixture son hashes Django válidos de `Admin123!`.

| Usuario | Rol | Contraseña |
|---|---|---|
| admin@stockmanager.com | Administrador | `Admin123!` |
| admin2@stockmanager.com | Administrador | `Admin123!` |
| operario@stockmanager.com | Operario | `Admin123!` |
| operario2@stockmanager.com | Operario | `Admin123!` |
| operario3@stockmanager.com | Operario | `Admin123!` |
| operario4@stockmanager.com | Operario | `Admin123!` |
