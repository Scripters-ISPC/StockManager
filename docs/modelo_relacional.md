# Modelo Relacional de Base de Datos — StockManager

**Base de Datos:** `stockmanager_db`  
**Motor SGBD:** MySQL 8.0+ / MariaDB 10.5+  
**Motor de Almacenamiento:** InnoDB (Soporte ACID completo y claves foráneas)  
**Codificación / Cotejamiento:** `utf8mb4` / `utf8mb4_unicode_ci`  
**Script Fuente:** `database/init_db.sql`  
**Versión:** 1.0.0 (Oficial)  

---

## 1. Introducción y Contexto Arquitectural

El modelo de datos relacional de **StockManager** fue diseñado para garantizar la integridad referencial, el aislamiento transaccional y la alta disponibilidad en el procesamiento de inventarios empresariales. La base de datos centraliza la información de los usuarios del sistema, el catálogo de insumos y materiales físicos, las órdenes de reposición y la bitácora inmutable de auditoría.

El script DDL de referencia `database/init_db.sql` inicializa el esquema `stockmanager_db` con el conjunto de caracteres `utf8mb4` (permitiendo caracteres especiales, tildes y símbolos internacionales) y configura el motor **InnoDB** para todas las tablas, habilitando transacciones seguras (`COMMIT` / `ROLLBACK`) y reglas de integridad referencial en cascada o restricción.

```sql
CREATE DATABASE IF NOT EXISTS stockmanager_db
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE stockmanager_db;
```

---

## 2. Diagrama de Estructura Lógica

El esquema se estructura en cuatro tablas principales normalizadas hasta la **Tercera Forma Normal (3FN)**:

```
+-----------------------------------------------------------------------------------+
|                                 stockmanager_db                                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +--------------------+          1:N          +------------------------------+   |
|   |      usuarios      | --------------------> |           pedidos            |   |
|   +--------------------+                       +------------------------------+   |
|   | PK id              |                       | PK id                        |   |
|   |    nombre          |                       | FK material_id -> materiales |   |
|   | UK email           |                       | FK usuario_id  -> usuarios   |   |
|   |    password        |                       |    cantidad                  |   |
|   |    rol (ENUM)      |                       |    proveedor                 |   |
|   |    creado_en       |                       |    urgencia (ENUM)           |   |
|   +--------------------+                       |    estado (ENUM)             |   |
|             | 1                                |    fecha_solicitud           |   |
|             |                                  +------------------------------+   |
|             | 1:N                                             ^                   |
|             v                                                 | 1:N               |
|   +--------------------+                                      |                   |
|   |     auditoria      |                       +------------------------------+   |
|   +--------------------+                       |          materiales          |   |
|   | PK id              |                       +------------------------------+   |
|   | FK usuario_id      |                       | PK id                        |   |
|   |    accion          |                       |    nombre                    |   |
|   |    detalle         |                       |    categoria                 |   |
|   |    fecha           |                       |    ubicacion                 |   |
|   +--------------------+                       |    cantidad_actual           |   |
|                                                |    stock_minimo              |   |
|                                                |    proveedor                 |   |
|                                                |    creado_en                 |   |
|                                                +------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Diccionario de Datos Detallado

A continuación se detalla cada una de las 4 tablas que conforman el sistema, con sus tipos de datos nativos en MySQL, restricciones de nulidad, claves, valores predeterminados y propósito de negocio.

---

### 3.1 Tabla: `usuarios`

- **Propósito:** Almacena la información de las cuentas de usuario autorizadas para ingresar a la plataforma, sus credenciales protegidas y el rol operativo asignado (control de acceso RBAC).

#### Estructura y Atributos:
| Campo | Tipo de Dato MySQL | Nulo / Requerido | Clave / Restricción | Valor por Defecto | Descripción de Negocio |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `INT` | `NOT NULL` | **PRIMARY KEY** (Auto-incremental) | *Autoincrement* | Identificador único unívoco del usuario en el sistema. |
| **`nombre`** | `VARCHAR(100)` | `NOT NULL` | Ninguna | *Ninguno* | Nombre y apellido completo del operador o administrador. |
| **`email`** | `VARCHAR(150)` | `NOT NULL` | **UNIQUE KEY** (`uk_usuarios_email`) | *Ninguno* | Correo electrónico corporativo. Actúa como identificador de inicio de sesión (`username`). |
| **`password`** | `VARCHAR(255)` | `NOT NULL` | Ninguna | *Ninguno* | Contraseña del usuario almacenada mediante algoritmo de hash criptográfico seguro (PBKDF2 / Argon2 / bcrypt). Longitud suficiente para sales y metadatos. |
| **`rol`** | `ENUM('Admin', 'User')` | `NOT NULL` | Restricción de Dominio ENUM | `'User'` | Perfil de privilegios en el sistema. Mapeo conceptual:<br>- `'Admin'`: Administrador General con control total.<br>- `'User'`: Operario de Planta/Almacén con permisos de registro y consulta. |
| **`creado_en`** | `TIMESTAMP` | `NOT NULL` | Ninguna | `CURRENT_TIMESTAMP` | Marca temporal automática del instante de creación de la cuenta de usuario. |

#### Definición DDL en `init_db.sql`:
```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

---

### 3.2 Tabla: `materiales`

- **Propósito:** Catálogo centralizado de artículos, materias primas, insumos y herramientas controladas por el almacén. Contiene el balance de existencias físicas en tiempo real y el umbral de seguridad para el disparo de alertas de reposición.

#### Estructura y Atributos:
| Campo | Tipo de Dato MySQL | Nulo / Requerido | Clave / Restricción | Valor por Defecto | Descripción de Negocio |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `INT` | `NOT NULL` | **PRIMARY KEY** (Auto-incremental) | *Autoincrement* | Identificador unívoco del material dentro del catálogo. |
| **`nombre`** | `VARCHAR(120)` | `NOT NULL` | Ninguna | *Ninguno* | Denominación técnica o comercial del artículo (ej. *"Tornillos M6x20"*, *"Cables Unipolar 2.5mm"*). |
| **`categoria`** | `VARCHAR(80)` | `NOT NULL` | Ninguna | *Ninguno* | Clasificación del material (ej. Ferretería, Electricidad, Pinturería, Herramientas). |
| **`ubicacion`** | `VARCHAR(100)` | `NOT NULL` | Ninguna | *Ninguno* | Coordenada física dentro del depósito o almacén (ej. *"Estante A-1"*, *"Depósito C"*). |
| **`cantidad_actual`** | `INT` | `NOT NULL` | `CHECK (cantidad_actual >= 0)` | `0` | Existencia física disponible en almacén en tiempo real. La restricción CHECK garantiza que nunca existan stocks negativos. |
| **`stock_minimo`** | `INT` | `NOT NULL` | `CHECK (stock_minimo >= 0)` | `1` | Cantidad umbral de seguridad. Si `cantidad_actual <= stock_minimo`, el sistema genera automáticamente una alerta visual de stock bajo/crítico. |
| **`proveedor`** | `VARCHAR(120)` | `NOT NULL` | Ninguna | *Ninguno* | Razón social o nombre comercial del proveedor preferente o habitual del material. |
| **`creado_en`** | `TIMESTAMP` | `NOT NULL` | Ninguna | `CURRENT_TIMESTAMP` | Fecha y hora en la que el ítem fue dado de alta en la plataforma. |

#### Definición DDL en `init_db.sql`:
```sql
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
```

---

### 3.3 Tabla: `pedidos`

- **Propósito:** Gestión de las solicitudes de compra o reordenamiento de insumos críticos generadas por los operarios o administradores para mantener los niveles operativos de inventario.

#### Estructura y Atributos:
| Campo | Tipo de Dato MySQL | Nulo / Requerido | Clave / Restricción | Valor por Defecto | Descripción de Negocio |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `INT` | `NOT NULL` | **PRIMARY KEY** (Auto-incremental) | *Autoincrement* | Número de orden o solicitud de reposición generado por el sistema. |
| **`material_id`** | `INT` | `NOT NULL` | **FOREIGN KEY** (`fk_pedidos_material`) | *Ninguno* | Referencia al artículo solicitado (`materiales.id`). Restricción `ON DELETE RESTRICT` (impide eliminar un material con pedidos asociados). |
| **`usuario_id`** | `INT` | `NOT NULL` | **FOREIGN KEY** (`fk_pedidos_usuario`) | *Ninguno* | Referencia al usuario solicitante (`usuarios.id`). Restricción `ON DELETE RESTRICT`. |
| **`cantidad`** | `INT` | `NOT NULL` | `CHECK (cantidad > 0)` | *Ninguno* | Número de unidades solicitadas al proveedor. Debe ser estrictamente superior a cero. |
| **`proveedor`** | `VARCHAR(120)` | `NOT NULL` | Ninguna | *Ninguno* | Razón social de la empresa proveedora a la que se cursa el pedido. |
| **`urgencia`** | `ENUM('Baja', 'Media', 'Alta')` | `NOT NULL` | Restricción de Dominio ENUM | `'Media'` | Prioridad de abastecimiento asignada a la solicitud.<br>*(Extensible conceptualmente a 'Crítica' según criticidad de línea de producción).* |
| **`estado`** | `ENUM('Pendiente', 'Completado', 'Cancelado')` | `NOT NULL` | Restricción de Dominio ENUM | `'Pendiente'` | Estado del ciclo de vida del pedido:<br>- `'Pendiente'`: Solicitud creada, a la espera de aprobación/compra.<br>- `'Completado'`: Mercadería recibida y stock ingresado.<br>- `'Cancelado'`: Pedido rechazado o anulado. |
| **`fecha_solicitud`**| `TIMESTAMP` | `NOT NULL` | Ninguna | `CURRENT_TIMESTAMP` | Fecha y hora exacta de emisión de la solicitud de pedido. |

#### Definición DDL en `init_db.sql`:
```sql
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
```

---

### 3.4 Tabla: `auditoria`

- **Propósito:** Registro inmutable (*Audit Log*) que almacena cronológicamente cada una de las operaciones críticas realizadas en la plataforma (ingresos y egresos de stock, login de usuarios, generación de pedidos, etc.) para fines de no repudio, trazabilidad y control de calidad.

#### Estructura y Atributos:
| Campo | Tipo de Dato MySQL | Nulo / Requerido | Clave / Restricción | Valor por Defecto | Descripción de Negocio |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `INT` | `NOT NULL` | **PRIMARY KEY** (Auto-incremental) | *Autoincrement* | Identificador secuencial único del registro de auditoría. |
| **`usuario_id`** | `INT` | `NOT NULL` | **FOREIGN KEY** (`fk_auditoria_usuario`) | *Ninguno* | Referencia al usuario que ejecutó la acción (`usuarios.id`). Con `ON DELETE CASCADE` para mantener consistencia en entornos de purga controlada. |
| **`accion`** | `VARCHAR(100)` | `NOT NULL` | Ninguna | *Ninguno* | Código nemotécnico de la acción ejecutada (ej. `'INICIALIZACIÓN'`, `'INGRESO_STOCK'`, `'EGRESO_STOCK'`, `'SOLICITUD_PEDIDO'`, `'LOGIN_EXITOSO'`). |
| **`detalle`** | `TEXT` | `NOT NULL` | Ninguna | *Ninguno* | Descripción circunstanciada de la operación, valores previos y posteriores, insumos involucrados o justificaciones provistas por el operador. |
| **`fecha`** | `TIMESTAMP` | `NOT NULL` | Ninguna | `CURRENT_TIMESTAMP` | Marca de tiempo precisa generada por el motor de base de datos al momento de la inserción. |

#### Definición DDL en `init_db.sql`:
```sql
CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    accion VARCHAR(100) NOT NULL,
    detalle TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
```

---

## 4. Matriz de Integridad Referencial y Relaciones

| Relación | Tabla Origen | Clave Foránea | Tabla Destino | Clave Primaria | Regla ON DELETE | Regla ON UPDATE | Justificación Técnica y de Negocio |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Materiales - Pedidos** | `pedidos` | `material_id` | `materiales` | `id` | `RESTRICT` | `CASCADE` | No se permite eliminar un material del catálogo si posee órdenes de pedido históricas o pendientes, preservando la trazabilidad. |
| **Usuarios - Pedidos** | `pedidos` | `usuario_id` | `usuarios` | `id` | `RESTRICT` | `CASCADE` | Se resguarda la identidad del solicitante de una compra impidiendo la eliminación física de usuarios con pedidos activos. |
| **Usuarios - Auditoría** | `auditoria` | `usuario_id` | `usuarios` | `id` | `CASCADE` | `CASCADE` | Propaga de forma controlada la actualización del identificador de usuario y permite la gestión del ciclo de vida de la cuenta. |

---

## 5. Índices y Estrategias de Optimización

Para maximizar el rendimiento en consultas concurrentes y analítica de stock, el esquema incluye y recomienda los siguientes índices:

1. **Índices Primarios (*Clustered Indexes*):**
   - Creados implícitamente sobre el campo `id` de las 4 tablas en InnoDB, organizando físicamente los datos según su orden numérico ascendente.
2. **Índice Único (*Unique Index*):**
   - `usuarios.email`: Garantiza en tiempo de ejecución que no existan cuentas duplicadas y permite búsquedas de login $O(1)$.
3. **Índices de Clave Foránea (*Foreign Key Indexes*):**
   - `pedidos.material_id` y `pedidos.usuario_id`: Creados automáticamente por InnoDB para optimizar las operaciones `JOIN` al consultar pedidos con datos del material y del operador.
   - `auditoria.usuario_id`: Acelera la generación de reportes de actividad filtrados por operador.
4. **Índice Compuesto Sugerido para Alertas de Stock:**
   ```sql
   CREATE INDEX idx_materiales_stock_alerta ON materiales(cantidad_actual, stock_minimo);
   ```
   Optimiza la evaluación continua de la condición `WHERE cantidad_actual <= stock_minimo` ejecutada por el **CU-02**.

---

## 6. Datos Semilla Iniciales (*Seeders*)

El script `init_db.sql` incluye un lote de datos iniciales verificado para pruebas de integración y arranque del entorno:

```sql
-- Usuarios Iniciales
INSERT INTO usuarios (id, nombre, email, password, rol) VALUES
(1, 'Administrador General', 'admin@stockmanager.com', 'admin123', 'Admin'),
(2, 'Juan Pérez', 'juan.perez@stockmanager.com', 'user123', 'User');

-- Catálogo de Materiales
INSERT INTO materiales (id, nombre, categoria, ubicacion, cantidad_actual, stock_minimo, proveedor) VALUES
(1, 'Tornillos M6x20', 'Ferretería', 'Estante A-1', 15, 50, 'Ferretería Central'),
(2, 'Cables Unipolar 2.5mm', 'Electricidad', 'Estante B-3', 120, 30, 'ElectroSur'),
(3, 'Pintura Sintética Blanca 4L', 'Pinturería', 'Depósito C', 8, 10, 'Pinturas del Norte'),
(4, 'Lija para Madera P120', 'Herramientas', 'Estante A-2', 200, 25, 'Ferretería Central');

-- Pedidos Iniciales
INSERT INTO pedidos (id, material_id, usuario_id, cantidad, proveedor, urgencia, estado) VALUES
(1, 1, 2, 100, 'Ferretería Central', 'Alta', 'Pendiente'),
(2, 3, 1, 15, 'Pinturas del Norte', 'Media', 'Pendiente');

-- Registros de Auditoría Iniciales
INSERT INTO auditoria (id, usuario_id, accion, detalle) VALUES
(1, 1, 'INICIALIZACIÓN', 'Carga inicial del sistema y catálogo de materiales.'),
(2, 2, 'SOLICITUD_PEDIDO', 'Generación de pedido de reposición para Tornillos M6x20.');
```
