CREATE DATABASE IF NOT EXISTS stockmanager_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Seleccionar esta base antes de ejecutar las migraciones de Django.
USE stockmanager_db;

-- El esquema oficial se crea con:
--   python manage.py migrate
-- Los datos de prueba se cargan con:
--   python manage.py loaddata initial_data.json
