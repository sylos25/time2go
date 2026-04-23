# Documentación Técnica Completa — Time2Go

> Última actualización: Abril 2026 (alineada a código actual)

---

## 1) Resumen ejecutivo

Time2Go es una aplicación web full-stack en `Next.js` para descubrir eventos, reservar, moderar contenido y gestionar roles (usuario, organizador, moderador, admin).

El proyecto integra:

- `PostgreSQL` como fuente de verdad.
- `JWT` con cookies `HttpOnly` + refresh token.
- `Upstash Redis` para revocación de JWT y control de sesión activa.
- `ePayco` para pagos de upgrade a organizador (checkout + webhook).
- `S3/R2` para archivos.

---

## 2) Stack actual

- `Next.js 16` + `React 19` + `TypeScript`.
- UI con `Tailwind CSS 4` + componentes basados en Radix.
- API en `src/app/api/**/route.ts`.
- DB por `pg` (SQL nativo, sin ORM).
- Seguridad: `jose`, `bcryptjs`, `Cloudflare Turnstile`.

Referencia viva del stack y operación: `docs/ARQUITECTURA-Y-OPERACION.md`.

---

## 3) Estructura clave del repo

```text
time2go/
├── middleware.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── epayco/webhook/
│   │   │   ├── refresh/
│   │   │   ├── login/
│   │   │   ├── docs/files/
│   │   │   └── docs/serve/
│   │   ├── docs/               # Página interna de documentación (solo admin)
│   │   └── perfil/pagar/       # Página intermedia para checkout ePayco
│   ├── hooks/
│   └── lib/
│       ├── jwt.ts
│       ├── auth-session*.ts
│       ├── active-session.ts
│       ├── token-revocation.ts
│       └── api-route-policy.ts
├── scripts SQL/
└── docs/
```

---

## 4) Autenticación y sesión (estado real)

### 4.1 Flujo

1. `POST /api/login` valida credenciales + Turnstile.
2. Emite par de tokens (`access` + `refresh`) y fija cookies `HttpOnly`.
3. `POST /api/refresh` rota refresh, revoca `jti` anterior y renueva cookies.
4. `POST /api/logout` invalida sesión y limpia cookies.

### 4.2 Redis y seguridad de sesión activa (cambio reciente)

En `src/lib/active-session.ts`:

- Se usa key versionada: `active:session:user:v2:{hmac}`.
- El identificador de usuario ya no se persiste “en claro” en la key.
- Se requiere `ACTIVE_SESSION_HMAC_SECRET` (con fallback solo en desarrollo).
- Hay compatibilidad temporal con key legacy durante migración.

En `src/lib/token-revocation.ts`:

- Revocación por `jti` con TTL hasta expiración: `revoked:jti:{jti}`.

---

## 5) ePayco (pagos de organizador)

### 5.1 Inicio de pago

- `POST /api/organizador-document`:
  - Toma plan desde `tabla_planes_organizador`.
  - Crea/actualiza registros de suscripción/cambio de rol.
  - Devuelve `checkout_url` hacia `src/app/perfil/pagar/page.tsx`.

### 5.2 Checkout cliente

- `src/app/perfil/pagar/page.tsx` carga `https://checkout.epayco.co/checkout.js`.
- Configura `ref`, monto, plan y URLs de retorno/confirmación.

### 5.3 Confirmación servidor

- `POST /api/epayco/webhook`:
  - Valida firma con `EPAYCO_P_CUST_ID_CLIENTE`.
  - Traduce estado de pasarela a estado interno.
  - Actualiza suscripciones y rol del usuario según resultado.

---

## 6) Rutas públicas API (middleware)

La política central está en `src/lib/api-route-policy.ts` (sincronizar con este listado y con `npm run validate:docs` en CI).

**GET públicos (catálogos y lectura):** `/api/categoria_boleto`, `/api/categoria_evento`, `/api/denuncias-eventos/catalogo`, `/api/departamentos`, `/api/home-config`, `/api/llamar_pais`, `/api/llamar_sitio`, `/api/municipios`, `/api/tipo-sitios`, `/api/tipo_evento`, `/api/validate-email`, `GET /api/events`, `GET /api/events/image`, `GET /api/reset-password`.

**POST públicos (flujo de auth y utilidades):** `/api/auth`, `/api/contact`, `/api/login`, `/api/login-google`, `/api/logout`, `/api/refresh`, `/api/send-validation-email`, `/api/usuario_formulario`, `/api/epayco/webhook`, `/api/cron/maintenance`. HEAD/GET en auth: `/api/auth`, `/api/login`, `/api/logout`.

**Recuperación de contraseña:** `GET/POST/PUT /api/reset-password`.

**Rutas dinámicas públicas (solo GET/HEAD, según policy):** `GET /api/organizador/{id}`, `GET /api/events/{id}` (el segmento no puede ser `image` ni `document` para el detalle), `GET /api/events/{id}/valoraciones`.

---

## 7) Variables de entorno relevantes (actualizadas)

### Core

- `DATABASE_URL`
- `JWT_SECRET` o `BETTER_AUTH_SECRET`

### Redis / sesión

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ACTIVE_SESSION_HMAC_SECRET`

### ePayco

- `EPAYCO_PUBLIC_KEY`
- `EPAYCO_TEST_MODE`
- `EPAYCO_P_CUST_ID_CLIENTE`
- `EPAYCO_RESPONSE_URL` (opcional)
- `EPAYCO_CONFIRMATION_URL` (opcional)

### Otros

- `EMAIL_*`
- `DOCUMENTS_*` + `DOCUMENT_STORAGE_PROVIDER`
- `CLOUDFLARE_TURNSTILE_*`
- `CRON_SECRET`

Plantilla real: `.env.example`.

<!-- env-inventory: ACTIVE_SESSION_HMAC_SECRET,APP_URL,BETTER_AUTH_SECRET,CLOUDFLARE_TURNSTILE_MODE,CLOUDFLARE_TURNSTILE_SECRET,COOKIE_DOMAIN,CRON_SECRET,DATABASE_SSL,DATABASE_SSL_REJECT_UNAUTHORIZED,DATABASE_URL,DENUNCIAS_ALERTA_DIAS,DENUNCIAS_ALERTA_MIN,DOCUMENTS_ACCESS_KEY_ID,DOCUMENTS_BUCKET_NAME,DOCUMENTS_ENDPOINT,DOCUMENTS_FORCE_PATH_STYLE,DOCUMENTS_PUBLIC_BASE_URL,DOCUMENTS_REGION,DOCUMENTS_SECRET_ACCESS_KEY,DOCUMENT_STORAGE_PROVIDER,EMAIL_PASSWORD,EMAIL_SERVICE,EMAIL_USER,EPAYCO_CONFIRMATION_URL,EPAYCO_P_CUST_ID_CLIENTE,EPAYCO_PUBLIC_KEY,EPAYCO_RESPONSE_URL,EPAYCO_TEST_MODE,GOOGLE_CLIENT_ID,JWT_ACTIVE_KID,JWT_AUDIENCE,JWT_ISSUER,JWT_KEYS,JWT_SECRET,NEXT_PUBLIC_APP_URL,NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,NEXT_PUBLIC_GOOGLE_CLIENT_ID,NEXT_PUBLIC_SITE_URL,NEXT_PUBLIC_TURNSTILE_STRICT_MODE,PGPOOL_MAX,PG_CONNECTION_TIMEOUT_MS,PG_IDLE_TIMEOUT_MS,SKIP_DATABASE_URL_CHECK,UPSTASH_REDIS_REST_TOKEN,UPSTASH_REDIS_REST_URL,WOMPI_EVENTS_SECRET,WOMPI_INTEGRITY_SECRET,WOMPI_PUBLIC_KEY -->

---

## 8) Página `/docs` interna

- UI: `src/app/docs/page.tsx`
- Acceso: solo admin (validación con `/api/me` + middleware).
- Lista archivos desde `public/docs/` por `/api/docs/files`.
- Sirve/descarga por `/api/docs/serve`.

---

## 9) Notas de mantenimiento

- Si cambias auth, pagos, Redis o rutas públicas API, actualiza:
  - `docs/ARQUITECTURA-Y-OPERACION.md`
  - `docs/DOCUMENTACION-TECNICA-COMPLETA.md`
  - `src/app/docs/page.tsx` (si aplica al contenido visible en `/docs`)
  - `.env.example` (si hay nuevas variables)

---

Este documento es una guía técnica extensa pero resumida.  
La referencia principal y operativa del proyecto sigue siendo `docs/ARQUITECTURA-Y-OPERACION.md`.
