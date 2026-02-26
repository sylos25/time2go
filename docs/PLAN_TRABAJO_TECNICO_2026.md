# Plan de Trabajo Técnico 2026 — Time2Go

## 1) Objetivo
Definir una ruta de mejora técnica del proyecto sin afectar la operación actual, priorizando seguridad, calidad de datos, mantenibilidad y experiencia de usuario.

## 2) Diagnóstico Ejecutivo

### Virtudes actuales
- Arquitectura moderna en gran parte del backend con Next.js App Router (`src/app/api`) y TypeScript estricto.
- Uso mayoritario de consultas SQL parametrizadas (`$1`, `$2`, etc.), lo cual reduce riesgo de SQL injection.
- Buen avance en control de permisos por accesibilidad (`/api/permissions/check`, `lib/permissions.ts`).
- Validaciones funcionales en formularios críticos (registro, login, inserción de datos).
- Componentes UI consistentes y documentación interna amplia en `docs/`.

### Puntos críticos a mejorar
- Convivencia de dos modelos API (`src/app/api` y `src/pages/api`) incrementa deuda técnica y complejidad.
- Enfoque híbrido de autenticación (Better Auth + JWT propio + `localStorage`) genera superficie de riesgo.
- Endpoints administrativos sensibles requieren hardening (autenticación/autorización uniforme, auditoría, rate limit).
- Existen rutas legacy con prácticas de alto riesgo que deben corregirse antes de expansión.

---

## 3) Evaluación por dominio

## 3.1 Consultas de BD
### Fortalezas
- Predominio de queries parametrizadas en APIs de negocio.
- En módulos admin recientes se usa whitelist de tablas/campos antes de construir SQL dinámico.

### Mejoras necesarias
- Estandarizar el patrón de acceso a datos (repositorio/servicio por módulo).
- Añadir trazabilidad de consultas sensibles (quién, cuándo, qué cambió).
- Revisar índices para consultas de listas frecuentes (usuarios/eventos/valoraciones).

### Acciones
1. Definir checklist SQL seguro (parametrización, whitelist, límites, ordenamiento determinístico).
2. Incorporar auditoría mínima en tablas críticas (`tabla_usuarios`, `tabla_eventos`, `tabla_baneados`).
3. Ejecutar revisión de rendimiento con `EXPLAIN ANALYZE` sobre 10 consultas más usadas.

---

## 3.2 Diseño (UI/UX)
### Fortalezas
- Identidad visual consistente y reciente homologación de paleta en dashboard.
- Patrones reutilizables de tabla/formulario ya presentes.

### Mejoras necesarias
- Consolidar tokens visuales para evitar estilos sueltos por componente.
- Definir estados estándar: loading, empty, error, success para todas las vistas administrativas.

### Acciones
1. Publicar guía corta de diseño interno (colores, espaciado, estados).
2. Crear catálogo de componentes de tabla/formulario para reuso.

---

## 3.3 Accesibilidad
### Fortalezas
- Se observan patrones de foco y manejo de teclado en modales (ejemplo registro).

### Mejoras necesarias
- Homologar `aria-label`, `role`, foco visible y navegación por teclado en componentes de dashboard.
- Revisar contraste de algunos estados para WCAG AA.

### Acciones
1. Auditoría A11y en 5 flujos clave (login, registro, crear evento, reservar, dashboard).
2. Checklist A11y en PRs (foco, etiquetas, contraste, lectura de errores).

---

## 3.4 Validaciones
### Fortalezas
- Validaciones útiles en frontend (email, teléfono, password, términos).
- Mensajes de error de BD razonables en módulos admin.

### Mejoras necesarias
- Centralizar esquemas de validación en backend (Zod/DTO), no solo en cliente.
- Evitar divergencia entre reglas frontend y backend.

### Acciones
1. Definir esquemas compartidos por dominio (auth, usuarios, eventos, admin-data).
2. Aplicar validación de payload al inicio de cada endpoint.

---

## 3.5 Conexiones y recursos
### Fortalezas
- Existe capa común de DB (`src/lib/db.ts`).

### Mejoras necesarias
- Algunas rutas legacy crean pools propios (riesgo de exceso de conexiones).
- Falta política uniforme de timeouts/reintentos para servicios externos.

### Acciones
1. Unificar todo acceso DB con `src/lib/db.ts`.
2. Definir timeouts estándar para Google/Cloudflare/Email.

---

## 3.6 Rutas y APIs
### Fortalezas
- Base sólida de endpoints en `app/api`.

### Mejoras necesarias
- Migración planificada de `pages/api` a `app/api`.
- Evitar rutas duplicadas o equivalentes en dos routers distintos.

### Acciones
1. Migrar por fases: lectura simple → autenticación → registro.
2. Mantener compatibilidad temporal con rutas `/api/v2/*` durante transición.

---

## 3.7 Frameworks y stack
### Fortalezas
- Next.js + React + TypeScript actualizados.
- Ecosistema UI y librerías de productividad maduras.

### Mejoras necesarias
- Revisar dependencias legacy y alineación de tooling (`eslint`, scripts `start`, estándares de lint/test).
- Definir baseline de calidad (lint, typecheck, build) en CI.

### Acciones
1. Crear pipeline mínimo CI: `lint`, `typecheck`, `build`.
2. Plan de actualización de dependencias por riesgo/impacto.

---

## 3.8 Token, sesión y autenticación
### Fortalezas
- Uso de cookie HttpOnly para sesión en parte del flujo.
- Soporte para Better Auth y JWT.

### Mejoras necesarias
- El modelo híbrido actual (cookie + JWT + localStorage) aumenta complejidad y riesgo.
- Se requiere una estrategia única de sesión para todo el proyecto.

### Acciones
1. Definir estándar único (recomendado: cookie HttpOnly + Better Auth como fuente oficial).
2. Reducir progresivamente el uso de `localStorage` para token de sesión.
3. Centralizar middleware/guards de autenticación por dominio de ruta.

---

## 3.9 Injections y hardening
### Fortalezas
- Buena base de parametrización SQL.
- Whitelists en endpoints de edición/consulta dinámica.

### Mejoras necesarias
- Endpoints administrativos deben reforzar control de acceso y trazabilidad.
- Revisar sanitización en campos de texto que luego se renderizan.

### Acciones
1. Reforzar autorización por permiso en todos los endpoints `admin/*`.
2. Añadir sanitización/normalización de payload en backend.
3. Agregar protección básica anti abuso: rate limit y throttling por IP/usuario.

---

## 3.10 Vulnerabilidades (prioridad)

## Críticas (resolver primero)
1. Riesgo de creación de usuario insegura en endpoint de auth legacy con password sin hash y rol recibido por payload.
2. Endpoints administrativos con potencial exposición si no aplican verificación de permiso homogénea.
3. Secretos operativos expuestos o compartidos fuera de entornos seguros (requerir rotación y gestión segura).

## Altas
1. Doble stack API (`pages/api` + `app/api`) y autenticación híbrida.
2. Falta de trazabilidad/auditoría de cambios administrativos.

## Medias
1. Cobertura parcial de validaciones backend estructuradas.
2. Experiencia inconsistente en estados de error/carga en algunos flujos.

---

## 4) Plan por fases (sin interrumpir operación)

## Fase 0 — Seguridad inmediata (1 semana)
- Congelar cambios no urgentes en auth.
- Corregir rutas críticas de autenticación insegura.
- Aplicar validación/autorización explícita en endpoints admin.
- Rotación de secretos y checklist de configuración segura.

**Entregables**
- Matriz de endpoints críticos protegidos.
- Evidencia de pruebas de acceso (permitido/denegado).

## Fase 1 — Estabilización API y sesión (1–2 semanas)
- Definir estándar oficial de sesión/token.
- Implementar capa común de guards para API.
- Iniciar migración controlada de `pages/api` a `app/api`.

**Entregables**
- Guía de arquitectura API v2.
- 3–5 endpoints legacy migrados y validados.

## Fase 2 — Calidad de datos y validaciones (2 semanas)
- Esquemas de validación backend por dominio.
- Normalización de errores y códigos HTTP.
- Auditoría de consultas frecuentes e índices.

**Entregables**
- Contratos API documentados.
- Reporte de performance SQL y ajustes.

## Fase 3 — UX/A11y y robustez (1–2 semanas)
- Checklist de accesibilidad aplicado a flujos principales.
- Estandarización de estados visuales de carga/error.
- Pruebas E2E mínimas de regresión en flujos críticos.

**Entregables**
- Informe A11y.
- Suite base de pruebas de regresión.

---

## 5) KPIs de éxito
- 0 endpoints críticos sin autorización explícita.
- 100% de endpoints nuevos en `app/api`.
- Reducción de incidencias de auth/sesión en producción.
- Tiempo de respuesta p95 estable en endpoints de mayor tráfico.
- Cobertura mínima de pruebas sobre flujos críticos (login, crear evento, reservar, dashboard usuarios).

---

## 6) Riesgos y mitigación
- Riesgo: romper flujos por migración de API.
  - Mitigación: estrategia paralela (`/api/v2`), feature flags y despliegue gradual.
- Riesgo: inconsistencias auth por doble esquema.
  - Mitigación: plan de convergencia con ventana de compatibilidad definida.
- Riesgo: deuda técnica por urgencias de negocio.
  - Mitigación: reservar capacidad fija por sprint para hardening (20–30%).

---

## 7) Recomendación final
Priorizar seguridad y autenticación en las primeras 2 fases. El proyecto tiene buena base técnica para escalar, pero su mayor retorno inmediato está en unificar APIs, robustecer autorización y consolidar el modelo de sesión/token.
