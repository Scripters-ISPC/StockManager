<div align="center">

# 📦 StockManager

*Sistema integral de gestión de inventario interno desarrollado como una Aplicación de Página Única (SPA) en Angular (v17+), diseñado para optimizar la administración de recursos, el control de stock crítico y la trazabilidad de reposiciones.*

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

</div>

---

## 🎯 Descripción General del Proyecto

> **StockManager** es una aplicación web enfocada en la gestión eficiente del inventario y la logística de un almacén, garantizando la escalabilidad y la toma de decisiones basada en datos.

El sistema está desarrollado con componentes standalone y rutas dinámicas, incorporando un control de acceso basado en roles (RBAC) con dos perfiles principales: **Administrador** y **Operario**.

**Funcionalidades principales:**
* 📥 Registro de ingreso y egreso de materiales con historial de modificaciones.
* ⚠️ Monitoreo visual y alertas críticas para materiales con stock bajo.
* 📝 Generación de solicitudes formales de reposición de mercadería mediante formularios reactivos validados.
* 🔒 Protección de rutas y vistas sensibles mediante Guardianes de Angular (*Guards*).

---

## 🛠️ Tecnologías Utilizadas

* **Angular (v17+):** Framework principal basado en componentes *standalone*, Signals y sistema avanzado de ruteo.
* **TypeScript:** Lenguaje base para la lógica de componentes, servicios y validación de formularios reactivos.
* **Bootstrap 5:** Sistema de grillas y componentes para garantizar la adaptabilidad móvil (*mobile-first*).
* **Git y GitHub:** Control de versiones bajo un modelo de ramas (`feat/`, `docs/`) y confirmaciones atómicas (*Conventional Commits*).

---

## 📂 Estructura de Carpetas

Atendiendo a las buenas prácticas de desarrollo, el repositorio concentra los archivos en una única aplicación principal, separando claramente las vistas públicas del módulo de gestión:

```text
/StockManager
│
├── /frontend               # Aplicación completa desarrollada en Angular (SPA)
│   ├── /src                # Código fuente (componentes, servicios, guards, rutas)
│   ├── angular.json        # Configuración del proyecto Angular
│   └── package.json        # Dependencias y scripts de ejecución
│
└── /maqueta                # Archivos estáticos originales de las fases previas (HTML/CSS)├──/maqueta
    │
    ├── /assets                     # Recursos multimedia globales
    │   ├── /icons                  # Íconos de la interfaz
    │   └── /img                    # Imágenes estáticas
    │
    ├── /css                        # Hojas de estilo de las páginas públicas
    │
    ├── /dashboard                  # Módulo de administración (Panel de control)
    │   ├── /css                    # Estilos específicos del panel
    │   ├── /js                     # Lógica funcional e interactividad
    │   ├── alertas.html            # Vista de notificaciones de stock crítico
    │   ├── historial-pedidos.html  # Registro de reposiciones anteriores
    │   ├── index.html              # Resumen principal del panel (Home Dashboard)
    │   ├── inventario.html         # Gestión de stock y auditoría
    │   ├── pedidos-formulario.html # Formulario de nueva solicitud
    │   └── pedidos.html            # Gestión de pedidos activos
    │
    ├── index.html                  # Landing Page / Inicio público
    ├── quienes-somos.html          # Página institucional del equipo
    └── template.html               # Plantilla base para creación de nuevas vistas
```
---

## 🚀 Instrucciones de Ejecución
Para poner en marcha la aplicación dinámica en tu entorno local, seguí estos pasos:

1. Clonar el repositorio en el entorno local.
2. Abrir una terminal y navegar hacia la carpeta del frontend con el comando: cd frontend
3. Instalar las dependencias necesarias ejecutando el comando: npm install
4. Ejecutar el servidor de desarrollo local con el comando: ng serve
5. Abrir tu navegador web e ingresar a http://localhost:4200/


---

## 🤖 Herramientas o IA Utilizadas

* **Editor de Código:** Visual Studio Code.
* **Validación de Código:** W3C Markup Validation Service, Lighthouse y compilador estricto de Angular. 
* **Inteligencia Artificial:** Asistencia de Gemini y ChatGPT para la refactorización de código estático a componentes SPA en Angular 17, estructuración de rutas hijas, lógica de Guardianes (Guards), soporte en la redacción de documentación técnica y revision de buenas practicas. *Todo el código resultante fue auditado y comprendido íntegramente por el equipo de desarrollo.*

---

## 👥 Integrantes del Equipo (ISPC Datalab)

| Nombre y Apellido | Rol / Especialidad |
| :--- | :--- |
| **Angelo, Yamila Noelia Belen** | Desarrolladora Front-End |
| **Catalas, Luis Gerardo** | Desarrollador Front-End |
| **Mazur, Luciana Del Milagro** | Desarrolladora Front-End |
| **Murua, Hector Marcelo** | Desarrollador Front-End |

<br>

<div align="center">
  <small>Instituto Superior Politécnico de Córdoba (ISPC) | Tecnicatura Superior en Desarrollo de Software</small>
</div>