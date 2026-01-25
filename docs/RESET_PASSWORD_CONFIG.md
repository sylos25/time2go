# Configuración del Reset de Contraseña

## Descripción

Se ha implementado una funcionalidad completa de reset de contraseña en tu aplicación Time2Go. El sistema permite a los usuarios:

1. Hacer clic en "¿Olvidaste tu contraseña?" en el formulario de login
2. Ingresar su correo electrónico
3. Recibir una nueva contraseña generada automáticamente en su bandeja de entrada

## Archivos Creados/Modificados

### Archivos Nuevos:

1. **`src/components/reset-password-dialog.tsx`**
   - Componente Modal que solicita el correo del usuario
   - Maneja el envío de la solicitud al API
   - Muestra mensajes de éxito o error

2. **`src/lib/email.ts`**
   - Servicio de email usando Nodemailer
   - Función `generateRandomPassword()` que crea contraseñas aleatorias de 12 caracteres
   - Función `sendResetPasswordEmail()` que envía el correo con la nueva contraseña

3. **`pages/api/reset-password.ts`**
   - Endpoint POST `/api/reset-password`
   - Verifica que el usuario existe
   - Genera una nueva contraseña
   - Actualiza la contraseña en la base de datos
   - Envía el correo al usuario

4. **`.env.local.example`**
   - Archivo de ejemplo con las variables de entorno necesarias

### Archivos Modificados:

1. **`src/components/login-form.tsx`**
   - Importa el componente `ResetPasswordDialog`
   - Agrega estado `resetPasswordOpen` para controlar el modal
   - Modifica el botón "¿Olvidaste tu contraseña?" para abrir el modal

## Configuración de Email

### Opción 1: Gmail (Recomendado)

1. Ve a [Google Account Security](https://myaccount.google.com/security)
2. Activa la "Verificación en dos pasos"
3. Ve a [App passwords](https://myaccount.google.com/apppasswords)
4. Selecciona "Mail" y "Windows Computer"
5. Copia la contraseña generada

6. En tu archivo `.env.local`:
```
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-app-generada
```

### Opción 2: Otros Proveedores SMTP

Puedes usar otros proveedores como SendGrid, AWS SES, Mailgun, etc.

Ejemplo con SendGrid:
```
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASSWORD=tu-sendgrid-api-key
```

O configura manualmente en `src/lib/email.ts`:
```typescript
const transporter = nodemailer.createTransport({
  host: "smtp.tuproveedor.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})
```

## Seguridad

✅ **Implementado:**
- Generación de contraseñas aleatorias seguras (12 caracteres con mayúsculas, minúsculas, números y símbolos)
- Contraseñas hasheadas con bcrypt antes de guardar en la base de datos
- Validación de email en el servidor
- No se revela si el email existe o no en la base de datos (por seguridad)
- El correo se envía SOLO si la contraseña se actualizó exitosamente

💡 **Recomendaciones Adicionales:**
- Implementar un token temporal en lugar de enviar la contraseña directamente
- Agregar un formulario de cambio de contraseña forzado en el primer login
- Implementar límite de intentos de reset de contraseña
- Agregar logging de intentos de reset de contraseña

## Flujo de Operación

```
Usuario hace clic en "¿Olvidaste tu contraseña?"
↓
Se abre el modal ResetPasswordDialog
↓
Usuario ingresa su correo
↓
POST /api/reset-password
↓
Backend verifica usuario
↓
Genera nueva contraseña
↓
Hashea la contraseña con bcrypt
↓
Actualiza en la base de datos
↓
Envía correo con nueva contraseña
↓
Usuario recibe correo y puede iniciar sesión
```

## Pruebas

Para probar localmente:

1. Configura un servicio SMTP de prueba (ej: Mailtrap, Ethereal)
2. Actualiza las variables de entorno en `.env.local`
3. Ejecuta la aplicación: `npm run dev`
4. Abre http://localhost:3000
5. Haz clic en "Iniciar Sesión" → "¿Olvidaste tu contraseña?"
6. Ingresa un email de prueba
7. Revisa el servicio SMTP para ver el correo

## Variables de Entorno Requeridas

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

Sin estas variables, el reset de contraseña mostrará un error.

## Mejoras Futuras

- [ ] Implementar tokens JWT para reset de contraseña temporal
- [ ] Agregar formulario para cambiar contraseña después de reset
- [ ] Implementar rate limiting en el endpoint de reset
- [ ] Agregar logging y auditoría de resets
- [ ] Implementar notificaciones en tiempo real
