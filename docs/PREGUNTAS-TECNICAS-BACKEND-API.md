# Time2Go — Preguntas Tecnicas Backend y API (Q&A)

> Ultima actualizacion: Abril 2026

---

## API y middleware

### 1. Donde estan los endpoints backend?
En `src/app/api/**/route.ts` bajo App Router de Next.js.

### 2. Que rol cumple el middleware?
Proteger rutas de UI por rol y APIs por JWT, salvo rutas publicas definidas por politica.

### 3. Donde se centraliza la politica de rutas API publicas?
En `src/lib/api-route-policy.ts`.

### 4. Se valida solo en middleware?
No. Los handlers sensibles revalidan autorizacion y reglas de negocio.

### 5. Que respuesta da una API privada sin token valido?
Generalmente 401 con payload JSON de error.

---

## Autenticacion y tokens

### 6. Como funciona el login backend?
Valida credenciales (y captcha segun modo), emite access/refresh y fija cookies HttpOnly.

### 7. Que endpoint renueva sesion?
`POST /api/refresh`.

### 8. Que endpoint cierra sesion?
`POST /api/logout`.

### 9. Que cambio reciente endurecio logout?
Ademas de revocar `jti` y limpiar cookies, se invalida la sesion activa (`sid`) en Redis.

### 10. Que secretos usa JWT?
`BETTER_AUTH_SECRET` o `JWT_SECRET` (segun resolucion interna).

### 11. Soporta rotacion de claves JWT?
Si, con `JWT_KEYS` y `JWT_ACTIVE_KID` si se configuran.

### 12. Como se distingue token access vs refresh?
Con claim `token_type` y verificacion esperada en backend.

---

## Seguridad backend

### 13. Como se mitiga brute force en login?
Con limites por IP y por IP+credencial, bloqueos progresivos y `429 Retry-After`.

### 14. Ese rate limit es distribuido entre replicas?
El principal del login actual es en memoria de proceso; hay base para evolucionar a distribuido.

### 15. Como se valida captcha del login?
Servidor consulta `siteverify` de Cloudflare Turnstile.

### 16. Que modos captcha existen?
`strict`, `degraded`, `disabled`.

### 17. Como se protege refresh de CSRF?
Con validacion de origen (`Origin`) confiable.

### 18. Como se evita enumeracion de usuarios en reset password?
El endpoint responde de forma neutra aunque el email no exista.

---

## Redis y sesion activa

### 19. Para que se usa Redis?
Revocacion de JWT por `jti` y control de sesion activa por usuario/sid.

### 20. Que aporta `ACTIVE_SESSION_HMAC_SECRET`?
Evita exponer identificadores directos en keys Redis usando HMAC.

### 21. Que es una sesion activa invalida?
Cuando el `sid` del token no coincide con la sesion registrada para ese usuario.

### 22. Que pasa si Redis cae o no esta configurado?
El sistema puede degradar parte de controles para no romper operacion, con menor endurecimiento.

---

## Base de datos y SQL

### 23. Se usa ORM?
No, SQL directo con `pg`.

### 24. Donde esta el esquema principal?
En `scripts SQL/DDL Time2Go.SQL`.

### 25. Donde se ubican funciones SQL?
En `scripts SQL/funciones/`.

### 26. Se usan transacciones en operaciones criticas?
Si, cuando se afecta mas de una tabla en un mismo flujo.

### 27. Como se maneja pool de conexiones?
Con `pg.Pool` y variables para maximo y timeouts.

---

## Integraciones backend

### 28. Como se integra ePayco?
Con creacion de checkout y webhook en `/api/epayco/webhook` para confirmacion.

### 29. Como se integra almacenamiento de archivos?
Con SDK S3-compatible (`@aws-sdk/client-s3`) para S3/R2.

### 30. Como se integra email?
Con Nodemailer sobre SMTP para eventos transaccionales.

### 31. Como se integra Google login?
Cliente obtiene credencial y backend valida/procesa en `/api/login-google`.

### 32. Como se exponen docs internas seguras?
APIs `/api/docs/files` y `/api/docs/serve`, protegidas para admin.

---

## Operacion y mantenimiento backend

### 33. Hay cron interno de Next?
No. Se usa endpoint de mantenimiento para scheduler externo.

### 34. Como se autoriza el cron?
Con `CRON_SECRET`.

### 35. Que hace el mantenimiento?
Chequeos/limpieza operativa segun implementacion del handler.

### 36. Que observabilidad hay hoy?
Logging por consola; recomendable evolucion a logs estructurados y alertas.

### 37. Como validar que una API cambio sin romper contratos?
Con pruebas, validaciones de schema/payload y revision de status codes.

---

## Troubleshooting backend

### 38. Si `/api/refresh` devuelve 401 frecuente, que revisar?
Cookies, origen, expiracion/revocacion de refresh y estado de sesion activa en Redis.

### 39. Si login da 429 muy seguido, que revisar?
Rate limit por IP, trafico automatizado, configuracion de proxy y cabeceras IP reales.

### 40. Si logout parece no cerrar sesion, que revisar?
Respuesta de `/api/logout`, limpieza real de cookies y eliminacion de `sid` activo.

