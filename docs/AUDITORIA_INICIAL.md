# Auditoría Inicial del Proyecto StockManager

## Estructura del árbol del proyecto
```
StockManager/
├─ .git/                 (repositorio)
├─ README.md            (documentación del proyecto)
├─ frontend/            (aplicación Angular SPA)
│   ├─ .angular/
│   ├─ .editorconfig
│   ├─ .gitignore
│   ├─ .prettierrc
│   ├─ .vscode/
│   ├─ README.md
│   ├─ angular.json
│   ├─ db.json           (mock API JSON Server)
│   ├─ node_modules/
│   ├─ package-lock.json
│   ├─ package.json
│   ├─ public/
│   ├─ src/             (código fuente Angular)
│   ├─ tsconfig.*
│   └─ ...
├─ maqueta/             (UI estática previa)
│   ├─ assets/
│   ├─ css/
│   ├─ dashboard/
│   ├─ index.html
│   └─ quienes-somos.html
└─ "modelado y arquitectura"/
    └─ Evidencia_4_Modelado_Datos.pdf
```

## Observaciones
1. **Frontend completo**: La carpeta `frontend` contiene una aplicación Angular que funciona con un *JSON Server* (`db.json`) como backend mock. Los scripts de ejecución son:
   ```
   npm run server   # levanta json-server en http://localhost:3000
   npm start        # levanta Angular dev server en http://localhost:4200
   ```
2. **Ausencia de backend Django**: No hay archivos ni carpetas típicas de un proyecto Django (`manage.py`, `requirements.txt`, `backend/`, etc.).
3. **Base de datos**: El proyecto usa únicamente `db.json` como fuente de datos mock; no hay configuración de PostgreSQL ni migraciones.
4. **API**: Sólo existe la API mock generada por json‑server; no hay implementación de endpoints reales, autenticación o control de permisos.
5. **Seguridad**: No hay autenticación JWT ni protección de rutas; Angular gestiona los “roles” mediante lógica de UI basada en datos estáticos del mock.
6. **Testing**: No se encuentran carpetas de pruebas (`tests/` o `*_test.py`). En el `README` se hace referencia a pruebas manuales.
7. **Documentación**: El `README.md` describe el proyecto y la ejecución con el mock, pero no menciona Django, PostgreSQL ni la integración requerida por EV6.
8. **Diagramas**: Existe un PDF `Evidencia_4_Modelado_Datos.pdf` que contiene un modelo de datos preliminar, pero no está vinculado a ningún código ni a una base de datos real.
9. **BPMN / UML**: No se hallaron archivos BPMN/UML dentro del árbol; solo el PDF mencionado.
10. **Código legado**: La carpeta `maqueta` contiene HTML/CSS estático que fue usado en fases anteriores; no está integrada con Angular ni con ningún backend.

## Estado actual vs. requerimientos de EV6
| Requerimiento | Estado | Comentario |
|---|---|---|
| Proyecto Django | **Faltante** | No hay código backend.
| PostgreSQL | **Faltante** | No hay configuración ni scripts.
| API REST (Django) | **Faltante** | Sólo JSON Server mock.
| Integración Angular ↔ Django | **Faltante** | Angular apunta a `localhost:3000`.
| Autenticación JWT | **Faltante** | No hay token ni seguridad.
| Tests automatizados | **Parcial** | Solo pruebas manuales.
| Signals, DTOs, Guards, Interceptors | **Parcial** | Angular tiene guards, pero sin backend.
| DER definitivo | **Pendiente** | PDF está presente pero no generado a partir de modelos Django.
| Documentación ABP, BPMN, UML | **Pendiente** | No se encontraron artefactos.

---

**Próximo paso**: Crear la rama `feature/ev6-backend-dashboard` (ya activa), añadir este archivo a `docs/AUDITORIA_INICIAL.md`, commitear y continuar con la planificación de la instalación de Django y PostgreSQL.
