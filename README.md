<div align="center">

# 📦 StockManager

*Sistema integral de gestión de inventario interno diseñado para optimizar la administración de recursos, el control de stock crítico y la trazabilidad de reposiciones.*

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

</div>

---

## 🎯 Descripción General del Proyecto

> **StockManager** es una aplicación web enfocada en la gestión eficiente del inventario y la logística de un almacén, garantizando la escalabilidad y la toma de decisiones basada en datos.

El sistema está diseñado para brindar una excelente experiencia de usuario (UX) a tres roles principales: **Administrador**, **Personal de Almacén** y **Encargado de Logística**. 

**Funcionalidades principales:**
* 📥 Registro de ingreso y egreso de materiales con historial de modificaciones.
* ⚠️ Monitoreo visual y alertas críticas para materiales con stock bajo.
* 📝 Generación de solicitudes formales de reposición de mercadería.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5:** Estructuración semántica de las vistas principales.
* **CSS3:** Estilos visuales externalizados y diseño responsivo.
* **Bootstrap 5:** Sistema de grillas y componentes para garantizar la adaptabilidad móvil (*mobile-first*).
* **Git y GitHub:** Control de versiones bajo un modelo de GitFlow con confirmaciones atómicas (*Conventional Commits*).

---

## 📂 Estructura de Carpetas

Atendiendo a las buenas prácticas de desarrollo, el repositorio concentra los archivos en una única aplicación principal, separando claramente las vistas públicas del módulo de gestión:

```text
/maqueta
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

---

## 🚀 Instrucciones de Ejecución

1. Clonar el repositorio en el entorno local.
2. Navegar hacia la carpeta `/maqueta`.
3. Abrir el archivo `index.html` en cualquier navegador web moderno (Chrome, Firefox, Edge).
> *Nota: Al ser una maqueta estática, no se requiere la instalación de dependencias ni levantar un servidor local.*

---

## 🤖 Herramientas o IA Utilizadas

* **Editor de Código:** Visual Studio Code.
* **Validación de Código:** W3C Markup Validation Service y Lighthouse (estándares web y accesibilidad).
* **Inteligencia Artificial:** Asistencia de Gemini y ChatGPT para la redacción de la documentación técnica y revisión de buenas prácticas en la refactorización CSS. *Todo el código resultante fue auditado y comprendido íntegramente por el equipo de desarrollo.*

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