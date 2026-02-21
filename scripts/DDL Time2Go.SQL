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
DROP TABLE IF EXISTS tabla_reserva_eventos;
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
    telefono_1                               DECIMAL(10,0)                               UNIQUE   CHECK (telefono_1 > 2999999999),
    telefono_2                               DECIMAL(10,0)                               UNIQUE   CHECK (telefono_2 > 2999999999),
    sitio_web                                VARCHAR                                     UNIQUE,
    fecha_creacion                           TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT  CURRENT_TIMESTAMP,
    fecha_actualizacion                      TIMESTAMP   WITH TIME ZONE                  DEFAULT  CURRENT_TIMESTAMP,
    FOREIGN KEY (id_municipio)                           REFERENCES       tabla_municipios(id_municipio)
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
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
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
    ig_google                               VARCHAR,
    nombres                                 VARCHAR(30)                                 CHECK (char_length(nombres) >= 3),
    apellidos                               VARCHAR(30)                                 CHECK (char_length(apellidos) >= 3),
    id_pais                                 INT,
    telefono                                DECIMAL(10,0)                               UNIQUE  CHECK (telefono > 2999999999),
    validacion_telefono                     BOOLEAN                                     DEFAULT FALSE,
    correo                                  VARCHAR                      NOT NULL       UNIQUE  CHECK (char_length(correo) >= 14),
    validacion_correo                       BOOLEAN                                     DEFAULT FALSE,
    contrasena_hash                         VARCHAR,
    confirmacion_contrasena_hash            VARCHAR,
    terminos_condiciones                    BOOLEAN                      NOT NULL,
    estado                                  BOOLEAN                      NOT NULL       DEFAULT TRUE,
    fecha_registro                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    fecha_desactivacion                     TIMESTAMP   WITH TIME ZONE,
    FOREIGN KEY (id_pais)                               REFERENCES       tabla_paises(id_pais),
    FOREIGN KEY (id_rol)                                REFERENCES       tabla_roles(id_rol)
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
    telefono_1                              DECIMAL(10,0)                NOT NULL       CHECK (telefono_1 > 2999999999),
    telefono_2                              DECIMAL(10,0)                               CHECK (telefono_2 > 2999999999),
    fecha_inicio                            DATE                         NOT NULL,
    fecha_fin                               DATE                         NOT NULL,   
    hora_inicio                             TIME                         NOT NULL,
    hora_final                              TIME                         NOT NULL,
    gratis_pago                             BOOLEAN                      NOT NULL       DEFAULT FALSE,                              -- FALSE: GRATIS and TRUE: PAGO.
    cupo                                    INT                          NOT NULL       DEFAULT 0 CHECK (cupo >= 0),                -- Numero de invitados (No debe ser menor a 0 y mayor a 5000).
    reservar_anticipado                     BOOLEAN                      NOT NULL       DEFAULT FALSE,                              -- FALSE: No requiere reserva anticipada and TRUE: Requiere reserva anticipada.
    estado                                  BOOLEAN                      NOT NULL       DEFAULT FALSE,                              -- FALSE: Pendiente por validar and TRUE: Aprobado.
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    fecha_desactivacion                     TIMESTAMP   WITH TIME ZONE,
    FOREIGN KEY (id_usuario)                            REFERENCES       tabla_usuarios(id_usuario),
    FOREIGN KEY (id_tipo_evento)                        REFERENCES       tabla_tipo_eventos(id_tipo_evento),
    FOREIGN KEY (id_categoria_evento)                   REFERENCES       tabla_categoria_eventos(id_categoria_evento),
    FOREIGN KEY (id_sitio)                              REFERENCES       tabla_sitios(id_sitio)
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
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento)                 REFERENCES  tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_documentos_eventos (
    id_documento_evento                     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    url_documento_evento                    VARCHAR                      NOT NULL       UNIQUE,
    id_evento                               INT                          NOT NULL,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento)                 REFERENCES  tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_documentos_usuarios (
    id_documento_usuario                    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    url_documento_usuario                   VARCHAR                      NOT NULL       UNIQUE,
    id_usuario                              INT                          NOT NULL,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)                REFERENCES  tabla_usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS tabla_valoraciones (
    id_valoracion                           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario                              INT                       	 NOT NULL,
    id_evento                               INT                          NOT NULL,
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
    quienes_asistiran                       VARCHAR                      NOT NULL        CHECK (char_length(quienes_asistiran) >= 3),
    fecha_reserva                           TIMESTAMP                    NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    estado                                  BOOLEAN                      NOT NULL        DEFAULT 'TRUE',
    fecha_actualizacion                     TIMESTAMP                    NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)                REFERENCES  tabla_usuarios(id_usuario),
    FOREIGN KEY (id_evento)                 REFERENCES  tabla_eventos(id_evento)
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

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_tipo_infraestructura_discapacitados
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_sitios_discapacitados
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_roles
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_usuarios
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
INSERT INTO tabla_accesibilidad_menu VALUES (2, 'Reservas', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (3, 'Editar Evento', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (4, 'Aprobar Evento', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (5, 'Eliminar Evento', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (6, 'Ver Dashboard', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (7, 'Gestionar Paises', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (8, 'Gestionar Departamentos', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (9, 'Gestionar Municipios', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (10, 'Gestionar Usuarios', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (11, 'Gestionar Roles', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (12, 'Gestionar Accesibilidad al Sistema', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (13, 'Gestionar Accesibilidad de los Roles', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (14, 'Gestionar Baneados', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (15, 'Gestionar Tipo Sitio', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (16, 'Gestionar Sitios', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (17, 'Gestionar Tipo de Infraestructura para Discapacitados', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (18, 'Gestionar Infraestructura con Sitios para Discapacitados', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (19, 'Gestionar Categorías Eventos', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (20, 'Gestionar Tipos de Eventos', NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu VALUES (21, 'Gestionar Valoraciones', NOW(), NOW());

-- Cargar en tabla_accesibilidad_menu_x_rol.
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (1, 1, 2, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (2, 1, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (3, 1, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (4, 2, 2, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (5, 2, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (6, 2, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (7, 3, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (8, 3, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (9, 4, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (10, 5, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (11, 6, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (12, 6, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (13, 7, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (14, 7, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (15, 8, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (16, 8, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (17, 9, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (18, 9, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (19, 10, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (20, 10, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (21, 11, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (22, 12, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (23, 13, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (24, 14, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (25, 15, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (26, 15, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (27, 16, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (28, 16, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (29, 17, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (30, 17, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (31, 18, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (32, 18, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (33, 19, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (34, 19, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (35, 20, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (36, 20, 4, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (37, 21, 3, NOW(), NOW());
INSERT INTO tabla_accesibilidad_menu_x_rol VALUES (38, 21, 4, NOW(), NOW());

-- Cargar en tabla_usuarios.
INSERT INTO tabla_usuarios (id_rol, ig_google, nombres, apellidos, id_pais, telefono, validacion_telefono, correo, validacion_correo, contrasena_hash, confirmacion_contrasena_hash, terminos_condiciones, estado, fecha_registro, fecha_actualizacion, fecha_desactivacion) 
    VALUES (1, NULL, 'Usuario', 'Prueba', 6, 3001234567, TRUE, 'usuario_prueba@correo.com', TRUE, crypt('Usuario123.', gen_salt('bf', 12)), crypt('Usuario123.', gen_salt('bf', 12)), TRUE, TRUE, NOW(), NOW(), NOW());
INSERT INTO tabla_usuarios (id_rol, ig_google, nombres, apellidos, id_pais, telefono, validacion_telefono, correo, validacion_correo, contrasena_hash, confirmacion_contrasena_hash, terminos_condiciones, estado, fecha_registro, fecha_actualizacion, fecha_desactivacion) 
    VALUES (2, NULL, 'Promotor', 'Prueba', 6, 3007654321, TRUE, 'promotor_prueba@correo.com', TRUE, crypt('Promotor123.', gen_salt('bf', 12)), crypt('Promotor123.', gen_salt('bf', 12)), TRUE, TRUE, NOW(), NOW(), NOW());
INSERT INTO tabla_usuarios (id_rol, ig_google, nombres, apellidos, id_pais, telefono, validacion_telefono, correo, validacion_correo, contrasena_hash, confirmacion_contrasena_hash, terminos_condiciones, estado, fecha_registro, fecha_actualizacion, fecha_desactivacion) 
    VALUES (3, NULL, 'Moderador', 'Prueba', 6, 3001122334, TRUE, 'moderador_prueba@correo.com', TRUE, crypt('Moderador123.', gen_salt('bf', 12)), crypt('Moderador123.', gen_salt('bf', 12)), TRUE, TRUE, NOW(), NOW(), NOW());
INSERT INTO tabla_usuarios (id_rol, ig_google, nombres, apellidos, id_pais, telefono, validacion_telefono, correo, validacion_correo, contrasena_hash, confirmacion_contrasena_hash, terminos_condiciones, estado, fecha_registro, fecha_actualizacion, fecha_desactivacion) 
    VALUES (4, NULL, 'Administrador', 'Prueba', 6, 3009876543, TRUE, 'administrador_prueba@correo.com', TRUE, crypt('Administrador123.', gen_salt('bf', 12)), crypt('Administrador123.', gen_salt('bf', 12)), TRUE, TRUE, NOW(), NOW(), NOW());


