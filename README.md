# Time2Go

Plataforma web para **descubrir y gestionar eventos** (culturales, deportivos y entretenimiento). Stack monolítico **Next.js** (App Router): interfaz en React y API en los mismos route handlers, con **PostgreSQL** como fuente de verdad.

---

## Documentación técnica

La referencia principal de **arquitectura, flujos, integraciones, variables de entorno y manejo de credenciales** está aquí:

**[→ `docs/ARQUITECTURA-Y-OPERACION.md`](./docs/ARQUITECTURA-Y-OPERACION.md)** · [Índice `docs/`](./docs/README.md)

Puedes añadir más guías (email, R2, reset password, etc.) bajo la carpeta `docs/` y enlazarlas desde este README.

---

## Requisitos

- **Node.js** compatible con Next.js 16 (ver `package.json`)
- **PostgreSQL** (cadena en `DATABASE_URL`)
- Opcional según funcionalidades: cuenta **S3/R2**, **ePayco**, **Google OAuth**, **Cloudflare Turnstile**, **Upstash Redis**, credenciales **SMTP**

---

## Puesta en marcha

1. Clona el repositorio e instala dependencias:

   ```bash
   npm install
   ```

2. Copia la plantilla de entorno y complétala:

   ```bash
   cp .env.example .env.local
   ```

   En **PowerShell** (Windows): `Copy-Item .env.example .env.local`

   Mínimo habitual en desarrollo: `DATABASE_URL`, `JWT_SECRET` o `BETTER_AUTH_SECRET`. Detalle de todas las variables en [`.env.example`](./.env.example) y en la doc de arquitectura.

3. Aplica el esquema y datos necesarios en PostgreSQL (scripts en `scripts SQL/`).

4. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000).

El proyecto usa **Turbopack** en `dev` (`next dev --turbopack`). La entrada de la app está en `src/app/page.tsx`.

---

## Scripts

| Comando        | Descripción              |
|----------------|--------------------------|
| `npm run dev`  | Desarrollo con Turbopack |
| `npm run build`| Compilación producción   |
| `npm run start`| Servidor tras `build`    |
| `npm run lint` | ESLint                   |

Despliegue habitual: **`next build`** + **`next start`** en un entorno Node (no se asume Vercel u otro host concreto).

---

## Estructura relevante

| Ruta | Contenido |
|------|-----------|
| `src/app/` | Páginas (`page.tsx`) y API (`api/**/route.ts`) |
| `src/components/` | UI, formularios, dashboard |
| `src/hooks/` | Sesión de cabecera, permisos, login |
| `src/lib/` | BD, JWT, cookies, almacenamiento, email, etc. |
| `middleware.ts` | JWT en `/api` y protección por rol en rutas UI |
| `public/docs/` | Archivos servidos a admins vía `/api/docs/*` |

---

## Autenticación y sesión (resumen)

- Tras el login, el servidor fija cookies **HttpOnly** (`token`, `refresh_token`). El cliente también guarda el access en **`localStorage`** para enviar `Authorization: Bearer` en muchas peticiones; conviene mitigar **XSS** (CSP, sanitización). Detalle en la doc de arquitectura.
- **`POST /api/refresh`** renueva tokens (con comprobación de `Origin`).
- **`POST /api/logout`** limpia cookies y el cliente debe limpiar `localStorage`.
- Utilidades de sesión en servidor: p. ej. `src/lib/auth-request.ts`, `src/lib/get-session.ts`.

---

## Cloudflare Turnstile (login)

Variables típicas:

- `CLOUDFLARE_TURNSTILE_SECRET` — validación en servidor (`siteverify`).
- `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` — widget en cliente.
- `CLOUDFLARE_TURNSTILE_MODE` — `strict` | `degraded` | `disabled`.
- `NEXT_PUBLIC_TURNSTILE_STRICT_MODE` — si el front exige token antes de enviar login.

Recomendación: producción normal `strict` + strict en front; en contingencia, `degraded` y relajar el front según tu política.

---

## Dashboard e inserción de datos

El **dashboard** (`/dashboard`) agrupa resumen, eventos, ingreso y consulta de datos maestros, usuarios, mapa de sitios y paneles para roles con permiso. El módulo de **inserción de datos** vive en la UI del dashboard y las APIs bajo `src/app/api/admin/`; la matriz de permisos viene de PostgreSQL (`tabla_accesibilidad_menu_x_rol`).

---

## Más sobre Next.js

- [Documentación Next.js](https://nextjs.org/docs)
- [Despliegue](https://nextjs.org/docs/app/building-your-application/deploying)

---

## Licencia y créditos

Revisa el archivo de licencia del repositorio si existe. Las fotografías de fondo en la pantalla de auth incluyen atribución en la propia UI.
