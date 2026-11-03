# 📦 StockManager

Sistema web desacoplado para la gestión de inventario, materiales, pedidos y
auditoría de movimientos. La aplicación permite controlar el stock, gestionar
solicitudes de reposición y consultar el historial de operaciones según el
rol del usuario.

## Arquitectura

StockManager utiliza una arquitectura cliente-servidor separada:

- **Frontend:** SPA desarrollada con Angular 17+ y TypeScript.
- **Backend:** API REST desarrollada con Django REST Framework.
- **Base de datos:** MySQL, con modelos relacionales y claves foráneas.
- **Comunicación:** HTTP/JSON mediante endpoints versionados bajo `/api/v1/`.
- **Autenticación:** JWT con autorización Bearer.
- **Documentación API:** Swagger/OpenAPI mediante `drf-spectacular`.

## Estructura del repositorio

```text
StockManager/
├── backend/                 # API Django REST Framework
│   ├── database/            # Scripts SQL de inicialización y auditoría
│   ├── fixtures/            # Datos iniciales de prueba
│   └── README.md            # Guía técnica del backend
├── frontend/                # Aplicación SPA Angular
│   └── README.md            # Guía técnica del frontend
└── README.md                # Presentación general del proyecto
```

## Cómo empezar

1. Consultar la guía del [backend](./backend/README.md) para configurar
   Python, MySQL, migraciones y datos de prueba.
2. Consultar la guía del [frontend](./frontend/README.md) para instalar
   dependencias y levantar Angular.
3. Ejecutar ambos servicios en terminales separadas:
   - API Django: `http://localhost:8000/`
   - Aplicación Angular: `http://localhost:4200/`

## Tecnologías clave

![Angular](https://img.shields.io/badge/Angular-17%2B-DD0031?logo=angular&logoColor=white)
![Django](https://img.shields.io/badge/Django-6.1-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-3.18-red)
![MySQL](https://img.shields.io/badge/MySQL-8.4%2B-4479A1?logo=mysql&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=black)

## Módulos principales

- **Usuarios:** autenticación, roles, cuentas y cambio de contraseña.
- **Inventario:** materiales, categorías, proveedores y control de stock.
- **Pedidos:** solicitudes de reposición y seguimiento de estados.
- **Auditoría:** historial persistente de ingresos, egresos y cambios.
