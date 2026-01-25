# ⚙️ Checklist de Configuración - Reset de Contraseña

## Pre-Requisitos
- [x] Node.js instalado
- [x] Proyecto Next.js configurado
- [x] Base de datos PostgreSQL conectada
- [x] Nodemailer instalado (`npm install nodemailer`)

## Configuración de Correo Electrónico

### Opción A: Gmail (Recomendado para Desarrollo)

- [ ] 1. Abrir: https://myaccount.google.com/security
- [ ] 2. Habilitar "Verificación en dos pasos"
- [ ] 3. Ir a: https://myaccount.google.com/apppasswords
- [ ] 4. Seleccionar:
  - [ ] Aplicación: Mail
  - [ ] Dispositivo: Windows Computer
- [ ] 5. Copiar la contraseña generada (16 caracteres)
- [ ] 6. Crear/Editar `.env.local` en la raíz del proyecto:

```
EMAIL_SERVICE=gmail
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

- [ ] 7. Guardar y cerrar el archivo
- [ ] 8. Reiniciar servidor: `npm run dev`

### Opción B: Gmail (Contraseña Regular - No Recomendado)

Si prefieres usar tu contraseña de Gmail directa:
- [ ] 1. Habilitar acceso a "Aplicaciones menos seguras" en https://myaccount.google.com/lesssecureapps
- [ ] 2. Usar tu contraseña de Gmail en `EMAIL_PASSWORD`

### Opción C: Ethereal Email (Para Testing)

- [ ] 1. Ir a: https://ethereal.email/
- [ ] 2. Hacer clic en "Create Ethereal Account"
- [ ] 3. Copiar los datos de acceso
- [ ] 4. Actualizar `.env.local`:

```
EMAIL_SERVICE=Ethereal
EMAIL_USER=tu-cuenta@ethereal.email
EMAIL_PASSWORD=tu-contraseña-ethereal
```

- [ ] 5. Cada correo aparecerá en el dashboard de Ethereal

## Instalación del Código

- [ ] 1. Copiar archivos (ya incluidos en el proyecto)
  - [x] `src/components/reset-password-dialog.tsx`
  - [x] `src/lib/email.ts`
  - [x] `pages/api/reset-password.ts`

- [ ] 2. Verificar que `login-form.tsx` importa `ResetPasswordDialog`
  - [x] Línea 9: `import { ResetPasswordDialog } from "@/components/reset-password-dialog"`
  - [x] Línea 21: `const [resetPasswordOpen, setResetPasswordOpen] = useState(false)`
  - [x] Línea 154: `onClick={() => setResetPasswordOpen(true)}`
  - [x] Línea 165: `<ResetPasswordDialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen} />`

- [ ] 3. Verificar que `package.json` incluye dependencias
  - [x] `"nodemailer": "^6.x.x"`
  - [x] `"@types/nodemailer": "^x.x.x"`

## Pruebas Iniciales

### Test 1: Verificar que el Modal Abre
- [ ] 1. Ejecutar: `npm run dev`
- [ ] 2. Abrir: http://localhost:3000/auth
- [ ] 3. Hacer clic en el botón "¿Olvidaste tu contraseña?"
- [ ] 4. Debe abrirse un modal con el título "Restablecer Contraseña"

### Test 2: Validación de Email
- [ ] 1. Hacer clic en "Enviar Correo" sin ingresar email
- [ ] 2. Debe mostrar error: "Por favor ingresa tu correo electrónico"

### Test 3: Solicitud de Reset
- [ ] 1. Ingresar un email que existe en tu base de datos
- [ ] 2. Hacer clic en "Enviar Correo"
- [ ] 3. Esperar a que se procese (el botón mostrará "Enviando...")
- [ ] 4. Debe mostrar: "¡Correo enviado exitosamente!"
- [ ] 5. Revisar el correo en tu bandeja de entrada (o en Ethereal)

### Test 3: Login con Nueva Contraseña
- [ ] 1. Copiar la nueva contraseña del correo
- [ ] 2. Cerrar el modal (se cerrará automáticamente)
- [ ] 3. Ingresar el email y la nueva contraseña
- [ ] 4. Hacer clic en "Iniciar Sesión"
- [ ] 5. Debe iniciar sesión correctamente

## Solución de Problemas

### Error: "Error al enviar el correo"

- [ ] Verificar que `.env.local` existe
- [ ] Verificar que `EMAIL_SERVICE`, `EMAIL_USER` y `EMAIL_PASSWORD` están configurados
- [ ] Verificar que no hay espacios extra en las variables
- [ ] Verificar los logs de la consola del servidor para más detalles

```
npm run dev 2>&1 | findstr "Error\|email\|EMAIL"
```

### Error: "Método no permitido" al enviar

- [ ] Verificar que el archivo `pages/api/reset-password.ts` existe
- [ ] Verificar que la URL es correcta: `/api/reset-password`
- [ ] Reiniciar el servidor

### No recibo el correo

- [ ] Revisar carpeta SPAM/Correo no deseado
- [ ] Si usas Gmail con contraseña real, activar "Aplicaciones menos seguras"
- [ ] Verificar que la contraseña de aplicación está sin espacios
- [ ] Probar con Ethereal para verificar que el sistema funciona

### Variables de entorno no se cargan

- [ ] Asegurarse de estar en la raíz del proyecto
- [ ] Archivo debe llamarse `.env.local` (no `.env`)
- [ ] **REINICIAR EL SERVIDOR** después de editar `.env.local`
- [ ] Recargar la página del navegador (Ctrl+Shift+R para limpia)

## Verificación Final

- [ ] Reset de contraseña solicitado correctamente
- [ ] Correo recibido en la bandeja de entrada
- [ ] Nueva contraseña funciona para login
- [ ] Usuario puede cambiar contraseña después
- [ ] Sistema es seguro y no revela información sensible

## Archivo de Log para Debugging

Si necesitas debug adicional, revisa los logs:

```bash
# En PowerShell
Get-Content .\next.log -Wait

# O ejecuta con debug
$env:DEBUG="*"; npm run dev
```

## Documentación Relacionada

- 📖 [RESET_PASSWORD_CONFIG.md](./RESET_PASSWORD_CONFIG.md) - Guía completa
- 📖 [GMAIL_SETUP_GUIDE.md](./GMAIL_SETUP_GUIDE.md) - Setup de Gmail
- 📖 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Resumen técnico

---

**¿Completaste todos los pasos?** ✅  
**¿Funcionan las pruebas?** ✅  
**¡Listo para usar!** 🚀

Si encuentras problemas, revisa la documentación o contacta con soporte.
