# Diagramas de arquitectura y diseño — StockManager

**Arquitectura:** Angular SPA + Django REST Framework + MySQL 8.4+
**Prefijo API:** `/api/v1/`
**Autenticación:** JWT Bearer
**Fuente de verdad del modelo:** `backend/*/models.py` y migraciones Django

## 1. Diagrama de componentes

```mermaid
flowchart LR
    U[Administrador / Operario]
    SPA[Frontend Angular SPA]
    AUTH[authGuard / roleGuard]
    API[API Django REST Framework]
    USU[App usuarios]
    INV[App inventario]
    PED[App pedidos]
    AUD[App auditoria]
    DB[(MySQL stockmanager_db)]

    U --> SPA
    SPA --> AUTH
    AUTH --> API
    API --> USU
    API --> INV
    API --> PED
    API --> AUD
    USU --> DB
    INV --> DB
    PED --> DB
    AUD --> DB
```

### Responsabilidades modulares

- **`usuarios`:** login, refresh JWT, usuarios y cambio de contraseña.
- **`inventario`:** materiales, categorías, proveedores y stock.
- **`pedidos`:** solicitudes, estados y comentarios de resolución/ingreso.
- **`auditoria`:** historial de movimientos y snapshots históricos.

Todas las vistas funcionales propias heredan de `APIView`. La renovación JWT
utiliza `RefreshTokenView` de SimpleJWT mediante la clase adaptadora del módulo
`usuarios`.

## 2. Diagrama entidad-relación

```mermaid
erDiagram
    USUARIOS_USUARIO ||--o{ PEDIDOS_PEDIDO : solicita
    USUARIOS_USUARIO ||--o{ AUDITORIA_REGISTRO : genera
    INVENTARIO_CATEGORIA ||--o{ INVENTARIO_MATERIAL : clasifica
    INVENTARIO_PROVEEDOR ||--o{ INVENTARIO_MATERIAL : abastece
    INVENTARIO_MATERIAL ||--o{ PEDIDOS_PEDIDO : referencia
    INVENTARIO_MATERIAL ||--o{ AUDITORIA_REGISTRO : registra

    USUARIOS_USUARIO {
        bigint id PK
        varchar email UK
        varchar username UK
        varchar first_name
        boolean is_admin
        boolean is_active
    }

    INVENTARIO_CATEGORIA {
        bigint id PK
        varchar nombre UK
    }

    INVENTARIO_PROVEEDOR {
        bigint id PK
        varchar nombre UK
        varchar contacto
        varchar telefono
        varchar correo
        boolean activo
    }

    INVENTARIO_MATERIAL {
        bigint id PK
        varchar nombre
        bigint categoria_id FK
        bigint proveedor_id FK
        varchar ubicacion
        unsigned_int cantidad_actual
        unsigned_int stock_minimo
    }

    PEDIDOS_PEDIDO {
        bigint id PK
        bigint material_id FK
        bigint solicitante_id FK
        varchar producto
        unsigned_int cantidad
        varchar urgencia
        varchar estado
        date fecha
        text comentario_resolucion
        text comentario_ingreso
    }

    AUDITORIA_REGISTRO {
        bigint id PK
        bigint material_id FK
        bigint usuario_id FK
        varchar material_nombre
        varchar tipo
        unsigned_int cantidad
        unsigned_int stock_anterior
        unsigned_int stock_nuevo
        datetime fecha_hora
    }
```

Reglas:

- `Pedido.material`: `CASCADE`.
- `Pedido.solicitante`: `SET_NULL`.
- `RegistroAuditoria.material`: `SET_NULL`.
- `RegistroAuditoria.usuario`: `SET_NULL`.

## 3. Diagrama de clases del dominio

```mermaid
classDiagram
    class Usuario {
        +BigInt id
        +String first_name
        +String email
        +Boolean is_admin
        +Boolean is_active
    }

    class Categoria {
        +BigInt id
        +String nombre
    }

    class Proveedor {
        +BigInt id
        +String nombre
        +String contacto
        +String telefono
        +String correo
        +Boolean activo
    }

    class Material {
        +BigInt id
        +String nombre
        +Categoria categoria
        +Proveedor proveedor
        +String ubicacion
        +UInt cantidad_actual
        +UInt stock_minimo
    }

    class Pedido {
        +BigInt id
        +Material material
        +Usuario solicitante
        +UInt cantidad
        +String urgencia
        +String estado
        +String comentario_resolucion
        +String comentario_ingreso
    }

    class RegistroAuditoria {
        +BigInt id
        +Material material
        +Usuario usuario
        +String material_nombre
        +String tipo
        +UInt stock_anterior
        +UInt stock_nuevo
        +DateTime fecha_hora
    }

    Categoria "1" --> "0..*" Material
    Proveedor "1" --> "0..*" Material
    Material "1" --> "0..*" Pedido
    Usuario "1" --> "0..*" Pedido
    Material "1" --> "0..*" RegistroAuditoria
    Usuario "1" --> "0..*" RegistroAuditoria
```

El modelo no declara métodos de dominio artificiales. Las operaciones CRUD,
las actualizaciones de estado y el registro de auditoría se ejecutan en
serializers, APIViews y servicios Angular.

## 4. Modelado BPMN: gestionar solicitud de reposición

### 4.1 Identificación del proceso

- **Nombre del proceso:** Gestionar solicitud de reposición de material.
- **Objetivo:** Registrar una necesidad de reposición, validarla, autorizarla,
  acompañar su entrega y actualizar el stock con trazabilidad histórica.
- **Evento que lo inicia:** Un operario o administrador identifica una necesidad
  de reposición y abre el formulario de nuevo pedido.
- **Participantes:** Operario, Administrador, SPA Angular, API Django REST,
  base de datos MySQL y proveedor.
- **Resultado:** Pedido entregado, stock actualizado y movimiento registrado en
  auditoría; alternativamente, pedido cancelado o solicitud corregida.

El proceso se representa con lanes para distinguir quién ejecuta cada
actividad. Incluye dos gateways principales: validación de datos y decisión
administrativa. También contempla una segunda decisión sobre la disponibilidad
del proveedor y un retorno al formulario cuando la validación falla.

### 4.2 Diagrama BPMN horizontal

El siguiente modelo utiliza la notación de flujo de Mermaid para representar
los elementos BPMN: evento de inicio, tareas, gateways, flujos de secuencia,
lanes y eventos de fin.

```mermaid
flowchart LR
    subgraph L1["Lane: Operario / Administrador"]
        S((Inicio: necesidad de reposición))
        A1["1. Abrir formulario de pedido"]
        A2["2. Seleccionar material y completar cantidad"]
        A8["8. Revisar estado de entrega"]
        A9["9. Confirmar ingreso recibido"]
        E1((Fin: pedido cancelado))
    end

    subgraph L2["Lane: SPA Angular"]
        A3["3. Validar formulario reactivo"]
        G1{"¿Datos válidos?"}
        A4["4. Enviar POST /api/v1/pedidos/"]
        A10["10. Enviar PATCH de confirmación"]
        R1["Corregir datos del formulario"]
    end

    subgraph L3["Lane: API Django / MySQL"]
        A5["5. Validar serializer y crear pedido Pendiente"]
        G2{"¿Administrador aprueba?"}
        A6["6. Cambiar estado a Aprobado"]
        A7["7. Cambiar estado a Cancelado"]
        G3{"¿Entrega disponible?"}
        A11["11. Cambiar estado a En Camino"]
        A12["12. Actualizar stock"]
        A13["13. Registrar auditoría"]
        A14["14. Cambiar estado a Entregado"]
        E2((Fin: pedido entregado y auditado))
    end

    subgraph L4["Lane: Proveedor"]
        A15["Confirmar disponibilidad y despachar pedido"]
    end

    S --> A1 --> A2 --> A3 --> G1
    G1 -- "No" --> R1 --> A2
    G1 -- "Sí" --> A4 --> A5 --> G2
    G2 -- "No: cancelar" --> A7 --> E1
    G2 -- "Sí" --> A6 --> A11 --> A15 --> G3
    G3 -- "No: reprogramar" --> A8 --> A15
    G3 -- "Sí: disponible" --> A8
    A8 --> A9 --> A10 --> A12 --> A13 --> A14 --> E2
```

El gateway `¿Datos válidos?` representa el retorno a la actividad anterior
cuando Angular detecta errores en el formulario reactivo. El gateway
`¿Administrador aprueba?` deriva en aprobación o cancelación. La decisión
`¿Entrega disponible?` permite reprogramar la entrega o continuar con el
estado `En Camino`. La confirmación final actualiza el stock, registra la
auditoría y cambia el pedido a `Entregado`.

El proceso contiene más de ocho actividades, tres decisiones, cuatro lanes,
dos caminos derivados de decisiones, un retorno a una actividad anterior y
dos eventos de fin posibles. Los nombres de endpoints utilizados corresponden
al contrato vigente de la API; no existe un endpoint independiente
`/aprobar/` ni `/movimiento/`.

## 5. Diagrama de secuencia: confirmar ingreso de pedido

El flujo real implementado para confirmar un pedido en estado `En Camino` es
coordinado por Angular. No existe un endpoint independiente
`/aprobar/` ni `/movimiento/`.

```mermaid
sequenceDiagram
    autonumber
    actor User as Administrador / Operario
    participant SPA as Angular SPA
    participant API as Django REST API
    participant DB as MySQL

    User ->> SPA: Pulsa "Confirmar ingreso"
    SPA ->> API: GET /api/v1/inventario/materiales/
    API ->> DB: Consulta material relacionado
    DB -->> API: Material y stock actual
    API -->> SPA: 200 OK

    SPA ->> API: PATCH /api/v1/inventario/materiales/{id}/
    Note right of SPA: { cantidadActual: stockNuevo }
    API ->> DB: Actualiza cantidad_actual
    DB -->> API: Material actualizado
    API -->> SPA: 200 OK

    SPA ->> API: POST /api/v1/auditoria/
    Note right of SPA: materialId, tipo, cantidad,<br/>stockAnterior, stockNuevo, observacion
    API ->> DB: Inserta RegistroAuditoria
    DB -->> API: Auditoría creada
    API -->> SPA: 201 Created

    SPA ->> API: PATCH /api/v1/pedidos/{id}/
    Note right of SPA: { estado: "Entregado",<br/>comentarioIngreso: "..." }
    API ->> DB: Actualiza estado y comentario_ingreso
    DB -->> API: Pedido actualizado
    API -->> SPA: 200 OK
    SPA -->> User: Refresca el listado
```

Los estados de pedido vigentes son:

```text
Pendiente → Aprobado → En Camino → Entregado
                         ↘ Cancelado
Pendiente/Aprobado ───────→ Cancelado
```

> El estado `Rechazado` no existe en el código actual. La cancelación se
> representa mediante `Cancelado`.
