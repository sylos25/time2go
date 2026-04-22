# Documentación Técnica Completa — Time2Go

> Última actualización: Abril 2026

---

## Tabla de contenidos

1. [Resumen del proyecto](#1-resumen-del-proyecto)
2. [Frameworks y su función](#2-frameworks-y-su-función)
3. [Librerías utilizadas](#3-librerías-utilizadas)
4. [Arquitectura del proyecto](#4-arquitectura-del-proyecto)
5. [Cómo están construidas las rutas API y conexión a la BD](#5-cómo-están-construidas-las-rutas-api-y-conexión-a-la-bd)
6. [Cómo están construidos los archivos React](#6-cómo-están-construidos-los-archivos-react)
7. [Autenticación y JWT con jose](#7-autenticación-y-jwt-con-jose)
8. [Variables de entorno relevantes](#8-variables-de-entorno-relevantes)

---

## 1. Resumen del proyecto

Time2Go es una plataforma web para **descubrir, crear y reservar eventos culturales y deportivos en Colombia**. Permite a usuarios normales reservar entradas, a organizadores gestionar sus eventos, a moderadores y administradores controlar el contenido desde un dashboard centralizado.

---

## 2. Frameworks y su función

### Next.js 16 (App Router)

**¿Qué es un framework?**
Un framework es una estructura base con reglas y herramientas predefinidas que ahorra trabajo repetitivo. En lugar de construir todo desde cero, el desarrollador trabaja dentro de su estructura.

**Next.js** es el framework principal del proyecto. Extiende React para incluir:

| Característica | Significado técnico |
|---|---|
| **App Router** | Sistema de rutas basado en carpetas dentro de `src/app/`. Cada carpeta es una URL automáticamente |
| **Server Components** | Componentes de React que se ejecutan **en el servidor** antes de enviarse al navegador. No tienen JavaScript en el cliente |
| **Client Components** | Componentes marcados con `"use client"` que se ejecutan **en el navegador** y pueden usar estado (`useState`) y efectos (`useEffect`) |
| **API Routes** | Archivos `route.ts` dentro de `src/app/api/` que funcionan como un backend REST dentro del mismo proyecto |
| **Middleware (Edge Runtime)** | Código que se ejecuta **antes de que llegue el request al servidor**, en una capa de red muy rápida llamada Edge. Se usa para autenticación y redirecciones |
| **Turbopack** | El nuevo compilador de Next.js (reemplaza a Webpack), activo en desarrollo con `npm run dev` |

**Resumen simple:** Next.js hace que React funcione tanto en el servidor como en el navegador, e incluye el backend (API) dentro del mismo proyecto.

---

### React 19

**¿Qué es React?**
React es la librería de interfaz de usuario. Permite construir la pantalla dividida en piezas reutilizables llamadas **componentes**. Cada componente es una función que retorna HTML (en realidad JSX).

React 19 introduce mejoras de rendimiento y el soporte nativo para Server Components que usa Next.js.

---

### TypeScript

**¿Qué es TypeScript?**
Es JavaScript con **tipos de datos obligatorios**. En lugar de escribir `let nombre = "Juan"`, en TypeScript defines `let nombre: string = "Juan"`. Esto hace que el editor detecte errores antes de ejecutar el código.

El proyecto usa TypeScript en todos sus archivos (`.ts` y `.tsx`).

---

### Tailwind CSS 4

**¿Qué es Tailwind CSS?**
Es un framework de estilos visuales. En lugar de escribir CSS en archivos separados, los estilos se aplican directamente en el HTML como clases utilitarias:

```html
<!-- Tailwind: todo en la clase -->
<div class="flex items-center bg-blue-500 text-white p-4 rounded-lg">

<!-- CSS tradicional: estilo en archivo aparte -->
<div class="mi-caja">
```

---

## 3. Librerías utilizadas

Una **librería** es código externo que resuelve un problema específico y se puede instalar con `npm install`. Estas son las del proyecto:

### Autenticación y Seguridad

| Librería | Para qué sirve |
|---|---|
| **jose** | Crear y verificar tokens JWT. Compatible con Edge Runtime (no usa Node.js puro) |
| **bcryptjs** | Hashear (cifrar sin posibilidad de revertir) contraseñas antes de guardarlas en la BD |
| **@upstash/redis** | Conectarse a Redis en la nube (Upstash) para guardar tokens revocados |
| **@upstash/ratelimit** | Limitar la cantidad de requests por IP para evitar ataques de fuerza bruta |
| **@marsidev/react-turnstile** | Integrar el captcha de Cloudflare (Turnstile) en el formulario de login |

### Base de datos

| Librería | Para qué sirve |
|---|---|
| **pg** | Driver oficial de PostgreSQL para Node.js. Permite enviar consultas SQL y recibir resultados |

### Almacenamiento de archivos

| Librería | Para qué sirve |
|---|---|
| **@aws-sdk/client-s3** | Subir y leer archivos (imágenes, documentos) a AWS S3 o cualquier almacenamiento compatible (Cloudflare R2) |
| **multer** | Procesar archivos enviados desde formularios HTML (`multipart/form-data`) |
| **browser-image-compression** | Comprimir imágenes en el navegador antes de subirlas, para ahorrar ancho de banda |

### UI (Interfaz de usuario)

| Librería | Para qué sirve |
|---|---|
| **@radix-ui/react-\*** | Componentes de UI accesibles y sin estilos (Dialog, Select, Tabs, Tooltip, etc.). La base del sistema de diseño |
| **lucide-react** | Librería de íconos SVG en React |
| **class-variance-authority (cva)** | Crear variantes de componentes con Tailwind de forma organizada (ej: botón primario, secundario, destructivo) |
| **clsx + tailwind-merge** | Combinar clases de Tailwind de forma limpia, evitando conflictos |
| **swiper** | Carrusel/slider de imágenes (usado en el hero carousel de la página principal) |

### Mapas y Geolocalización

| Librería | Para qué sirve |
|---|---|
| **leaflet + react-leaflet** | Mostrar mapas interactivos de OpenStreetMap sin depender de Google Maps |

### Formularios y Validación

| Librería | Para qué sirve |
|---|---|
| **zod** | Validar esquemas de datos. Define la forma esperada de los datos y lanza errores si no coinciden |
| **react-datepicker / react-day-picker** | Selectores de fecha/calendario en formularios |
| **react-number-format** | Formatear campos numéricos (precios, teléfonos) |

### Datos y Reportes

| Librería | Para qué sirve |
|---|---|
| **recharts** | Gráficas y visualizaciones de datos (usado en el dashboard de administración) |
| **jspdf** | Generar archivos PDF desde JavaScript (ej: comprobantes de reserva) |
| **qrcode** | Generar códigos QR (ej: en reservas para verificar asistencia) |
| **date-fns** | Manipular y formatear fechas de forma sencilla |

### Comunicación

| Librería | Para qué sirve |
|---|---|
| **nodemailer** | Enviar correos electrónicos desde Node.js (validación de cuenta, notificaciones) |

### Testing

| Librería | Para qué sirve |
|---|---|
| **vitest** | Framework de pruebas unitarias (alternativa moderna a Jest) |
| **@testing-library/react** | Probar componentes de React simulando cómo los usa un usuario real |
| **jsdom** | Simular un navegador en Node.js para correr pruebas sin abrir Chrome |

---

## 4. Arquitectura del proyecto

### Estructura de carpetas

```
time2go/
├── middleware.ts          ← Intercepta TODOS los requests (autenticación/roles)
├── next.config.ts         ← Configuración de Next.js (headers de seguridad, imágenes)
├── src/
│   ├── app/               ← App Router: cada subcarpeta = una URL
│   │   ├── page.tsx       ← Página principal (/)
│   │   ├── layout.tsx     ← Layout raíz (envuelve toda la app)
│   │   ├── api/           ← Backend REST (cada carpeta = un endpoint)
│   │   ├── dashboard/     ← Página /dashboard
│   │   ├── eventos/       ← Páginas de eventos
│   │   └── ...
│   ├── components/        ← Componentes React reutilizables
│   │   ├── ui/            ← Componentes base (Button, Input, Dialog...)
│   │   ├── dashboard/     ← Componentes específicos del dashboard
│   │   ├── header.tsx     ← Cabecera global
│   │   └── ...
│   ├── lib/               ← Lógica de negocio y utilidades del servidor
│   │   ├── db.ts          ← Conexión a PostgreSQL
│   │   ├── jwt.ts         ← Firmar y verificar tokens
│   │   ├── jwt-secret.ts  ← Resolver el secreto JWT
│   │   ├── token-revocation.ts ← Lista negra de tokens en Redis
│   │   ├── auth-request.ts ← Extraer sesión de un request
│   │   ├── get-session.ts  ← Obtener sesión en Server Components
│   │   ├── permissions.ts  ← IDs de permisos del sistema
│   │   ├── email.ts        ← Envío de correos
│   │   └── ...
│   ├── hooks/             ← Custom Hooks de React (lógica reutilizable del cliente)
│   └── types/             ← Definiciones de tipos TypeScript globales
```

---

### Glosario de conceptos arquitectónicos clave

| Término | Significado |
|---|---|
| **App Router** | Sistema de enrutamiento de Next.js basado en la estructura de carpetas. Un archivo `page.tsx` dentro de `src/app/eventos/` crea automáticamente la ruta `/eventos` |
| **Route Handler** | Archivo `route.ts` dentro de `src/app/api/`. Equivale a un endpoint de una API REST tradicional. Exporta funciones `GET`, `POST`, `PUT`, `DELETE`, etc. |
| **Server Component** | Componente que Next.js ejecuta en el servidor. Puede hacer `await` directamente, leer la BD, leer cookies. **No** puede usar `useState`, `useEffect` ni eventos del navegador |
| **Client Component** | Componente marcado con `"use client"` al inicio del archivo. Se ejecuta en el navegador. Puede usar hooks de React (`useState`, `useEffect`, etc.) e interactuar con el DOM |
| **Edge Runtime** | Entorno de ejecución ultra-rápido y distribuido (no es Node.js completo). El `middleware.ts` corre aquí. Solo puede usar APIs web estándar, por eso se usa `jose` en lugar de `jsonwebtoken` |
| **Pool de conexiones** | En lugar de abrir una conexión nueva a la BD con cada request (costoso), se mantiene un grupo de conexiones abiertas listas para reutilizar. El proyecto usa un pool de `pg` |
| **Middleware** | Código que se ejecuta automáticamente entre el request del usuario y la página/API destino. Se usa para validar autenticación antes de permitir el acceso |
| **JTI (JWT ID)** | Identificador único de cada token JWT. Permite revocar un token específico sin invalidar todos los demás |
| **Refresh Token Rotation** | Cuando el access token expira, el cliente envía el refresh token para obtener uno nuevo. El refresh token usado se invalida inmediatamente y se emite uno nuevo |
| **httpOnly Cookie** | Cookie que el JavaScript del navegador **nunca puede leer**. Solo el servidor la ve. Protege contra ataques XSS (Cross-Site Scripting) |
| **CSP (Content Security Policy)** | Política de seguridad que le dice al navegador desde qué orígenes puede cargar scripts, estilos, imágenes, etc. Configurado en `next.config.ts` |

---

## 5. Cómo están construidas las rutas API y conexión a la BD

### 5.1 Conexión a PostgreSQL — `src/lib/db.ts`

La conexión a la base de datos usa la librería `pg` con un **Pool singleton**:

```
                    Variables de entorno
                    DATABASE_URL, PGPOOL_MAX, etc.
                           │
                           ▼
                    buildConfig()
                    (construye la configuración)
                           │
                           ▼
               ┌───────────────────────┐
               │   globalThis.__pool   │  ← Un solo Pool para todo el proceso Node
               │   (Pool de pg)        │     (HMR en dev y warm instances en prod
               └───────────────────────┘      reutilizan la misma instancia)
                           │
              ┌────────────┴────────────┐
              │                         │
        pool.query(sql)          pool.connect()
        (query rápida,        (conexión dedicada,
         auto-released)        para transacciones)
```

**Características del Pool:**
- **Máximo de conexiones:** configurable con `PGPOOL_MAX` (default: 20, máximo: 100)
- **Timeout de conexión inactiva:** `PG_IDLE_TIMEOUT_MS` (default: 30 segundos)
- **SSL automático:** se activa si la URL contiene dominios de Neon, AWS, Azure o Supabase
- **Protección en producción:** si no hay `DATABASE_URL` en producción, lanza error al arrancar

**Dos formas de usar el pool:**

```typescript
// 1. Query simple (para SELECTs, sin transacción)
const result = await pool.query("SELECT * FROM tabla_usuarios WHERE id = $1", [id]);

// 2. Conexión dedicada (para múltiples queries relacionadas o transacciones)
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("INSERT INTO ...", [...]);
  await client.query("COMMIT");
} catch {
  await client.query("ROLLBACK");
} finally {
  client.release(); // ← SIEMPRE devolver la conexión al pool
}
```

> **Seguridad importante:** Todas las queries usan **parámetros posicionales** (`$1`, `$2`, etc.) en lugar de concatenar strings. Esto previene **SQL Injection** (OWASP Top 10 #3).

---

### 5.2 Estructura de un Route Handler (endpoint API)

Cada endpoint vive en `src/app/api/<nombre>/route.ts`. La estructura típica es:

```
POST /api/events
     │
     ▼  src/app/api/events/route.ts
┌─────────────────────────────────────────┐
│ 1. Verificar autenticación              │
│    getRequesterIdFromRequest(req)        │
│    → Lee JWT del header Bearer o cookie │
│                                         │
│ 2. Verificar permisos/rol               │
│    SELECT id_rol FROM tabla_usuarios... │
│    SELECT * FROM tabla_accesibilidad... │
│                                         │
│ 3. Validar datos de entrada             │
│    zod.parse(formData) o               │
│    revisión manual de campos           │
│                                         │
│ 4. Ejecutar lógica de negocio           │
│    pool.query() / client.query()        │
│    uploadImageBuffer() / etc.           │
│                                         │
│ 5. Retornar respuesta                   │
│    NextResponse.json({ ok: true, ... }) │
└─────────────────────────────────────────┘
```

**Ejemplo real simplificado (`/api/login`):**

```typescript
export async function POST(req: Request) {
  const { email, password, turnstileToken } = await req.json();
  
  // 1. Validar captcha (Cloudflare Turnstile)
  await verifyTurnstileToken(turnstileToken, ip);
  
  // 2. Buscar usuario en BD (query parametrizada → sin SQL Injection)
  const result = await pool.query(
    "SELECT * FROM tabla_usuarios u JOIN tabla_usuarios_credenciales c ...",
    [normalizedEmail]
  );
  
  // 3. Verificar contraseña con bcrypt
  const valid = await bcrypt.compare(password, user.contrasena_hash);
  
  // 4. Firmar tokens JWT
  const accessToken  = await signToken({ id_usuario, id_rol, token_type: "access" },  15 * 60);
  const refreshToken = await signToken({ id_usuario, id_rol, token_type: "refresh" }, 7 * 24 * 3600);
  
  // 5. Devolver tokens en cookies httpOnly
  response.headers.append("Set-Cookie", serializeCookie("token", accessToken, { httpOnly: true }));
  response.headers.append("Set-Cookie", serializeCookie("refresh_token", refreshToken, { httpOnly: true }));
}
```

---

### 5.3 Listado completo de endpoints API

```
src/app/api/
├── admin/              → Operaciones de administrador (insertar datos)
├── auth/               → Integración con Better Auth / OAuth
├── categoria_boleto/   → Catálogo de tipos de boleto
├── categoria_evento/   → Catálogo de categorías de evento
├── change-password/    → Cambiar contraseña autenticado
├── contact/            → Formulario de contacto
├── cron/               → Tareas programadas (mantenimiento)
├── dashboard/          → Datos para el panel de administración
├── deactivate/         → Desactivar cuenta de usuario
├── denuncias-eventos/  → Sistema de reportes/denuncias de eventos
├── departamentos/      → Catálogo de departamentos de Colombia
├── docs/               → Acceso a documentación (solo admin)
├── events/             → CRUD de eventos
├── favoritos/          → Gestión de eventos favoritos
├── home-config/        → Configuración de la página principal
├── llamar_pais/        → Catálogo de países (para prefijos telefónicos)
├── llamar_sitio/       → Catálogo de sitios de eventos
├── login/              → Autenticación con email + contraseña
├── login-google/       → Autenticación con Google OAuth
├── logout/             → Cerrar sesión (revocar tokens)
├── me/                 → Datos del usuario autenticado actual
├── mis-valoraciones/   → Reseñas/valoraciones del usuario
├── municipios/         → Catálogo de municipios de Colombia
├── organizador/        → Gestión de perfil de organizador
├── organizador-document/ → Documentos del organizador (S3)
├── perfil/             → Actualizar datos del perfil
├── permissions/        → Consulta de permisos del rol
├── refresh/            → Renovar access token con refresh token
├── reservas/           → Crear y consultar reservas de eventos
├── reset-password/     → Recuperación de contraseña por email
├── send-validation-email/ → Reenviar email de validación
├── stats/              → Estadísticas del dashboard
├── tipo-sitios/        → Catálogo de tipos de sitio
├── tipo_evento/        → Catálogo de tipos de evento
├── usuarios/           → CRUD de usuarios (admin)
├── usuario_formulario/ → Registro de nuevo usuario
├── validate-email/     → Confirmar email con token
└── epayco/             → Webhook de pagos con ePayco
```

---

### 5.4 Protección de rutas API — Middleware

El archivo `middleware.ts` intercepta **todos los requests** antes de que lleguen a su destino:

```
Usuario hace request
        │
        ▼
   middleware.ts  (Edge Runtime — ultra rápido)
        │
        ├─ ¿Es ruta pública? (/api/login, /api/registro...) → PASA sin verificar
        │
        ├─ ¿Es /api/*?
        │    ├─ Extrae token (Bearer header o cookie "token")
        │    ├─ Verifica JWT con jose
        │    └─ Sin token válido → 401 Unauthorized
        │
        └─ ¿Es página protegida? (/dashboard, /perfil, /mis-reservas...)
             ├─ Lee cookie "token"
             ├─ Verifica JWT
             ├─ Extrae id_rol del payload
             ├─ Compara rol con los roles permitidos para esa ruta
             ├─ Rol insuficiente → redirige a "/"
             └─ Sin sesión → redirige a "/auth?redirect=..."
```

**Roles del sistema:**

| ID | Rol | Acceso |
|---|---|---|
| 1 | Usuario | Mis reservas, perfil, favoritos, valoraciones |
| 2 | Organizador | Todo lo anterior + crear eventos, mis-eventos |
| 3 | Moderador | Todo lo anterior + dashboard |
| 4 | Administrador | Todo, incluyendo /docs |

---

## 6. Cómo están construidos los archivos React

### 6.1 La distinción fundamental: Server vs Client

En Next.js con App Router, **todo componente es Server Component por defecto**. Para hacerlo Client Component, se pone `"use client"` en la primera línea:

```typescript
// ─── Server Component (por defecto) ─────────────────────────
// src/app/eventos/page.tsx
import pool from "@/lib/db"  // ✅ Puede leer la BD directamente

export default async function EventosPage() {
  const eventos = await pool.query("SELECT * FROM tabla_eventos");  // ✅ async/await OK
  return <div>{eventos.rows.map(e => <p>{e.nombre}</p>)}</div>
}

// ─── Client Component ────────────────────────────────────────
// src/components/header.tsx
"use client"  // ← Esta línea lo convierte en Client Component

import { useState } from "react"  // ✅ Puede usar hooks

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)  // ✅ Estado local OK
  return <nav onClick={() => setMenuOpen(!menuOpen)}>...</nav>
}
```

**Regla práctica del proyecto:**

| ¿Necesita...? | Tipo |
|---|---|
| Leer la BD, leer cookies del servidor, `async/await` de datos | Server Component |
| `useState`, `useEffect`, eventos de click/input, hooks de React | Client Component |
| Acceso a `window`, `document`, localStorage | Client Component |

---

### 6.2 Estructura típica de un componente Client

Todos los componentes Client del proyecto siguen este patrón:

```typescript
"use client"

// 1. Imports de React y librerías
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// 2. Imports de componentes UI (Radix/shadcn)
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// 3. Imports de hooks custom y tipos
import { useHeaderSession } from "@/hooks/use-header-session"
import type { JSX } from "react"

// 4. Interfaz de props (TypeScript)
interface MiComponenteProps {
  titulo: string
  onClose?: () => void
}

// 5. El componente como función
export function MiComponente({ titulo, onClose }: MiComponenteProps): JSX.Element {
  // 6. Estado local
  const [cargando, setCargando] = useState(false)
  
  // 7. Hooks custom
  const router = useRouter()
  const { user } = useHeaderSession()
  
  // 8. Manejadores de eventos
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    const res = await fetch("/api/eventos", { method: "POST", ... })
    // ...
  }
  
  // 9. JSX retornado
  return (
    <div className="flex flex-col gap-4">
      <h1>{titulo}</h1>
      <Button onClick={handleSubmit} disabled={cargando}>
        {cargando ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  )
}
```

---

### 6.3 Custom Hooks

Los **Custom Hooks** son funciones de React que empiezan con `use` y encapsulan lógica reutilizable. Están en `src/hooks/`:

```typescript
// src/hooks/use-header-session.ts
// Encapsula toda la lógica de leer la sesión del usuario desde /api/me

export function useHeaderSession() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [sessionResolved, setSessionResolved] = useState(false)
  
  useEffect(() => {
    fetch("/api/me")
      .then(r => r.json())
      .then(data => {
        setUser(data.user)
        setSessionResolved(true)
      })
  }, [])
  
  return { user, sessionResolved, performLogout }
}

// Uso en cualquier componente:
const { user, sessionResolved } = useHeaderSession()
```

Hooks más importantes del proyecto:

| Hook | Para qué sirve |
|---|---|
| `use-header-session` | Obtener el usuario autenticado actual en el cliente |
| `use-permissions` | Verificar si el usuario tiene un permiso específico |
| `use-admin-role-access` | Verificar acceso a funciones de administrador |
| `use-change-password-page` | Lógica del formulario de cambio de contraseña |

---

### 6.4 Sistema de componentes UI (shadcn/ui + Radix)

El proyecto usa **shadcn/ui**, que no es una librería instalable sino una colección de componentes copiados al proyecto en `src/components/ui/`. Cada componente combina:

- **Radix UI**: lógica de accesibilidad (ARIA, keyboard navigation, focus management)
- **Tailwind CSS**: estilos visuales
- **cva (class-variance-authority)**: variantes del componente

```
src/components/ui/
├── button.tsx      ← Button con variantes: primary, secondary, destructive, ghost
├── input.tsx       ← Input estilizado
├── dialog.tsx      ← Modal con overlay, animaciones, cierre con Escape
├── select.tsx      ← Dropdown accesible
├── tabs.tsx        ← Pestañas con animación
├── card.tsx        ← Tarjeta contenedora
└── ...
```

Ventaja: los componentes son accesibles por defecto (conformes con WCAG 2.1) sin esfuerzo extra.

---

### 6.5 Layout y jerarquía de páginas

```
layout.tsx (raíz)                ← Aplica a TODAS las páginas
├── <html lang="es">
│   └── <body>
│       ├── SecurityProvider     ← Context de seguridad global
│       ├── {children}           ← Contenido de cada página
│       └── DeferredGlobalUI     ← Modales y alertas globales (cargadas después)
│
└── src/app/
    ├── page.tsx                 → "/" (página principal)
    │   ├── Header
    │   ├── HeroSection          ← Carrusel de eventos destacados
    │   ├── EventsPreview        ← Grid de eventos
    │   └── Footer
    │
    ├── dashboard/page.tsx       → "/dashboard"
    │   └── Dashboard con tabs (resumen, eventos, usuarios, sitios...)
    │
    ├── eventos/[id]/page.tsx    → "/eventos/abc123"  ← [id] = parámetro dinámico
    │   └── Detalle del evento con mapa y botón de reserva
    │
    └── auth/page.tsx            → "/auth"
        └── Modal de login/registro
```

> Los **parámetros dinámicos** (carpetas entre corchetes como `[id]`) permiten que la misma página sirva para cualquier evento. Next.js pasa el valor como prop `params.id`.

---

## 7. Autenticación y JWT con jose

Ver explicación completa en el chat. Resumen del flujo:

```
Login exitoso
     │
     ├─ signToken() → access token  (15 min)  → cookie "token"       (httpOnly)
     └─ signToken() → refresh token (7 días)  → cookie "refresh_token" (httpOnly)
     
Cada request
     │
     └─ middleware lee cookie "token" → verifyToken() → extrae id_usuario + id_rol
     
Token expirado
     │
     └─ POST /api/refresh con cookie "refresh_token"
          ├─ Verifica refresh token
          ├─ Revoca JTI del refresh viejo (Redis)
          ├─ Emite nuevo access token (15 min)
          └─ Emite nuevo refresh token (7 días) — Rotation
          
Logout
     └─ Revoca JTI del refresh token actual (Redis) + borra ambas cookies
```

---

## 8. Variables de entorno relevantes

Estas variables van en el archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL=postgresql://user:password@host:5432/database
PGPOOL_MAX=20

# JWT y autenticación
JWT_SECRET=mi-secreto-muy-largo-y-aleatorio
BETTER_AUTH_SECRET=alternativo-al-jwt-secret
JWT_KEYS={"v1":"secreto-v1","v2":"secreto-v2"}   # Para key rotation
JWT_ACTIVE_KID=v1
JWT_ISSUER=time2go
JWT_AUDIENCE=time2go-app
COOKIE_DOMAIN=.time2go.com   # Para subdomains

# Redis (revocación de tokens y rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Captcha
CLOUDFLARE_TURNSTILE_SECRET=...
CLOUDFLARE_TURNSTILE_MODE=strict   # strict | degraded | disabled

# Almacenamiento de archivos (S3 / Cloudflare R2)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=time2go-files

# Correo electrónico
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Pagos
EPAYCO_P_CUST_ID_CLIENTE=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

*Documento generado para el equipo de desarrollo de Time2Go.*
