# Time2Go

Este es un proyecto [Next.js](https://nextjs.org) - Plataforma de eventos.

## 📚 Documentación

Para consultar la documentación del proyecto, incluyendo la configuración de reset de contraseña y la guía de inserción de datos:

👉 **[Ver documentación en la carpeta `/docs`](./docs/README.md)**

### 📖 Guías Disponibles
- [Email Validation Guide](./docs/EMAIL_VALIDATION_GUIDE.md)
- [Gmail Setup Guide](./docs/GMAIL_SETUP_GUIDE.md)
- [Insert Data Guide](./docs/INSERT_DATA_GUIDE.md) - **Nuevo: Módulo de inserción de datos en dashboard**
- [Login Validation Guide](./docs/LOGIN_VALIDATION_GUIDE.md)
- [Reset Password Configuration](./docs/RESET_PASSWORD_CONFIG.md)
- [Setup Checklist](./docs/SETUP_CHECKLIST.md)
- [Cloudflare R2 Storage Guide](./docs/R2_STORAGE_GUIDE.md) - **Nuevo: almacenamiento de imágenes y PDF**

## 🆕 Módulo de Inserción de Datos

Se ha agregado un nuevo módulo al dashboard que permite insertar datos en la base de datos de forma segura:

**Acceso:** Dashboard → Menú → "Insertar Datos"

**Características:**
- ✅ 6 tablas disponibles (Países, Sitios, Municipios, Usuarios, Categorías, Tipos de Eventos)
- ✅ Validación automática de integridad referencial
- ✅ Hash seguro de contraseñas (bcrypt)
- ✅ Mensajes de error claros y específicos
- ✅ Formularios dinámicos adaptados a cada tabla

Para más detalles: [Guía de Inserción de Datos](./docs/INSERT_DATA_GUIDE.md)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cookies y sesión

Se añade soporte de sesión mediante cookies HttpOnly para mayor seguridad. Cambios relevantes:

- `POST /api/login` ahora devuelve el JWT en JSON y además establece una cookie HttpOnly `token` con el JWT.
- `POST /api/logout` limpia la cookie de sesión en el servidor.
- El helper `src/lib/get-session.ts` busca el token también en la cookie cuando se ejecuta en el servidor.

Notas de uso:

- El token en la cookie es HttpOnly: el cliente no puede leerla desde JavaScript. La app mantiene `localStorage` histórico para compatibilidad pero debe migrarse a depender sólo de la cookie cuando sea posible.
- Para el cierre de sesión se llama a `/api/logout` y se limpia también el estado cliente.

## Login resiliente (Turnstile)

El login soporta modo de degradación controlada para incidentes del proveedor captcha.

Variables de entorno:

- `CLOUDFLARE_TURNSTILE_MODE=strict|degraded|disabled`
	- `strict`: exige captcha y falla si el proveedor no responde.
	- `degraded`: si el proveedor falla, permite login con controles antiabuso (rate limit + bloqueo temporal).
	- `disabled`: desactiva verificación captcha.
- `CLOUDFLARE_TURNSTILE_SECRET`: secreto de validación server-side.
- `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`: llave pública para renderizar widget en cliente.
- `NEXT_PUBLIC_TURNSTILE_STRICT_MODE=true|false`: controla si el frontend exige token antes de enviar login.

Recomendación operativa:

- Producción normal: `CLOUDFLARE_TURNSTILE_MODE=strict` y `NEXT_PUBLIC_TURNSTILE_STRICT_MODE=true`.
- Contingencia por incidente: `CLOUDFLARE_TURNSTILE_MODE=degraded` y `NEXT_PUBLIC_TURNSTILE_STRICT_MODE=false`.

