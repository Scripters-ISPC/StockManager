-- ===================================================
-- Script de Creación e Inicialización de Base de Datos
-- Proyecto: StockManager
-- Motor: MySQL 8.0+
-- ===================================================

CREATE DATABASE IF NOT EXISTS stockmanager_db
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE stockmanager_db;

-- Desactivar revisión de claves foráneas para recrear tablas
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS materiales;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tabla: usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabla: materiales (Catálogo de Inventario basado en db.json)
CREATE TABLE materiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    ubicacion VARCHAR(100) NOT NULL,
    cantidad_actual INT NOT NULL DEFAULT 0 CHECK (cantidad_actual >= 0),
    stock_minimo INT NOT NULL DEFAULT 1 CHECK (stock_minimo >= 0),
    proveedor VARCHAR(120) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabla: pedidos (Reposición de Stock)
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    usuario_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    proveedor VARCHAR(120) NOT NULL,
    urgencia ENUM('Baja', 'Media', 'Alta') NOT NULL DEFAULT 'Media',
    estado ENUM('Pendiente', 'Completado', 'Cancelado') NOT NULL DEFAULT 'Pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedidos_material FOREIGN KEY (material_id) 
        REFERENCES materiales(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. Tabla: auditoria (Historial de Transacciones)
CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    accion VARCHAR(100) NOT NULL,
    detalle TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ===================================================
-- CARGA INICIAL DE DATOS (Semilla / Seeders)
-- Coherencia con estructura histórica de db.json
-- ===================================================

-- Usuarios (Roles Admin y User)
INSERT INTO usuarios (id, nombre, email, password, rol) VALUES
(1, 'Administrador General', 'admin@stockmanager.com', 'admin123', 'Admin'),
(2, 'Juan Pérez', 'juan.perez@stockmanager.com', 'user123', 'User');

-- Catálogo de Materiales
INSERT INTO materiales (id, nombre, categoria, ubicacion, cantidad_actual, stock_minimo, proveedor) VALUES
(1, 'Tornillos M6x20', 'Ferretería', 'Estante A-1', 15, 50, 'Ferretería Central'),
(2, 'Cables Unipolar 2.5mm', 'Electricidad', 'Estante B-3', 120, 30, 'ElectroSur'),
(3, 'Pintura Sintética Blanca 4L', 'Pinturería', 'Depósito C', 8, 10, 'Pinturas del Norte'),
(4, 'Lija para Madera P120', 'Herramientas', 'Estante A-2', 200, 25, 'Ferretería Central');

-- Pedidos
INSERT INTO pedidos (id, material_id, usuario_id, cantidad, proveedor, urgencia, estado) VALUES
(1, 1, 2, 100, 'Ferretería Central', 'Alta', 'Pendiente'),
(2, 3, 1, 15, 'Pinturas del Norte', 'Media', 'Pendiente');

-- Registros de Auditoría
INSERT INTO auditoria (id, usuario_id, accion, detalle) VALUES
(1, 1, 'INICIALIZACIÓN', 'Carga inicial del sistema y catálogo de materiales.'),
(2, 2, 'SOLICITUD_PEDIDO', 'Generación de pedido de reposición para Tornillos M6x20.');