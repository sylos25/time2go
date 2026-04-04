# Time2Go — Arquitectura, funcionamiento y operación

Documento técnico del repositorio: qué es el proyecto, cómo está montado, qué servicios usa y cómo se manejan credenciales y secretos. Última revisión alineada con el código del monorepo Next.js (App Router).

---

## 1. Qué es Time2Go

**Time2Go** es una aplicación web para **descubrir y gestionar eventos** (culturales, deportivos, etc.). Combina:

- Un **frontend** React (páginas y componentes cliente) con Tailwind y componentes tipo shadcn (Radix).
- Un **backend** embebido en la misma app mediante **Route Handlers** bajo `src/app/api/*`.
- Una base de datos **PostgreSQL** con esquema y scripts SQL versionados en `scripts SQL/`.
- Integraciones opcionadas por variables de entorno: **almacenamiento S3-compatible** (p. ej. Cloudflare R2), **correo** (Nodemailer), **pagos Wompi**, **Google Sign-In**, **Cloudflare Turnstile**, **Upstash Redis** (revocación JWT y módulo de rate limit preparado).

El despliegue previsto es **`next build` + `next start`** (Node). La configuración de Next incluye `images.unoptimized: true` (útil si no usas el optimizador de imágenes del servidor de Next).

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

1. El usuario carga una URL (p. ej. `/eventos`).
2. **Next.js** resuelve `src/app/eventos/page.tsx` (muchas rutas son `"use client"`).
3. El **Root layout** (`src/app/layout.tsx`) aplica fuentes Geist, tema inicial leyendo cookie `theme`, y envuelve la app en **`SecurityProvider`** (cliente) y **`DeferredGlobalUI`**.
4. Componentes como **`Header`** usan **`useHeaderSession`**: hidratan `localStorage`, llaman **`GET /api/me`** con cookies, y si hace falta **`POST /api/refresh`** antes de reintentar.
5. Las rutas protegidas por **middleware** (perfil, dashboard, crear evento, etc.) exigen cookie **`token`** con JWT válido para navegación directa; si falta o el rol no coincide, redirección a `/auth` o `/`.

### 4.2 API (`/api/*`)

1. Si la ruta empieza por `/api/`, el **middleware** comprueba si el método + pathname están en la lista pública (`src/lib/api-route-policy.ts`).
2. Si no son públicas: extrae JWT de **`Authorization: Bearer …`** o cookie **`token`**, resuelve secreto con **`resolveJwtSecret()`**, verifica con **`verifyToken(..., "access")`**.
3. El **route handler** ejecuta lógica (SQL, S3, etc.) y suele responder JSON `{ ok, message, … }`.

---

## 5. Autenticación y manejo de credenciales (detalle)

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

### 6.1 PostgreSQL

- **Variable principal:** `DATABASE_URL` (connection string).
- **Producción:** si falta `DATABASE_URL` y no está `SKIP_DATABASE_URL_CHECK=true`, el módulo `src/lib/db.ts` **lanza** al cargar (evita arrancar sin BD).
- **Pool:** `PGPOOL_MAX`, `PG_IDLE_TIMEOUT_MS`, `PG_CONNECTION_TIMEOUT_MS`.
- **SSL:** `DATABASE_SSL=true` o heurística por host (Neon, AWS, Azure, Supabase); `DATABASE_SSL_REJECT_UNAUTHORIZED`.

### 6.2 Almacenamiento de objetos (S3 / R2)

- Implementado en **`src/lib/document-storage.ts`** con **AWS SDK v3** `S3Client`.
- **`DOCUMENT_STORAGE_PROVIDER`**: `r2` o `s3`.
- Requiere como mínimo: `DOCUMENTS_BUCKET_NAME`, `DOCUMENTS_ACCESS_KEY_ID`, `DOCUMENTS_SECRET_ACCESS_KEY`; opcionales `DOCUMENTS_REGION`, `DOCUMENTS_ENDPOINT`, `DOCUMENTS_PUBLIC_BASE_URL`, `DOCUMENTS_FORCE_PATH_STYLE`.
- Uso: imágenes y PDFs de eventos, documentos del flujo organizador/Wompi, etc. Claves tipo `Documents/YYYY/MM/event-…/timestamp-random-nombre.pdf`.

### 6.3 Correo electrónico (Nodemailer)

- **`src/lib/email.ts`**: `createTransport` con `EMAIL_SERVICE` (default gmail), `EMAIL_USER`, `EMAIL_PASSWORD`.
- TLS: en no-producción puede relajar `rejectUnauthorized` para desarrollo.
- Funciones: validación de correo, reset password, notificaciones de ban, etc.
- **Nota:** plantillas HTML pueden referenciar URLs externas (p. ej. imagen de banner en Cloudinary en algún template); es dependencia de terceros solo para ese asset, no del core de la app.

### 6.4 Upstash Redis

- **`UPSTASH_REDIS_REST_URL`** y **`UPSTASH_REDIS_REST_TOKEN`**.
- **Revocación JWT:** `src/lib/token-revocation.ts` guarda claves `revoked:jti:{jti}` con TTL acotado al `exp` del token. Si no hay env, la revocación es **no-op** (no falla).
- **`src/lib/login-rate-limit.ts`**: define **Ratelimit** de Upstash (ventanas deslizantes por IP y por credencial). En el estado actual del repo, **`POST /api/login`** implementa además su **propio** rate limit en memoria en producción; el prelude `runLoginRateLimitPrelude` del módulo compartido puede quedar como extensión futura o integración pendiente — conviene unificar si quieres límites distribuidos solo vía Upstash.

### 6.5 Wompi (pagos Colombia)

- **Checkout:** `WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`, monto `ORGANIZADOR_ROLE_WOMPI_AMOUNT_COP` (compat: `PROMOTOR_ROLE_WOMPI_AMOUNT_COP`). URL de retorno basada en `NEXT_PUBLIC_SITE_URL`.
- **Webhook:** `WOMPI_EVENTS_SECRET` para validar firma del evento; en producción sin secreto las verificaciones fallan. Evento manejado: `transaction.updated`; actualiza `tabla_cambio_rol_usuario` y, si aprobado, sube rol del usuario.

### 6.6 Google Sign-In

- Cliente: **`NEXT_PUBLIC_GOOGLE_CLIENT_ID`** (usado en `google-login-button.tsx`).
- Servidor: **`login-google`** puede leer también `GOOGLE_CLIENT_ID` según código del route.

### 6.7 Cloudflare Turnstile

- Cliente: **`NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`**, **`NEXT_PUBLIC_TURNSTILE_STRICT_MODE`** (`use-login-form.ts`).
- Servidor: **`CLOUDFLARE_TURNSTILE_SECRET`**, verificación contra `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- Modo: **`CLOUDFLARE_TURNSTILE_MODE`**: `strict` | `degraded` | `disabled`.

### 6.8 URLs públicas de la app

- **`NEXT_PUBLIC_SITE_URL`**, **`NEXT_PUBLIC_APP_URL`**, **`APP_URL`**: bases para enlaces en emails, redirects Wompi, etc. (usos dispersos; revisar cada handler).

---

## 7. Rate limiting del login

- En **`NODE_ENV === production`**, `POST /api/login` aplica límites con **mapas en memoria** por instancia (IP y par IP+email), ventanas de 15 minutos, bloqueos progresivos y respuestas **429** con `Retry-After`.
- Si en el futuro se conecta **`runLoginRateLimitPrelude`** desde `login-rate-limit.ts` y hay Upstash, los límites pueden volverse **distribuidos** entre réplicas (límites ejemplo en ese archivo: ~70/IP/15m y ~8 credenciales/15m en Upstash).

---

## 8. Roles y permisos

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
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Revocación JTI; rate limit Upstash en módulo dedicado |
| `COOKIE_DOMAIN` | Cookies en subdominio |
| `EMAIL_*` | Envío de correos |
| `DOCUMENTS_*`, `DOCUMENT_STORAGE_PROVIDER` | R2/S3 |
| `WOMPI_*`, `NEXT_PUBLIC_SITE_URL` | Pagos |
| `NEXT_PUBLIC_ORGANIZADOR_PRICE_COP` | Precio mostrado en UI perfil (compat `NEXT_PUBLIC_PROMOTOR_PRICE_COP`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_ID` | OAuth Google |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`, `CLOUDFLARE_TURNSTILE_SECRET`, `CLOUDFLARE_TURNSTILE_MODE` | CAPTCHA login |

Ver siempre **`.env.example`** en la raíz para la lista mantenida por el equipo.

---

## 10. Base de datos y SQL

- Esquema principal: **`scripts SQL/DDL Time2Go.SQL`**.
- Datos semilla / ejemplos: **`scripts SQL/insert/`**.
- Funciones almacenadas: **`scripts SQL/funciones/`** (eventos, usuarios, valoraciones, etc.).
- Migraciones puntuales: p. ej. **`scripts SQL/migrations/`** (renombres de rol, etc.).

El código TypeScript **no** usa ORM; ejecuta SQL con **`pg`** y, en algunos flujos, llama a funciones SQL por nombre.

---

## 11. Seguridad en el cliente adicional

- **`SecurityProvider`** (`src/components/shared/SecurityProvider.tsx`): capa cliente que intenta **detectar herramientas de desarrollo** (dimensiones ventana) y mostrar pantalla de “acceso restringido”. Es una medida **débil** frente a atacantes (no sustituye seguridad servidor); puede afectar a usuarios con layouts extraños.

---

## 12. Documentación interna en la app

- Ruta **`/docs`** (UI): pensada para **administradores**; el guard del cliente valida rol vía **`/api/me`**. Los archivos viven en **`public/docs/`** y se listan/sirven con **`/api/docs/files`** y **`/api/docs/serve`**.

---

## 13. Operación y despliegue

1. Configurar variables de entorno en el hosting (Node).
2. Ejecutar migraciones / DDL / funciones en PostgreSQL según entorno.
3. `npm ci` → `npm run build` → `npm run start`.
4. Tras proxy inverso, configurar cabeceras **`X-Forwarded-For` / `X-Real-IP`** si quieres rate limit por IP fiable.
5. Asegurar **HTTPS** en producción para `Secure` en cookies y para integridad Wompi/webhooks.

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
| Webhook Wompi | `src/app/api/wompi/webhook/route.ts` |

---

*Este documento describe el comportamiento observado en el código. Si cambias rutas, env o flujos, actualiza este archivo para que siga siendo la referencia única del equipo.*
