# Modelo relacional de datos — StockManager

**Base de datos:** `stockmanager_db`
**Motor:** MySQL 8.4+
**Almacenamiento:** InnoDB
**Codificación:** `utf8mb4` / `utf8mb4_unicode_ci`
**Fuente operativa:** migraciones de Django
**Esquema auditable:** [`backend/database/schema.sql`](../backend/database/schema.sql)

## 1. Arquitectura de persistencia

El backend utiliza cuatro aplicaciones Django separadas:

| Aplicación | Responsabilidad |
|---|---|
| `usuarios` | Cuentas, roles, autenticación y credenciales |
| `inventario` | Categorías, proveedores, materiales y existencias |
| `pedidos` | Solicitudes de reposición y estados |
| `auditoria` | Historial persistente de movimientos |

Django genera los nombres físicos de tabla con el formato
`<app>_<modelo>`. Por lo tanto, los nombres reales no son `usuarios` o
`materiales`, sino los indicados en las secciones siguientes.

## 2. Entidades y tablas principales

### `usuarios_usuario`

Representa el usuario personalizado configurado mediante
`AUTH_USER_MODEL = 'usuarios.Usuario'`.

| Campo | Tipo lógico | Restricciones |
|---|---|---|
| `id` | `BIGINT` | PK, autoincremental |
| `password` | `VARCHAR(128)` | Hash Django |
| `first_name` | `VARCHAR(150)` | Nombre visible |
| `last_name` | `VARCHAR(150)` | Apellido opcional |
| `email` | `VARCHAR(254)` | NOT NULL, UNIQUE |
| `username` | `VARCHAR(150)` | UNIQUE |
| `is_admin` | `BOOLEAN` | Define el rol administrativo |
| `is_staff` | `BOOLEAN` | Se sincroniza con el rol |
| `is_superuser` | `BOOLEAN` | Permisos globales Django |
| `is_active` | `BOOLEAN` | Estado de la cuenta |
| `date_joined` | `DATETIME(6)` | Fecha de alta |

Los roles expuestos por el serializer son `Administrador` y `Operario`.

### `inventario_categoria`

| Campo | Tipo lógico | Restricciones |
|---|---|---|
| `id` | `BIGINT` | PK, autoincremental |
| `nombre` | `VARCHAR(80)` | NOT NULL, UNIQUE |

### `inventario_proveedor`

| Campo | Tipo lógico | Restricciones |
|---|---|---|
| `id` | `BIGINT` | PK, autoincremental |
| `nombre` | `VARCHAR(120)` | NOT NULL, UNIQUE |
| `contacto` | `VARCHAR(150)` | NOT NULL, vacío permitido |
| `telefono` | `VARCHAR(50)` | NOT NULL, vacío permitido |
| `correo` | `VARCHAR(150)` | NOT NULL, vacío permitido |
| `activo` | `BOOLEAN` | Activo/inactivo |
| `creado_en` | `DATETIME(6)` | Alta automática |

### `inventario_material`

| Campo | Tipo lógico | Restricciones |
|---|---|---|
| `id` | `BIGINT` | PK, autoincremental |
| `nombre` | `VARCHAR(120)` | NOT NULL |
| `ubicacion` | `VARCHAR(100)` | NOT NULL |
| `cantidad_actual` | `UNSIGNED INT` | Valor no negativo |
| `stock_minimo` | `UNSIGNED INT` | Valor no negativo |
| `creado_en` | `DATETIME(6)` | Alta automática |
| `categoria_id` | `BIGINT` | FK nullable, `SET NULL` |
| `proveedor_id` | `BIGINT` | FK nullable, `SET NULL` |

Relaciones:

- `categoria_id` referencia `inventario_categoria.id`.
- `proveedor_id` referencia `inventario_proveedor.id`.
- Si se elimina una categoría o proveedor, el material conserva su registro y
  la FK queda en `NULL`.

### `pedidos_pedido`

| Campo | Tipo lógico | Restricciones |
|---|---|---|
| `id` | `BIGINT` | PK, autoincremental |
| `producto` | `VARCHAR(120)` | Snapshot del nombre |
| `material_id` | `BIGINT` | FK obligatoria, `CASCADE` |
| `cantidad` | `UNSIGNED INT` | Mayor que cero mediante serializer |
| `proveedor` | `VARCHAR(120)` | Nullable |
| `urgencia` | `VARCHAR(10)` | `baja`, `media` o `alta` |
| `estado` | `VARCHAR(20)` | Estado de la solicitud |
| `fecha` | `DATE` | Fecha del pedido |
| `observaciones` | `LONGTEXT` | Opcional |
| `solicitante_id` | `BIGINT` | FK nullable, `SET NULL` |
| `solicitante_nombre` | `VARCHAR(150)` | Snapshot del solicitante |
| `comentario_resolucion` | `LONGTEXT` | Opcional |
| `comentario_ingreso` | `LONGTEXT` | Opcional |

Estados vigentes en `pedidos.models.Pedido.Estado`:

```text
Pendiente
Aprobado
En Camino
Entregado
Cancelado
```

> `Rechazado` no forma parte del modelo actual. Si la rúbrica lo exige,
> primero debe agregarse al enum Django, serializer, frontend, migración,
> fixture y documentación.

Reglas de borrado:

- `Pedido.material` usa `ON DELETE CASCADE`: al eliminar el material se
  eliminan sus pedidos asociados.
- `Pedido.solicitante` usa `ON DELETE SET NULL`: el pedido permanece.

### `auditoria_registroauditoria`

| Campo | Tipo lógico | Restricciones |
|---|---|---|
| `id` | `BIGINT` | PK, autoincremental |
| `material_id` | `BIGINT` | FK nullable, `SET NULL` |
| `material_nombre` | `VARCHAR(120)` | Snapshot permanente |
| `tipo` | `VARCHAR(11)` | `ingreso`, `egreso`, `creacion`, `edicion`, `eliminacion` |
| `cantidad` | `UNSIGNED INT` | No negativa |
| `stock_anterior` | `UNSIGNED INT` | No negativa |
| `stock_nuevo` | `UNSIGNED INT` | No negativa |
| `usuario_id` | `BIGINT` | FK nullable, `SET NULL` |
| `fecha` | `DATE` | Fecha del evento |
| `fecha_hora` | `DATETIME(6)` | Momento del evento |
| `observacion` | `LONGTEXT` | Detalle del movimiento |

Las relaciones con material y usuario usan `SET NULL`. El registro histórico
no se elimina, y `material_nombre` permite conservar el contexto aun cuando el
material original ya no exista.

## 3. Integridad referencial

```text
inventario_categoria 1 ─── N inventario_material
inventario_proveedor 1 ─── N inventario_material
inventario_material 1 ─── N pedidos_pedido       ON DELETE CASCADE
usuarios_usuario     1 ─── N pedidos_pedido       ON DELETE SET NULL
inventario_material 1 ─── N auditoria_registroauditoria ON DELETE SET NULL
usuarios_usuario     1 ─── N auditoria_registroauditoria ON DELETE SET NULL
```

El diseño completo, incluyendo tablas auxiliares de Django, claves e índices,
se encuentra en `backend/database/schema.sql`.
