# 🎤 Documento de Exposición — Proyecto Time2Go

## 1) ¿Qué es Time2Go?

**Time2Go** es una plataforma web para la **gestión y reserva de eventos**.
Su propósito es conectar usuarios con experiencias (eventos) y dar a administradores/promotores herramientas para crear, validar y administrar contenido desde un panel central.

---

## 2) Problema que resuelve

En la organización de eventos suelen existir retos como:

- Publicación y actualización manual de información.
- Procesos poco claros para validar eventos o usuarios.
- Falta de control de permisos por rol.
- Baja trazabilidad de datos y errores en carga administrativa.

**Time2Go** aborda estos problemas con un sistema integrado de frontend + API + base de datos, con validaciones y control de acceso.

---

## 3) Objetivo del proyecto

Construir una plataforma moderna que permita:

- Visualizar eventos de forma pública.
- Reservar y gestionar eventos por usuario.
- Administrar eventos, usuarios y analíticas desde dashboard.
- Aplicar permisos por rol de forma granular.
- Mantener seguridad en autenticación y manejo de datos.

---

## 4) Funcionalidades clave (estado actual del repositorio)

### Módulo público

- Página de inicio con secciones de presentación y preview de eventos.
- Catálogo/listado de eventos.
- Contacto, perfil, políticas y rutas de validación de correo.

### Módulo autenticación y cuenta

- Inicio de sesión y registro.
- Validación de correo.
- Cambio y reseteo de contraseña (con envío por correo, según documentación).
- Monitoreo de sesión y cierre de sesión con limpieza de cookie/token.

### Dashboard administrativo

- Vista general con métricas y analíticas.
- Gestión de eventos (consultar/editar según permisos).
- Gestión de usuarios.
- Módulo **Insertar Datos** con formularios dinámicos para 6 tablas.
- Visualización y soporte para documentos PDF en flujos de eventos.

### Control de acceso

- Sistema de permisos por accesibilidad (tabla de permisos por rol).
- Verificación de permisos vía API y hooks en frontend.
- Menús y acciones condicionadas por permisos.

---

## 5) Arquitectura (resumen técnico)

Time2Go sigue una arquitectura web de capas:

1. **Frontend (Next.js + React + TypeScript)**
   - App Router.
   - Componentes reutilizables y UI con Tailwind/Radix.

2. **Backend API (Route Handlers en Next.js)**
   - Endpoints para autenticación, eventos, usuarios, reservas, estadísticas, permisos y administración.

3. **Persistencia (PostgreSQL)**
   - Integridad relacional con llaves primarias/foráneas y restricciones.

4. **Servicios complementarios**
   - Email transaccional para validación/reset.
   - Almacenamiento de archivos con guía de Cloudflare R2 (documentado en el proyecto).

---

## 6) Seguridad implementada (puntos para destacar)

- Hash de contraseñas con **bcrypt**.
- Uso de JWT y soporte de sesión por cookie **HttpOnly**.
- Validaciones en cascada: cliente, servidor y base de datos.
- Consultas SQL parametrizadas para reducir riesgo de inyección.
- Control de permisos por rol antes de exponer acciones sensibles.

---

## 7) Stack tecnológico

- **Framework:** Next.js (App Router)
- **UI:** React, Tailwind CSS, Radix UI, Lucide
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL (`pg`)
- **Auth/seguridad:** JWT, better-auth, bcrypt
- **Visualización:** Recharts
- **Documentos/archivos:** React PDF, integración de storage documentada

---

## 8) Flujo funcional simplificado para exponer

1. Usuario entra al sitio y consulta eventos.
2. Se autentica para acceder a funciones de cuenta/reservas.
3. El sistema valida sesión y permisos según rol.
4. En dashboard, administradores gestionan eventos/usuarios/datos.
5. Cada operación sensible pasa por validación backend + reglas de BD.

---

## 9) Demostración sugerida (5–7 minutos)

### Parte A — Vista usuario (2 min)

- Abrir Home.
- Ir a eventos.
- Mostrar acceso a autenticación y perfil.

### Parte B — Seguridad y sesión (1 min)

- Explicar validación de sesión y cierre seguro.
- Mencionar validación de correo/cambio de contraseña.

### Parte C — Dashboard (2–3 min)

- Entrar al panel administrativo.
- Mostrar métricas y módulos principales.
- Enseñar “Insertar Datos” y explicar validaciones.

### Parte D — Permisos por rol (1 min)

- Explicar que las opciones dependen de accesibilidad por rol.
- Ejemplo: funcionalidades visibles/no visibles según permisos.

---

## 10) Valor del proyecto

- Centraliza operación de eventos en una sola plataforma.
- Reduce errores en gestión administrativa gracias a validaciones.
- Mejora seguridad y gobierno del sistema por permisos.
- Facilita evolución del producto con arquitectura modular.

---

## 11) Retos y mejoras recomendadas

- Fortalecer auditoría de acciones administrativas.
- Profundizar estrategia de rate limiting y hardening de endpoints.
- Ampliar automatización de pruebas (unitarias/integración/e2e).
- Evolucionar módulos CRUD completos para más entidades.

---

## 12) Cierre para presentación

**Mensaje final sugerido:**

> “Time2Go no solo muestra eventos; implementa una arquitectura completa de gestión con seguridad, permisos y herramientas administrativas que permiten escalar la operación de manera ordenada y confiable.”

---

## 13) Preguntas frecuentes para defensa

**¿Qué hace diferente a Time2Go?**  
Combina experiencia de usuario, panel administrativo y control de permisos en un mismo producto.

**¿Cómo protege la información sensible?**  
Con hash de contraseñas, validaciones multicapa, sesiones seguras y restricciones en base de datos.

**¿Es escalable?**  
Sí, porque usa módulos separados (frontend, API, BD) y un esquema de permisos extensible.

**¿Qué ya está documentado?**  
Guías de setup, permisos, validación de correo, reset de contraseña, módulo de inserción de datos y almacenamiento.

---

**Documento preparado para exposición académica/profesional**  
**Proyecto:** Time2Go  
**Fecha:** Febrero 2026
