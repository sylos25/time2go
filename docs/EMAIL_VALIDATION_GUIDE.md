# Guía de Validación de Email - Time2Go

## Descripción General

Se ha implementado un sistema completo de validación de correo electrónico para el formulario de registro. Los usuarios reciben un email con un link de validación que deben confirmar antes de poder acceder a la plataforma.

## Cambios Realizados

### 1. Base de Datos

#### Tabla nueva: `tabla_validacion_email_tokens`
```sql
CREATE TABLE IF NOT EXISTS tabla_validacion_email_tokens (
    id_token                SERIAL                      PRIMARY KEY,
    numero_documento        VARCHAR(10)                 NOT NULL,
    token                   VARCHAR(64)                 NOT NULL        UNIQUE,
    utilizado               BOOLEAN                     NOT NULL        DEFAULT FALSE,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion        TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours',
    fecha_validacion        TIMESTAMP   WITH TIME ZONE,
    FOREIGN KEY (numero_documento) REFERENCES tabla_usuarios(numero_documento) ON DELETE CASCADE
);
```

**Nota:** La columna `validacion_correo` ya existe en `tabla_usuarios` con valor por defecto `FALSE`. Se actualiza a `TRUE` cuando el usuario valida su email.

### 2. APIs Creadas

#### A. POST `/api/send-validation-email`
- **Propósito:** Enviar email de validación
- **Parámetros:**
  - `email`: Email del usuario
  - `numero_documento`: Documento del usuario
  - `baseUrl`: URL base del sitio (opcional, se obtiene del contexto)
- **Respuesta:** Confirmación de envío

#### B. GET `/api/validate-email?token={token}`
- **Propósito:** Validar el email mediante el token recibido
- **Parámetros:**
  - `token`: Token recibido en el email
- **Acciones:**
  - Verifica validez y expiración del token (24 horas)
  - Actualiza `validacion_correo = TRUE` en tabla_usuarios
  - Marca token como utilizado
- **Respuesta:** Mensaje de éxito o error

### 3. Funciones de Email

Se agregaron a `src/lib/email.ts`:

```typescript
// Genera un token aleatorio de 32 bytes en hexadecimal
export function generateEmailValidationToken(): string

// Envía el email con link de validación
export async function sendEmailValidationEmail(
  email: string,
  token: string,
  baseUrl: string
): Promise<boolean>
```

### 4. Flujo de Registro Actualizado

En `pages/api/usuario_formulario.ts`:

1. Usuario se registra con el formulario
2. Usuario es creado en `tabla_usuarios` con `validacion_correo = FALSE`
3. Se genera un token de validación
4. Se guarda el token en `tabla_validacion_email_tokens`
5. Se envía email con link: `{baseUrl}/validate-email?token={token}`
6. Usuario recibe mensaje indicando que debe validar su email

### 5. Página de Validación

Nueva página: `src/app/validate-email/page.tsx`

- Procesa el link del email automáticamente
- Muestra estado: cargando, éxito o error
- Redirige a login en caso de éxito (3 segundos)
- Permite ir manual a login en caso de error

### 6. Componente Actualizado

`src/components/register-form.tsx`:

- Nuevo mensaje de éxito informando sobre validación de email
- Ya NO redirige automáticamente al login después del registro
- Usuario debe validar su email primero

## Flujo Completo del Usuario

1. **Registro**: Usuario completa formulario y hace clic en "Crear Cuenta"
2. **Confirmación**: Ve mensaje: "Se ha enviado un correo de validación a tu email"
3. **Email**: Recibe email en su buzón con botón "Validar Correo Electrónico"
4. **Validación**: Hace clic en el link → va a `/validate-email?token={token}`
5. **Confirmación**: Ve página de éxito "¡Tu correo ha sido validado correctamente!"
6. **Redireccionamiento**: Es redirigido automáticamente a `/auth` (login) después de 3 segundos
7. **Base de Datos**: Columna `validacion_correo` en `tabla_usuarios` está ahora en `TRUE`

## Variables de Entorno Requeridas

Asegúrate de tener configuradas en `.env.local`:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-o-app-password
NEXTAUTH_URL=http://localhost:3000  # o tu URL de producción
```

## Seguridad

- **Tokens únicos**: Cada usuario recibe un token único
- **Expiración**: Los tokens expiran en 24 horas
- **Validación única**: Un token solo puede usarse una vez
- **Integridad**: Se valida que el token exista, no haya expirado y no haya sido usado

## Próximos Pasos (Opcionales)

1. Implementar reenvío de email si el usuario no lo recibió
2. Agregar reintento de validación
3. Agregar verificación en login: no permitir login si `validacion_correo = FALSE`
4. Agregable: Cambio de email con revalidación
