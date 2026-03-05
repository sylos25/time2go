/*
|------------------------------------------------------------------------------------|
| DDL Time2Go                                                                       |
| AUTORES : BRAYHAN ORDUZ Y WILLIAM ROJAS                                           |
| FECHA   : 2025-07-06                                                              |
| DESCRIPCION: Script de creacion de tablas y relaciones para la aplicacion Time2Go |
|------------------------------------------------------------------------------------|
*/
-- BORRADO TABLAS
DROP TABLE IF EXISTS tabla_validacion_email_tokens;
DROP TABLE IF EXISTS tabla_reserva_asistentes;
DROP TABLE IF EXISTS tabla_reserva_eventos;
DROP TABLE IF EXISTS tabla_eventos_telefonos;
DROP TABLE IF EXISTS tabla_sitios_telefonos;
DROP TABLE IF EXISTS tabla_auditoria_pk;
DROP TABLE IF EXISTS tabla_auditoria_detalle;
DROP TABLE IF EXISTS tabla_auditoria_bd;
DROP TABLE IF EXISTS tabla_links;
DROP TABLE IF EXISTS tabla_evento_informacion_importante;
DROP TABLE IF EXISTS tabla_valores;
DROP TABLE IF EXISTS tabla_categoria_boletos;
DROP TABLE IF EXISTS tabla_valoraciones;
DROP TABLE IF EXISTS tabla_imagenes_eventos;
DROP TABLE IF EXISTS tabla_documentos_eventos;
DROP TABLE IF EXISTS tabla_eventos_x_dias;
DROP TABLE IF EXISTS tabla_eventos;
DROP TABLE IF EXISTS tabla_tipo_eventos;
DROP TABLE IF EXISTS tabla_categoria_eventos;
DROP TABLE IF EXISTS tabla_baneados;
DROP TABLE IF EXISTS tabla_usuarios_credenciales;
DROP TABLE IF EXISTS tabla_personas;
DROP TABLE IF EXISTS tabla_usuarios;
DROP TABLE IF EXISTS tabla_roles;
DROP TABLE IF EXISTS tabla_sitios_disc;
DROP TABLE IF EXISTS tabla_tipo_infraest_disc;
DROP TABLE IF EXISTS tabla_sitios;
DROP TABLE IF EXISTS tabla_tipo_sitios;
DROP TABLE IF EXISTS tabla_municipios;
DROP TABLE IF EXISTS tabla_departamentos;
DROP TABLE IF EXISTS tabla_paises;

-- CREACION DE TIPOS ENUM
CREATE TYPE tip_doc AS ENUM ('Cédula de Ciudadanía', 'Cédula de Extranjería', 'Pasaporte');

-- Primero cargar la extension de pgcrypto.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CREACION DE TABLAS
CREATE TABLE IF NOT EXISTS tabla_paises (
    id_pais                                  INT                          PRIMARY KEY,
    nombre_pais                              VARCHAR                      NOT NULL       CHECK (char_length(nombre_pais) >= 3),
    fecha_creacion                           TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                      TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_departamentos (
    id_departamento                          INT                          PRIMARY KEY,
    nombre_departamento                      VARCHAR                      NOT NULL       CHECK (char_length(nombre_departamento) >= 4),
    id_pais                                  INT                          NOT NULL,
    fecha_creacion                           TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                      TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pais)                                REFERENCES       tabla_paises(id_pais)
);

CREATE TABLE IF NOT EXISTS tabla_municipios (
    id_departamento                          INT                          NOT NULL,
    id_municipio                             INT                          PRIMARY KEY,
    nombre_municipio                         VARCHAR                      NOT NULL        CHECK (char_length(nombre_municipio) >= 3),
    distrito                                 BOOLEAN                      NOT NULL,
    area_metropolitana                       BOOLEAN                      NOT NULL,
    fecha_creacion                           TIMESTAMP   WITH TIME ZONE   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                      TIMESTAMP   WITH TIME ZONE                   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_departamento)                        REFERENCES       tabla_departamentos(id_departamento)
);

CREATE TABLE IF NOT EXISTS tabla_tipo_sitios (
    id_tipo_sitio                            INT                          PRIMARY KEY,
    nombre_tipo_sitio                        VARCHAR                      NOT NULL       UNIQUE  CHECK (char_length(nombre_tipo_sitio) >= 4),
    fecha_creacion                           TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                      TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_sitios (
    id_sitio                                 INT                          PRIMARY KEY,   
    nombre_sitio                             VARCHAR                      NOT NULL                CHECK (char_length(nombre_sitio) >= 3),
    id_tipo_sitio                            INT                          NOT NULL,
    acceso_discapacidad                      BOOLEAN                      NOT NULL       DEFAULT  FALSE,
    id_municipio                             INT                          NOT NULL,
    direccion                                VARCHAR                      NOT NULL       UNIQUE   CHECK (char_length(direccion) >= 6),
    latitud                                  VARCHAR                      NOT NULL       UNIQUE,
    longitud                                 VARCHAR                      NOT NULL       UNIQUE,
    sitio_web                                VARCHAR                                     UNIQUE,
    fecha_creacion                           TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT  CURRENT_TIMESTAMP,
    fecha_actualizacion                      TIMESTAMP   WITH TIME ZONE                  DEFAULT  CURRENT_TIMESTAMP,
    FOREIGN KEY (id_municipio)                           REFERENCES       tabla_municipios(id_municipio)
);

CREATE TABLE IF NOT EXISTS tabla_sitios_telefonos (
    id_sitio_telefono                        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_sitio                                 INT                          NOT NULL,
    telefono                                 DECIMAL(10,0)                NOT NULL       UNIQUE   CHECK (telefono > 2999999999),
    es_principal                             BOOLEAN                      NOT NULL       DEFAULT FALSE,
    fecha_creacion                           TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                      TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sitio)                               REFERENCES       tabla_sitios(id_sitio)
);

CREATE TABLE IF NOT EXISTS tabla_tipo_infraestructura_discapacitados (
    id_infraestructura_discapacitados       INT                          PRIMARY KEY,
    nombre_infraestructura_discapacitados   VARCHAR                      NOT NULL       UNIQUE   CHECK (char_length(nombre_infraestructura_discapacitados) >= 4),
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT  CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT  CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_sitios_discapacitados (
    id_sitios_discapacitados                INT         PRIMARY KEY,
    id_sitio                                INT                          NOT NULL,
    id_infraestructura_discapacitados       INT                          NOT NULL,
    descripcion                             TEXT                         NOT NULL       CHECK (char_length(descripcion) >= 10),
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_infraestructura_discapacitados) REFERENCES tabla_tipo_infraestructura_discapacitados(id_infraestructura_discapacitados)
);

CREATE TABLE IF NOT EXISTS tabla_roles (
    id_rol                                  INT                          PRIMARY KEY,   
    nombre_rol                              VARCHAR                      NOT NULL       UNIQUE  CHECK (char_length(nombre_rol) >= 3),
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_usuarios (
	id_usuario                              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_publico                              VARCHAR                      NOT NULL       UNIQUE,
    id_rol                                  INT                          NOT NULL       DEFAULT 1,
    terminos_condiciones                    BOOLEAN                      NOT NULL,
    estado                                  BOOLEAN                      NOT NULL       DEFAULT TRUE,
    fecha_registro                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    fecha_desactivacion                     TIMESTAMP   WITH TIME ZONE,
    FOREIGN KEY (id_rol)                                REFERENCES       tabla_roles(id_rol)
);

CREATE TABLE IF NOT EXISTS tabla_personas (
    id_usuario                              INT                          PRIMARY KEY,
    nombres                                 VARCHAR(30)                                 CHECK (char_length(nombres) >= 3),
    apellidos                               VARCHAR(30)                                 CHECK (char_length(apellidos) >= 3),
    id_pais                                 INT,
    telefono                                DECIMAL(10,0)                               UNIQUE  CHECK (telefono > 2999999999),
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)                            REFERENCES       tabla_usuarios(id_usuario),
    FOREIGN KEY (id_pais)                               REFERENCES       tabla_paises(id_pais)
);

CREATE TABLE IF NOT EXISTS tabla_usuarios_credenciales (
    id_usuario                              INT                          PRIMARY KEY,
    id_google                               VARCHAR                                     UNIQUE,
    correo                                  VARCHAR                      NOT NULL       UNIQUE  CHECK (char_length(correo) >= 14),
    contrasena_hash                         VARCHAR,
    validacion_correo                       BOOLEAN                      NOT NULL       DEFAULT FALSE,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)                            REFERENCES       tabla_usuarios(id_usuario)
);

CREATE TABLE tabla_favoritos (
    id_favorito    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario     INT NOT NULL UNIQUE,
    id_evento      INT NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(id_usuario),
    FOREIGN KEY (id_evento)  REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_auditoria_bd (
    id_auditoria                            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tabla                                   VARCHAR                      NOT NULL,
    operacion                               VARCHAR(10)                  NOT NULL,
    id_usuario_app                          INT,
    usuario_bd                              VARCHAR                      NOT NULL        DEFAULT CURRENT_USER,
    fecha_evento                            TIMESTAMP   WITH TIME ZONE   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_operacion_auditoria CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    CONSTRAINT fk_auditoria_usuario_app FOREIGN KEY (id_usuario_app) REFERENCES tabla_usuarios(id_usuario) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tabla_auditoria_pk (
    id_auditoria                            BIGINT                       NOT NULL,
    columna_pk                              VARCHAR                      NOT NULL,
    valor_pk                                TEXT                         NOT NULL,
    PRIMARY KEY (id_auditoria, columna_pk),
    FOREIGN KEY (id_auditoria)                          REFERENCES       tabla_auditoria_bd(id_auditoria)
);

CREATE TABLE IF NOT EXISTS tabla_auditoria_detalle (
    id_auditoria_detalle                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_auditoria                            BIGINT                       NOT NULL,
    columna                                 VARCHAR                      NOT NULL,
    valor_anterior                          TEXT,
    valor_nuevo                             TEXT,
    FOREIGN KEY (id_auditoria)                          REFERENCES       tabla_auditoria_bd(id_auditoria)
);

CREATE TABLE IF NOT EXISTS tabla_validacion_email_tokens (
    id_token                                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario                              INT                          NOT NULL,
    token                                   VARCHAR                      NOT NULL        UNIQUE,
    utilizado                               BOOLEAN                      NOT NULL        DEFAULT FALSE,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion                        TIMESTAMP   WITH TIME ZONE   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_validacion                        TIMESTAMP   WITH TIME ZONE,
    FOREIGN KEY (id_usuario)                            REFERENCES       tabla_usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS tabla_accesibilidad_menu (
    id_accesibilidad                        INT                          PRIMARY KEY,
    nombre_accesibilidad                    VARCHAR                      NOT NULL        UNIQUE  CHECK (char_length(nombre_accesibilidad) >= 3),
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                   DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_accesibilidad_menu_x_rol (
    id_accesibilidad_menu_x_rol             INT                          PRIMARY KEY,
    id_accesibilidad                        INT                          NOT NULL,
    id_rol                                  INT                          NOT NULL,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_accesibilidad)                      REFERENCES       tabla_accesibilidad_menu(id_accesibilidad),
    FOREIGN KEY (id_rol)                                REFERENCES       tabla_roles(id_rol)
);


CREATE TABLE IF NOT EXISTS tabla_baneados (
    id_ban                                  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario                              INT                          NOT NULL,
    motivo_ban                              TEXT                         NOT NULL        CHECK (char_length(motivo_ban) >= 10),
    inicio_ban                              TIMESTAMP                    NOT NULL,
    fin_ban                                 TIMESTAMP                    NOT NULL,
    responsable                             INT                          NOT NULL,
    fecha_registro                          TIMESTAMP   WITH TIME ZONE   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)                            REFERENCES       tabla_usuarios(id_usuario),
    FOREIGN KEY (responsable)                           REFERENCES       tabla_usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS tabla_categoria_eventos (
    id_categoria_evento                     INT                          PRIMARY KEY,   
    nombre                                  VARCHAR                      NOT NULL       UNIQUE CHECK (char_length(nombre) >= 3),
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_tipo_eventos (
    id_tipo_evento                          INT                          PRIMARY KEY,
    id_categoria_evento                     INT                          NOT NULL,
    nombre                                  VARCHAR                      NOT NULL       UNIQUE CHECK (char_length(nombre) >= 3),
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria_evento)                   REFERENCES       tabla_categoria_eventos(id_categoria_evento)
);

CREATE TABLE IF NOT EXISTS tabla_eventos (
    id_evento                               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_publico_evento                       VARCHAR                      NOT NULL       UNIQUE,
    pulep_evento                            VARCHAR                                     UNIQUE  CHECK (char_length(pulep_evento) >= 6),   
    nombre_evento                           VARCHAR                      NOT NULL       CHECK (char_length(nombre_evento) >= 6),
    responsable_evento                      VARCHAR                      NOT NULL       CHECK (char_length(responsable_evento) >= 6),
    id_usuario                              INT                          NOT NULL,                                                   -- ID del usuario que crea el evento.
    id_categoria_evento                     INT                          NOT NULL,
    id_tipo_evento                          INT                          NOT NULL,
    id_sitio                                INT                          NOT NULL,                                                   -- ID del lugar (dentro del municipio) donde se realiza el evento.
    descripcion                             TEXT                         NOT NULL       CHECK (char_length(descripcion) >= 10),
    fecha_inicio                            DATE                         NOT NULL,
    fecha_fin                               DATE                         NOT NULL,   
    hora_inicio                             TIME                         NOT NULL,
    hora_final                              TIME                         NOT NULL,
    gratis_pago                             BOOLEAN                      NOT NULL       DEFAULT FALSE,                              -- FALSE: GRATIS and TRUE: PAGO.
    cupo                                    INT                          NOT NULL       DEFAULT 0 CHECK (cupo >= 0),                -- Numero de invitados (No debe ser menor a 0 y mayor a 5000).
    reservar_anticipado                     BOOLEAN                      NOT NULL       DEFAULT FALSE,                              -- FALSE: No requiere reserva anticipada and TRUE: Requiere reserva anticipada.
    estado                                  BOOLEAN                      NOT NULL       DEFAULT FALSE,                              -- FALSE: Pendiente por validar and TRUE: Aprobado.
    motivo_rechazo                          TEXT,                                                                                   -- Detalle del motivo de rechazo en caso de que el evento sea rechazado por un moderador o administrador.
    rechazo_por                             INT,                                                                                    -- ID del usuario que rechaza el evento. Debe ser un moderador o administrador.
    destacado                               BOOLEAN                      NOT NULL       DEFAULT FALSE,                              -- FALSE: No destacado and TRUE: Destacado.
    destacado_por                           INT,                                                                                    -- ID del usuario que destaca el evento. Debe ser un moderador o administrador.
    fecha_destacado                         TIMESTAMP   WITH TIME ZONE,                                                             -- Fecha en la que se destacó el evento.
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    fecha_desactivacion                     TIMESTAMP   WITH TIME ZONE,
    FOREIGN KEY (id_usuario)                            REFERENCES       tabla_usuarios(id_usuario),
    FOREIGN KEY (rechazo_por)                           REFERENCES       tabla_usuarios(id_usuario),
    FOREIGN KEY (destacado_por)                         REFERENCES       tabla_usuarios(id_usuario),
    FOREIGN KEY (id_tipo_evento)                        REFERENCES       tabla_tipo_eventos(id_tipo_evento),
    FOREIGN KEY (id_categoria_evento)                   REFERENCES       tabla_categoria_eventos(id_categoria_evento),
    FOREIGN KEY (id_sitio)                              REFERENCES       tabla_sitios(id_sitio)
);

CREATE TABLE IF NOT EXISTS tabla_eventos_telefonos (
    id_evento_telefono                       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_evento                                INT                          NOT NULL,
    telefono                                 DECIMAL(10,0)                NOT NULL       CHECK (telefono > 2999999999),
    es_principal                             BOOLEAN                      NOT NULL       DEFAULT FALSE,
    fecha_creacion                           TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                      TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_evento_telefono UNIQUE (id_evento, telefono),
    FOREIGN KEY (id_evento)                  REFERENCES  tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_evento_informacion_importante (
    id_evento_info_item                     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_evento                               INT                          NOT NULL       UNIQUE,
    detalle                                 TEXT                         NOT NULL       CHECK (char_length(detalle) >= 5),
    obligatorio                             BOOLEAN                      NOT NULL       DEFAULT FALSE,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento)                             REFERENCES       tabla_eventos(id_evento)
);


CREATE TABLE IF NOT EXISTS tabla_imagenes_eventos (
    id_imagen_evento                        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    url_imagen_evento                       VARCHAR                      NOT NULL       UNIQUE,
    id_evento                               INT                          NOT NULL,
    storage_provider                        VARCHAR                      NOT NULL       DEFAULT 'legacy_url',
    storage_key                             TEXT,
    mime_type                               VARCHAR                      NOT NULL       DEFAULT 'image/jpeg',
    bytes                                   BIGINT,
    original_filename                       VARCHAR,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento)                 REFERENCES  tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_documentos_eventos (
    id_documento_evento                     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    url_documento_evento                    VARCHAR                      NOT NULL       UNIQUE,
    id_evento                               INT                          NOT NULL       UNIQUE,
    storage_provider                        VARCHAR                      NOT NULL       DEFAULT 'legacy_url',
    storage_key                             TEXT,
    mime_type                               VARCHAR                      NOT NULL       DEFAULT 'application/pdf',
    bytes                                   BIGINT,
    original_filename                       VARCHAR,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento)                 REFERENCES  tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_documentos_usuarios (
    id_documento_usuario                    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    url_documento_usuario                   VARCHAR                      NOT NULL       UNIQUE,
    id_usuario                              INT                          NOT NULL       UNIQUE,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)                REFERENCES  tabla_usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS tabla_valoraciones (
    id_valoracion                           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario                              INT                       	 NOT NULL      UNIQUE,
    id_evento                               INT                          NOT NULL      UNIQUE,
    valoracion                              INT                          NOT NULL       CHECK (valoracion BETWEEN 1 AND 5),
    comentario                              VARCHAR,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)                REFERENCES  tabla_usuarios(id_usuario),
    FOREIGN KEY (id_evento)                 REFERENCES  tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_reserva_eventos (
    id_reserva_evento                       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario                              INT                      	 NOT NULL,
    id_evento                               INT                          NOT NULL,
    tipo_documento                          tip_doc                      NOT NULL,
    numero_documento                        VARCHAR                      NOT NULL,
    cuantos_asistiran                       INT                          NOT NULL        CHECK (cuantos_asistiran > 0 AND cuantos_asistiran <= 4),
    fecha_reserva                           TIMESTAMP                    NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    estado                                  BOOLEAN                      NOT NULL        DEFAULT 'TRUE',
    fecha_actualizacion                     TIMESTAMP                    NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_reserva_usuario_evento    UNIQUE (id_usuario, id_evento),
    FOREIGN KEY (id_usuario)                REFERENCES  tabla_usuarios(id_usuario),
    FOREIGN KEY (id_evento)                 REFERENCES  tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_reserva_asistentes (
    id_reserva_asistente                     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reserva_evento                        INT                          NOT NULL,
    nombre_asistente                         VARCHAR                      NOT NULL        CHECK (char_length(nombre_asistente) >= 3),
    tipo_documento                           tip_doc,
    numero_documento                         VARCHAR,
    fecha_creacion                           TIMESTAMP   WITH TIME ZONE   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                      TIMESTAMP   WITH TIME ZONE                   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_reserva_asistente_doc UNIQUE (id_reserva_evento, numero_documento),
    FOREIGN KEY (id_reserva_evento)          REFERENCES  tabla_reserva_eventos(id_reserva_evento)
);

CREATE TABLE IF NOT EXISTS tabla_boleteria (
    id_boleto                               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_evento                               INT                          NOT NULL,
    nombre_boleto                           VARCHAR                      NOT NULL        CHECK (char_length(nombre_boleto) >= 3),
    precio_boleto                           DECIMAL(9,2)                 NOT NULL        CHECK (precio_boleto >= 0),
    servicio                                DECIMAL(9,2),
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento)                 REFERENCES  tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_links (
    id_link                                 INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_evento                               INT                          NOT NULL,
    link                                    TEXT                         NOT NULL,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento)                 REFERENCES  tabla_eventos(id_evento)
);


--TRIGGER ACT FECHAS
CREATE OR REPLACE FUNCTION fun_actualiza_fecha()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_paises BEFORE UPDATE ON tabla_paises
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_departamentos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_municipios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_tipo_sitios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_sitios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_sitios_telefonos BEFORE UPDATE ON tabla_sitios_telefonos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_tipo_infraestructura_discapacitados
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_sitios_discapacitados
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_roles
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_usuarios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_personas
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_usuarios_credenciales
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_validacion_email_tokens
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_accesibilidad_menu
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_accesibilidad_menu_x_rol
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_baneados
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_categoria_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_tipo_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_eventos BEFORE UPDATE ON tabla_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_eventos_telefonos BEFORE UPDATE ON tabla_eventos_telefonos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_imagenes_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_documentos_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_documentos_usuarios BEFORE UPDATE ON tabla_documentos_usuarios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_valoraciones
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_reserva_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_reserva_asistentes BEFORE UPDATE ON tabla_reserva_asistentes
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_boleteria
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_links
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_evento_info_items BEFORE UPDATE ON tabla_evento_informacion_importante
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

-- Trigger para crear id_publico en la tabla usuarios.
CREATE OR REPLACE FUNCTION generar_id_publico()
RETURNS TRIGGER AS $$
BEGIN
  NEW.id_publico :=
    substring(encode(digest(NEW.id_usuario::text, 'sha256'), 'hex') from 1 for 12);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generar_id_publico BEFORE INSERT ON tabla_usuarios
FOR EACH ROW EXECUTE FUNCTION generar_id_publico();


-- Trigger para crear id_publico_evento en la tabla eventos.
CREATE OR REPLACE FUNCTION generar_id_publico_evento()
RETURNS TRIGGER AS $$
BEGIN
  NEW.id_publico_evento :=
    substring(encode(digest(NEW.id_evento::text, 'sha256'), 'hex') from 1 for 12);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generar_id_publico BEFORE INSERT ON tabla_eventos
FOR EACH ROW EXECUTE FUNCTION generar_id_publico_evento();

-- Cargar en tabla_roles.
INSERT INTO tabla_roles VALUES  (1,'Usuario');
INSERT INTO tabla_roles VALUES  (2,'Promotor');
INSERT INTO tabla_roles VALUES  (3,'Moderador');
INSERT INTO tabla_roles VALUES  (4,'Administrador');

-- Cargar en tabla_accesibilidad_menu.
INSERT INTO tabla_accesibilidad_menu VALUES (1, 'Crear Evento', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (2, 'Gestionar Reservas', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (3, 'Gestionar Eventos', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (4, 'Ver Dashboard', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (5, 'Agregar Data', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (6, 'Editar Data', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (7, 'Eliminar Data', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (8, 'Gestionar Usuarios', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (9, 'Gestionar Roles', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (10, 'Gestionar Accesibilidad al Sistema', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (11, 'Gestionar Baneados', NOW(), NOW());


-- Cargar en tabla_accesibilidad_menu_x_rol.
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (1, 1, 2, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (2, 1, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (3, 1, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (4, 2, 2, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (5, 2, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (6, 2, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (7, 3, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (8, 4, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (9, 4, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (10, 5, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (11, 5, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (12, 6, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (13, 6, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (14, 7, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (15, 8, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (16, 9, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (17, 10, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (18, 11, 4, NOW(), NOW());


-- Cargar en tabla_usuarios.
INSERT INTO tabla_usuarios (id_rol, terminos_condiciones, estado, fecha_registro, fecha_actualizacion, fecha_desactivacion)
    VALUES (1, TRUE, TRUE, NOW(), NOW(), NOW());
INSERT INTO tabla_usuarios (id_rol, terminos_condiciones, estado, fecha_registro, fecha_actualizacion, fecha_desactivacion)
    VALUES (2, TRUE, TRUE, NOW(), NOW(), NOW());
INSERT INTO tabla_usuarios (id_rol, terminos_condiciones, estado, fecha_registro, fecha_actualizacion, fecha_desactivacion)
    VALUES (3, TRUE, TRUE, NOW(), NOW(), NOW());
INSERT INTO tabla_usuarios (id_rol, terminos_condiciones, estado, fecha_registro, fecha_actualizacion, fecha_desactivacion)
    VALUES (4, TRUE, TRUE, NOW(), NOW(), NOW());

INSERT INTO tabla_personas (id_usuario, nombres, apellidos, id_pais, telefono, validacion_telefono, fecha_creacion, fecha_actualizacion)
    VALUES (1, 'Usuario', 'Prueba', 6, 3001234567, TRUE, NOW(), NOW());
INSERT INTO tabla_personas (id_usuario, nombres, apellidos, id_pais, telefono, validacion_telefono, fecha_creacion, fecha_actualizacion)
    VALUES (2, 'Promotor', 'Prueba', 6, 3007654321, TRUE, NOW(), NOW());
INSERT INTO tabla_personas (id_usuario, nombres, apellidos, id_pais, telefono, validacion_telefono, fecha_creacion, fecha_actualizacion)
    VALUES (3, 'Moderador', 'Prueba', 6, 3001122334, TRUE, NOW(), NOW());
INSERT INTO tabla_personas (id_usuario, nombres, apellidos, id_pais, telefono, validacion_telefono, fecha_creacion, fecha_actualizacion)
    VALUES (4, 'Administrador', 'Prueba', 6, 3009876543, TRUE, NOW(), NOW());

INSERT INTO tabla_usuarios_credenciales (id_usuario, correo, contrasena_hash, id_google, validacion_correo, fecha_creacion, fecha_actualizacion)
    VALUES (1, 'usuario_prueba@correo.com', crypt('Usuario123.', gen_salt('bf', 12)), NULL, TRUE, NOW(), NOW());
INSERT INTO tabla_usuarios_credenciales (id_usuario, correo, contrasena_hash, id_google, validacion_correo, fecha_creacion, fecha_actualizacion)
    VALUES (2, 'promotor_prueba@correo.com', crypt('Promotor123.', gen_salt('bf', 12)), NULL, TRUE, NOW(), NOW());
INSERT INTO tabla_usuarios_credenciales (id_usuario, correo, contrasena_hash, id_google, validacion_correo, fecha_creacion, fecha_actualizacion)
    VALUES (3, 'moderador_prueba@correo.com', crypt('Moderador123.', gen_salt('bf', 12)), NULL, TRUE, NOW(), NOW());
INSERT INTO tabla_usuarios_credenciales (id_usuario, correo, contrasena_hash, id_google, validacion_correo, fecha_creacion, fecha_actualizacion)
    VALUES (4, 'administrador_prueba@correo.com', crypt('Administrador123.', gen_salt('bf', 12)), NULL, TRUE, NOW(), NOW());


-- AUDITORIA DE CAMBIOS (INSERT, UPDATE, DELETE)
CREATE OR REPLACE FUNCTION fun_registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    v_id_usuario_text TEXT;
    v_id_usuario_app INT;
    v_id_auditoria BIGINT;
    v_valor_anterior TEXT;
    v_valor_nuevo TEXT;
    v_pk RECORD;
    v_col RECORD;
BEGIN
    v_id_usuario_text := current_setting('app.id_usuario', true);

    IF v_id_usuario_text IS NOT NULL AND v_id_usuario_text ~ '^[0-9]+$' THEN
        v_id_usuario_app := v_id_usuario_text::INT;
    ELSE
        v_id_usuario_app := NULL;
    END IF;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO tabla_auditoria_bd (tabla, operacion, id_usuario_app, usuario_bd)
        VALUES (TG_TABLE_NAME, TG_OP, v_id_usuario_app, CURRENT_USER)
        RETURNING id_auditoria INTO v_id_auditoria;

        FOR v_pk IN
            SELECT a.attname AS columna_pk
            FROM pg_index i
            JOIN pg_attribute a
              ON a.attrelid = i.indrelid
             AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = TG_RELID
              AND i.indisprimary
            ORDER BY a.attnum
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_pk.columna_pk)
            INTO v_valor_nuevo
            USING NEW;

            INSERT INTO tabla_auditoria_pk (id_auditoria, columna_pk, valor_pk)
            VALUES (v_id_auditoria, v_pk.columna_pk, COALESCE(v_valor_nuevo, 'NULL'));
        END LOOP;

        FOR v_col IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = TG_TABLE_SCHEMA
              AND table_name = TG_TABLE_NAME
            ORDER BY ordinal_position
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_col.column_name)
            INTO v_valor_nuevo
            USING NEW;

            INSERT INTO tabla_auditoria_detalle (id_auditoria, columna, valor_nuevo)
            VALUES (v_id_auditoria, v_col.column_name, v_valor_nuevo);
        END LOOP;

        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO tabla_auditoria_bd (tabla, operacion, id_usuario_app, usuario_bd)
        VALUES (TG_TABLE_NAME, TG_OP, v_id_usuario_app, CURRENT_USER)
        RETURNING id_auditoria INTO v_id_auditoria;

        FOR v_pk IN
            SELECT a.attname AS columna_pk
            FROM pg_index i
            JOIN pg_attribute a
              ON a.attrelid = i.indrelid
             AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = TG_RELID
              AND i.indisprimary
            ORDER BY a.attnum
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_pk.columna_pk)
            INTO v_valor_nuevo
            USING NEW;

            INSERT INTO tabla_auditoria_pk (id_auditoria, columna_pk, valor_pk)
            VALUES (v_id_auditoria, v_pk.columna_pk, COALESCE(v_valor_nuevo, 'NULL'));
        END LOOP;

        FOR v_col IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = TG_TABLE_SCHEMA
              AND table_name = TG_TABLE_NAME
            ORDER BY ordinal_position
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_col.column_name)
            INTO v_valor_anterior
            USING OLD;

            EXECUTE format('SELECT ($1).%I::text', v_col.column_name)
            INTO v_valor_nuevo
            USING NEW;

            IF v_valor_anterior IS DISTINCT FROM v_valor_nuevo THEN
                INSERT INTO tabla_auditoria_detalle (id_auditoria, columna, valor_anterior, valor_nuevo)
                VALUES (v_id_auditoria, v_col.column_name, v_valor_anterior, v_valor_nuevo);
            END IF;
        END LOOP;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO tabla_auditoria_bd (tabla, operacion, id_usuario_app, usuario_bd)
        VALUES (TG_TABLE_NAME, TG_OP, v_id_usuario_app, CURRENT_USER)
        RETURNING id_auditoria INTO v_id_auditoria;

        FOR v_pk IN
            SELECT a.attname AS columna_pk
            FROM pg_index i
            JOIN pg_attribute a
              ON a.attrelid = i.indrelid
             AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = TG_RELID
              AND i.indisprimary
            ORDER BY a.attnum
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_pk.columna_pk)
            INTO v_valor_anterior
            USING OLD;

            INSERT INTO tabla_auditoria_pk (id_auditoria, columna_pk, valor_pk)
            VALUES (v_id_auditoria, v_pk.columna_pk, COALESCE(v_valor_anterior, 'NULL'));
        END LOOP;

        FOR v_col IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = TG_TABLE_SCHEMA
              AND table_name = TG_TABLE_NAME
            ORDER BY ordinal_position
        LOOP
            EXECUTE format('SELECT ($1).%I::text', v_col.column_name)
            INTO v_valor_anterior
            USING OLD;

            INSERT INTO tabla_auditoria_detalle (id_auditoria, columna, valor_anterior)
            VALUES (v_id_auditoria, v_col.column_name, v_valor_anterior);
        END LOOP;

        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    reg RECORD;
BEGIN
    FOR reg IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename LIKE 'tabla_%'
                                        AND tablename NOT IN ('tabla_auditoria_bd', 'tabla_auditoria_pk', 'tabla_auditoria_detalle')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_auditoria ON %I', reg.tablename);
        EXECUTE format('CREATE TRIGGER trg_auditoria AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION fun_registrar_auditoria()', reg.tablename);
    END LOOP;
END;
$$;


