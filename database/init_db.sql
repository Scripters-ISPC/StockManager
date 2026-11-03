-- Bootstrap de la base MySQL para StockManager.
-- El esquema lo crea Django mediante sus migraciones.

CREATE DATABASE IF NOT EXISTS stockmanager_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Después de ejecutar este archivo:
--   cd backend
--   python manage.py migrate
--   python manage.py loaddata fixtures/initial_data.json
--
-- Usuario demo:
--   admin@stockmanager.com
--   Admin123!
