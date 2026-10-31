# Diagramas de Arquitectura y Diseño — StockManager

**Proyecto:** StockManager  
**Documento:** Diagramas de Especificación Técnica (Mermaid.js)  
**Versión:** 1.0.0  
**Fecha:** Octubre 2026  

---

## 1. Introducción

El presente documento complementa la documentación arquitectural y funcional de **StockManager**, proporcionando la representación visual estandarizada mediante diagramas renderizables con **Mermaid.js**. Se incluyen tres modelos fundamentales:

1. **Diagrama Entidad-Relación (DER):** Modelado físico de la base de datos relacional MySQL (`stockmanager_db`).
2. **Diagrama de Clases (UML):** Estructura del modelo de dominio orientado a objetos en Python / Django.
3. **Diagrama de Secuencia:** Flujo temporal y transaccional del caso de uso nuclear *"Generar Solicitud de Reposición"*.

---

## 2. Diagrama Entidad-Relación (DER)

Representa el esquema relacional normalizado implementado en `database/init_db.sql`. Se explicitan las entidades, atributos, claves primarias (`PK`), claves foráneas (`FK`), restricciones únicas (`UK`) y cardinalidades de cardinalidad 1 a N:

- Un **usuario** puede emitir de 0 a muchos **pedidos** (`1:N`).
- Un **usuario** puede generar de 0 a muchos registros de **auditoría** (`1:N`).
- Un **material** puede estar involucrado en 0 a muchos **pedidos** de reposición (`1:N`).

```mermaid
erDiagram
    USUARIOS ||--o{ PEDIDOS : "solicita (1:N)"
    USUARIOS ||--o{ AUDITORIA : "ejecuta (1:N)"
    MATERIALES ||--o{ PEDIDOS : "referencia (1:N)"

    USUARIOS {
        int id PK "Identificador único"
        string nombre "Nombre y apellido del usuario"
        string email UK "Correo corporativo único"
        string password "Hash seguro de contraseña"
        enum rol "Admin o User"
        timestamp creado_en "Fecha de registro"
    }

    MATERIALES {
        int id PK "Identificador único del insumo"
        string nombre "Denominación del material"
        string categoria "Clasificación o rubro"
        string ubicacion "Ubicación en almacén"
        int cantidad_actual "Existencia actual (>= 0)"
        int stock_minimo "Umbral mínimo de alerta (>= 0)"
        string proveedor "Proveedor predeterminado"
        timestamp creado_en "Fecha de alta"
    }

    PEDIDOS {
        int id PK "Número de orden de pedido"
        int material_id FK "Referencia a materiales.id"
        int usuario_id FK "Referencia a usuarios.id"
        int cantidad "Cantidad solicitada (> 0)"
        string proveedor "Razón social del proveedor"
        enum urgencia "Baja, Media o Alta"
        enum estado "Pendiente, Completado o Cancelado"
        timestamp fecha_solicitud "Fecha de emisión"
    }

    AUDITORIA {
        int id PK "Identificador único del log"
        int usuario_id FK "Referencia a usuarios.id"
        string accion "Código de acción realizada"
        text detalle "Descripción de la transacción"
        timestamp fecha "Marca temporal del evento"
    }
```

---

## 3. Diagrama de Clases del Dominio (UML)

Representa las entidades del modelo de datos y lógica de negocio en el backend (Python / Django ORM), detallando atributos tipados, modificadores de acceso y métodos de dominio para el control de inventario y pedidos:

```mermaid
classDiagram
    class Usuario {
        +int id
        +string nombre
        +string email
        +string password
        +string rol
        +datetime creado_en
        +bool is_admin
        +set_password(raw_password: str) void
        +check_password(raw_password: str) bool
        +es_administrador() bool
    }

    class Material {
        +int id
        +string nombre
        +string categoria
        +string ubicacion
        +int cantidad_actual
        +int stock_minimo
        +string proveedor
        +datetime creado_en
        +actualizar_stock(tipo: str, cantidad: int) void
        +verificar_disponibilidad(cantidad: int) bool
        +es_stock_bajo() bool
        +es_stock_critico() bool
    }

    class Pedido {
        +int id
        +int material_id
        +int usuario_id
        +int cantidad
        +string proveedor
        +string urgencia
        +string estado
        +datetime fecha_solicitud
        +cambiar_estado(nuevo_estado: str) void
        +aprobar_pedido() void
        +completar_recepcion() void
        +cancelar_pedido() void
    }

    class Auditoria {
        +int id
        +int usuario_id
        +string accion
        +string detalle
        +datetime fecha
        +registrar_evento(usuario_id: int, accion: str, detalle: str) void
    }

    Usuario "1" --> "0..*" Pedido : emite
    Usuario "1" --> "0..*" Auditoria : protagoniza
    Material "1" --> "0..*" Pedido : es_solicitado
```

### Descripción de Responsabilidades de Clases:
- **`Usuario`:** Encapsula la gestión de identidad, encriptación de credenciales y autorización RBAC (`Admin` / `Operario`).
- **`Material`:** Aplica invariantes de inventario (regla de no negatividad en stock), evalúa umbrales dinámicos de severidad y gestiona altas/bajas de existencias.
- **`Pedido`:** Implementa la máquina de estados de las solicitudes de reabastecimiento (Pendiente $\rightarrow$ Aprobado / Cancelado $\rightarrow$ Completado).
- **`Auditoria`:** Servicio transversal para registrar de forma inmutable todas las operaciones transaccionales realizadas en el sistema.

---

## 4. Diagrama de Secuencia: Generar Solicitud de Reposición

Describe la secuencia temporal y el intercambio de mensajes sincrónicos y asincrónicos entre los componentes del sistema para el caso de uso **CU-03 ("Generar Solicitud de Reposición de Materiales")**:

- **Actores y Participantes:**
  - **Operario / Admin:** Usuario final que detecta el stock bajo e inicia la solicitud.
  - **Frontend (Angular SPA):** Formulario reactivo con validaciones y manejo de token JWT.
  - **API REST (Django / DRF):** Controlador, serializadores, validaciones de negocio y transaccionalidad atómica.
  - **Base de Datos (MySQL):** Motor relacional con motor InnoDB y llaves foráneas.

```mermaid
sequenceDiagram
    autonumber
    actor User as Operario / Admin
    participant SPA as Frontend (Angular SPA)
    participant API as API REST (Django / DRF)
    participant DB as Motor BD (MySQL)

    Note over User, SPA: 1. Detección y Carga de Formulario
    User ->> SPA: Selecciona material en alerta y pulsa "Solicitar Reposición"
    SPA ->> SPA: Carga formulario con datos predeterminados (material_id, proveedor)
    User ->> SPA: Ingresa cantidad requerida y selecciona urgencia ("Alta")
    User ->> SPA: Clic en "Confirmar y Enviar Solicitud"

    Note over SPA, API: 2. Validación y Despacho HTTP
    SPA ->> SPA: Validar formulario reactivo (cantidad > 0)
    SPA ->> API: POST /api/v1/pedidos/<br/>[Header: Authorization Bearer JWT]<br/>{ material_id: 1, cantidad: 100, proveedor: "Ferretería Central", urgencia: "Alta" }

    Note over API: 3. Intercepción y Autenticación
    API ->> API: Validar firma y vigencia del Token JWT

    alt Token JWT Inválido o Expirado
        API -->> SPA: HTTP 401 Unauthorized { "detail": "Token inválido" }
        SPA -->> User: Alerta: "Sesión expirada. Inicie sesión nuevamente"
    else Token Válido
        Note over API, DB: 4. Transacción Atómica de Negocio
        API ->> DB: BEGIN TRANSACTION
        
        API ->> DB: SELECT id, nombre FROM materiales WHERE id = 1
        DB -->> API: Retorna registro de material

        alt Material No Encontrado
            API ->> DB: ROLLBACK
            API -->> SPA: HTTP 404 Not Found { "error": "Material inexistente" }
            SPA -->> User: Alerta visual: "El material especificado no existe"
        else Material Válido
            API ->> DB: INSERT INTO pedidos (material_id, usuario_id, cantidad, proveedor, urgencia, estado, fecha_solicitud)<br/>VALUES (1, 2, 100, 'Ferretería Central', 'Alta', 'Pendiente', NOW())
            DB -->> API: OK (Retorna nuevo ID: 15)

            API ->> DB: INSERT INTO auditoria (usuario_id, accion, detalle, fecha)<br/>VALUES (2, 'SOLICITUD_PEDIDO', 'Generación de pedido para material ID: 1, Cant: 100', NOW())
            DB -->> API: OK

            API ->> DB: COMMIT
            DB -->> API: Transacción exitosa consolidada

            Note over API, User: 5. Respuesta y Actualización de UI
            API -->> SPA: HTTP 201 Created { id: 15, estado: "Pendiente", ... }
            SPA ->> SPA: Actualizar estado reactivo y refrescar lista de pedidos
            SPA -->> User: Notificación Toast de Éxito:<br/>"Pedido #15 creado exitosamente en estado Pendiente"
        end
    end
```

---

## 5. Conclusiones y Trazabilidad

Los diagramas expuestos aseguran que tanto el equipo de desarrollo frontend, backend y administración de base de datos mantengan una referencia unívoca y rigurosa sobre:
1. **Esquema Relacional:** La exactitud de tipos, restricciones `CHECK`, valores por defecto y claves foráneas en MySQL.
2. **Arquitectura Orientada a Objetos:** El comportamiento encapsulado en los modelos de Django.
3. **Flujo de Ejecución:** La robustez transaccional requerida en la creación de órdenes de compra con auditoría vinculada.
