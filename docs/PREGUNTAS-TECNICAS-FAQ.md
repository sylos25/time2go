# Time2Go — FAQ Tecnica Extendida

> Ultima actualizacion: Abril 2026  
> Alcance: arquitectura, backend, frontend, base de datos, seguridad, despliegue, operacion y troubleshooting.

---

## 1) Arquitectura general

### 1. Que tipo de arquitectura usa Time2Go?
Usa un monolito full-stack con Next.js App Router: frontend React y backend en `route.ts` dentro del mismo repositorio.

### 2. El backend esta separado del frontend?
No. Ambos viven en la misma app Next.js. Las APIs estan en `src/app/api/**/route.ts`.

### 3. Es SSR, SSG o CSR?
Es mixto. Hay rutas renderizadas en servidor y componentes cliente (`"use client"`). Depende de cada pagina/modulo.

### 4. Cual es la ruta de entrada de la aplicacion?
La entrada principal de UI parte de `src/app/page.tsx` y del layout global `src/app/layout.tsx`.

### 5. Donde se define la proteccion global de rutas?
En `middleware.ts`, tanto para UI protegida por rol como para politica de autenticacion en `/api`.

### 6. Cual es la fuente de verdad de datos?
PostgreSQL.

### 7. Se usa ORM?
No. Se usa SQL directo con `pg`.

---

## 2) Frontend y UI

### 8. Que stack de UI usa el proyecto?
React + Tailwind CSS + componentes basados en Radix.

### 9. Como se maneja el estado de sesion en cabecera?
Con `useHeaderSession` (`src/hooks/use-header-session.ts`) que hidrata estado, valida `/api/me` y refresca sesion si aplica.

### 10. Como se abre login desde header?
El header puede abrir modal (`onAuthClick`) o redirigir a `/auth?step=login`.

### 11. El login conserva la redireccion original?
Si. El flujo `/auth` conserva `redirect` entre pasos (`choice`, `login`, `register`).

### 12. Como se maneja el mostrar/ocultar contrasena?
Con boton `type="button"` en `PasswordInputField`, evitando submit accidental.

### 13. Por que se usa un modal para auth en algunas vistas y pagina en otras?
Para UX flexible: en algunas pantallas se prioriza continuidad en contexto (modal), en otras se usa flujo completo (`/auth`).

### 14. Como funciona el carrusel de eventos destacados?
Usa Swiper con loop/autoplay y ahora con `centeredSlides`, duplicacion de items y relleno dinamico por breakpoint cuando hay pocos eventos.

### 15. Que pasa si solo existe 1 evento destacado?
Se repite para mantener continuidad visual del carrusel.

---

## 3) API y backend

### 16. Donde estan los endpoints?
En `src/app/api/**/route.ts`.

### 17. Como se decide que API es publica?
Con la politica central en `src/lib/api-route-policy.ts`.

### 18. Que pasa con una API no publica sin token?
El middleware responde 401.

### 19. Se valida tambien dentro del handler aunque haya middleware?
Si, en endpoints sensibles se valida de nuevo rol/permisos/propiedad para defensa en profundidad.

### 20. Hay formato comun de errores?
Si, hay utilidades en `src/lib/api-error-response.ts` y codigos en `src/lib/error-codes.ts`.

### 21. Como se obtiene sesion en servidor?
Con utilidades como `src/lib/get-session.ts` y funciones de auth-request.

---

## 4) Autenticacion, JWT y sesion

### 22. Que tipo de autenticacion usa?
JWT (access + refresh) con cookies HttpOnly.

### 23. Donde se emiten los tokens?
En `POST /api/login` y tambien en login social (`/api/login-google`).

### 24. Como se refresca la sesion?
Con `POST /api/refresh`, que rota refresh y vuelve a fijar cookies.

### 25. `/api/refresh` tiene proteccion CSRF?
Tiene validacion de `Origin` confiable contra el origen de la request.

### 26. Que hace exactamente el logout?
Revoca `jti`, limpia cookies y ahora tambien invalida la sesion activa (`sid`) en Redis para impedir refresh residual.

### 27. Como se detecta sesion reemplazada por otro login?
Mediante control de sesion activa por `sid` en Redis y validacion en `verifyTokenDetailed`.

### 28. Que diferencia hay entre access y refresh?
Access: corto plazo para acceso API/UI. Refresh: mayor vida para renovar access sin re-login.

### 29. Donde se define expiracion de tokens?
En `src/lib/auth-session.ts`.

### 30. Se soporta rotacion de claves JWT?
Si, con `JWT_KEYS` + `JWT_ACTIVE_KID` (si se configuran).

### 31. Que secreto se usa para JWT?
`BETTER_AUTH_SECRET` o `JWT_SECRET` (segun resolucion en `jwt-secret.ts`).

---

## 5) Seguridad

### 32. Hay captcha en login?
Si, Cloudflare Turnstile.

### 33. Que modos soporta Turnstile?
`strict`, `degraded` y `disabled`.

### 34. Que ocurre si el proveedor captcha falla?
En `degraded`, permite continuidad con controles de intentos; en `strict`, bloquea.

### 35. Hay proteccion contra fuerza bruta?
Si, con limites por IP y por IP+credencial en `POST /api/login` (en produccion).

### 36. El rate limit es distribuido?
Actualmente el principal del login es en memoria de proceso. Hay piezas para Upstash que pueden extenderlo.

### 37. Las contrasenas se guardan en texto plano?
No. Se guardan hasheadas con bcrypt/bcryptjs.

### 38. Hay validacion de complejidad de contrasena?
Si, por frontend y backend.

### 39. Hay politicas de cabeceras de seguridad?
Si, se definen cabeceras (incluyendo CSP) en `next.config.ts`.

### 40. Se puede evitar por completo el riesgo XSS solo con cookies HttpOnly?
No. Si existen datos sensibles en `localStorage`, un XSS puede exponerlos. Se requiere defensa en capas (CSP, sanitizacion, etc.).

---

## 6) Redis, revocacion y sesion activa

### 41. Para que se usa Redis en este proyecto?
Revocacion por `jti` y control de sesion activa por usuario/sid.

### 42. Como se evita exponer identificadores en keys Redis?
Con HMAC (`ACTIVE_SESSION_HMAC_SECRET`) en la key versionada de sesion activa.

### 43. Que pasa si Redis no esta configurado?
Las utilidades degradan de forma segura para no romper arranque, pero se pierde parte del endurecimiento.

### 44. Que aporta `clearActiveSession`?
Permite invalidar la sesion activa al cerrar sesion y evitar que quede abierta por refresh.

---

## 7) Base de datos y SQL

### 45. Donde esta el esquema principal?
En `scripts SQL/DDL Time2Go.SQL`.

### 46. Donde estan funciones SQL y migraciones?
En `scripts SQL/funciones/` y `scripts SQL/migrations/`.

### 47. Como se manejan transacciones criticas?
Con `BEGIN/COMMIT/ROLLBACK` en handlers que tocan varias tablas.

### 48. Hay semillas o inserts de catalogos?
Si, en `scripts SQL/insert/`.

### 49. Como se controla el listado de eventos publicos a nivel SQL?
Con funciones SQL (por ejemplo `fn_eventos_listar_json`) y criterios de estado/proceso.

---

## 8) Pagos (ePayco)

### 50. Para que se integra ePayco?
Para pagos del flujo de upgrade a organizador.

### 51. Donde se crea la sesion de checkout?
En el flujo backend (`/api/organizador-document`) y pagina de pago en `/perfil/pagar`.

### 52. Como se confirma pago en servidor?
Por webhook en `/api/epayco/webhook`.

### 53. Que valida el webhook?
Firma y consistencia de datos antes de actualizar estado de suscripcion/rol.

### 54. Que variables son clave para ePayco?
`EPAYCO_PUBLIC_KEY`, `EPAYCO_P_CUST_ID_CLIENTE`, `EPAYCO_RESPONSE_URL`, `EPAYCO_CONFIRMATION_URL`, `EPAYCO_TEST_MODE`.

---

## 9) Documentos y almacenamiento

### 55. Donde se guardan documentos/archivos?
En proveedor S3-compatible (S3 o R2) segun configuracion.

### 56. Que variables gobiernan storage?
`DOCUMENTS_*` y `DOCUMENT_STORAGE_PROVIDER`.

### 57. Hay control de tipo/tamano de archivos?
Si, en endpoints que reciben archivos (imagenes/PDFs), con validaciones y limites.

### 58. Hay proteccion contra path traversal en docs internas?
Si, en `/api/docs/serve`.

### 59. Como se expone documentacion interna?
Desde `public/docs/` via `/api/docs/files` y `/api/docs/serve`, solo admin.

---

## 10) Email y notificaciones

### 60. Que motor de correo usa?
Nodemailer sobre SMTP.

### 61. Para que eventos se envia correo?
Validacion de email, recuperacion de contrasena, contacto, aprobacion de evento, ban/reactivacion, entre otros.

### 62. Que variables se requieren para email?
`EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD` (y relacionadas).

---

## 11) Rendimiento y compilacion

### 63. Que comando usar para desarrollo rapido?
`npm run dev` (Turbopack).

### 64. Hay fallback a Webpack?
Si, `npm run dev:webpack`.

### 65. Que optimizaciones recientes se aplicaron al build?
`optimizePackageImports` en Next, ajuste de `tsconfig include`, mejoras de flujo de compilacion.

### 66. Como medir si el build esta lento por TypeScript?
Revisar salida de `next build` y el tramo `Running TypeScript`.

### 67. Que hacer si compila pero falla type-check?
Corregir errores tipados primero; Next no finaliza build productivo con errores TS.

---

## 12) Despliegue y entorno

### 68. Cual es el despliegue recomendado?
`next build` + `next start` en runtime Node.

### 69. Se puede usar solo export estatico?
Solo si la app y APIs lo permiten; en general este proyecto depende de backend runtime.

### 70. Que variables minimas son criticas para iniciar?
`DATABASE_URL` y secreto JWT (`BETTER_AUTH_SECRET` o `JWT_SECRET`).

### 71. Como se manejan secretos?
En `.env.local` (local) y variables del proveedor en produccion. No versionar secretos.

### 72. Que pasa si falta `DATABASE_URL` en produccion?
El modulo de BD falla intencionalmente para evitar correr sin DB valida.

---

## 13) Dominio, DNS y tuneles

### 73. Por que un tunnel puede estar activo pero no abrir la web?
Porque DNS del dominio no apunta al tunnel o porque la app local no responde en el puerto esperado.

### 74. Diferencia entre Named Tunnel y Quick Tunnel?
Named Tunnel usa hostname propio configurado en DNS. Quick Tunnel entrega URL temporal `*.trycloudflare.com`.

### 75. Cuando conviene Quick Tunnel?
Para pruebas rapidas, demos o debugging sin configurar dominio.

### 76. Por que cambia la URL en Quick Tunnel?
Porque es efimera por sesion/ejecucion.

### 77. Como validar si el problema es cloudflared o la app?
Primero abrir `http://localhost:<puerto>`. Si eso falla, no es tunnel: es app local.

---

## 14) Operacion, mantenimiento y cron

### 78. Hay tareas periodicas?
Si, endpoint `POST /api/cron/maintenance` pensado para scheduler externo.

### 79. Como se autoriza el cron?
Con `CRON_SECRET`.

### 80. Que hace mantenimiento?
Salud de BD y limpieza/actualizaciones operativas segun implementacion del handler.

### 81. Existe observabilidad avanzada?
Hay logging basico (console). Recomendable evolucionar a logs estructurados + alertas.

---

## 15) Troubleshooting frecuente

### 82. El login responde "Error de red" en frontend. Que revisar?
Conectividad al backend, consola navegador, estado de `/api/login`, CORS/origin y disponibilidad de captcha.

### 83. Login correcto pero luego rebota a inicio. Que revisar?
Parametro `redirect`, middleware de ruta destino, validez de cookies/token y rol del usuario.

### 84. Logout hecho pero sesion sigue viva. Que revisar?
Que `/api/logout` responda 200 y que cookies se limpien; validar Redis/sid y que no exista refresh paralelo.

### 85. `trycloudflare` da 404. Que revisar?
Que cloudflared use la URL actual, app local viva, y puerto correcto.

### 86. Build falla en CI pero local no. Que revisar?
Variables de entorno faltantes, version Node, diferencias de lockfile y type-check estricto.

### 87. Pagos no confirman en local. Que revisar?
URL de confirmacion publica (tunnel) y webhook alcanzable desde proveedor.

### 88. No llegan correos. Que revisar?
Credenciales SMTP, bloqueos del proveedor, logs de envio y reputacion/cupo de cuenta.

---

## 16) Preguntas de entrevista tecnica sobre Time2Go (con respuesta corta)

### 89. Como defenderias el flujo de auth contra abuso automatizado?
Turnstile + rate limiting + bloqueos progresivos + revocacion de tokens + sesion activa por sid.

### 90. Como evitarias sesiones "zombie" despues de logout?
Revocar `jti`, limpiar cookies y borrar `sid` activo en Redis.

### 91. Que ventaja tiene separar politica de rutas publicas API en un modulo?
Consistencia, trazabilidad y menor riesgo de divergencia entre middleware y handlers.

### 92. Por que elegir SQL directo en vez de ORM aqui?
Control fino de consultas, compatibilidad con funciones SQL existentes y menor capa de abstraccion.

### 93. Como escalarias el rate limit del login en multi-instancia?
Moviendolo totalmente a almacenamiento compartido (Redis) y quitando dependencia de memoria local.

### 94. Que trade-off implica guardar datos en `localStorage`?
Mejor UX y estado rapido, pero mayor superficie ante XSS.

### 95. Como asegurarias callbacks de pagos en entorno local?
Tunnel publico estable/temporal + URLs correctas en proveedor + verificacion de firma en webhook.

### 96. Que capa te protege primero una API privada?
Middleware JWT; luego validacion interna del handler para seguridad por capas.

### 97. Como harías hardening adicional de seguridad HTTP?
CSP mas restrictiva por host, HSTS (cuando aplique), y revisiones periodicas de cabeceras.

### 98. Como optimizarias compilado sin romper funcionalidad?
Turbopack en dev, imports optimizados, tipo-check mas acotado, eliminar trabajo redundante.

### 99. Como documentar cambios tecnicos para no perder contexto?
Actualizar README + docs de arquitectura + doc tecnica completa + reporte RNF en el mismo PR.

### 100. Cual es la principal deuda tecnica visible hoy?
Observabilidad centralizada y rate limiting distribuido totalmente consistente en entornos con replicas.

---

## 17) Checklist rapido para nuevos desarrolladores

1. Instalar dependencias (`npm install`).
2. Configurar `.env.local` con DB + secretos minimos.
3. Levantar app (`npm run dev`).
4. Verificar login/logout/refresh en entorno local.
5. Revisar `middleware.ts` y `api-route-policy.ts`.
6. Ejecutar `npm run build` antes de cerrar cambios.
7. Actualizar docs cuando se toquen auth, rutas o infra.

---

Si agregas nuevas integraciones o cambias flujos clave (auth, pagos, permisos, cron, storage), actualiza este FAQ junto con:

- `README.md`
- `docs/ARQUITECTURA-Y-OPERACION.md`
- `docs/DOCUMENTACION-TECNICA-COMPLETA.md`
- `public/docs/REPORTE_REQUERIMIENTOS_NO_FUNCIONALES.md`
