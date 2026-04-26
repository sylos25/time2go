# Matriz de Objetos SQL PostgreSQL

Este documento inventaría los objetos PostgreSQL definidos en los scripts de Time2Go y su uso efectivo desde la aplicación. El conteo se hizo sobre objetos únicos, excluyendo duplicados presentes en el consolidado `scripts SQL/insert_fun_triggers.sql`.

## !1. Resumen ejecutivo

| Tipo de objeto | Cantidad | Observaciones |
|---|---:|---|
| Funciones PostgreSQL únicas | 15 | 11 de negocio/API y 4 de trigger |
| Triggers | 28 | 26 de actualización de timestamp y 2 de ID público |
| Procedures | 0 | No hay `CREATE PROCEDURE` |
| Views | 0 | No hay `CREATE VIEW` ni `CREATE MATERIALIZED VIEW` |
| Event triggers | 0 | No hay `CREATE EVENT TRIGGER` |
| Rules / Jobs | 0 | No hay `CREATE RULE`, `pg_cron` ni jobs explícitos |
| Tipos ENUM | 2 | `tip_doc`, `rec_cont` |
| Schemas | 1 | `app_api` |
| Extensiones | 1 | `pgcrypto` |
| Índices explícitos | 1 | `uq_suscripcion_organizador_activa` |
| Columnas `GENERATED ALWAYS AS IDENTITY` | 26 | Generan secuencias implícitas administradas por PostgreSQL |

## 2. Matriz de funciones PostgreSQL

### 2.1 Funciones de negocio y acceso a datos

| Función | Esquema | Archivo fuente | Tipo | Usada desde la app | Punto de uso detectado |
|---|---|---|---|---|---|
| `fn_auth_crear_usuario` | `app_api` | `scripts SQL/funciones/fn_auth_crear_usuario.sql` | negocio | Sí | `src/app/api/auth/route.ts` |
| `fn_error_catalogo` | `app_api` | `scripts SQL/funciones/fn_error_catalogo.sql` | soporte de errores | No directo | No se detectó invocación en `src/` |
| `fn_evento_crear` | `app_api` | `scripts SQL/funciones/fn_evento_crear.sql` | negocio | Sí | `src/app/api/events/route.ts`, `src/app/api/events/[id]/route.ts` |
| `fn_evento_actualizar` | `app_api` | `scripts SQL/funciones/fn_evento_actualizar.sql` | negocio | No directo | No se detectó invocación en `src/` |
| `fn_eventos_listar_json` | `app_api` | `scripts SQL/funciones/fn_eventos_listar_json.sql` | consulta JSON | Sí | `src/app/api/events/route.ts`, `src/app/api/events/[id]/route.ts` |
| `fn_listar_usuarios_paginado_json` | `public` | `scripts SQL/funciones/fn_listar_usuarios_paginado_json.sql` | consulta JSON | Sí | `src/app/api/usuarios/lib/usuarios-repository.ts` |
| `fn_valoraciones_obtener` | `app_api` | `scripts SQL/funciones/fn_valoraciones_obtener.sql` | consulta | Sí | `src/app/api/mis-valoraciones/lib/mis-valoraciones-repository.ts` |
| `fn_valoraciones_obtener_por_id` | `app_api` | `scripts SQL/funciones/fn_valoraciones_obtener.sql` | consulta | Sí | `src/app/api/mis-valoraciones/lib/mis-valoraciones-repository.ts` |
| `fn_valoraciones_crear` | `app_api` | `scripts SQL/funciones/fn_valoraciones_obtener.sql` | negocio | Sí | `src/app/api/mis-valoraciones/lib/mis-valoraciones-repository.ts` |
| `fn_valoraciones_actualizar` | `app_api` | `scripts SQL/funciones/fn_valoraciones_obtener.sql` | negocio | Sí | `src/app/api/mis-valoraciones/lib/mis-valoraciones-repository.ts` |
| `fn_valoraciones_eliminar` | `app_api` | `scripts SQL/funciones/fn_valoraciones_obtener.sql` | negocio | Sí | `src/app/api/mis-valoraciones/lib/mis-valoraciones-repository.ts` |

### 2.2 Funciones de trigger

| Función | Archivo fuente | Retorno | Trigger asociado | Estado |
|---|---|---|---|---|
| `fun_actualiza_fecha` | `scripts SQL/triggers/trigger_actualiza_fecha.sql` | `TRIGGER` | Sí, 26 triggers `trig_update_*` | Activa |
| `generar_id_publico` | `scripts SQL/triggers/trigger_id_publico.sql` | `TRIGGER` | Sí, `trg_generar_id_publico` | Activa |
| `generar_id_publico_evento` | `scripts SQL/triggers/trigger_id_publico_evento.sql` | `TRIGGER` | Sí, `trg_generar_id_publico_evento` | Activa |
| `fun_registrar_auditoria` | `scripts SQL/triggers/fun_registrar_auditoria.sql` | `TRIGGER` | No se detectó `CREATE TRIGGER` asociado en scripts | Definida pero no conectada |

## 3. Matriz de triggers

### 3.1 Triggers de timestamp automático

Todos están definidos en `scripts SQL/triggers/trigger_actualiza_fecha.sql` y ejecutan `fun_actualiza_fecha()`.

| Trigger | Tabla |
|---|---|
| `trig_update_tabla_paises` | `tabla_paises` |
| `trig_update_tabla_departamentos` | `tabla_departamentos` |
| `trig_update_tabla_municipios` | `tabla_municipios` |
| `trig_update_tabla_tipo_sitios` | `tabla_tipo_sitios` |
| `trig_update_tabla_sitios` | `tabla_sitios` |
| `trig_update_tabla_sitios_telefonos` | `tabla_sitios_telefonos` |
| `trig_update_tabla_tipo_infraestructura_discapacitados` | `tabla_tipo_infraestructura_discapacitados` |
| `trig_update_tabla_sitios_discapacitados` | `tabla_sitios_discapacitados` |
| `trig_update_tabla_roles` | `tabla_roles` |
| `trig_update_tabla_usuarios` | `tabla_usuarios` |
| `trig_update_tabla_usuarios_credenciales` | `tabla_usuarios_credenciales` |
| `trig_update_tabla_accesibilidad_menu` | `tabla_accesibilidad_menu` |
| `trig_update_tabla_accesibilidad_menu_x_rol` | `tabla_accesibilidad_menu_x_rol` |
| `trig_update_tabla_baneados` | `tabla_baneados` |
| `trig_update_tabla_categoria_eventos` | `tabla_categoria_eventos` |
| `trig_update_tabla_tipo_eventos` | `tabla_tipo_eventos` |
| `trig_update_tabla_eventos` | `tabla_eventos` |
| `trig_update_tabla_eventos_telefonos` | `tabla_eventos_telefonos` |
| `trig_update_tabla_evento_informacion_importante` | `tabla_evento_informacion_importante` |
| `trig_update_tabla_imagenes_eventos` | `tabla_imagenes_eventos` |
| `trig_update_tabla_cambio_rol_usuario` | `tabla_cambio_rol_usuario` |
| `trig_update_tabla_valoraciones` | `tabla_valoraciones` |
| `trig_update_tabla_reserva_eventos` | `tabla_reserva_eventos` |
| `trig_update_tabla_reserva_asistentes` | `tabla_reserva_asistentes` |
| `trig_update_tabla_boleteria` | `tabla_boleteria` |
| `trig_update_tabla_links` | `tabla_links` |

### 3.2 Triggers de identificador público

| Trigger | Tabla | Momento | Función ejecutada | Archivo |
|---|---|---|---|---|
| `trg_generar_id_publico` | `tabla_usuarios` | `BEFORE INSERT` | `generar_id_publico()` | `scripts SQL/triggers/trigger_id_publico.sql` |
| `trg_generar_id_publico_evento` | `tabla_eventos` | `BEFORE INSERT` | `generar_id_publico_evento()` | `scripts SQL/triggers/trigger_id_publico_evento.sql` |

## 4. Otros objetos PostgreSQL

### 4.1 Tipos ENUM

| Tipo | Valores | Archivo |
|---|---|---|
| `tip_doc` | `Tarjeta de Identidad`, `Cédula de Ciudadanía`, `Cédula de Extranjería`, `Pasaporte` | `scripts SQL/DDL Time2Go.SQL` |
| `rec_cont` | `Pendiente`, `Caducado`, `Validado` | `scripts SQL/DDL Time2Go.SQL` |

### 4.2 Schema, extensión e índice explícito

| Objeto | Nombre | Archivo |
|---|---|---|
| Schema | `app_api` | `scripts SQL/DDL Time2Go.SQL` |
| Extensión | `pgcrypto` | `scripts SQL/DDL Time2Go.SQL` |
| Índice único parcial | `uq_suscripcion_organizador_activa` | `scripts SQL/DDL Time2Go.SQL` |

### 4.3 Identidades y secuencias implícitas

El DDL define 26 columnas con `GENERATED ALWAYS AS IDENTITY`. PostgreSQL crea y administra de forma implícita su secuencia asociada, aunque no exista `CREATE SEQUENCE` explícito en los scripts.

## 5. Hallazgos operativos

| Hallazgo | Impacto |
|---|---|
| Existe duplicación de definiciones en `scripts SQL/insert_fun_triggers.sql` respecto a `scripts SQL/funciones/` y `scripts SQL/triggers/`. | El conteo del documento usa objetos únicos, no líneas duplicadas. |
| `fun_registrar_auditoria()` existe como función trigger, pero no se detectó un `CREATE TRIGGER` que la conecte a tablas en los scripts revisados. | La auditoría automática no quedaría activa solo con los scripts actuales, salvo que se cree fuera del repositorio. |
| La aplicación invoca directamente 9 funciones SQL desde `src/`. | Son las funciones críticas a mantener sincronizadas entre DB y API. |
| No hay `CREATE PROCEDURE`, `CREATE VIEW`, `CREATE MATERIALIZED VIEW`, `CREATE EVENT TRIGGER` ni jobs `pg_cron`. | El modelo SQL actual se apoya en tablas, funciones y triggers. |

## 6. Archivos base revisados

- `scripts SQL/DDL Time2Go.SQL`
- `scripts SQL/insert_fun_triggers.sql`
- `scripts SQL/funciones/*.sql`
- `scripts SQL/triggers/*.sql`
- `src/app/api/auth/route.ts`
- `src/app/api/events/route.ts`
- `src/app/api/events/[id]/route.ts`
- `src/app/api/usuarios/lib/usuarios-repository.ts`
- `src/app/api/mis-valoraciones/lib/mis-valoraciones-repository.ts`