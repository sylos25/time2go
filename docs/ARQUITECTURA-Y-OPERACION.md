# Time2Go — Arquitectura, funcionamiento y operación

Documento técnico del repositorio: qué es el proyecto, cómo está montado, qué servicios usa y cómo se manejan credenciales y secretos. Última revisión alineada con el código del monorepo Next.js (App Router).

---

## 1. Qué es Time2Go

**Time2Go** es una aplicación web para **descubrir y gestionar eventos** (culturales, deportivos, etc.). Combina:

- Un **frontend** React (páginas y componentes cliente) con Tailwind y componentes tipo shadcn (Radix).
- Un **backend** embebido en la misma app mediante **Route Handlers** bajo `src/app/api/*`.
- Una base de datos **PostgreSQL** con esquema y scripts SQL versionados en `scripts SQL/`.
- Integraciones opcionadas por variables de entorno: **almacenamiento S3-compatible** (p. ej. Cloudflare R2), **correo** (Nodemailer), **pagos ePayco**, **Google Sign-In**, **Cloudflare Turnstile**, **Upstash Redis** (revocación JWT y módulo de rate limit preparado). Cada una se describe con **qué es** y **rol en el proyecto** en **§6**; el stack de librerías en **§2.1**.

El despliegue previsto es **`next build` + `next start`** (Node). La configuración de Next incluye `images.unoptimized: true` (útil si no usas el optimizador de imágenes del servidor de Next), patrones `images.remotePatterns` para portadas en CDN, y cabeceras de seguridad orientativas (CSP y afines) en `next.config.ts`.

---

## 2. Stack tecnológico (versiones orientativas)

| Capa | Tecnología |
|------|------------|
| Framework | **Next.js 16** (App Router) |
| UI | **React 19**, **Tailwind CSS 4**, **Radix UI**, **lucide-react** |
| Lenguaje | **TypeScript** |
| Base de datos | **PostgreSQL** vía **`pg`** (pool) |
| Auth | **JWT** firmados con **`jose`** (HS256; opcional rotación de claves) |
| Hash contraseñas | **bcryptjs** |
| Validación | **Zod** |
| Mapas | **Leaflet** + **react-leaflet** |
| Carruseles | **Swiper** |
| Gráficos (dashboard) | **Recharts** |
| PDF (cliente) | **jspdf** |
| Almacenamiento archivos | **@aws-sdk/client-s3** (API compatible con S3 y R2) |
| Email | **nodemailer** |
| Bot / human check | **Cloudflare Turnstile** (`@marsidev/react-turnstile` + verificación servidor) |
| Redis serverless | **@upstash/redis**; **@upstash/ratelimit** (módulo `login-rate-limit.ts`; ver nota en §7) |

Scripts npm habituales: `npm run dev` (Turbopack), `npm run build`, `npm run start`, `npm run lint`.

### 2.1 Piezas del stack: qué son y para qué (resumen)

| Pieza | Qué es | Para qué en Time2Go |
|-------|--------|---------------------|
| **Next.js (App Router)** | Framework full-stack sobre React: rutas de página, API en el mismo repo, SSR/SSG según ruta. | Servir la web y los `route.ts` bajo `/api`. |
| **React** | Librería UI por componentes y estado. | Pantallas, formularios, dashboard. |
| **Tailwind CSS** | Estilos utility-first (clases en JSX). | Diseño rápido y consistente. |
| **Radix UI** | Primitivos accesibles (diálogos, menús, select) sin estilos impuestos. | Base de componentes tipo shadcn. |
| **lucide-react** | Iconos SVG como componentes. | Iconografía en header, dashboard, etc. |
| **TypeScript** | JavaScript con tipos estáticos. | Mantenibilidad y menos errores en tiempo de compilación. |
| **pg** | Cliente oficial de PostgreSQL para Node. | Pool de conexiones y consultas SQL. |
| **jose** | Librería estándar para JWT (firmar/verificar). | Access y refresh tokens (HS256; opcional rotación). |
| **bcryptjs** | Hash de contraseñas resistente a fuerza bruta. | Almacenar credenciales sin texto plano. |
| **Zod** | Esquemas de validación en TypeScript. | Validar cuerpos de API y formularios donde se use. |
| **Leaflet + react-leaflet** | Mapas interactivos en el navegador. | Sitios, eventos y vistas con mapa. |
| **Swiper** | Carrusel táctil / responsive. | Galerías o listas deslizables en UI. |
| **Recharts** | Gráficos en React. | Visualizaciones en dashboard. |
| **jspdf** | Generación de PDF en el cliente. | Exportes o comprobantes desde el navegador. |
| **@aws-sdk/client-s3** | Cliente oficial API S3. | Subir/descargar objetos en S3 o R2 (misma API). |
| **nodemailer** | Envío de correo por SMTP desde Node. | Emails transaccionales (ver §6.3). |
| **@marsidev/react-turnstile** | Widget React de Cloudflare Turnstile. | Mostrar el desafío anti-bot en login. |
| **@upstash/redis** | Cliente HTTP hacia Redis serverless. | Revocación de tokens y rate limit opcional. |
| **Vitest** (dev) | Test runner rápido, compatible con Vite. | Pruebas unitarias/integración ligeras en CI. |

---

## 3. Estructura del repositorio (resumen)

```
time2go/
├── middleware.ts                 # Auth JWT para /api y control de rol en rutas UI
├── next.config.ts
├── package.json
├── .env.example                  # Plantilla de variables (no secretos reales)
├── src/
│   ├── app/                      # App Router: páginas (page.tsx) y API (api/**/route.ts)
│   ├── components/               # UI, header, formularios, dashboard, etc.
│   ├── hooks/                    # use-header-session, use-permissions, use-login-form, …
│   └── lib/                      # db, jwt, cookies, auth-request, document-storage, email, …
├── public/                       # Estáticos; public/docs/ para documentos servidos vía API admin
├── scripts SQL/                  # DDL, inserts, funciones, migraciones
└── docs/
    └── ARQUITECTURA-Y-OPERACION.md   # Este archivo
```

---

## 4. Cómo fluye una petición

### 4.1 Páginas (UI)

- **Middleware (Next.js):** **Qué es:** Código que se ejecuta **antes** de servir una ruta, en el **Edge** o Node según configuración; puede redirigir, reescribir o bloquear. **Rol en Time2Go:** En `middleware.ts` exige **JWT** en rutas de página sensibles (dashboard, perfil, crear evento, …) según **rol**, y aplica reglas distintas para **`/api/*`** (lista pública vs. token obligatorio).

1. El usuario carga una URL (p. ej. `/eventos`).
2. **Next.js** resuelve `src/app/eventos/page.tsx` (muchas rutas son `"use client"`).
3. El **Root layout** (`src/app/layout.tsx`) aplica fuentes Geist, tema inicial leyendo cookie `theme`, y envuelve la app en **`SecurityProvider`** (cliente) y **`DeferredGlobalUI`**. **`SecurityProvider`:** capa cliente descrita en §11.
4. Componentes como **`Header`** usan **`useHeaderSession`**: hidratan `localStorage`, llaman **`GET /api/me`** con cookies, y si hace falta **`POST /api/refresh`** antes de reintentar.
5. Las rutas protegidas por **middleware** (perfil, dashboard, crear evento, etc.) exigen cookie **`token`** con JWT válido para navegación directa; si falta o el rol no coincide, redirección a `/auth` o `/`.

### 4.2 API (`/api/*`)

- **`api-route-policy.ts`:** **Qué es:** Módulo centralizado con la lista de rutas **`/api`** que **no** requieren JWT en el middleware. **Rol en Time2Go:** Evitar duplicar lógica y documentar en código qué endpoints son anónimos (login, webhooks, catálogos, cron con su propio secreto, etc.).

1. Si la ruta empieza por `/api/`, el **middleware** comprueba si el método + pathname están en la lista pública (`src/lib/api-route-policy.ts`).
2. Algunas rutas son “públicas” solo en el sentido de que **no exigen JWT** en el middleware, pero el **handler** aplica su propia autenticación (p. ej. **`POST /api/cron/maintenance`**: exige **`CRON_SECRET`** vía `Authorization: Bearer …` o cabecera **`x-cron-secret`**).
3. Si no son públicas: extrae JWT de **`Authorization: Bearer …`** o cookie **`token`**, resuelve secreto con **`resolveJwtSecret()`**, verifica con **`verifyToken(..., "access")`**.
4. El **route handler** ejecuta lógica (SQL, S3, etc.) y suele responder JSON `{ ok, message, … }`.

---

## 5. Autenticación y manejo de credenciales (detalle)

- **JWT (JSON Web Token):** **Qué es:** Cadena firmada digitalmente que suele llevar **claims** (quién es el usuario, hasta cuándo vale, tipo de token). El servidor verifica la **firma** con un secreto compartido (HS256 en este proyecto) o con claves públicas/privadas si activas rotación. **Rol en Time2Go:** **Access** de corta duración para API y navegación; **refresh** en cookie HttpOnly para obtener nuevos access sin pedir contraseña en cada visita.

### 5.1 Tipos de credencial

| Credencial | Dónde vive | Quién la lee |
|------------|------------|--------------|
| **JWT access** | Cookie HttpOnly `token` + copia en **`localStorage`** (`token`) para `Authorization: Bearer` desde el cliente | Middleware (cookie o Bearer), `auth-request.ts`, hooks |
| **JWT refresh** | Cookie HttpOnly `refresh_token` (SameSite **strict**) | Solo servidor en `POST /api/refresh` |
| **Contraseña** | Hash **bcrypt** en `tabla_usuarios_credenciales` | `POST /api/login`, `POST /api/change-password` |
| **Google** | Token ID enviado al backend; validación con Google | `POST /api/login-google` |
| **Turnstile** | Token de un solo uso en el cuerpo del login | `POST /api/login` → `siteverify` Cloudflare |

### 5.2 Secreto JWT (servidor y Edge)

- **`resolveJwtSecret()`** (`src/lib/jwt-secret.ts`): usa **`BETTER_AUTH_SECRET`** si existe, si no **`JWT_SECRET`**. En **producción** falta de secreto → error al resolver. En desarrollo puede caer en `"dev-secret"` si no hay env (solo dev).
- El mismo módulo se importa desde **middleware (Edge)** y desde rutas Node: **no usa APIs solo-Node**, para poder compartir lógica.

### 5.3 Emisión de tokens en login

Tras validar credenciales (y Turnstile según modo), **`POST /api/login`** firma:

- Access y refresh con **`signToken`** (`src/lib/jwt.ts`), incluyendo `id_usuario`, `id_rol`, nombre, `token_type`.
- Devuelve cabeceras **`Set-Cookie`** serializadas con **`serializeCookie`** (`src/lib/cookies.ts`):  
  - **`HttpOnly`**, **`Secure`** si `NODE_ENV === "production"`**, **`SameSite`**: lax para `token`, strict para `refresh_token` (en refresh route).  
  - **`COOKIE_DOMAIN`** opcional para compartir cookies entre subdominios.

El cliente además guarda en **`localStorage`**: `token`, `userName`, `userRole`, `userPublicId`, **`accessExpiresAt`** (segundos unix) para programar refresh antes de expirar.

### 5.4 Renovación (`POST /api/refresh`)

- Exige cabecera **`Origin`** igual al origen de la URL de la petición (mitigación CSRF en refresh).
- Lee **`refresh_token`** de cookies parseadas.
- Verifica JWT tipo refresh; si lleva **`jti`**, puede **revocar** ese JTI en Redis (§6.4).
- Emite nuevos access + refresh y vuelve a fijar cookies.

### 5.5 Cierre de sesión (`POST /api/logout`)

- Limpia cookies `token` y `refresh_token` (max-age 0) con mismas opciones de dominio/secure.

### 5.6 Dos modos de lectura del JWT en API

- **`getRequesterIdLenient`**: si hay Bearer inválido, **sigue** intentando cookie (útil para ciertos clientes).
- **`getRequesterIdFromRequest` (strict)**: si hay Bearer y falla, **no** usa cookie (coherente con “el cliente mandó Bearer a propósito”).

### 5.7 Riesgo XSS y `localStorage`

El **`.env.example`** advierte: el access token también está en **`localStorage`**. Cualquier XSS puede leerlo. Mitigaciones recomendadas: **CSP**, sanitizar HTML, no insertar HTML crudo desde datos usuario. Las cookies HttpOnly **no** sustituyen por completo el riesgo mientras el front duplique el token en `localStorage` para Bearer.

---

## 6. Servicios externos e integraciones

En cada apartado, **Qué es** resume el producto o estándar; **Rol en Time2Go** indica cómo lo usa este repositorio. Los detalles de variables y rutas siguen en las viñetas.

### 6.1 PostgreSQL

- **Qué es:** Base de datos **relacional** de código abierto; datos en tablas con SQL, transacciones ACID y extensiones (p. ej. PostGIS en otros proyectos).
- **Rol en Time2Go:** Almacén principal de usuarios, eventos, reservas, denuncias, pagos asociados a rol, etc. El acceso es por SQL explícito (`pg`), no por ORM.

- **Variable principal:** `DATABASE_URL` (connection string).
- **Producción:** si falta `DATABASE_URL` y no está `SKIP_DATABASE_URL_CHECK=true`, el módulo `src/lib/db.ts` **lanza** al cargar (evita arrancar sin BD).
- **Pool:** `PGPOOL_MAX`, `PG_IDLE_TIMEOUT_MS`, `PG_CONNECTION_TIMEOUT_MS`.
- **SSL:** `DATABASE_SSL=true` o heurística por host (Neon, AWS, Azure, Supabase); `DATABASE_SSL_REJECT_UNAUTHORIZED`.

### 6.2 Almacenamiento de objetos (S3 / R2)

- **Qué es:** **S3** es el servicio de objetos de AWS (archivos en “buckets” con API HTTP). **R2** de Cloudflare ofrece **API compatible con S3**, pensado para costes de salida más bajos; sigue siendo “almacenamiento de archivos en la nube”.
- **Rol en Time2Go:** Guardar y referenciar **PDFs e imágenes** de eventos, documentos del flujo organizador/ePayco, etc., vía `document-storage.ts`.

- Implementado en **`src/lib/document-storage.ts`** con **AWS SDK v3** `S3Client`.
- **`DOCUMENT_STORAGE_PROVIDER`**: `r2` o `s3`.
- Requiere como mínimo: `DOCUMENTS_BUCKET_NAME`, `DOCUMENTS_ACCESS_KEY_ID`, `DOCUMENTS_SECRET_ACCESS_KEY`; opcionales `DOCUMENTS_REGION`, `DOCUMENTS_ENDPOINT`, `DOCUMENTS_PUBLIC_BASE_URL`, `DOCUMENTS_FORCE_PATH_STYLE`.
- Uso: imágenes y PDFs de eventos, documentos del flujo organizador/ePayco, etc. Claves tipo `Documents/YYYY/MM/event-…/timestamp-random-nombre.pdf`.

### 6.3 Correo electrónico (Nodemailer + SMTP)

- **Qué es:** **Nodemailer** es una librería Node que habla con un servidor de correo por **SMTP** (Gmail, Outlook, SendGrid, Mailgun, etc., según configures). No es un servicio en sí: el “envío real” lo hace tu proveedor SMTP.
- **Rol en Time2Go:** Enviar mensajes **transaccionales** (validación de cuenta, reset de contraseña, formulario de contacto al buzón del sistema, aprobación de evento, avisos de ban/reactivación).

- **`src/lib/email.ts`**: `createTransport` con `EMAIL_SERVICE` (default gmail), `EMAIL_USER`, `EMAIL_PASSWORD`.
- TLS: en no-producción puede relajar `rejectUnauthorized` para desarrollo.
- **Plantillas** (estilo unificado: banner Cloudinary, gradientes): validación de correo, restablecimiento de contraseña, mensajes de contacto al buzón del sistema, **notificación al organizador cuando su evento es aprobado** (`sendEventApprovedEmail`: nombre del evento + enlace a `/eventos/{id}`; se dispara desde **`PUT /api/events/[id]/toggle-status`** al pasar de no aprobado → aprobado), **notificación de ban** con **categoría** (`tabla_categoria_ban`) y **motivo** (`tabla_motivos_ban`) y fechas de inicio/fin del ban (`sendBanNotificationEmail` + `PUT /api/usuarios/[id]/ban`), y correo de **reactivación** tras desban/validación.
- Bases de URL para enlaces: **`NEXT_PUBLIC_APP_URL`**, **`APP_URL`**, **`BETTER_AUTH_URL`** (según función).
- **Cloudinary (solo en plantillas HTML):** **Qué es:** CDN y servicio de **imágenes** (alojamiento, transformaciones). **Rol en Time2Go:** URL fija del **banner** decorativo en correos; si deja de estar disponible o quieres independencia, sustituye la URL en `email.ts` por tu propio asset.
- **Nota:** cualquier imagen externa en un email depende de ese tercero solo para la carga visual del mensaje, no para la lógica de la app.

### 6.4 Upstash Redis

- **Qué es:** **Redis** es un almacén en memoria clave-valor, muy usado para caché y contadores. **Upstash** lo ofrece como **servicio serverless** con API **HTTP/REST** (sin mantener un servidor Redis tú mismo).
- **Rol en Time2Go:** Registrar **tokens JWT revocados** (por `jti`) hasta su expiración; el módulo `login-rate-limit.ts` define límites con **@upstash/ratelimit** para un posible uso distribuido (hoy el login también limita en memoria en Node).

- **`UPSTASH_REDIS_REST_URL`** y **`UPSTASH_REDIS_REST_TOKEN`**.
- **`ACTIVE_SESSION_HMAC_SECRET`**: secreto dedicado para firmar (HMAC SHA-256) la clave por usuario usada por control de sesión activa en Redis. Evita exponer `id_usuario` como parte de la key.
- **Revocación JWT:** `src/lib/token-revocation.ts` guarda claves `revoked:jti:{jti}` con TTL acotado al `exp` del token. Si no hay env, la revocación es **no-op** (no falla).
- **Control de sesión activa:** `src/lib/active-session.ts` usa una key versionada `active:session:user:v2:{hmac}`. Durante migración, si no existe la key v2 consulta una key legacy y la limpia al escribir nuevamente.
- **`src/lib/login-rate-limit.ts`**: define **Ratelimit** de Upstash (ventanas deslizantes por IP y por credencial). En el estado actual del repo, **`POST /api/login`** implementa además su **propio** rate limit en memoria en producción; el prelude `runLoginRateLimitPrelude` del módulo compartido puede quedar como extensión futura o integración pendiente — conviene unificar si quieres límites distribuidos solo vía Upstash.

### 6.5 ePayco (pagos Colombia)

- **Qué es:** **Pasarela de pagos** colombiana (PSE, tarjetas, billeteras, etc.) orientada a comercio electrónico; expone **checkout** embebido o redirección y **webhooks** para confirmar transacciones en el servidor.
- **Rol en Time2Go:** Cobrar el proceso de **upgrade a organizador**; el webhook `transaction.updated` actualiza tablas de cambio de rol cuando el pago es válido.

- **Checkout:** `EPAYCO_PUBLIC_KEY`; el monto se toma del plan elegido en `tabla_planes_organizador` (columna `precio_cop`). URL de retorno basada en `NEXT_PUBLIC_SITE_URL`.
- **Webhook:** `EPAYCO_P_CUST_ID_CLIENTE` para validar firma del evento de confirmación. Actualiza `tabla_cambio_rol_usuario` y, si aprobado, sube rol del usuario.

### 6.6 Google Sign-In

- **Qué es:** **Inicio de sesión con Google** vía **OAuth 2.0 / OpenID Connect**: el usuario autoriza en Google y la app recibe un **token de identidad** que el backend puede validar con las claves públicas de Google.
- **Rol en Time2Go:** Alternativa al registro/login con email y contraseña; reduce fricción y delega verificación de correo a Google.

- Cliente: **`NEXT_PUBLIC_GOOGLE_CLIENT_ID`** (usado en `google-login-button.tsx`).
- Servidor: **`login-google`** puede leer también `GOOGLE_CLIENT_ID` según código del route.

### 6.7 Cloudflare Turnstile

- **Qué es:** Servicio de **Cloudflare** similar a un CAPTCHA moderno: distingue **tráfico automatizado** de humanos con un widget ligero o flujos invisibles, sin ser el dueño de la cuenta de correo.
- **Rol en Time2Go:** Mitigar **abuso del endpoint de login** (fuerza bruta, bots); el token se verifica en servidor contra la API `siteverify` de Cloudflare.

- Cliente: **`NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`**, **`NEXT_PUBLIC_TURNSTILE_STRICT_MODE`** (`use-login-form.ts`).
- Servidor: **`CLOUDFLARE_TURNSTILE_SECRET`**, verificación contra `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- Modo: **`CLOUDFLARE_TURNSTILE_MODE`**: `strict` | `degraded` | `disabled`.

### 6.8 URLs públicas de la app (variables de entorno)

- **Qué son:** No son un “servicio” aparte: son **cadenas configurables** que representan el **origen HTTPS** (o `http://localhost:3000` en desarrollo) desde el que los usuarios acceden a la app.
- **Rol en Time2Go:** Construir **enlaces absolutos** en correos, redirecciones tras pagos ePayco, y cualquier URL que deba apuntar al front desplegado. `NEXT_PUBLIC_*` se inyecta en el bundle del cliente; las demás suelen ser solo servidor.

- **`NEXT_PUBLIC_SITE_URL`**, **`NEXT_PUBLIC_APP_URL`**, **`APP_URL`**: bases para enlaces en emails, redirects ePayco, etc. (usos dispersos; revisar cada handler).

### 6.9 Tareas programadas (mantenimiento)

- **Qué es (cron / scheduler):** Patrón general de **ejecución periódica** (cada día, hora, etc.) sin intervención humana. En servidores Linux clásicos existe el demonio **cron**; en la nube equivalen **GitHub Actions `schedule`**, **cron de Vercel**, **Cloud Scheduler**, etc.
- **Rol en Time2Go:** **Next.js no trae planificador interno**. La app expone **`POST /api/cron/maintenance`**; un **proceso externo** debe llamarla con **`CRON_SECRET`**. El handler concentra archivo de eventos, limpieza de tokens y un ping de salud a la BD.

- **GitHub Actions (workflow de mantenimiento):** **Qué es:** CI/CD de GitHub que puede ejecutar jobs en **push**, **PR** o **calendario** (`schedule`). **Rol en Time2Go:** **`.github/workflows/cron-maintenance.yml`** puede disparar un `curl` diario al endpoint de producción si configuras secretos **`CRON_SECRET`** y **`MAINTENANCE_URL`** (opcional; puedes usar solo el cron de tu hosting).

- **Endpoint:** **`POST /api/cron/maintenance`** (`src/app/api/cron/maintenance/route.ts`).
- **Middleware:** la ruta está en la lista pública de **`api-route-policy.ts`** para **POST** (no usa JWT); la **autorización real** es el secreto compartido.
- **Secreto:** variable **`CRON_SECRET`**. Cabeceras aceptadas: **`Authorization: Bearer <CRON_SECRET>`** o **`x-cron-secret: <CRON_SECRET>`**. Si no está definido `CRON_SECRET`, la ruta responde **503**.
- **Qué hace** (respuesta JSON con tiempos por paso): comprobación **`SELECT 1`** (salud BD), **archivo de eventos pasados** (`UPDATE tabla_eventos SET proceso = TRUE` donde el evento está aprobado, `proceso` aún falso y **`fecha_fin < CURRENT_DATE`**), borrado de filas caducadas en **`tabla_validacion_email_tokens`**, borrado en **`tabla_recuperacion_contrasena_tokens`** (expirados y registros `Caducado` muy antiguos).
- **Listado público de eventos:** la función **`app_api.fn_eventos_listar_json`** (script en `scripts SQL/funciones/fn_eventos_listar_json.sql`) filtra el catálogo anónimo con **`estado = TRUE` y `proceso = FALSE`**, de modo que los eventos marcados como archivados dejen de aparecer en el listado normal tras el cron. Tras desplegar código nuevo, **vuelve a aplicar** el `CREATE OR REPLACE` de esa función en PostgreSQL.
- El workflow **`.github/workflows/cron-maintenance.yml`** usa además **`schedule`** diario y **`workflow_dispatch`**; si faltan los secretos del repo, el job **no falla**: avisa y termina (ver bullet de GitHub Actions arriba).

### 6.10 Reportes (denuncias) de eventos

- **Qué es:** Flujo de **moderación comunitaria**: un usuario autenticado puede **señalar** un evento con un **motivo del catálogo** y texto opcional; el staff revisa en dashboard.
- **Rol en Time2Go:** Cumplir expectativas de confianza y términos (contenido inapropiado, fraude, etc.), con cola para moderadores/admins y **alertas por volumen** de reportes por evento.

- **Catálogo de motivos (lectura pública):** **`GET /api/denuncias-eventos/catalogo`**.
- **Usuario autenticado:** **`POST /api/events/[id]/denuncia`** (crear reporte; **`GET`** en la misma ruta para saber si el usuario ya reportó ese evento).
- **Moderación (roles 3 y 4):**
  - **`GET /api/dashboard/denuncias-eventos`** — lista paginada con filtros por estado de la denuncia.
  - **`PATCH /api/dashboard/denuncias-eventos/[id]`** — cambiar estado (`pendiente`, `revisando`, `resuelta`, `desestimada`).
  - **`GET /api/dashboard/denuncias-eventos/alertas?minCount=&days=`** — eventos con **≥ N reportes en los últimos X días** (priorización). Valores por defecto configurables con **`DENUNCIAS_ALERTA_MIN`** y **`DENUNCIAS_ALERTA_DIAS`** (si no existen, 3 y 30).
- **UI:** **`/dashboard/denuncias-eventos`** — tabla de cola + panel de alertas por umbral.

### 6.11 Cabeceras de seguridad y CSP (`next.config.ts`)

- **Qué es:** Las respuestas HTTP pueden llevar **cabeceras** que instruyen al navegador (no abrir en iframe ajeno, no adivinar MIME, etc.). **CSP** (*Content Security Policy*) es una cabecera que **limita de dónde puede cargar scripts, estilos, imágenes y conexiones** la página, reduciendo impacto de XSS y recursos no deseados.
- **Rol en Time2Go:** `next.config.ts` añade CSP **orientativa** (incluye dominios usados por Turnstile, Google OAuth, mapas/tiles, ePayco) más cabeceras como `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` y `Permissions-Policy`. Conviene **ajustar la CSP** si añades nuevos orígenes o quieres endurecerla (p. ej. sustituir `https:` amplios por hosts concretos).

### 6.12 Imágenes remotas (`next.config.ts` → `images.remotePatterns`)

- **Qué es:** Next puede optimizar imágenes con el componente `<Image />`; para URLs **externas** hay que declarar **patrones permitidos** (`remotePatterns`) por seguridad.
- **Rol en Time2Go:** Permitir portadas alojadas en **S3, R2, Cloudinary**, etc., además de localhost en desarrollo. Sigue activo **`images.unoptimized: true`**, típico cuando el despliegue no usa el optimizador de imágenes del servidor de Next.

---

## 7. Rate limiting del login

- **Qué es:** **Rate limiting** acota **cuántas peticiones** puede hacer un cliente (por IP, por cuenta, etc.) en una ventana de tiempo, para frenar abuso y ataques de fuerza bruta.
- **Rol en Time2Go:** En **`NODE_ENV === production`**, `POST /api/login` usa **mapas en memoria** por instancia (IP y par IP+email), ventanas de 15 minutos, bloqueos progresivos y respuestas **429** con `Retry-After`.
- Si en el futuro se conecta **`runLoginRateLimitPrelude`** desde `login-rate-limit.ts` y hay Upstash, los límites pueden volverse **distribuidos** entre réplicas (límites ejemplo en ese archivo: ~70/IP/15m y ~8 credenciales/15m en Upstash).

---

## 8. Roles y permisos

- **Qué es:** Un **rol** agrupa capacidades (quién puede crear eventos, entrar al dashboard, etc.). Aquí se codifica como **número** en JWT y en BD; los **permisos finos** pueden depender además de tablas de accesibilidad.
- **Rol en Time2Go:** El **middleware** bloquea rutas de UI por rol; las **API** deben seguir validando para evitar IDOR.

- **Roles numéricos:** 1 Usuario, 2 Organizador, 3 Moderador, 4 Administrador (`middleware.ts`).
- **Permisos de menú/acción:** tabla `tabla_accesibilidad_menu_x_rol`; IDs en `src/lib/permissions.ts` (`CREAR_EVENTOS`, `VER_DASHBOARD`, etc.).
- El **middleware** protege rutas de página por **rol**.
- Las **API** y el **header** usan **`/api/permissions/check`** para mostrar “Crear evento” o “Dashboard” solo si la matriz BD lo permite.

---

## 9. Lista consolidada de variables de entorno

> No copies secretos reales al repo. Usa `.env` / `.env.local` en gitignore.

**Críticas en producción típica**

| Variable | Propósito |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL |
| `JWT_SECRET` o `BETTER_AUTH_SECRET` | Firma JWT (el primero en `jwt-secret` es `BETTER_AUTH_SECRET` si ambos existen) |

**Opcionales pero necesarias según feature**

| Variable | Propósito |
|----------|-----------|
| `SKIP_DATABASE_URL_CHECK` | `true` solo en CI/build sin BD real |
| `JWT_KEYS`, `JWT_ACTIVE_KID`, `JWT_ISSUER`, `JWT_AUDIENCE` | Rotación / claims JWT |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Revocación JTI; control de sesión activa; rate limit Upstash en módulo dedicado |
| `ACTIVE_SESSION_HMAC_SECRET` | Firma HMAC SHA-256 para ofuscar la identidad interna en keys de sesión activa en Redis |
| `COOKIE_DOMAIN` | Cookies en subdominio |
| `EMAIL_*` | Envío de correos |
| `DOCUMENTS_*`, `DOCUMENT_STORAGE_PROVIDER` | R2/S3 |
| `EPAYCO_*`, `NEXT_PUBLIC_SITE_URL` | Pagos |
| (sin variable de precio en .env) | El precio de membresia se obtiene desde `tabla_planes_organizador.precio_cop` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_ID` | OAuth Google |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`, `CLOUDFLARE_TURNSTILE_SECRET`, `CLOUDFLARE_TURNSTILE_MODE` | CAPTCHA login |
| `CRON_SECRET` | Autoriza `POST /api/cron/maintenance` (obligatorio en producción si usas el job) |
| `DENUNCIAS_ALERTA_MIN`, `DENUNCIAS_ALERTA_DIAS` | Umbrales por defecto para `/api/dashboard/denuncias-eventos/alertas` |

**Secretos de GitHub Actions** (opcional, para el workflow de mantenimiento): `CRON_SECRET`, `MAINTENANCE_URL` (ver §6.9).

Ver siempre **`.env.example`** en la raíz para la lista mantenida por el equipo.

---

## 10. Base de datos y SQL

- Esquema principal: **`scripts SQL/DDL Time2Go.SQL`**.
- Datos semilla / ejemplos: **`scripts SQL/insert/`** (incluye catálogos de denuncias de eventos donde aplique).
- Funciones almacenadas: **`scripts SQL/funciones/`** (eventos, usuarios, valoraciones, etc.). La lista pública de eventos pasa por **`fn_eventos_listar_json`**, que excluye filas con **`proceso = TRUE`** cuando no es “solo míos” ni “incluir todos” (ver §6.9).
- Migraciones puntuales: p. ej. **`scripts SQL/migrations/`** (renombres de rol, ajustes de denuncias, etc.).

El código TypeScript **no** usa ORM; ejecuta SQL con **`pg`** y, en algunos flujos, llama a funciones SQL por nombre.

**Columna `proceso` en `tabla_eventos`:** en el DDL figura como **`Proceso`**; en PostgreSQL el identificador sin comillas queda en minúsculas (**`proceso`**). El cron y el código usan ese nombre coherente con el catálogo estándar de PostgreSQL.

---

## 11. Seguridad en el cliente adicional

- **`SecurityProvider`** (`src/components/shared/SecurityProvider.tsx`)
  - **Qué es:** Componente React de **envoltura** que en el navegador intenta inferir si se abrieron **herramientas de desarrollo** (p. ej. por tamaño atípico de la ventana) y muestra una pantalla de bloqueo.
  - **Rol en Time2Go:** Capa **opcional y discutible** de “anti-inspección”; **no** es seguridad real (un atacante puede saltársela). Puede molestar a usuarios con ventanas docked o monitores raros.

---

## 12. Documentación interna en la app

- **Qué es:** Módulo de **documentos internos** (PDF u otros) servidos por la propia app solo a perfiles autorizados.
- **Rol en Time2Go:** Ruta **`/docs`** (UI) para **administradores**; el cliente comprueba rol vía **`/api/me`**. Los archivos están en **`public/docs/`** y se listan/sirven con **`/api/docs/files`** y **`/api/docs/serve`**.

---

## 13. Operación y despliegue

1. Configurar variables de entorno en el hosting (Node).
2. Ejecutar migraciones / DDL / funciones en PostgreSQL según entorno.
3. `npm ci` → `npm run build` → `npm run start`.
4. Aplicar en PostgreSQL la versión actual de **`fn_eventos_listar_json`** (y el resto de funciones/migraciones pendientes) para alinear listados y archivo de eventos.
5. Definir **`CRON_SECRET`** y programar llamadas a **`POST /api/cron/maintenance`** (cron del hosting, GitHub Actions u otro scheduler), o ejecutarlo manualmente tras despliegues si aplica.
6. Tras proxy inverso, configurar cabeceras **`X-Forwarded-For` / `X-Real-IP`** si quieres rate limit por IP fiable.
7. Asegurar **HTTPS** en producción para `Secure` en cookies y para validación de firmas en ePayco/webhooks.

---

## 14. Dónde profundizar en código

| Tema | Archivos |
|------|----------|
| Política API pública | `src/lib/api-route-policy.ts` |
| Middleware | `middleware.ts` |
| JWT | `src/lib/jwt.ts`, `src/lib/jwt-secret.ts` |
| Sesión header / refresh | `src/hooks/use-header-session.ts` |
| Login + cookies + Turnstile | `src/app/api/login/route.ts` |
| Refresh + cookies | `src/app/api/refresh/route.ts` |
| Pool BD | `src/lib/db.ts` |
| Archivos | `src/lib/document-storage.ts` |
| Email | `src/lib/email.ts` |
| Webhook ePayco | `src/app/api/epayco/webhook/route.ts` |
| Aprobar / rechazar evento (correo al organizador si pasa a aprobado) | `src/app/api/events/[id]/toggle-status/route.ts` |
| Ban usuario (correo categoría + motivo) | `src/app/api/usuarios/[id]/ban/route.ts` |
| Cron mantenimiento | `src/app/api/cron/maintenance/route.ts` |
| Denuncias eventos (dashboard + alertas) | `src/app/api/dashboard/denuncias-eventos/route.ts`, `…/alertas/route.ts`, `…/[id]/route.ts` |
| Denuncia desde ficha de evento | `src/app/api/events/[id]/denuncia/route.ts` |
| Listado SQL eventos | `scripts SQL/funciones/fn_eventos_listar_json.sql` |

---

*Este documento describe el comportamiento observado en el código. Si cambias rutas, env o flujos, actualiza este archivo para que siga siendo la referencia única del equipo.*
