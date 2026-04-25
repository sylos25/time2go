# Reporte de Requerimientos No Funcionales (RNF)

Fecha: 2026-04-25  
Proyecto: Time2Go (Next.js)

## 1. Objetivo y alcance

Este documento consolida los requerimientos no funcionales tecnicos identificados en el proyecto, enfocados en:

- Seguridad
- Disponibilidad y continuidad operativa
- Rendimiento y eficiencia
- Accesibilidad tecnica
- Confiabilidad y manejo de errores
- Operacion, monitoreo y mantenibilidad

No se incluyen criterios de diseno visual.

## 2. Resumen ejecutivo

El sistema implementa una base solida de controles no funcionales en autenticacion, autorizacion, validacion de entradas y proteccion de rutas. Tambien incorpora mecanismos de continuidad (modo degradado para captcha) y controles de carga para archivos.

Principales fortalezas:

- Control de acceso por roles en middleware y APIs.
- Sesion con cookie HttpOnly + SameSite + expiracion JWT.
- Revocacion por `jti` + cancelacion de sesion activa (`sid`) en logout.
- Mitigacion de fuerza bruta en login con limites y bloqueos progresivos.
- Validaciones de payload y respuestas de error consistentes.
- Restricciones de tipo/tamano de archivos y sanitizacion de paths.
- Cabeceras de seguridad HTTP globales (incluyendo CSP) declaradas en `next.config.ts`.

Principales brechas tecnicas detectadas:

- El rate limit de login es en memoria de proceso (no distribuido).
- Monitoreo y auditoria centralizada no visibles (solo logs por consola).
- Hay mecanismos de bloqueo de teclado/navegacion que pueden impactar accesibilidad.
- No se observan SLO/SLA ni objetivos de rendimiento formalizados.

## 3. RNF identificados por categoria

## 3.1 Seguridad

### RNF-SEC-01: Control de acceso basado en roles
- Estado actual: Implementado.
- Criterio tecnico: El sistema debe restringir rutas y operaciones por rol de usuario.
- Evidencia:
  - `middleware.ts` protege rutas por patron y rol permitido.
  - `src/lib/permissions.ts` valida permisos por `id_accesibilidad` y rol.
  - Endpoints administrativos validan rol admin (por ejemplo docs privadas).

### RNF-SEC-02: Autenticacion robusta y expiracion de sesion
- Estado actual: Implementado.
- Criterio tecnico: El sistema debe autenticar via JWT firmado y rechazar tokens invalidos o expirados.
- Evidencia:
  - `src/lib/jwt.ts` firma y verifica JWT.
  - `src/app/api/login/route.ts` emite token con expiracion de 12 horas.
  - `middleware.ts` valida expiracion `exp` antes de permitir acceso.

### RNF-SEC-03: Manejo seguro de sesion en cookie
- Estado actual: Implementado.
- Criterio tecnico: El token de sesion debe poder viajar en cookie `HttpOnly` para reducir exposicion en cliente.
- Evidencia:
  - `src/app/api/login/route.ts` setea cookie `token` con `HttpOnly`, `SameSite=lax`, `Secure` en produccion.
  - `src/app/api/logout/route.ts` limpia cookies y revoca la sesion activa para impedir refresh residual.

### RNF-SEC-12: Revocacion e invalidacion de sesion en logout
- Estado actual: Implementado.
- Criterio tecnico: Al cerrar sesion debe invalidarse tanto el token como el identificador de sesion activa del usuario.
- Evidencia:
  - `src/app/api/logout/route.ts` revoca `jti` de access/refresh y llama `clearActiveSession(...)`.
  - `src/lib/active-session.ts` elimina keys v2/legacy segun `userId` y `sid`.
  - `src/lib/get-session.ts` y `src/app/api/me/route.ts` soportan lectura desde cookie.

### RNF-SEC-04: Proteccion anti-fuerza-bruta y antiabuso en login
- Estado actual: Implementado parcialmente (fortaleza local, limitacion distribuida).
- Criterio tecnico: El login debe limitar intentos por IP/credencial y aplicar bloqueos temporales.
- Evidencia:
  - `src/app/api/login/route.ts` usa limitadores por IP y por combinacion IP+email.
  - Incluye bloqueo progresivo y respuesta `429` con `Retry-After`.
- Brecha:
  - El limite vive en memoria del proceso, por lo que no comparte estado entre replicas ni sobrevive reinicios.

### RNF-SEC-05: Verificacion captcha con resiliencia
- Estado actual: Implementado.
- Criterio tecnico: El acceso debe validar captcha y soportar estrategia de contingencia del proveedor.
- Evidencia:
  - `src/app/api/login/route.ts` integra Cloudflare Turnstile.
  - Soporta modos `strict`, `degraded` y `disabled`.
  - Timeout explicito de 4 segundos al proveedor captcha.

### RNF-SEC-06: Politica de contrasenas y hashing
- Estado actual: Implementado.
- Criterio tecnico: Las contrasenas deben cumplir complejidad minima y almacenarse con hash.
- Evidencia:
  - `src/lib/auth-form-validation.ts`, `src/app/api/usuario_formulario/route.ts`, `src/app/api/change-password/route.ts` aplican complejidad (8-20, letra, numero, simbolo).
  - Hashing con `bcrypt`/`bcryptjs` antes de persistir.

### RNF-SEC-07: Validacion de correo y token de un solo uso
- Estado actual: Implementado.
- Criterio tecnico: El sistema debe validar correo con token temporal y no reutilizable.
- Evidencia:
  - `src/app/api/usuario_formulario/route.ts` genera token de validacion con expiracion.
  - `src/app/api/validate-email/route.ts` valida expiracion y marca token como usado.

### RNF-SEC-08: Validacion y saneamiento de entradas
- Estado actual: Implementado.
- Criterio tecnico: Las entradas de usuario deben validarse por formato, longitud y dominio permitido.
- Evidencia:
  - `src/app/api/events/route.ts` y `src/app/api/events/[id]/route.ts` validan contenido y rangos de negocio.
  - `src/lib/auth-form-validation.ts` sanitiza email/password y restringe dominios permitidos.

### RNF-SEC-09: Seguridad de archivos y path traversal
- Estado actual: Implementado.
- Criterio tecnico: El sistema debe validar tipo/tamano de archivos y bloquear traversal de rutas.
- Evidencia:
  - `src/app/api/events/route.ts` limita imagenes (max 8) y documentos PDF (max 5 MB).
  - `src/lib/document-storage.ts` sanitiza nombres de archivo y genera storage keys seguras.
  - `src/app/api/docs/serve/route.ts` sanitiza path y verifica que el archivo resuelto quede dentro de `public/docs`.

### RNF-SEC-10: Minimizacion de enumeracion de usuarios
- Estado actual: Implementado en flujo de reset.
- Criterio tecnico: El reset de password no debe confirmar existencia de cuenta.
- Evidencia:
  - `src/app/api/reset-password/route.ts` responde exitoso incluso cuando el correo no existe.

### RNF-SEC-11: Seguridad en documentacion interna
- Estado actual: Implementado.
- Criterio tecnico: El acceso a documentacion operativa interna debe ser solo para admin.
- Evidencia:
  - `middleware.ts` protege `/docs` para rol admin.
  - `src/app/api/docs/files/route.ts` y `src/app/api/docs/serve/route.ts` revalidan rol admin.

## 3.2 Disponibilidad y continuidad operativa

### RNF-AVA-01: Degradacion controlada ante falla de terceros
- Estado actual: Implementado.
- Criterio tecnico: Ante caida del proveedor captcha, debe existir modo de contingencia con controles antiabuso.
- Evidencia:
  - `src/app/api/login/route.ts` permite modo degradado con rate limit/bloqueo activo.

### RNF-AVA-02: Verificacion periodica de vigencia de sesion
- Estado actual: Implementado.
- Criterio tecnico: El cliente debe detectar expiracion de sesion sin depender de accion explicita del usuario.
- Evidencia:
  - `src/hooks/use-session-expiry.ts` valida `/api/me` cada 5 minutos y en cambios de visibilidad.
  - `src/components/session-monitor.tsx` muestra alerta de sesion expirada.

### RNF-AVA-03: Tolerancia basica a fallos en UI/API
- Estado actual: Implementado parcialmente.
- Criterio tecnico: Las fallas deben manejarse con codigos HTTP y mensajes controlados.
- Evidencia:
  - Multiples APIs devuelven estados 4xx/5xx consistentes.
  - Utilidades `src/lib/api-error-response.ts` y `src/lib/error-codes.ts` estandarizan errores.

## 3.3 Rendimiento y eficiencia

### RNF-PERF-01: Control de tamano de carga
- Estado actual: Implementado.
- Criterio tecnico: Deben existir limites de carga para proteger memoria, red y almacenamiento.
- Evidencia:
  - `src/app/api/events/route.ts` limita cantidad de imagenes y tamano de PDF.

### RNF-PERF-02: Caching de recursos binarios servidos
- Estado actual: Implementado.
- Criterio tecnico: Archivos multimedia/docs deben incluir directivas de cache.
- Evidencia:
  - `src/app/api/events/image/route.ts`, `src/app/api/events/document/route.ts`, `src/app/api/docs/serve/route.ts` agregan `Cache-Control`.

### RNF-PERF-03: Carga diferida en frontend
- Estado actual: Implementado.
- Criterio tecnico: El frontend debe reducir trabajo inicial con carga diferida/lazy cuando aplique.
- Evidencia:
  - `src/components/events-preview.tsx` usa `loading="lazy"` en imagenes destacadas.

### RNF-PERF-04: Timeout explicito para dependencia externa critica
- Estado actual: Implementado.
- Criterio tecnico: Integraciones externas deben tener timeout para evitar bloqueos prolongados.
- Evidencia:
  - `src/app/api/login/route.ts` aplica timeout de 4 segundos en verificacion captcha.

## 3.4 Accesibilidad tecnica

### RNF-A11Y-01: Componentes con soporte de teclado y focus visible
- Estado actual: Implementado parcialmente.
- Criterio tecnico: Los componentes interactivos deben ser operables por teclado y mostrar foco visible.
- Evidencia:
  - Libreria de UI basada en Radix (`src/components/ui/*`) incluye patrones `focus-visible`, `aria-invalid`, labels y controles accesibles.
  - `src/components/theme-toggle.tsx` usa `aria-label`.
  - Formularios usan asociaciones `Label`/`htmlFor` (por ejemplo en `src/components/register-form.tsx`).

### RNF-A11Y-02: Semantica base del documento
- Estado actual: Implementado parcialmente.
- Criterio tecnico: La app debe declarar idioma y viewport para compatibilidad de lectores/navegadores.
- Evidencia:
  - `src/app/layout.tsx` define `viewport`.
  - `src/app/layout.tsx` define `lang="en"`.
- Observacion:
  - El contenido principal de la app esta en espanol; conviene alinear `lang` con idioma real para mejorar accesibilidad.

### RNF-A11Y-03: Riesgo de bloqueo de interacciones de usuario
- Estado actual: Implementado con impacto potencial.
- Criterio tecnico: Controles de seguridad cliente no deben impedir uso legitimo de teclado/navegacion asistiva.
- Evidencia:
  - `src/components/shared/SecurityProvider.tsx` bloquea teclas DevTools, cierre/navegacion y contexto en produccion.
- Riesgo:
  - Puede afectar usuarios con tecnologia asistiva y patrones de navegacion por teclado.

## 3.5 Confiabilidad, integridad y mantenibilidad

### RNF-REL-01: Integridad transaccional en operaciones criticas
- Estado actual: Implementado en alta de usuario.
- Criterio tecnico: Operaciones de multiples tablas deben usar transacciones atomicas.
- Evidencia:
  - `src/app/api/usuario_formulario/route.ts` usa `BEGIN`, `COMMIT`, `ROLLBACK`.

### RNF-REL-02: Consistencia de errores de negocio
- Estado actual: Implementado.
- Criterio tecnico: Errores funcionales deben mapearse a codigos HTTP estables.
- Evidencia:
  - `src/lib/error-codes.ts` y `src/lib/api-error-response.ts` estandarizan codigos y status.

### RNF-REL-03: Control de acceso por doble capa (ruta + API)
- Estado actual: Implementado.
- Criterio tecnico: El backend no debe confiar solo en proteccion de frontend.
- Evidencia:
  - Se valida rol/permisos tanto en middleware como en handlers API sensibles.

## 3.6 Operacion, observabilidad y cumplimiento

### RNF-OPS-01: Trazabilidad de errores
- Estado actual: Basico.
- Criterio tecnico: Los errores deben quedar registrados para soporte operativo.
- Evidencia:
  - Uso extendido de `console.error` en APIs y frontend.
- Brecha:
  - No se observan IDs de correlacion, niveles estructurados, ni integracion visible con plataforma de observabilidad.

### RNF-OPS-02: Seguridad de informacion en caches de documentos internos
- Estado actual: Implementado.
- Criterio tecnico: Documentos internos deben servirse con cache privada cuando aplique.
- Evidencia:
  - `src/app/api/events/document/route.ts` y `src/app/api/docs/serve/route.ts` usan `Cache-Control: private`.

### RNF-OPS-03: Configuracion por entorno
- Estado actual: Implementado.
- Criterio tecnico: Secretos y modos operativos deben depender de variables de entorno.
- Evidencia:
  - JWT secret, dominio de cookie, modo Turnstile y credenciales de storage se consumen desde env vars.

## 4. Matriz resumida de cumplimiento

| Categoria | Implementado | Parcial | Brecha relevante |
|---|---:|---:|---:|
| Seguridad | 10 | 1 | 2 |
| Disponibilidad | 2 | 1 | 1 |
| Rendimiento | 4 | 0 | 2 |
| Accesibilidad tecnica | 1 | 2 | 1 |
| Confiabilidad/mantenibilidad | 3 | 0 | 1 |
| Operacion/observabilidad | 2 | 1 | 2 |

## 5. Recomendaciones tecnicas priorizadas

Prioridad alta:

1. Migrar rate limit de login a almacenamiento compartido (Redis o similar) para entornos con multiples instancias.
2. Incorporar monitoreo centralizado (logs estructurados, correlacion por request, alertas).
3. Definir objetivos operativos medibles (SLO/SLA con umbrales de latencia y disponibilidad).

Prioridad media:

1. Revisar `SecurityProvider` para evitar bloqueos que afecten accesibilidad y usabilidad legitima.
2. Endurecer cabeceras de seguridad en borde (por ejemplo HSTS segun estrategia de dominio/HTTPS).
3. Ajustar parametros de `pg.Pool` (timeouts, max conexiones, idle timeout) segun carga esperada.

Prioridad baja:

1. Alinear `lang` del documento HTML con idioma principal de contenido.
2. Agregar pruebas automatizadas especificas de RNF (authz, rate limit, archivos, regresion de errores).

## 6. Conclusion

Time2Go ya contiene una base no funcional madura en seguridad de acceso, validaciones y control de incidentes de autenticacion. Para nivel productivo robusto y escalable, el siguiente salto debe centrarse en observabilidad, seguridad HTTP de borde, y endurecimiento distribuido de controles antiabuso.
