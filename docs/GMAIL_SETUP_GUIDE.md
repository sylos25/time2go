# Guía Rápida: Configurar Gmail para Reset de Contraseña

## Pasos para Configurar Gmail:

### 1. Habilitar Verificación en Dos Pasos
- Ve a: https://myaccount.google.com/security
- Busca "Verificación en dos pasos"
- Sigue los pasos para activarla

### 2. Generar Contraseña de Aplicación
- Ve a: https://myaccount.google.com/apppasswords
- Selecciona:
  - **Seleccionar aplicación:** Mail
  - **Seleccionar dispositivo:** Windows Computer (o el que uses)
- Google generará una contraseña de 16 caracteres

### 3. Copiar la Contraseña Generada
La contraseña tendrá un formato similar a:
```
xxxx xxxx xxxx xxxx
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos (ya existente)
DATABASE_URL=postgresql://user:password@localhost:5432/time2go

# Autenticación (ya existente)
BETTER_AUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret

# EMAIL - Configurar con tus datos de Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=xxxxxxxxxxxx
```

**⚠️ IMPORTANTE:** 
- Reemplaza `tu-email@gmail.com` con tu dirección de Gmail
- Reemplaza `xxxxxxxxxxxx` con la contraseña de aplicación generada (sin espacios)
- **NUNCA** uses tu contraseña de Gmail real en las variables de entorno

### 5. Reiniciar el Servidor
```bash
npm run dev
```

## Verificar que Funciona

1. Abre la aplicación en: http://localhost:3000
2. Ve al formulario de login
3. Haz clic en "¿Olvidaste tu contraseña?"
4. Ingresa un correo que existe en tu base de datos
5. Deberías recibir un correo con una nueva contraseña en segundos

## Solucionar Problemas

### "Error al enviar el correo"
- Verifica que las variables de entorno están correctas
- Revisa que la contraseña de aplicación está sin espacios
- Asegúrate de haber habilitado la verificación en dos pasos

### No recibo el correo
- Revisa la carpeta de SPAM/Correo no deseado
- Verifica que el email en la base de datos es correcto
- Revisa los logs del servidor para errores

### Variables de entorno no reconocidas
- Asegúrate de reiniciar el servidor después de editar `.env.local`
- Recarga la página del navegador

## Otros Proveedores de Email

Si prefieres usar otro proveedor:

### SendGrid:
```env
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxx
```

### Microsoft 365:
```env
EMAIL_SERVICE=outlook
EMAIL_USER=tu-email@microsoft.com
EMAIL_PASSWORD=tu-contraseña
```

### ProtonMail:
```env
EMAIL_SERVICE=ProtonMail
EMAIL_USER=tu-email@protonmail.com
EMAIL_PASSWORD=tu-contraseña
```

Modifica el servicio según tu proveedor en el archivo `src/lib/email.ts` si es necesario.

## Para Desarrollo/Testing:

Puedes usar un servicio de email gratuito para testing:

### Ethereal Email (Recomendado para desarrollo):
```bash
# Ve a https://ethereal.email/
# Crea una cuenta gratis (temporal)
```

Luego configura:
```env
EMAIL_SERVICE=Ethereal
EMAIL_USER=tu-email-ethereal@ethereal.email
EMAIL_PASSWORD=tu-contraseña-ethereal
```

Cada correo se mostrará en el dashboard de Ethereal para que lo revises.

---

¿Preguntas? Revisa el archivo [RESET_PASSWORD_CONFIG.md](./RESET_PASSWORD_CONFIG.md) para más detalles.
