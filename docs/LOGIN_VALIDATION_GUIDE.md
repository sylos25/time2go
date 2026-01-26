# Validación de Email en Login - Time2Go

## Cambios Implementados

Se ha actualizado el sistema de login para requerir que los usuarios validen su correo electrónico antes de poder acceder a la plataforma.

### 1. Validación en el Endpoint de Login

**Archivo:** `pages/api/login.ts`

**Cambios:**
- Se agrega verificación de la columna `validacion_correo` en `tabla_usuarios`
- Si `validacion_correo = FALSE`, retorna error 403 (Forbidden) con mensaje específico
- Si `validacion_correo = TRUE`, permite el login normalmente

**Respuesta cuando email no está validado (HTTP 403):**
```json
{
  "error": "Email no validado",
  "message": "Debes validar tu correo electrónico antes de poder acceder. Revisa tu buzón de entrada y haz clic en el link de validación.",
  "requiresEmailValidation": true
}
```

### 2. Componente de Login Actualizado

**Archivo:** `src/components/login-form.tsx`

**Cambios:**
- ✅ Nuevo estado `emailValidationError` para distinguir errores de validación de email
- ✅ Verificación de `requiresEmailValidation` en respuesta del servidor
- ✅ Mensaje diferenciado en amarillo (advertencia) cuando el email no está validado
- ✅ Icono `AlertCircle` para mejor visualización del error
- ✅ Mensajes claros indicando que debe validar su email

**Flujo de Error:**
1. Usuario ingresa credenciales correctas pero email no validado
2. Servidor responde con status 403 y `requiresEmailValidation: true`
3. Se muestra mensaje en amarillo: "Debes validar tu correo electrónico antes de poder acceder..."
4. Usuario debe ir a su email y validar antes de intentar login de nuevo

### 3. Cómo Funciona

**Flujo Completo:**

1. **Registro**
   - Usuario se registra con email
   - Usuario creado con `validacion_correo = FALSE`
   - Se envía email de validación

2. **Validación de Email**
   - Usuario hace clic en el link del email
   - API `/validate-email?token={token}` ejecuta:
     - Verifica validez y expiración del token
     - Actualiza `validacion_correo = TRUE` en BD
     - Marca token como usado
   - Página muestra confirmación y redirige a login

3. **Login**
   - Usuario intenta iniciar sesión
   - API `/login` verifica si `validacion_correo = TRUE`
   - Si es FALSE: rechaza login con error informativo
   - Si es TRUE: permite login normalmente

## Cambios en la Base de Datos

La columna `validacion_correo` ya existe en `tabla_usuarios` con:
```sql
validacion_correo       BOOLEAN                     NOT NULL        DEFAULT FALSE
```

Se usa esta columna para rastrear si el email ha sido validado.

## Seguridad Implementada

✅ **Token único por usuario**: Cada email recibe un token único
✅ **Expiración de token**: Válido por 24 horas
✅ **Token de uso único**: No se puede usar dos veces
✅ **Validación requerida**: Sin validación, NO se puede hacer login
✅ **Mensajes informativos**: Guía al usuario sobre qué hacer

## Mensajes al Usuario

### Error de Credenciales (antes de la validación)
```
❌ Credenciales inválidas
```

### Email no Validado
```
⚠️  Debes validar tu correo electrónico antes de poder acceder. 
    Revisa tu buzón de entrada y haz clic en el link de validación.
```

### Otros Errores
```
❌ [Mensaje de error específico]
```

## Próximas Mejoras (Opcionales)

1. **Reenviar Email de Validación**
   - Opción en página de login para reenviar email
   - Especialmente útil si lo borraron por error

2. **Recordatorio Visual**
   - Banner en homepage diciendo "Valida tu email"

3. **Admin Panel**
   - Ver usuarios sin validar
   - Opción para validar manualmente

4. **Resend Validation Email**
   - Endpoint para reenviar email si lo perdió
   - Verificar que el usuario existe y no está validado
