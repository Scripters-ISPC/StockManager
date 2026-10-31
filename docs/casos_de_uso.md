# Especificación de Casos de Uso — StockManager

**Proyecto:** StockManager — Sistema de Gestión y Control Inteligente de Inventarios  
**Versión:** 1.0.0  
**Fecha de Documentación:** Octubre 2026  
**Estado:** Oficial / Base de Referencia  
**Autores:** Equipo de Desarrollo & Arquitectura de Software  

---

## 1. Introducción y Alcance

El presente documento define la especificación formal de los **Casos de Uso (CU)** nucleares del sistema **StockManager**. La plataforma implementa una arquitectura desacoplada orientada a servicios, conformada por:
- **Frontend (Capa de Presentación):** Aplicación de Página Única (*SPA*) desarrollada en **Angular** con Angular Material / Bootstrap y TailwindCSS.
- **Backend (Capa de Negocio y API):** Servicio API REST desarrollado sobre **Django & Django REST Framework (DRF)** con autenticación delegada mediante tokens criptográficos **JWT** (*JSON Web Tokens*).
- **Base de Datos (Capa de Persistencia):** Base de datos relacional **MySQL 8.0+** (`stockmanager_db`) motorizada bajo **InnoDB**, con soporte estricto de transacciones ACID y restricciones de integridad referencial.

---

## 2. Actores del Sistema

| Actor | Tipo | Descripción y Alcance de Responsabilidad |
| :--- | :--- | :--- |
| **Administrador (`Admin`)** | Humano / Primario | Usuario con privilegios totales. Administra cuentas de usuario, catálogo integral de insumos, parámetros de criticidad de stock, autoriza/cancela solicitudes de pedidos y audita todas las transacciones históricas del sistema. |
| **Operario (`User` / `Operario`)** | Humano / Primario | Personal de almacén o planta. Registra entradas y salidas físicas de material, monitorea el tablero de existencias críticas y elabora solicitudes formales de reposición de insumos. |
| **Servicio API REST (Django)** | Sistema / Secundario | Componente backend encargado de la ejecución de lógica de negocio, validación de reglas de dominio, cálculo dinámico de alertas y generación de auditoría automática. |
| **Motor de Base de Datos (MySQL)** | Sistema / Secundario | Responsable del almacenamiento persistente, control transaccional e integridad de las tablas `usuarios`, `materiales`, `pedidos` y `auditoria`. |

---

## 3. Matriz de Trazabilidad de Casos de Uso

| Código | Nombre del Caso de Uso | Actores Principales | Nivel de Complejidad | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| **CU-00** | Inicio de Sesión en el Sistema | Administrador, Operario | Media | Crítica |
| **CU-01** | Registrar Ingreso / Egreso de Materiales | Operario, Administrador | Alta | Crítica |
| **CU-02** | Monitorear Alertas de Stock Bajo | Administrador, Operario | Media | Alta |
| **CU-03** | Generar Solicitud de Reposición de Materiales | Operario, Administrador | Alta | Alta |

---

## 4. Especificación Detallada de Casos de Uso

---

### Caso de Uso 0: Inicio de Sesión en el Sistema (CU-00)

#### 1. Ficha Descriptiva
- **Identificador:** CU-00
- **Nombre:** Inicio de Sesión en el Sistema (*User Authentication*)
- **Actor Principal:** Administrador / Operario
- **Actor Secundario:** Servicio de Autenticación Django (SimpleJWT), Base de Datos MySQL
- **Precondiciones:**
  1. El usuario debe existir previamente registrado en la tabla `usuarios` de MySQL con un correo electrónico único y contraseña con hash seguro.
  2. La aplicación cliente Angular debe estar en ejecución y con conectividad al backend Django (`/api/v1/usuarios/login/`).

#### 2. Disparador (*Trigger*)
El usuario accede a la ruta de inicio `/login` de la SPA en Angular e introduce sus credenciales.

#### 3. Flujo Principal (*Happy Path*)
1. El usuario ingresa su `email` y `password` en el formulario reactivo de inicio de sesión de Angular.
2. El usuario presiona el botón **"Iniciar Sesión"**.
3. El cliente Angular valida la consistencia sintáctica del formulario (formato de correo válido y campo de contraseña no vacío).
4. Angular despacha una solicitud HTTP `POST /api/v1/usuarios/login/` con el cuerpo JSON:
   ```json
   {
     "email": "usuario@stockmanager.com",
     "password": "********"
   }
   ```
5. El backend Django intercepta la petición, verifica la correspondencia criptográfica de la contraseña contra el hash almacenado en la tabla `usuarios` de MySQL.
6. Al autenticar exitosamente, Django genera un par de tokens criptográficos JWT (`access` y `refresh`) e incluye en el payload los claims de identidad: `user_id`, `nombre`, `email` y rol (`is_admin` / `rol`).
7. Django retorna una respuesta HTTP `200 OK` con los tokens y datos de perfil.
8. La SPA en Angular almacena el token JWT de forma segura (localStorage/sessionStorage y en el estado global), configura el interceptor HTTP para adjuntar el encabezado `Authorization: Bearer <access_token>` en solicitudes subsecuentes y redirige al usuario al panel principal (*Dashboard*).

#### 4. Flujos Alternativos y Excepciones
- **FA-0.1: Credenciales Inválidas (Usuario o Contraseña incorrectos)**
  - En el paso 5, si el email no existe o la contraseña no coincide con el hash, Django responde con código HTTP `401 Unauthorized`:
    ```json
    { "detail": "Credenciales inválidas. Compruebe su correo y contraseña." }
    ```
  - Angular captura el error mediante su interceptor de errores, no almacena ningún token y muestra una notificación visual de alerta (Snackbar o Toast en rojo): *"Usuario o contraseña incorrectos"*.
  - El formulario se resetea y el foco vuelve al campo de contraseña.
- **FA-0.2: Formulario con Campos Faltantes o Inválidos**
  - En el paso 3, si el usuario omite campos o ingresa un formato de correo erróneo, la validación reactiva de Angular bloquea el botón de envío y resalta los campos con mensajes de validación (*Client-side validation*).
- **FA-0.3: Caída del Servicio Backend / Base de Datos**
  - Si el backend o MySQL no responden, Angular captura un error HTTP `500 Internal Server Error` o `0 Connection Refused`, mostrando un mensaje al usuario: *"No se pudo conectar con el servidor. Intente nuevamente más tarde"*.

#### 5. Postcondiciones
- El usuario queda autenticado en la sesión del cliente con su rol específico reconocido (`Admin` o `Operario`).
- Las vistas y rutas protegidas del sistema quedan accesibles según la política de control de acceso basada en roles (RBAC).

---

### Caso de Uso 1: Registrar Ingreso/Egreso de Materiales (CU-01)

#### 1. Ficha Descriptiva
- **Identificador:** CU-01
- **Nombre:** Registrar Ingreso / Egreso de Materiales (*Inventory Stock Movement*)
- **Actor Principal:** Operario / Administrador
- **Actor Secundario:** Django REST API (Módulo Inventario y Auditoría), Base de Datos MySQL
- **Precondiciones:**
  1. El usuario se encuentra autenticado con un token JWT válido.
  2. El material sobre el cual se efectuará el movimiento existe registrado en la tabla `materiales` (`id`, `nombre`, `cantidad_actual`, `stock_minimo`).

#### 2. Disparador (*Trigger*)
El usuario ingresa a la vista de Inventario o a la pantalla de Movimientos de Stock y selecciona la opción **"Registrar Movimiento"**.

#### 3. Flujo Principal (*Happy Path*)
1. El usuario busca y selecciona el material deseado desde el catálogo interactivo de la SPA.
2. El sistema despliega el modal interactivo con la información del material: nombre, código, ubicación y `cantidad_actual`.
3. El usuario especifica:
   - **Tipo de Movimiento:** `Ingreso` (adición a almacén) o `Egreso` (consumo / despacho).
   - **Cantidad:** Valor numérico entero estrictamente mayor a 0 (`cantidad > 0`).
   - **Observación o Motivo:** Justificación del movimiento (ej. *"Recepción de proveedor"*, *"Asignación a línea de montaje"*).
4. El usuario confirma la operación pulsando **"Guardar Movimiento"**.
5. Angular despacha una solicitud HTTP `POST /api/v1/inventario/materiales/{id}/movimiento/` con el payload:
   ```json
   {
     "tipo": "ingreso",
     "cantidad": 50,
     "observacion": "Lote recibido s/remito 4091"
   }
   ```
6. Django inicia una transacción atómica (`transaction.atomic()`):
   - Recupera el registro del material con bloqueo de fila (`SELECT ... FOR UPDATE`).
   - Valida la disponibilidad de stock si el tipo es `Egreso`.
   - Si el tipo es `Ingreso`: `nuevo_stock = cantidad_actual + cantidad`.
   - Si el tipo es `Egreso`: `nuevo_stock = cantidad_actual - cantidad`.
   - Actualiza el campo `cantidad_actual` en la tabla `materiales`.
   - Inserta de forma obligatoria un registro en la tabla `auditoria`:
     - `usuario_id`: ID del usuario extraído del JWT.
     - `accion`: `'INGRESO_STOCK'` o `'EGRESO_STOCK'`.
     - `detalle`: Descripción del movimiento (material afectado, cantidad, stock previo, stock nuevo y motivo).
     - `fecha`: Marca temporal del servidor.
   - Ejecuta el `COMMIT` de la transacción en MySQL.
7. Django retorna una respuesta HTTP `200 OK` con los datos actualizados del material y el balance final.
8. Angular actualiza la fila del material en la tabla reactiva, recalcula visualmente los indicadores de stock y emite un mensaje de éxito: *"Movimiento registrado satisfactoriamente"*.

#### 4. Flujos Alternativos y Excepciones
- **FA-1.1: Stock Insuficiente en Operación de Egreso**
  - En el paso 6, si la operación es de tipo `Egreso` y `cantidad > cantidad_actual`:
    - El backend Django cancela la operación (`ROLLBACK`) para salvaguardar la restricción de integridad `CHECK (cantidad_actual >= 0)`.
    - Responde con código HTTP `400 Bad Request`:
      ```json
      { "error": "Stock insuficiente. La existencia actual es de 15 unidades y se intentó retirar 20." }
      ```
    - Angular despliega una alerta modal de advertencia indicando la insuficiencia de stock y manteniendo el formulario abierto para corrección.
- **FA-1.2: Cantidad no Válida (Menor o Igual a Cero)**
  - Si el usuario introduce un valor $\le 0$, el validador del formulario reactivo en Angular no permite la emisión. Si la petición llegara al backend, DRF rechaza la carga con `HTTP 400 Bad Request: "La cantidad debe ser mayor a cero"`.
- **FA-1.3: Token Expirado durante la Operación**
  - Si el token JWT caducó, el backend responde `401 Unauthorized`. El interceptor de Angular captura el evento, intenta el refresco del token vía `/api/v1/usuarios/login/refresh/`, y en caso de fallo redirige a `/login`.

#### 5. Postcondiciones
- La columna `cantidad_actual` del insumo en la tabla `materiales` queda actualizada en MySQL.
- Queda registrado un nuevo evento histórico en la tabla `auditoria` garantizando la trazabilidad.

---

### Caso de Uso 2: Monitorear Alertas de Stock Bajo (CU-02)

#### 1. Ficha Descriptiva
- **Identificador:** CU-02
- **Nombre:** Monitorear Alertas de Stock Bajo y Crítico (*Stock Level Monitoring & Alerts*)
- **Actor Principal:** Administrador / Operario
- **Actor Secundario:** API REST Django, Base de Datos MySQL
- **Precondiciones:**
  1. El usuario se encuentra autenticado en el sistema.
  2. Existen registros de insumos en la tabla `materiales`.

#### 2. Disparador (*Trigger*)
El usuario inicia sesión y visualiza el *Dashboard* general o hace clic en la sección **"Alertas de Stock"**.

#### 3. Flujo Principal (*Happy Path*)
1. Al cargar la vista del Dashboard en Angular, la aplicación despacha una petición HTTP `GET /api/v1/inventario/materiales/alertas/` (o consulta general de catálogo).
2. Django ejecuta una consulta optimizada contra MySQL:
   ```sql
   SELECT id, nombre, categoria, ubicacion, cantidad_actual, stock_minimo, proveedor
   FROM materiales
   WHERE cantidad_actual <= stock_minimo
   ORDER BY (cantidad_actual - stock_minimo) ASC;
   ```
3. MySQL devuelve los materiales con existencia comprometida.
4. Django clasifica y empaqueta las alertas en dos niveles de criticidad:
   - **Nivel Crítico:** Materiales con `cantidad_actual == 0` o `cantidad_actual <= (stock_minimo * 0.3)`.
   - **Nivel Bajo Stock (Preventivo):** Materiales con `cantidad_actual > (stock_minimo * 0.3)` pero `cantidad_actual <= stock_minimo`.
5. Django responde con código HTTP `200 OK` y el listado de insumos bajo alerta con sus respectivos estados calculados.
6. La SPA en Angular renderiza en el Dashboard:
   - **Tarjetas KPI métricas:** Cantidad total de insumos en estado crítico y bajo stock.
   - **Tabla destacada de insumos bajo umbral:** Con colores semafóricos (Rojo para crítico, Amarillo/Naranja para bajo stock).
   - **Botón de acción rápida:** Opción directa *"Solicitar Reposición"* adyacente a cada material en alerta para enlazar al **CU-03**.

#### 4. Flujos Alternativos y Excepciones
- **FA-2.1: Todos los Insumos en Niveles Óptimos (Sin Alertas Activas)**
  - Si la consulta en MySQL retorna cero filas (`ResultSet` vacío):
  - Angular renderiza un estado visual positivo (*Empty State* informativo) con un icono verde de aprobación: *"Inventario saludable: No existen insumos con niveles por debajo del stock mínimo"*.
- **FA-2.2: Filtrado Dinámico por Categoría o Ubicación**
  - El usuario puede aplicar filtros en tiempo real en la interfaz de Angular por `categoría` (ej. 'Ferretería', 'Pinturería') o por `proveedor`. La SPA refina la vista localmente o solicita los datos filtrados al backend mediante parámetros query.

#### 5. Postcondiciones
- El personal operativo y administrativo cuenta con visibilidad en tiempo real de los insumos vulnerables a quiebres de existencias, habilitando la toma de decisiones proactiva.

---

### Caso de Uso 3: Generar Solicitud de Reposición de Materiales (CU-03)

#### 1. Ficha Descriptiva
- **Identificador:** CU-03
- **Nombre:** Generar Solicitud de Reposición de Materiales (*Purchase Order Requisition*)
- **Actor Principal:** Operario / Administrador
- **Actor Secundario:** API REST Django, Base de Datos MySQL
- **Precondiciones:**
  1. El usuario se encuentra debidamente autenticado en el sistema.
  2. El material a reponer existe en la tabla `materiales`.

#### 2. Disparador (*Trigger*)
El usuario pulsa el botón **"Solicitar Reposición"** desde la tarjeta de alerta de stock (CU-02) o navega a la sección **"Pedidos / Nueva Solicitud"**.

#### 3. Flujo Principal (*Happy Path*)
1. El usuario abre el formulario de reposición. Si proviene de una alerta de stock, el sistema precarga automáticamente el `material_id`, nombre del material y el `proveedor` predeterminado.
2. Si es una solicitud manual, el usuario selecciona el material desde una lista desplegable con autocompletado reactivo.
3. El usuario completa los siguientes campos obligatorios del pedido:
   - **Cantidad a Solicitar:** Valor entero positivo mayor a cero (`cantidad > 0`).
   - **Proveedor:** Razón social del proveedor asignado (precargado o modificable).
   - **Nivel de Urgencia:** Selección mediante menú desplegable: `'Baja'`, `'Media'`, `'Alta'` o `'Crítica'` (según el impacto en la operación).
4. El usuario presiona el botón **"Confirmar y Enviar Solicitud"**.
5. Angular valida el formulario y emite una petición HTTP `POST /api/v1/pedidos/` con la cabecera `Authorization: Bearer <token>` y el cuerpo JSON:
   ```json
   {
     "material_id": 1,
     "cantidad": 100,
     "proveedor": "Ferretería Central",
     "urgencia": "Alta"
   }
   ```
6. El backend Django ejecuta la lógica dentro de una transacción atómica:
   - Extrae el `usuario_id` del token JWT autenticado para asociarlo al pedido.
   - Valida la existencia del `material_id` en la tabla `materiales`.
   - Inserta un nuevo registro en la tabla `pedidos` con:
     - `material_id`: ID del insumo.
     - `usuario_id`: ID del solicitante.
     - `cantidad`: Cantidad pedida.
     - `proveedor`: Proveedor asignado.
     - `urgencia`: Nivel de urgencia establecido.
     - `estado`: Valor por defecto `'Pendiente'`.
     - `fecha_solicitud`: Marca temporal del servidor (`CURRENT_TIMESTAMP`).
   - Inserta simultáneamente un registro en la tabla `auditoria`:
     - `usuario_id`: ID del solicitante.
     - `accion`: `'SOLICITUD_PEDIDO'`.
     - `detalle`: `"Generación de pedido de reposición para el material ID: 1, Cantidad: 100, Proveedor: Ferretería Central, Urgencia: Alta"`.
     - `fecha`: Marca temporal del servidor.
   - Consolida la transacción (`COMMIT`) en MySQL.
7. Django retorna código HTTP `201 Created` con el objeto completo del pedido generado.
8. La SPA en Angular muestra una notificación emergente de confirmación: *"Pedido #N generado con éxito en estado Pendiente"*, limpia el formulario y redirige al listado general de pedidos.

#### 4. Flujos Alternativos y Excepciones
- **FA-3.1: Material no Encontrado o Inactivo**
  - En el paso 6, si el `material_id` enviado no existe o fue dado de baja en la base de datos, la clave foránea `fk_pedidos_material` o la validación del serializador DRF falla. Django retorna `HTTP 404 Not Found` o `HTTP 400 Bad Request: "El material especificado no existe"`.
- **FA-3.2: Cantidad Menor o Igual a Cero**
  - Si el usuario ingresa un valor negativo o cero, la validación del frontend detiene el envío. Si se elude el cliente, la restricción de integridad `CHECK (cantidad > 0)` en MySQL o el serializador de Django impiden la inserción respondiendo con `HTTP 400 Bad Request`.
- **FA-3.3: Cancelación del Formulario**
  - El usuario puede presionar el botón "Cancelar" en cualquier momento antes del envío. El sistema descarta los datos introducidos sin alterar ninguna tabla ni registrar eventos en auditoría.

#### 5. Postcondiciones
- Se persiste un nuevo registro con estado `'Pendiente'` en la tabla `pedidos` de MySQL.
- Se registra el evento en la tabla `auditoria` con el usuario emisor y los detalles de la orden.
- El panel de control de pedidos refleja la nueva solicitud para posterior revisión y aprobación por parte del Administrador.

---

## 5. Reglas de Negocio Vinculadas (RN)

1. **RN-01: Autenticación Mandatoria y RBAC:** Todo acceso a las rutas operativas (`inventario`, `pedidos`, `auditoria`) requiere un token JWT válido y no revocado. Determinadas acciones (como la eliminación de materiales o visualización de bitácoras de auditoría completas) están reservadas al rol `Admin`.
2. **RN-02: Integridad Estricta de Existencias (No Negatividad):** Bajo ningún concepto la columna `cantidad_actual` de un insumo puede descender de cero (`CHECK (cantidad_actual >= 0)`). Toda operación de egreso que vulnere esta condición debe ser abortada de forma atómica.
3. **RN-03: Determinación Proactiva de Alertas de Stock:** Un material entra en condición de alerta de stock en el instante en que `cantidad_actual <= stock_minimo`. La severidad es catalogada como crítica si la existencia es nula o representa menos de un tercio del stock mínimo de seguridad.
4. **RN-04: Auditoría Transaccional Obligatoria e Inmutable:** Toda mutación de estado que involucre existencias físicas o creación de pedidos de compra debe registrar de manera concurrente e inescindible un registro en la tabla `auditoria`. Los registros de auditoría no pueden ser editados ni eliminados por ningún usuario regular.
5. **RN-05: Ciclo de Vida Controlado de Pedidos:** Todo pedido nace en estado `'Pendiente'`. Solamente un usuario con rol `Admin` posee la potestad de transicionar el pedido hacia los estados `'Aprobado'`, `'Completado'` o `'Cancelado'`. Al completarse una recepción, se debe disparar automáticamente el ingreso correspondiente de existencias (CU-01).
