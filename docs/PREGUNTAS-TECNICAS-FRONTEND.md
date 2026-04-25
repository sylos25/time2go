# Time2Go — Preguntas Tecnicas Frontend (Q&A)

> Ultima actualizacion: Abril 2026

---

## UI, componentes y experiencia

### 1. Que librerias de UI usa el frontend?
Tailwind CSS para estilos utilitarios y componentes basados en Radix para accesibilidad y consistencia.

### 2. Como se organiza la UI reusable?
En `src/components/`, separando partes de auth, header, dashboard y componentes `ui/*`.

### 3. Como se manejan modales y dialogos?
Con primitives de Radix (`Dialog`) envueltos en componentes propios en `src/components/ui/dialog.tsx`.

### 4. Como se evita submit accidental en botones secundarios dentro de formularios?
Definiendo `type="button"` en botones como "mostrar/ocultar contrasena".

### 5. Como se mantiene consistencia visual entre pantallas?
Mediante clases de utilidad compartidas, paleta unificada y reutilizacion de componentes base (`Button`, `Input`, `Label`, etc.).

---

## Auth en frontend

### 6. Como se estructura el flujo de autenticacion?
Con pagina `/auth` y modal de auth segun contexto, ambos consumiendo hooks y APIs de sesion.

### 7. Como se evita perder redireccion post-login?
Conservando `redirect` en query params entre pasos de auth (`choice/login/register`).

### 8. Donde vive la logica del formulario de login?
En `use-login-form.ts` (estado, submit, captcha, errores y banderas de UX).

### 9. Como se muestra captcha en login?
Con `@marsidev/react-turnstile` y manejo de token/errores en cliente.

### 10. Como se maneja mensaje de errores de login?
Se categorizan por tipo (correo no validado, cuenta baneada, credenciales invalidas, error de red).

---

## Header, sesion y navegacion

### 11. Como sabe el header si el usuario esta autenticado?
Con `useHeaderSession`, que sincroniza `localStorage`, consulta `/api/me` y refresca sesion si aplica.

### 12. Como se decide mostrar "Crear Evento" o "Dashboard"?
Por permisos/rol via `usePermission` y datos de sesion.

### 13. Que hace "Cerrar sesion" en frontend?
Dispara flujo de logout y limpia estado local; el backend invalida cookies/token/sesion activa.

### 14. Como se evita estado inconsistente entre pestañas?
Escuchando eventos de `storage` y eventos custom de login/logout.

### 15. Como se gestiona sesion reemplazada?
Se detecta por codigo especifico y se redirige al flujo de autenticacion con notificacion.

---

## Carruseles y listados visuales

### 16. Que se usa para carruseles de eventos?
Swiper (`swiper/react`) con modulos de navigation, pagination y autoplay.

### 17. Como arranca centrado el carrusel?
Con `centeredSlides={true}`.

### 18. Que pasa si hay pocos eventos para loop?
Se repiten items hasta completar un minimo visual.

### 19. Ese minimo es fijo?
No, es dinamico por ancho de pantalla (movil/tablet/desktop).

### 20. Como se optimiza carga visual en cards?
Con `loading="lazy"` en imagenes y transiciones limitadas.

---

## Rendimiento frontend

### 21. Que mejora reciente acelera entorno de desarrollo?
Uso de Turbopack por defecto en `npm run dev`.

### 22. Como reducir trabajo de imports pesados?
Con `optimizePackageImports` en `next.config.ts`.

### 23. Como evitar type-check excesivo?
Acotando `include` en `tsconfig.json`.

### 24. Como detectar cuellos de botella visuales?
Inspeccion de render, peso de imagenes y costo de componentes interactivos.

### 25. Como prevenir re-renders innecesarios en listas?
Uso de claves estables y memorizar derivados con `useMemo` cuando aporta.

---

## Accesibilidad y UX tecnica

### 26. Como se garantiza etiquetado de campos?
Con `Label htmlFor` + `id` consistente en inputs.

### 27. Como se mejora usabilidad de formularios largos?
Mensajes de error claros y validacion progresiva por campo.

### 28. Que riesgos UX existen en bloqueos de teclado globales?
Puede afectar accesibilidad si se bloquean atajos/acciones legitimas.

### 29. Como alinear idioma tecnico con lectores de pantalla?
Ajustando `lang` del layout al idioma principal del contenido.

### 30. Que validar antes de cerrar un cambio de UI?
Responsive, foco/teclado, estados de error, coherencia visual y no regresion funcional.

