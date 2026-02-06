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
CREATE TYPE tip_doc     AS ENUM ('Cédula de Ciudadanía', 'Cédula de Extranjería', 'Pasaporte');
CREATE TYPE tip_rol     AS ENUM ('Usuario', 'Promotor', 'Administrador', 'SuperAdministrador');
CREATE TYPE estado_pago AS ENUM ('Pendiente', 'Pagado', 'Fallido');

-- CREACION DE TABLAS
CREATE TABLE IF NOT EXISTS tabla_paises (
    id_pais                 INT                         PRIMARY KEY,
    nombre_pais             VARCHAR                     NOT NULL        CHECK (char_length(nombre_pais) >= 3),
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_departamentos (
    id_departamento         INT                         PRIMARY KEY,
    nombre_departamento     VARCHAR                     NOT NULL        CHECK (char_length(nombre_departamento) >= 4),
    id_pais                 INT                         NOT NULL,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pais) REFERENCES  tabla_paises(id_pais)
);

CREATE TABLE IF NOT EXISTS tabla_municipios (
    id_departamento         INT                         NOT NULL,
    id_municipio            INT                         PRIMARY KEY,
    nombre_municipio        VARCHAR                     NOT NULL        CHECK (char_length(nombre_municipio) >= 3),
    distrito                BOOLEAN                     NOT NULL,
    area_metropolitana      BOOLEAN                     NOT NULL,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_departamento) REFERENCES  tabla_departamentos(id_departamento)
);

CREATE TABLE IF NOT EXISTS tabla_tipo_sitios (
    id_tipo_sitio           INT                         PRIMARY KEY,
    nombre_tipo_sitio       VARCHAR                     NOT NULL        UNIQUE CHECK (char_length(nombre_tipo_sitio) >= 4),
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_sitios (
    id_sitio                INT                         PRIMARY KEY,
    nombre_sitio            VARCHAR                     NOT NULL        CHECK (char_length(nombre_sitio) >= 3),
    id_tipo_sitio           INT                         NOT NULL,
    acceso_discapacidad     BOOLEAN                     NOT NULL,
    id_municipio            INT                         NOT NULL,
    direccion               VARCHAR                     NOT NULL        UNIQUE CHECK (char_length(direccion) >= 6),
    latitud                 VARCHAR                     NOT NULL        UNIQUE,
    longitud                VARCHAR                     NOT NULL        UNIQUE,
    telefono_1              DECIMAL(10,0)                               UNIQUE CHECK (telefono_1 > 2999999999),
    telefono_2              DECIMAL(10,0)                                UNIQUE CHECK (telefono_2 > 2999999999),
    sitio_web               VARCHAR                                     UNIQUE,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_municipio) REFERENCES  tabla_municipios(id_municipio)
);

CREATE TABLE IF NOT EXISTS tabla_tipo_infraest_disc (
    id_infraest_disc        INT                         PRIMARY KEY,
    nombre_infraest_disc    VARCHAR                     NOT NULL        UNIQUE CHECK (char_length(nombre_infraest_disc) >= 4),
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_sitios_disc (
    id_sitios_disc          INT                         PRIMARY KEY,
    id_sitio                INT                         NOT NULL,
    id_infraest_disc        INT                         NOT NULL,
    descripcion             TEXT                        NOT NULL,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_roles (
    id_rol                  INT,
    nombre_rol              VARCHAR NOT NULL,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_rol)
);

CREATE TABLE IF NOT EXISTS tabla_usuarios (
	tipo_documento          tip_doc                     NOT NULL,
    numero_documento        VARCHAR(10)                 NOT NULL        UNIQUE,
    nombres                 VARCHAR(30)                 NOT NULL        CHECK (char_length(nombres) >= 3),
    apellidos               VARCHAR(30)                 NOT NULL        CHECK (char_length(apellidos) >= 3),
    id_pais                 INT                         NOT NULL,
    telefono                DECIMAL(10,0)                               UNIQUE CHECK (telefono > 2999999999),
    validacion_telefono     BOOLEAN                                     DEFAULT FALSE,
    correo                  VARCHAR                     NOT NULL        UNIQUE CHECK (char_length(correo) >= 14),
    validacion_correo       BOOLEAN                     NOT NULL        DEFAULT FALSE,
    contrasena_hash         VARCHAR                     NOT NULL,
    fecha_registro          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_desactivacion     TIMESTAMP   WITH TIME ZONE,
    estado                  BOOLEAN                     NOT NULL        DEFAULT TRUE,
    id_rol                  INT                         NOT NULL        DEFAULT 1,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (numero_documento),
    FOREIGN KEY (id_pais) REFERENCES tabla_paises(id_pais),
    FOREIGN KEY (id_rol)  REFERENCES tabla_roles(id_rol)
);

CREATE TABLE IF NOT EXISTS tabla_validacion_email_tokens (
    id_token                SERIAL                      PRIMARY KEY,
    numero_documento        VARCHAR(10)                 NOT NULL,
    token                   VARCHAR(64)                 NOT NULL        UNIQUE,
    utilizado               BOOLEAN                     NOT NULL        DEFAULT FALSE,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion        TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_validacion        TIMESTAMP   WITH TIME ZONE,
    FOREIGN KEY (numero_documento) REFERENCES tabla_usuarios(numero_documento) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tabla_baneados (
    id_baneado              SERIAL                      PRIMARY KEY,
    id_usuario              VARCHAR                         NOT NULL,
    motivo_ban              TEXT                        NOT NULL,
    incio_ban               TIMESTAMP                   NOT NULL,
    termina_ban             TIMESTAMP                   NOT NULL,
    responsable             VARCHAR                     NOT NULL,
    fecha_registro          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(numero_documento),
    FOREIGN KEY (responsable) REFERENCES tabla_usuarios(numero_documento)
);

CREATE TABLE IF NOT EXISTS tabla_categoria_eventos (
    id_categoria_evento     INT                         PRIMARY KEY,
    nombre                  VARCHAR                     NOT NULL        UNIQUE CHECK (char_length(nombre) >= 3),
    fecha_creacion          TIMESTAMP WITH TIME ZONE    NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP WITH TIME ZONE                    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_tipo_eventos (
    id_tipo_evento          INT                         PRIMARY KEY,
    id_categoria_evento     INT                         NOT NULL,
    nombre                  VARCHAR                     NOT NULL        UNIQUE CHECK (char_length(nombre) >= 3),
    fecha_creacion          TIMESTAMP WITH TIME ZONE    NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP WITH TIME ZONE                    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria_evento) REFERENCES tabla_categoria_eventos(id_categoria_evento)
);

CREATE TABLE IF NOT EXISTS tabla_eventos (
    id_evento               INT                         PRIMARY KEY,
    nombre_evento           VARCHAR                     NOT NULL        CHECK (char_length(nombre_evento) >= 6),
    id_usuario              VARCHAR                     NOT NULL,                                                   -- ID del usuario que crea el evento.
    id_categoria_evento     INT                         NOT NULL,
    id_tipo_evento          INT                         NOT NULL,
    id_sitio                INT                         NOT NULL,                                                   -- ID del lugar (dentro del municipio) donde se realiza el evento.
    id_municipio            INT                         NOT NULL,
    descripcion             TEXT                        NOT NULL,
    telefono_1              DECIMAL(10,0)               NOT NULL        CHECK (telefono_1 > 2999999999),
    telefono_2              DECIMAL(10,0)                               CHECK (telefono_2 > 2999999999),
    fecha_inicio            DATE                        NOT NULL,
    fecha_fin               DATE                        NOT NULL,   
    hora_inicio             TIME                        NOT NULL,
    hora_final              TIME                        NOT NULL,
    dias_semana             TEXT,                                                                                   -- JSON string of selected days (YYYY-MM-DD array)
    gratis_pago             BOOLEAN                     NOT NULL        DEFAULT FALSE,                              -- FALSE: GRATIS and TRUE: PAGO.
    cupo                    INT                         NOT NULL        DEFAULT 0 CHECK (cupo >= 0),                -- Numero de invitados (No debe ser menor a 0 y mayor a 5000).
    estado                  BOOLEAN                     NOT NULL        DEFAULT FALSE,                              -- FALSE: Pendiente por validar and TRUE: Aprobado.
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    fecha_desactivacion     TIMESTAMP   WITH TIME ZONE,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(numero_documento),
    FOREIGN KEY (id_tipo_evento) REFERENCES tabla_tipo_eventos(id_tipo_evento),
    FOREIGN KEY (id_categoria_evento) REFERENCES tabla_categoria_eventos(id_categoria_evento),
    FOREIGN KEY (id_sitio) REFERENCES tabla_sitios(id_sitio),
    FOREIGN KEY (id_municipio) REFERENCES tabla_municipios(id_municipio)
);

CREATE TABLE IF NOT EXISTS tabla_imagenes_eventos (
    id_imagen_evento        SERIAL                      PRIMARY KEY,
    url_imagen_evento       VARCHAR                     NOT NULL        UNIQUE,
    id_evento               INT                         NOT NULL,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_documentos_eventos (
    id_documento_evento     SERIAL                      PRIMARY KEY,
    url_documento_evento    VARCHAR                     NOT NULL        UNIQUE,
    id_evento               INT                         NOT NULL,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_eventos_x_dias (
    id_evento_x_dia         SERIAL                      PRIMARY KEY,
    id_evento               INT                         NOT NULL,
    dia                     DATE                        NOT NULL,
	fecha_creación			TIMESTAMP	WITH TIME ZONE	 NOT NULL		DEFAULT CURRENT_TIMESTAMP,
	fecha_actualizacion		TIMESTAMP	WITH TIME ZONE	 NOT NULL 		DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_valoraciones (
    id_valoracion           SERIAL                      PRIMARY KEY,
    id_usuario              VARCHAR                     NOT NULL,
    id_evento               INT                         NOT NULL,
    valoracion              INT                         NOT NULL        CHECK (valoracion BETWEEN 1 AND 5),
    comentario              VARCHAR,
    fecha_creacion          TIMESTAMP WITH TIME ZONE    NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP WITH TIME ZONE                    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(numero_documento),
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_reserva_eventos (
    id_reserva_evento       SERIAL                      PRIMARY KEY,
    id_usuario              VARCHAR                     NOT NULL,
    id_evento               INT                         NOT NULL,
    fecha_reserva           TIMESTAMP                   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    estado                  BOOLEAN                     NOT NULL        DEFAULT 'TRUE',
    fecha_actualizacion     TIMESTAMP                   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(numero_documento),
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_categoria_boletos (
    id_categoria_boleto     INT                         PRIMARY KEY,
    nombre_categoria_boleto VARCHAR                     NOT NULL        UNIQUE CHECK (char_length(nombre_categoria_boleto) >= 3),
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP   
    );

CREATE TABLE IF NOT EXISTS tabla_valores (
    id_valor                SERIAL                      PRIMARY KEY,
    id_evento               INT                         NOT NULL,
    id_categoria_boleto     INT                         NOT NULL        DEFAULT 1,
    valor                   DECIMAL(9,2)                NOT NULL,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento),
    FOREIGN KEY (id_categoria_boleto) REFERENCES tabla_categoria_boletos(id_categoria_boleto)
);

CREATE TABLE IF NOT EXISTS tabla_links (
    id_link                 SERIAL                      PRIMARY KEY,
    id_evento               INT                         NOT NULL,
    link                    VARCHAR                     NOT NULL,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE INDEX idx_municipios_id_pais ON tabla_municipios(id_pais);
CREATE INDEX idx_usuarios_id_pais ON tabla_usuarios(id_pais);
CREATE INDEX idx_usuarios_id_ciudad ON tabla_usuarios(id_ciudad);
CREATE INDEX idx_eventos_id_pais ON tabla_eventos(id_pais);
CREATE INDEX idx_eventos_id_ciudad ON tabla_eventos(id_ciudad);
CREATE INDEX idx_eventos_id_tipo_evento ON tabla_eventos(id_tipo_evento);
CREATE INDEX idx_eventos_id_imagen_evento ON tabla_eventos(id_imagenes_eventos);
CREATE INDEX idx_verificaciones_usuario ON tabla_verificaciones(id_usuario);
CREATE INDEX idx_valoraciones_evento ON tabla_valoraciones(id_evento);
CREATE INDEX idx_reserva_evento_usuario ON tabla_reserva_eventos(id_usuario);
CREATE INDEX idx_reserva_evento_evento ON tabla_reserva_eventos(id_evento);
CREATE INDEX idx_pagos_reserva ON tabla_pagos(id_reserva_evento);
CREATE INDEX idx_reembolso_usuario ON tabla_reembolsos(id_usuario);

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

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_tipo_infraest_disc
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_sitios_disc
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_roles
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_usuarios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_validacion_email_tokens
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

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_eventos_x_dias
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_valoraciones
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_reserva_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_imagenes BEFORE UPDATE ON tabla_categoria_boletos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_valores
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_links
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

-- CARGA DE DATOS INICIALES

-- Cargar en tabla_roles.
INSERT INTO tabla_roles VALUES  (1,'Usuario');
INSERT INTO tabla_roles VALUES  (2,'Promotor');
INSERT INTO tabla_roles VALUES  (3,'Moderador');
INSERT INTO tabla_roles VALUES  (4,'Administrador');

-- Primero cargar la extension de pgcrypto para el hash de contraseñas.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Cargar en tabla_usuarios.
INSERT INTO tabla_usuarios VALUES ('Cédula de Ciudadanía', '1095951827', 'Brayhan Jahir', 'Orduz Perez', 6, 3143413720, TRUE, 'bryhanorduz14@gmail.com', TRUE, crypt('BhyOP06*', gen_salt('bf', 12)), NOW (), NULL, TRUE, 4, NOW());
INSERT INTO tabla_usuarios VALUES ('Cédula de Ciudadanía', '1095581203', 'William', 'Rojas', 6, 3167598925, TRUE, 'willirojasorduz@gmail.com', TRUE, crypt('William15.', gen_salt('bf', 12)), NOW (), NULL, TRUE, 4, NOW());
INSERT INTO tabla_usuarios VALUES ('Cédula de Ciudadanía', '1091234567', 'Usuario', 'Prueba', 6, 3001234567, TRUE, 'usuario_prueba@correo.com', TRUE, crypt('Usuario123.', gen_salt('bf', 12)), NOW (), NULL, TRUE, 1, NOW());
INSERT INTO tabla_usuarios VALUES ('Cédula de Extranjería', '1097654321', 'Promotor', 'Prueba', 6, 3007654321, TRUE, 'promotor_prueba@correo.com', TRUE, crypt('Promotor123.', gen_salt('bf', 12)), NOW (), NULL, TRUE, 2, NOW());
INSERT INTO tabla_usuarios VALUES ('Pasaporte', '12A24578B', 'Moderador', 'Prueba', 6, 3001122334, TRUE, 'moderador_prueba@correo.com', TRUE, crypt('Moderador123.', gen_salt('bf', 12)), NOW (), NULL, TRUE, 3, NOW());