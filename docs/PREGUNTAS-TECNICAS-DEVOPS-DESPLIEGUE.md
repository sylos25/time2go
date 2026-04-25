# Time2Go — Preguntas Tecnicas DevOps y Despliegue (Q&A)

> Ultima actualizacion: Abril 2026

---

## Build, runtime y entorno

### 1. Como se despliega Time2Go en forma estandar?
`npm run build` y luego `npm run start` en runtime Node.

### 2. Es valido export estatico para todo el proyecto?
No en general, porque hay backend/API y flujos que requieren servidor.

### 3. Que comando de desarrollo usa mejor rendimiento?
`npm run dev` (Turbopack).

### 4. Existe fallback con Webpack?
Si, `npm run dev:webpack`.

### 5. Que variable es critica para arranque backend?
`DATABASE_URL`.

### 6. Que variable es critica para auth?
`BETTER_AUTH_SECRET` o `JWT_SECRET`.

---

## Variables de entorno y secretos

### 7. Donde se documentan variables?
En `.env.example` y docs tecnicas del proyecto.

### 8. Se deben versionar secretos en git?
No.

### 9. Que variables son claves para Redis?
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `ACTIVE_SESSION_HMAC_SECRET`.

### 10. Que variables son claves para captcha?
`NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`, `CLOUDFLARE_TURNSTILE_SECRET`, modo Turnstile.

### 11. Que variables son claves para pagos?
`EPAYCO_PUBLIC_KEY`, `EPAYCO_P_CUST_ID_CLIENTE`, URLs de respuesta/confirmacion.

### 12. Que variables son claves para storage?
`DOCUMENTS_*` y `DOCUMENT_STORAGE_PROVIDER`.

---

## DNS, dominio y cloudflared

### 13. Diferencia entre Named Tunnel y Quick Tunnel?
Named usa hostname propio (requiere DNS correcto). Quick usa URL temporal `trycloudflare`.

### 14. Un tunnel puede estar conectado y aun asi no servir?
Si, si DNS no apunta al tunnel o si la app local no responde.

### 15. Que indica un `trycloudflare` con 404?
URL vieja o backend local inaccesible/puerto incorrecto.

### 16. Como validar rapido un tunnel?
Primero `http://localhost:<puerto>`, luego tunnel, luego URL publica.

### 17. Como saber quien controla DNS autoritativo?
Con `nslookup -type=NS dominio`.

### 18. Si NS apunta a otro proveedor, Cloudflare tunnel igual funciona?
Si, pero debes crear registros DNS en el proveedor autoritativo.

---

## Seguridad operacional

### 19. Que nivel de endurecimiento HTTP existe?
Cabeceras de seguridad definidas en `next.config.ts` con CSP.

### 20. Falta algo adicional en borde?
Segun entorno, suele recomendarse HSTS estricto y politicas mas cerradas de origen.

### 21. Como se protege endpoint de cron?
Con `CRON_SECRET` por cabecera.

### 22. Como se protegen docs internas?
Rutas y APIs restringidas a admin.

---

## Rendimiento y escalabilidad

### 23. Como medir cuello de build?
Revisar tiempos de compilacion y type-check en salida de `next build`.

### 24. Que optimizaciones recientes ayudan a build?
Imports optimizados, tsconfig mas acotado y uso de Turbopack en dev.

### 25. Que riesgo hay con rate limit en memoria al escalar replicas?
Inconsistencia entre nodos y perdida de estado al reiniciar.

### 26. Como mejorar ese punto?
Llevar limites criticos a almacenamiento compartido (Redis).

---

## CI/CD y mantenimiento

### 27. Que verificar en pipeline antes de merge?
`npm run build`, lint, y checks de rutas/contratos si aplica.

### 28. Cuando actualizar documentacion?
Siempre que cambien auth, rutas, seguridad, integraciones o despliegue.

### 29. Que docs deben tocarse minimo en cambios de arquitectura?
`README.md`, `docs/ARQUITECTURA-Y-OPERACION.md`, `docs/DOCUMENTACION-TECNICA-COMPLETA.md`.

### 30. Que incluir en un runbook de incidentes?
Sintoma, impacto, metricas/logs, causa raiz, mitigacion y acciones preventivas.

---

## Troubleshooting operativo rapido

### 31. Build falla por TypeScript en produccion, que hacer?
Corregir errores tipados; Next bloquea build productivo con errores TS.

### 32. Login falla solo en produccion, que revisar primero?
Variables de entorno, cookies secure/domain, captcha y origen.

### 33. Webhook de pagos no llega, que revisar?
URL publica activa, DNS/tunnel, firewall/proxy y logs del proveedor.

### 34. Correos no salen, que revisar?
SMTP credenciales, restricciones del proveedor y logs de envio.

### 35. Datos lentos en dashboard, que revisar?
Consultas SQL, indices, latencia DB y payloads de API.

### 36. Sesiones no cierran bien, que revisar?
Logout 200, limpieza cookies, revocacion jti y eliminacion `sid` en Redis.

