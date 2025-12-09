/*
|------------------------------------------------------------------------------------|
| DDL Time2Go                                                                       |
| AUTORES : BRAYHAN ORDUZ Y WILLIAM ROJAS                                           |
| FECHA   : 2025-07-06                                                              |
| DESCRIPCION: Script de creacion de tablas y relaciones para la aplicacion Time2Go |
|------------------------------------------------------------------------------------|
*/
-- BORRADO TABLAS
DROP TABLE IF EXISTS tabla_reservas_eventos;
DROP TABLE IF EXISTS tabla_costos_eventos;
DROP TABLE IF EXISTS tabla_costos;
DROP TABLE IF EXISTS tabla_valoraciones;
DROP TABLE IF EXISTS tabla_eventos;
DROP TABLE IF EXISTS tabla_eventos_x_dias;
DROP TABLE IF EXISTS tabla_tipo_eventos;
DROP TABLE IF EXISTS tabla_categorias_eventos;
DROP TABLE IF EXISTS tabla_baneados;
DROP TABLE IF EXISTS tabla_menu_usuarios;
DROP TABLE IF EXISTS tabla_usuarios;
DROP TABLE IF EXISTS tabla_roles;
DROP TABLE IF EXISTS tabla_menu;
DROP TABLE IF EXISTS tabla_sitios_disc;
DROP TABLE IF EXISTS tabla_tipo_infraest_disc;
DROP TABLE IF EXISTS tabla_sitios;
DROP TABLE IF EXISTS tabla_tipo_sitios;
DROP TABLE IF EXISTS tabla_municipios;
DROP TABLE IF EXISTS tabla_departamentos;
DROP TABLE IF EXISTS tabla_paises;
DROP TABLE IF EXISTS tabla_imagenes;


CREATE TYPE tip_doc     AS ENUM ('Tarjeta de Identidad', 'Cédula de Ciudadanía', 'Cédula de Extranjería', 'Pasaporte');
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
    descripcion             TEXT                        NOT NULL,
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

CREATE TABLE IF NOT EXISTS tabla_menu (
    id_menu                 INT                         PRIMARY KEY,
    nombre_opcion           VARCHAR                     NOT NULL        UNIQUE CHECK (char_length(nombre_opcion) >= 5),
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_roles (
    id_rol                  INT,
    nombre_rol              VARCHAR NOT NULL,
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

CREATE TABLE IF NOT EXISTS tabla_menu_usuarios (
    id_menu_usuario         INT                         PRIMARY KEY,
    id_rol                  INT                         NOT NULL,
    id_menu                 INT                         NOT NULL,
    permisos                BOOLEAN                     NOT NULL        DEFAULT FALSE,
    fecha_asignacion        TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    fecha_revocacion        TIMESTAMP   WITH TIME ZONE,
    FOREIGN KEY (id_rol) REFERENCES tabla_roles(id_rol),
    FOREIGN KEY (id_menu) REFERENCES tabla_menu(id_menu)
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

CREATE TABLE IF NOT EXISTS tabla_categorias_eventos (
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
    FOREIGN KEY (id_categoria_evento) REFERENCES tabla_categorias_eventos(id_categoria_evento)
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
    gratis_pago             BOOLEAN                     NOT NULL        DEFAULT FALSE,                              -- FALSE: GRATIS and TRUE: PAGO.
    cupo                    INT                         NOT NULL        DEFAULT 0 CHECK (cupo >= 0),                -- Numero de invitados (No debe ser menor a 0 y mayor a 5000).
    estado                  BOOLEAN                     NOT NULL        DEFAULT FALSE,                              -- FALSE: Pendiente por validar and TRUE: Aprobado.
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    fecha_desactivacion     TIMESTAMP   WITH TIME ZONE,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(numero_documento),
    FOREIGN KEY (id_tipo_evento) REFERENCES tabla_tipo_eventos(id_tipo_evento),
    FOREIGN KEY (id_categoria_evento) REFERENCES tabla_categorias_eventos(id_categoria_evento),
    FOREIGN KEY (id_sitio) REFERENCES tabla_sitios(id_sitio),
    FOREIGN KEY (id_municipio) REFERENCES tabla_municipios(id_municipio)
);

CREATE TABLE IF NOT EXISTS tabla_imagenes_eventos (
    id_imagen_evento        SERIAL                      PRIMARY KEY,
    url_imagen_evento       VARCHAR                     NOT NULL        UNIQUE,
    id_evento               INT                         NOT NULL,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_documentos_eventos (
    id_documento_evento     SERIAL                      PRIMARY KEY,
    url_documento_evento    VARCHAR                     NOT NULL        UNIQUE,
    id_evento               INT                         NOT NULL,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_eventos_x_dias (
    id_evento_x_dia         SERIAL                      PRIMARY KEY,
    id_evento               INT                         NOT NULL,
    dia                     DATE                        NOT NULL, 
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

CREATE TABLE IF NOT EXISTS tabla_reservas_eventos (
    id_reserva_evento       SERIAL                      PRIMARY KEY,
    id_usuario              VARCHAR                     NOT NULL,
    id_evento               INT                         NOT NULL,
    fecha_reserva           TIMESTAMP                   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    estado                  BOOLEAN                     NOT NULL        DEFAULT 'TRUE',
    fecha_actualizacion     TIMESTAMP                   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(numero_documento),
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_valores (
    id_valor                SERIAL                      PRIMARY KEY,
    id_evento               INT                         NOT NULL,
    valor                   DECIMAL(9,2)                NOT NULL,
    fecha_actualizacion     TIMESTAMP WITH TIME ZONE                    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_links (
    id_link                 SERIAL                      PRIMARY KEY,
    id_evento               INT                         NOT NULL,
    link                    VARCHAR                     NOT NULL,
    fecha_actualizacion     TIMESTAMP                   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE INDEX idx_ciudades_id_pais ON tabla_ciudades(id_pais);
CREATE INDEX idx_usuarios_id_pais ON tabla_usuarios(id_pais);
CREATE INDEX idx_usuarios_id_ciudad ON tabla_usuarios(id_ciudad);
CREATE INDEX idx_eventos_id_pais ON tabla_eventos(id_pais);
CREATE INDEX idx_eventos_id_ciudad ON tabla_eventos(id_ciudad);
CREATE INDEX idx_eventos_id_tipo_evento ON tabla_eventos(id_tipo_evento);
CREATE INDEX idx_eventos_id_imagen ON tabla_eventos(id_imagen);
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
$$ LANGUAGE plpgsql;|

CREATE TRIGGER trig_update_usuarios BEFORE UPDATE ON tabla_usuarios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_qr BEFORE UPDATE ON tabla_qr
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_paises BEFORE UPDATE ON tabla_paises
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_municipios BEFORE UPDATE ON tabla_municipios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_eventos BEFORE UPDATE ON tabla_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_imagenes BEFORE UPDATE ON tabla_imagenes
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_tipo_eventos BEFORE UPDATE ON tabla_tipo_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_valoraciones BEFORE UPDATE ON tabla_valoraciones
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

CREATE TRIGGER trig_update_valoraciones BEFORE UPDATE ON tabla_reembolsos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

--INSERTS PRUEBAS

INSERT INTO tabla_menu (id_menu, nombre_opcion) VALUES 
(1, 'Administrar usuarios'),
(2, 'Gestión de eventos');


-- CARGAR EN TABLA_ROLES
INSERT INTO tabla_roles VALUES  (1,'Usuario');
INSERT INTO tabla_roles VALUES  (2,'Promotor');
INSERT INTO tabla_roles VALUES  (3,'Moderador');
INSERT INTO tabla_roles VALUES  (4,'Administrador');

-- CARGAR EN TABLA_CATEGORIAS_EVENTOS
INSERT INTO tabla_categorias_eventos VALUES (1, 'Música');
INSERT INTO tabla_categorias_eventos VALUES (2, 'Cultura y Arte');
INSERT INTO tabla_categorias_eventos VALUES (3, 'Deportes');

-- CARGAR EN TABLA_TIPO_EVENTOS
INSERT INTO tabla_tipo_eventos VALUES (1, 1, 'Concierto');
INSERT INTO tabla_tipo_eventos VALUES (2, 1, 'Festival');
INSERT INTO tabla_tipo_eventos VALUES (3, 1, 'Sesión acústica');
INSERT INTO tabla_tipo_eventos VALUES (4, 1, 'Tributo');
INSERT INTO tabla_tipo_eventos VALUES (5, 1, 'Show DJ');
INSERT INTO tabla_tipo_eventos VALUES (6, 2, 'Obra de teatro');
INSERT INTO tabla_tipo_eventos VALUES (7, 2, 'Exposición');
INSERT INTO tabla_tipo_eventos VALUES (8, 2, 'Cine-foro');
INSERT INTO tabla_tipo_eventos VALUES (9, 2, 'Danza');
INSERT INTO tabla_tipo_eventos VALUES (10, 2, 'Performance');
INSERT INTO tabla_tipo_eventos VALUES (11, 3, 'Torneo');
INSERT INTO tabla_tipo_eventos VALUES (12, 3, 'Partido amistoso');
INSERT INTO tabla_tipo_eventos VALUES (13, 3, 'Carrera 5k');
INSERT INTO tabla_tipo_eventos VALUES (14, 3, 'Clase deportiva');
INSERT INTO tabla_tipo_eventos VALUES (15, 3, 'Exhibición deportiva');

-- CARGAR EN TABLA_TIPO_SITIOS
INSERT INTO tabla_tipo_sitios VALUES (1, 'Teatro');
INSERT INTO tabla_tipo_sitios VALUES (2, 'Centro de convenciones');
INSERT INTO tabla_tipo_sitios VALUES (3, 'Museo');

-- CARGAR EN TABLA_PAISES.
INSERT INTO tabla_paises VALUES  (1, 'Colombia');

-- CARGA TABLE DE DEPARTAMENTOS SEGÚN DANE.
INSERT INTO tabla_departamentos VALUES  (91,'Amazonas',1);
INSERT INTO tabla_departamentos VALUES  (05,'Antioquia',1);
INSERT INTO tabla_departamentos VALUES  (81,'Arauca',1);
INSERT INTO tabla_departamentos VALUES  (08,'Atlántico',1);
INSERT INTO tabla_departamentos VALUES  (11,'Bogotá',1);
INSERT INTO tabla_departamentos VALUES  (13,'Bolivar',1);
INSERT INTO tabla_departamentos VALUES  (15,'Boyacá',1);
INSERT INTO tabla_departamentos VALUES  (17,'Caldas',1);
INSERT INTO tabla_departamentos VALUES  (18,'Caquetá',1);
INSERT INTO tabla_departamentos VALUES  (85,'Casanare',1);
INSERT INTO tabla_departamentos VALUES  (19,'Cauca',1);
INSERT INTO tabla_departamentos VALUES  (20,'Cesar',1);
INSERT INTO tabla_departamentos VALUES  (27,'Chocó',1);
INSERT INTO tabla_departamentos VALUES  (23,'Córdoba',1);
INSERT INTO tabla_departamentos VALUES  (25,'Cundinamarca',1);
INSERT INTO tabla_departamentos VALUES  (94,'Guanía',1);
INSERT INTO tabla_departamentos VALUES  (95,'Guaviare',1);
INSERT INTO tabla_departamentos VALUES  (41,'Huila',1);
INSERT INTO tabla_departamentos VALUES  (44,'La Guajira',1);
INSERT INTO tabla_departamentos VALUES  (47,'Magdalena',1);
INSERT INTO tabla_departamentos VALUES  (50,'Meta',1);
INSERT INTO tabla_departamentos VALUES  (52,'Nariño',1);
INSERT INTO tabla_departamentos VALUES  (54,'Norte de Santander',1);
INSERT INTO tabla_departamentos VALUES  (86,'Putumayo',1);
INSERT INTO tabla_departamentos VALUES  (63,'Quindío',1);
INSERT INTO tabla_departamentos VALUES  (66,'Risaralda',1);
INSERT INTO tabla_departamentos VALUES  (68,'Santander',1);
INSERT INTO tabla_departamentos VALUES  (70,'Sucre',1);
INSERT INTO tabla_departamentos VALUES  (73,'Tolima',1);
INSERT INTO tabla_departamentos VALUES  (76,'Valle del Cauca',1);
INSERT INTO tabla_departamentos VALUES  (88,'Archipiélago de San Andrés',1);
INSERT INTO tabla_departamentos VALUES  (97,'Vaupés',1);
INSERT INTO tabla_departamentos VALUES  (99,'Vichada',1);

-- CARGA TABLE DE MUNICIPIOS SEGÚN DANE.
INSERT INTO tabla_municipios VALUES (91, 91263, 'EL ENCANTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (91, 91405, 'LA CHORRERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (91, 91407, 'LA PEDRERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (91, 91430, 'LA VICTORIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (91, 91001, 'LETICIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (91, 91460, 'MIRITÍ - PARANÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (91, 91530, 'PUERTO ALEGRÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (91, 91536, 'PUERTO ARICA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (91, 91540, 'PUERTO NARIÑO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (91, 91669, 'PUERTO SANTANDER', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (91, 91798, 'TARAPACÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05120, 'CÁCERES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05154, 'CAUCASIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05250, 'EL BAGRE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05495, 'NECHÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05790, 'TARAZÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05895, 'ZARAGOZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05142, 'CARACOLÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05425, 'MACEO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05579, 'PUERTO BERRÍO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05585, 'PUERTO NARE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05591, 'PUERTO TRIUNFO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05893, 'YONDÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05031, 'AMALFI', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05040, 'ANORÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05190, 'CISNEROS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05604, 'REMEDIOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05670, 'SAN ROQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05690, 'SANTO DOMINGO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05736, 'SEGOVIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05858, 'VEGACHÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05885, 'YALÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05890, 'YOLOMBÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05038, 'ANGOSTURA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05086, 'BELMIRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05107, 'BRICEÑO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05134, 'CAMPAMENTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05150, 'CAROLINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05237, 'DON MATÍAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05264, 'ENTRERRÍOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05310, 'GÓMEZ PLATA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05315, 'GUADALUPE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05361, 'ITUANGO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05647, 'SAN ANDRÉS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05658, 'SAN JOSÉ DE LA MONTAÑA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05664, 'SAN PEDRO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05686, 'SANTA ROSA DE OSOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05819, 'TOLEDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05854, 'VALDIVIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05887, 'YARUMAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05004, 'ABRIAQUÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05044, 'ANZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05059, 'ARMENIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05113, 'BURITICÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05138, 'CAÑASGORDAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05234, 'DABEIBA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05240, 'EBÉJICO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05284, 'FRONTINO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05306, 'GIRALDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05347, 'HELICONIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05411, 'LIBORINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05501, 'OLAYA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05543, 'PEQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05628, 'SABANALARGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05656, 'SAN JERÓNIMO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05042, 'SANTAFÉ DE ANTIOQUIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05761, 'SOPETRÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05842, 'URAMITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05002, 'ABEJORRAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05021, 'ALEJANDRÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05055, 'ARGELIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05148, 'CARMEN DE VIBORAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05197, 'COCORNÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05206, 'CONCEPCIÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05313, 'GRANADA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05318, 'GUARNE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05321, 'GUATAPÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05376, 'LA CEJA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05400, 'LA UNIÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05440, 'MARINILLA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05483, 'NARIÑO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05541, 'PEÑOL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05607, 'RETIRO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05615, 'RIONEGRO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05649, 'SAN CARLOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05652, 'SAN FRANCISCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05660, 'SAN LUIS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05667, 'SAN RAFAEL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05674, 'SAN VICENTE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05697, 'SANTUARIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05756, 'SONSÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05030, 'AMAGÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05034, 'ANDES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05036, 'ANGELÓPOLIS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05091, 'BETANIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05093, 'BETULIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05125, 'CAICEDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05145, 'CARAMANTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05101, 'CIUDAD BOLÍVAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05209, 'CONCORDIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05282, 'FREDONIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05353, 'HISPANIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05364, 'JARDÍN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05368, 'JERICÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05390, 'LA PINTADA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05467, 'MONTEBELLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05576, 'PUEBLORRICO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05642, 'SALGAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05679, 'SANTA BÁRBARA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05789, 'TÁMESIS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05792, 'TARSO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05809, 'TITIRIBÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05847, 'URRAO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05856, 'VALPARAÍSO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05861, 'VENECIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05045, 'APARTADÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05051, 'ARBOLETES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05147, 'CAREPA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05172, 'CHIGORODÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05475, 'MURINDÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05480, 'MUTATÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05490, 'NECOCLÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05659, 'SAN JUAN DE URABÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05665, 'SAN PEDRO DE URABÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05837, 'TURBO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05873, 'VIGÍA DEL FUERTE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05079, 'BARBOSA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05088, 'BELLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05129, 'CALDAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05212, 'COPACABANA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05266, 'ENVIGADO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05308, 'GIRARDOTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05360, 'ITAGÜÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05380, 'LA ESTRELLA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05001, 'MEDELLÍN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (05, 05631, 'SABANETA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (81, 81001, 'ARAUCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (81, 81065, 'ARAUQUITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (81, 81220, 'CRAVO NORTE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (81, 81300, 'FORTUL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (81, 81591, 'PUERTO RONDÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (81, 81736, 'SARAVENA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (81, 81794, 'TAME', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 88564, 'PROVIDENCIA Y SANTA CATALINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 88001, 'SAN ANDRÉS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08001, 'BARRANQUILLA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08296, 'GALAPA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08433, 'MALAMBO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08573, 'PUERTO COLOMBIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08758, 'SOLEDAD', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08137, 'CAMPO DE LA CRUZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08141, 'CANDELARIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08421, 'LURUACO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08436, 'MANATÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08606, 'REPELÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08675, 'SANTA LUCÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08770, 'SUAN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08078, 'BARANOA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08520, 'PALMAR DE VARELA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08558, 'POLONUEVO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08560, 'PONEDERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08634, 'SABANAGRANDE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08638, 'SABANALARGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08685, 'SANTO TOMÁS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08372, 'JUAN DE ACOSTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08549, 'PIOJÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08832, 'TUBARÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (08, 08849, 'USIACURÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (11, 11001, 'BOGOTÁ D.C.', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13188, 'CICUCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13300, 'HATILLO DE LOBA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13440, 'MARGARITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13468, 'MOMPÓS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13650, 'SAN FERNANDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13780, 'TALAIGUA NUEVO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13052, 'ARJONA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13062, 'ARROYOHONDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13140, 'CALAMAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13001, 'CARTAGENA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13222, 'CLEMENCIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13433, 'MAHATES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13620, 'SAN CRISTÓBAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13647, 'SAN ESTANISLAO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13673, 'SANTA CATALINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13683, 'SANTA ROSA DE LIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13760, 'SOPLAVIENTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13836, 'TURBACO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13838, 'TURBANA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13873, 'VILLANUEVA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13030, 'ALTOS DEL ROSARIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13074, 'BARRANCO DE LOBA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13268, 'EL PEÑÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13580, 'REGIDOR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13600, 'RÍO VIEJO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13667, 'SAN MARTÍN DE LOBA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13042, 'ARENAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13160, 'CANTAGALLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13473, 'MORALES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13670, 'SAN PABLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13688, 'SANTA ROSA DEL SUR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13744, 'SIMITÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13006, 'ACHÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13430, 'MAGANGUÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13458, 'MONTECRISTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13549, 'PINILLOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13655, 'SAN JACINTO DEL CAUCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13810, 'TIQUISIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13244, 'CARMEN DE BOLÍVAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13212, 'CÓRDOBA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13248, 'EL GUAMO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13442, 'MARÍA LA BAJA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13654, 'SAN JACINTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13657, 'SAN JUAN NEPOMUCENO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (13, 13894, 'ZAMBRANO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15232, 'CHÍQUIZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15187, 'CHIVATÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15204, 'CÓMBITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15224, 'CUCAITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15476, 'MOTAVITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15500, 'OICATÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15646, 'SAMACÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15740, 'SIACHOQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15762, 'SORA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15764, 'SORACÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15763, 'SOTAQUIRÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15814, 'TOCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15001, 'TUNJA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15837, 'TUTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15861, 'VENTAQUEMADA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15180, 'CHISCAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15223, 'CUBARÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15244, 'EL COCUY', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15248, 'EL ESPINO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15317, 'GUACAMAYAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15332, 'GÜICÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15522, 'PANQUEBA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15377, 'LABRANZAGRANDE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15518, 'PAJARITO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15533, 'PAYA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15550, 'PISBA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15090, 'BERBEO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15135, 'CAMPOHERMOSO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15455, 'MIRAFLORES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15514, 'PÁEZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15660, 'SAN EDUARDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15897, 'ZETAQUIRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15104, 'BOYACÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15189, 'CIÉNEGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15367, 'JENESANO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15494, 'NUEVO COLÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15599, 'RAMIRIQUÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15621, 'RONDÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15804, 'TIBANÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15835, 'TURMEQUÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15842, 'UMBITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15879, 'VIRACACHÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15172, 'CHINAVITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15299, 'GARAGOA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15425, 'MACANAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15511, 'PACHAVITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15667, 'SAN LUIS DE GACENO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15690, 'SANTA MARÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15097, 'BOAVITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15218, 'COVARACHÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15403, 'LA UVITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15673, 'SAN MATEO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15720, 'SATIVANORTE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15723, 'SATIVASUR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15753, 'SOATÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15774, 'SUSACÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15810, 'TIPACOQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15106, 'BRICEÑO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15109, 'BUENAVISTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15131, 'CALDAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15176, 'CHIQUINQUIRÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15212, 'COPER', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15401, 'LA VICTORIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15442, 'MARIPÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15480, 'MUZO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15507, 'OTANCHE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15531, 'PAUNA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15572, 'PUERTO BOYACÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15580, 'QUÍPAMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15632, 'SABOYÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15676, 'SAN MIGUEL DE SEMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15681, 'SAN PABLO BORBUR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15832, 'TUNUNGUÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15022, 'ALMEIDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15236, 'CHIVOR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15322, 'GUATEQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15325, 'GUAYATÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15380, 'LA CAPILLA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15761, 'SOMONDOCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15778, 'SUTATENZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15798, 'TENZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15051, 'ARCABUCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15185, 'CHITARAQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15293, 'GACHANTIVÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15469, 'MONIQUIRÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15600, 'RÁQUIRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15638, 'SÁCHICA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15664, 'SAN JOSÉ DE PARE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15696, 'SANTA SOFÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15686, 'SANTANA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15776, 'SUTAMARCHÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15808, 'TINJACÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15407, 'VILLA DE LEYVA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15047, 'AQUITANIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15226, 'CUÍTIVA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15272, 'FIRAVITOBA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15296, 'GÁMEZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15362, 'IZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15464, 'MONGUA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15466, 'MONGUÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15491, 'NOBSA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15542, 'PESCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15759, 'SOGAMOSO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15806, 'TIBASOSA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15820, 'TÓPAGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15822, 'TOTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15087, 'BELÉN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15114, 'BUSBANZÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15162, 'CERINZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15215, 'CORRALES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15238, 'DUITAMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15276, 'FLORESTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15516, 'PAIPA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15693, 'SANTA ROSA DE VITERBO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15839, 'TUTAZÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15092, 'BETÉITIVA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15183, 'CHITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15368, 'JERICÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15537, 'PAZ DE RÍO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15757, 'SOCHA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15755, 'SOCOTÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (15, 15790, 'TASCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17272, 'FILADELFIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17388, 'LA MERCED', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17442, 'MARMATO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17614, 'RIOSUCIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17777, 'SUPÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17433, 'MANZANARES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17444, 'MARQUETALIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17446, 'MARULANDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17541, 'PENSILVANIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17042, 'ANSERMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17088, 'BELALCÁZAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17616, 'RISARALDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17665, 'SAN JOSÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17877, 'VITERBO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17174, 'CHINCHINÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17001, 'MANIZALES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17486, 'NEIRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17524, 'PALESTINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17873, 'VILLAMARÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17013, 'AGUADAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17050, 'ARANZAZU', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17513, 'PÁCORA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17653, 'SALAMINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17380, 'LA DORADA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17495, 'NORCASIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17662, 'SAMANÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (17, 17867, 'VICTORIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18029, 'ALBANIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18094, 'BELÉN DE LOS ANDAQUÍES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18150, 'CARTAGENA DEL CHAIRÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18205, 'CURRILLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18247, 'EL DONCELLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18256, 'EL PAUJIL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18001, 'FLORENCIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18410, 'LA MONTAÑITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18460, 'MILÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18479, 'MORELIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18592, 'PUERTO RICO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18610, 'SAN JOSÉ DEL FRAGUA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18753, 'SAN VICENTE DEL CAGUÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18756, 'SOLANO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18785, 'SOLITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (18, 18860, 'VALPARAÍSO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85010, 'AGUAZUL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85015, 'CHÁMEZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85125, 'HATO COROZAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85136, 'LA SALINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85139, 'MANÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85162, 'MONTERREY', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85225, 'NUNCHÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85230, 'OROCUÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85250, 'PAZ DE ARIPORO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85263, 'PORE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85279, 'RECETOR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85300, 'SABANALARGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85315, 'SÁCAMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85325, 'SAN LUIS DE PALENQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85400, 'TÁMARA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85410, 'TAURAMENA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85430, 'TRINIDAD', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85440, 'VILLANUEVA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (85, 85001, 'YOPAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19130, 'CAJIBÍO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19256, 'EL TAMBO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19392, 'LA SIERRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19473, 'MORALES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19548, 'PIENDAMÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19001, 'POPAYÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19622, 'ROSAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19760, 'SOTARÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19807, 'TIMBÍO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19110, 'BUENOS AIRES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19142, 'CALOTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19212, 'CORINTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19455, 'MIRANDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19513, 'PADILLA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19573, 'PUERTO TEJADA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19698, 'SANTANDER DE QUILICHAO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19780, 'SUÁREZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19845, 'VILLA RICA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19318, 'GUAPI', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19418, 'LÓPEZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19809, 'TIMBIQUÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19137, 'CALDONO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19355, 'INZÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19364, 'JAMBALÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19517, 'PAEZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19585, 'PURACÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19743, 'SILVIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19821, 'TORIBÍO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19824, 'TOTORÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19022, 'ALMAGUER', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19050, 'ARGELIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19075, 'BALBOA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19100, 'BOLÍVAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19290, 'FLORENCIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19397, 'LA VEGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19450, 'MERCADERES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19532, 'PATÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19533, 'PIAMONTE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19693, 'SAN SEBASTIÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19701, 'SANTA ROSA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (19, 19785, 'SUCRE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20045, 'BECERRIL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20175, 'CHIMICHAGUA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20178, 'CHIRIGUANÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20228, 'CURUMANÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20400, 'LA JAGUA DE IBIRICO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20517, 'PAILITAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20787, 'TAMALAMEQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20032, 'ASTREA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20060, 'BOSCONIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20238, 'EL COPEY', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20250, 'EL PASO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20013, 'AGUSTÍN CODAZZI', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20621, 'LA PAZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20443, 'MANAURE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20570, 'PUEBLO BELLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20750, 'SAN DIEGO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20001, 'VALLEDUPAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20011, 'AGUACHICA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20295, 'GAMARRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20310, 'GONZÁLEZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20383, 'LA GLORIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20550, 'PELAYA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20614, 'RÍO DE ORO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20710, 'SAN ALBERTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (20, 20770, 'SAN MARTÍN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27050, 'ATRATO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27073, 'BAGADÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27099, 'BOJAYÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27245, 'EL CARMEN DE ATRATO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27413, 'LLORÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27425, 'MEDIO ATRATO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27001, 'QUIBDÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27600, 'RÍO QUITO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27006, 'ACANDÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27086, 'BELÉN DE BAJIRÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27150, 'CARMÉN DEL DARIÉN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27615, 'RIOSUCIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27800, 'UNGUÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27075, 'BAHÍA SOLANO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27372, 'JURADÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27495, 'NUQUÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27025, 'ALTO BAUDÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27077, 'BAJO BAUDÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27250, 'EL LITORAL DEL SAN JUAN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27430, 'MEDIO BAUDÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27135, 'CANTÓN DE SAN PABLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27160, 'CERTEGUÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27205, 'CONDOTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27361, 'ITSMINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27450, 'MEDIO SAN JUAN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27491, 'NÓVITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27580, 'RÍO FRÍO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27660, 'SAN JOSÉ DEL PALMAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27745, 'SIPÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27787, 'TADÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (27, 27810, 'UNIÓN PANAMERICANA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23807, 'TIERRALTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23855, 'VALENCIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23168, 'CHIMÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23300, 'COTORRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23417, 'LORICA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23464, 'MOMIL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23586, 'PURÍSIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23001, 'MONTERÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23090, 'CANALETE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23419, 'LOS CÓRDOBAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23500, 'MOÑITOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23574, 'PUERTO ESCONDIDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23672, 'SAN ANTERO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23675, 'SAN BERNARDO DEL VIENTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23182, 'CHINÚ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23660, 'SAHAGÚN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23670, 'SAN ANDRÉS SOTAVENTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23068, 'AYAPEL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23079, 'BUENAVISTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23350, 'LA APARTADA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23466, 'MONTELÍBANO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23555, 'PLANETA RICA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23570, 'PUEBLO NUEVO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23580, 'PUERTO LIBERTADOR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23162, 'CERETÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23189, 'CIÉNAGA DE ORO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23678, 'SAN CARLOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (23, 23686, 'SAN PELAYO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25183, 'CHOCONTÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25426, 'MACHETÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25436, 'MANTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25736, 'SESQUILÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25772, 'SUESCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25807, 'TIBIRITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25873, 'VILLAPINZÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25001, 'AGUA DE DIOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25307, 'GIRARDOT', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25324, 'GUATAQUÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25368, 'JERUSALÉN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25483, 'NARIÑO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25488, 'NILO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25612, 'RICAURTE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25815, 'TOCAIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25148, 'CAPARRAPÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25320, 'GUADUAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25572, 'PUERTO SALGAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25019, 'ALBÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25398, 'LA PEÑA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25402, 'LA VEGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25489, 'NIMAIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25491, 'NOCAIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25592, 'QUEBRADANEGRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25658, 'SAN FRANCISCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25718, 'SASAIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25777, 'SUPATÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25851, 'ÚTICA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25862, 'VERGARA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25875, 'VILLETA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25293, 'GACHALÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25297, 'GACHETÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25299, 'GAMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25322, 'GUASCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25326, 'GUATAVITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25372, 'JUNÍN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25377, 'LA CALERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25839, 'UBALÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25086, 'BELTRÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25095, 'BITUIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25168, 'CHAGUANÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25328, 'GUAYABAL DE SÍQUIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25580, 'PULÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25662, 'SAN JUAN DE RÍO SECO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25867, 'VIANÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25438, 'MEDINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25530, 'PARATEBUENO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25151, 'CAQUEZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25178, 'CHIPAQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25181, 'CHOACHÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25279, 'FOMEQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25281, 'FOSCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25335, 'GUAYABETAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25339, 'GUTIÉRREZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25594, 'QUETAME', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25841, 'UBAQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25845, 'UNE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25258, 'EL PEÑÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25394, 'LA PALMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25513, 'PACHO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25518, 'PAIME', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25653, 'SAN CAYETANO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25823, 'TOPAIPÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25871, 'VILLAGÓMEZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25885, 'YACOPÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25126, 'CAJICÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25175, 'CHÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25200, 'COGUA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25295, 'GACHANCIPÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25486, 'NEMOCÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25758, 'SOPÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25785, 'TABIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25817, 'TOCANCIPÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25899, 'ZIPAQUIRÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25099, 'BOJACÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25214, 'COTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25260, 'EL ROSAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25269, 'FACATATIVÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25286, 'FUNZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25430, 'MADRID', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25473, 'MOSQUERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25769, 'SUBACHOQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25799, 'TENJO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25898, 'ZIPACÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25740, 'SIBATÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25754, 'SOACHA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25053, 'ARBELÁEZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25120, 'CABRERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25290, 'FUSAGASUGÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25312, 'GRANADA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25524, 'PANDI', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25535, 'PASCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25649, 'SAN BERNARDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25743, 'SILVANIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25805, 'TIBACUY', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25506, 'VENECIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25035, 'ANAPOIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25040, 'ANOLAIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25599, 'APULO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25123, 'CACHIPAY', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25245, 'EL COLEGIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25386, 'LA MESA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25596, 'QUÍPILE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25645, 'SAN ANTONIO DE TEQUENDAMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25797, 'TENA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25878, 'VIOTÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25154, 'CARMEN DE CARUPA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25224, 'CUCUNUBÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25288, 'FÚQUENE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25317, 'GUACHETÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25407, 'LENGUAZAQUE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25745, 'SIMIJACA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25779, 'SUSA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25781, 'SUTATAUSA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25793, 'TAUSA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (25, 25843, 'UBATÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (94, 94343, 'BARRANCO MINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (94, 94886, 'CACAHUAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (94, 94001, 'INÍRIDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (94, 94885, 'LA GUADALUPE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (94, 94663, 'MAPIRIPÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (94, 94888, 'MORICHAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (94, 94887, 'PANA PANA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (94, 94884, 'PUERTO COLOMBIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (94, 94883, 'SAN FELIPE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (95, 95015, 'CALAMAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (95, 95025, 'EL RETORNO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (95, 95200, 'MIRAFLORES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (95, 95001, 'SAN JOSÉ DEL GUAVIARE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41013, 'AGRADO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41026, 'ALTAMIRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41298, 'GARZÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41306, 'GIGANTE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41319, 'GUADALUPE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41548, 'PITAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41770, 'SUAZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41791, 'TARQUI', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41016, 'AIPE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41020, 'ALGECIRAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41078, 'BARAYA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41132, 'CAMPOALEGRE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41206, 'COLOMBIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41349, 'HOBO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41357, 'ÍQUIRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41001, 'NEIVA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41524, 'PALERMO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41615, 'RIVERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41676, 'SANTA MARÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41799, 'TELLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41801, 'TERUEL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41872, 'VILLAVIEJA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41885, 'YAGUARÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41378, 'LA ARGENTINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41396, 'LA PLATA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41483, 'NÁTAGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41518, 'PAICOL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41797, 'TESALIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41006, 'ACEVEDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41244, 'ELÍAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41359, 'ISNOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41503, 'OPORAPA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41530, 'PALESTINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41551, 'PITALITO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41660, 'SALADOBLANCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41668, 'SAN AGUSTÍN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (41, 41807, 'TIMANÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44035, 'ALBANIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44090, 'DIBULLA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44430, 'MAICAO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44560, 'MANAURE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44001, 'RIOHACHA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44847, 'URIBIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44078, 'BARRANCAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44098, 'DISTRACCIÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44110, 'EL MOLINO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44279, 'FONSECA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44378, 'HATONUEVO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44420, 'LA JAGUA DEL PILAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44650, 'SAN JUAN DEL CESAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44855, 'URUMITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (44, 44874, 'VILLANUEVA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47058, 'ARIGUANÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47170, 'CHIBOLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47460, 'NUEVA GRANADA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47555, 'PLATO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47660, 'SABANAS DE SAN ÁNGEL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47798, 'TENERIFE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47030, 'ALGARROBO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47053, 'ARACATACA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47189, 'CIÉNAGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47268, 'EL RETÉN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47288, 'FUNDACIÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47570, 'PUEBLO VIEJO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47980, 'ZONA BANANERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47161, 'CERRO SAN ANTONIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47205, 'CONCORDIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47258, 'EL PIÑÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47541, 'PEDRAZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47551, 'PIVIJAY', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47605, 'REMOLINO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47675, 'SALAMINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47745, 'SITIONUEVO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47960, 'ZAPAYÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47001, 'SANTA MARTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47245, 'EL BANCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47318, 'GUAMAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47545, 'PIJIÑO DEL CARMEN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47692, 'SAN SEBASTIÁN DE BUENAVISTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47703, 'SAN ZENÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47707, 'SANTA ANA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (47, 47720, 'SANTA BÁRBARA DE PINTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50251, 'EL CASTILLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50270, 'EL DORADO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50287, 'FUENTE DE ORO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50313, 'GRANADA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50350, 'LA MACARENA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50370, 'LA URIBE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50400, 'LEJANÍAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50325, 'MAPIRIPÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50330, 'MESETAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50450, 'PUERTO CONCORDIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50577, 'PUERTO LLERAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50590, 'PUERTO RICO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50683, 'SAN JUAN DE ARAMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50711, 'VISTA HERMOSA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50001, 'VILLAVICENCIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50006, 'ACACÍAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50110, 'BARRANCA DE UPÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50150, 'CASTILLA LA NUEVA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50226, 'CUMARAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50245, 'EL CALVARIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50318, 'GUAMAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50606, 'RESTREPO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50680, 'SAN CARLOS GUAROA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50686, 'SAN JUANITO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50223, 'SAN LUIS DE CUBARRAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50689, 'SAN MARTÍN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50124, 'CABUYARO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50568, 'PUERTO GAITÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (50, 50573, 'PUERTO LÓPEZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52240, 'CHACHAGÜÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52207, 'CONSACÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52254, 'EL PEÑOL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52260, 'EL TAMBO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52381, 'LA FLORIDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52480, 'NARIÑO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52001, 'PASTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52683, 'SANDONÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52788, 'TANGUA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52885, 'YACUANQUER', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52036, 'ANCUYÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52320, 'GUAITARILLA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52385, 'LA LLANADA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52411, 'LINARES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52418, 'LOS ANDES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52435, 'MALLAMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52506, 'OSPINA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52565, 'PROVIDENCIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52612, 'RICAURTE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52678, 'SAMANIEGO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52699, 'SANTA CRUZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52720, 'SAPUYES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52838, 'TÚQUERRES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52079, 'BARBACOAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52250, 'EL CHARCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52520, 'FRANCISCO PIZARRO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52390, 'LA TOLA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52427, 'MAGÜÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52473, 'MOSQUERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52490, 'OLAYA HERRERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52621, 'ROBERTO PAYÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52696, 'SANTA BÁRBARA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52835, 'TUMACO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52019, 'ALBÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52051, 'ARBOLEDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52083, 'BELÉN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52110, 'BUESACO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52203, 'COLÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52233, 'CUMBITARA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52256, 'EL ROSARIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52258, 'EL TABLÓN DE GÓMEZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52378, 'LA CRUZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52399, 'LA UNIÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52405, 'LEIVA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52540, 'POLICARPA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52685, 'SAN BERNARDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52687, 'SAN LORENZO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52693, 'SAN PABLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52694, 'SAN PEDRO DE CARTAGO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52786, 'TAMINANGO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52022, 'ALDANA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52210, 'CONTADERO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52215, 'CÓRDOBA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52224, 'CUASPUD', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52227, 'CUMBAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52287, 'FUNES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52317, 'GUACHUCAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52323, 'GUALMATÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52352, 'ILES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52354, 'IMUÉS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52356, 'IPIALES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52560, 'POTOSÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52573, 'PUERRES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (52, 52585, 'PUPIALES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54051, 'ARBOLEDAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54223, 'CUCUTILLA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54313, 'GRAMALOTE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54418, 'LOURDES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54660, 'SALAZAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54680, 'SANTIAGO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54871, 'VILLA CARO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54109, 'BUCARASICA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54250, 'EL TARRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54720, 'SARDINATA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54810, 'TIBÚ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54003, 'ÁBREGO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54128, 'CACHIRÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54206, 'CONVENCIÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54245, 'EL CARMEN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54344, 'HACARÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54385, 'LA ESPERANZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54398, 'LA PLAYA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54498, 'OCAÑA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54670, 'SAN CALIXTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54800, 'TEORAMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54001, 'CÚCUTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54261, 'EL ZULIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54405, 'LOS PATIOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54553, 'PUERTO SANTANDER', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54673, 'SAN CAYETANO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54874, 'VILLA DEL ROSARIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54125, 'CÁCOTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54174, 'CHITAGÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54480, 'MUTISCUA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54518, 'PAMPLONA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54520, 'PAMPLONITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54743, 'SILOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54099, 'BOCHALEMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54172, 'CHINÁCOTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54239, 'DURANIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54347, 'HERRÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54377, 'LABATECA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54599, 'RAGONVALIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (54, 54820, 'TOLEDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86219, 'COLÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86001, 'MOCOA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86320, 'ORITO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86568, 'PUERTO ASÍS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86569, 'PUERTO CAICEDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86571, 'PUERTO GUZMÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86573, 'PUERTO LEGUÍZAMO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86755, 'SAN FRANCISCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86757, 'SAN MIGUEL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86760, 'SANTIAGO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86749, 'SIBUNDOY', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86865, 'VALLE DEL GUAMUEZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (86, 86885, 'VILLA GARZÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63001, 'ARMENIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63111, 'BUENAVISTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63130, 'CALARCÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63212, 'CÓRDOBA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63302, 'GÉNOVA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63548, 'PIJAO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63272, 'FILANDIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63690, 'SALENTO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63190, 'CIRCASIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63401, 'LA TEBAIDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63470, 'MONTENEGRO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (63, 63594, 'QUIMBAYA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66170, 'DOSQUEBRADAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66400, 'LA VIRGINIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66440, 'MARSELLA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66001, 'PEREIRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66682, 'SANTA ROSA DE CABAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66045, 'APÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66075, 'BALBOA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66088, 'BELÉN DE UMBRÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66318, 'GUÁTICA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66383, 'LA CELIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66594, 'QUINCHÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66687, 'SANTUARIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66456, 'MISTRATÓ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (66, 66572, 'PUEBLO RICO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68176, 'CHIMÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68209, 'CONFINES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68211, 'CONTRATACIÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68245, 'EL GUACAMAYO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68296, 'GALÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68298, 'GÁMBITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68320, 'GUADALUPE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68322, 'GUAPOTÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68344, 'HATO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68500, 'OIBA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68522, 'PALMAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68524, 'PALMAS DEL SOCORRO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68720, 'SANTA HELENA DEL OPÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68745, 'SIMACOTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68755, 'SOCORRO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68770, 'SUAITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68147, 'CAPITANEJO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68152, 'CARCASÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68160, 'CEPITÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68162, 'CERRITO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68207, 'CONCEPCIÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68266, 'ENCISO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68318, 'GUACÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68425, 'MACARAVITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68432, 'MÁLAGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68468, 'MOLAGAVITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68669, 'SAN ANDRÉS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68684, 'SAN JOSÉ DE MIRANDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68686, 'SAN MIGUEL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68051, 'ARATOCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68079, 'BARICHARA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68121, 'CABRERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68167, 'CHARALÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68217, 'COROMORO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68229, 'CURITÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68264, 'ENCINO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68370, 'JORDÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68464, 'MOGOTES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68498, 'OCAMONTE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68502, 'ONZAGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68533, 'PÁRAMO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68549, 'PINCHOTE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68679, 'SAN GIL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68682, 'SAN JOAQUÍN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68855, 'VALLE DE SAN JOSÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68872, 'VILLANUEVA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68081, 'BARRANCABERMEJA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68092, 'BETULIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68235, 'EL CARMEN DE CHUCURÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68575, 'PUERTO WILCHES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68655, 'SABANA DE TORRES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68689, 'SAN VICENTE DE CHUCURÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68895, 'ZAPATOCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68001, 'BUCARAMANGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68132, 'CALIFORNIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68169, 'CHARTÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68255, 'EL PLAYÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68276, 'FLORIDABLANCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68307, 'GIRÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68406, 'LEBRÍJA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68418, 'LOS SANTOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68444, 'MATANZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68547, 'PIEDECUESTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68615, 'RIONEGRO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68705, 'SANTA BÁRBARA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68780, 'SURATÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68820, 'TONA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68867, 'VETAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68013, 'AGUADA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68020, 'ALBANIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68077, 'BARBOSA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68101, 'BOLÍVAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68179, 'CHIPATÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68190, 'CIMITARRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68250, 'EL PEÑÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68271, 'FLORIÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68324, 'GUAVATÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68327, 'GÜEPSA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68368, 'JESÚS MARÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68377, 'LA BELLEZA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68397, 'LA PAZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68385, 'LANDÁZURI', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68572, 'PUENTE NACIONAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68573, 'PUERTO PARRÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68673, 'SAN BENITO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68773, 'SUCRE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (68, 68861, 'VÉLEZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70265, 'GUARANDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70429, 'MAJAGUAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70771, 'SUCRE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70230, 'CHALÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70204, 'COLOSO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70473, 'MORROA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70508, 'OVEJAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70001, 'SINCELEJO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70221, 'COVEÑAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70523, 'PALMITO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70713, 'SAN ONOFRE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70820, 'SANTIAGO DE TOLÚ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70823, 'TOLÚ VIEJO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70110, 'BUENAVISTA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70215, 'COROZAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70233, 'EL ROBLE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70235, 'GALERAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70418, 'LOS PALMITOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70670, 'SAMPUÉS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70702, 'SAN JUAN BETULIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70717, 'SAN PEDRO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70742, 'SINCÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70124, 'CAIMITO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70400, 'LA UNIÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70678, 'SAN BENITO ABAD', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (70, 70708, 'SAN MARCOS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73030, 'AMBALEMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73055, 'ARMERO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73270, 'FALÁN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73283, 'FRESNO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73349, 'HONDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73443, 'MARIQUITA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73520, 'PALOCABILDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73148, 'CARMEN DE APICALÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73226, 'CUNDAY', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73352, 'ICONONZO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73449, 'MELGAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73873, 'VILLARRICA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73067, 'ATACO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73168, 'CHAPARRAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73217, 'COYAIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73483, 'NATAGAIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73504, 'ORTEGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73555, 'PLANADAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73616, 'RIOBLANCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73622, 'RONCESVALLES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73675, 'SAN ANTONIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73026, 'ALVARADO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73043, 'ANZOÁTEGUI', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73124, 'CAJAMARCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73200, 'COELLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73268, 'ESPINAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73275, 'FLANDES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73001, 'IBAGUÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73547, 'PIEDRAS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73624, 'ROVIRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73678, 'SAN LUIS', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73854, 'VALLE DE SAN JUAN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73024, 'ALPUJARRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73236, 'DOLORES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73319, 'GUAMO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73563, 'PRADO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73585, 'PURIFICACIÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73671, 'SALDAÑA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73770, 'SUÁREZ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73152, 'CASABIANCA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73347, 'HERVEO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73408, 'LÉRIDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73411, 'LÍBANO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73461, 'MURILLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73686, 'SANTA ISABEL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73861, 'VENADILLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (73, 73870, 'VILLAHERMOSA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76036, 'ANDALUCÍA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76111, 'BUGA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76113, 'BUGALAGRANDE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76126, 'CALIMA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76248, 'EL CERRITO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76306, 'GINEBRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76318, 'GUACARÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76606, 'RESTREPO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76616, 'RIOFRÍO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76670, 'SAN PEDRO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76828, 'TRUJILLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76834, 'TULUÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76890, 'YOTOCO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76020, 'ALCALÁ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76041, 'ANSERMANUEVO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76054, 'ARGELIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76100, 'BOLÍVAR', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76147, 'CARTAGO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76243, 'EL ÁGUILA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76246, 'EL CAIRO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76250, 'EL DOVIO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76400, 'LA UNIÓN', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76403, 'LA VICTORIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76497, 'OBANDO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76622, 'ROLDANILLO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76823, 'TORO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76845, 'ULLOA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76863, 'VERSALLES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76895, 'ZARZAL', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76109, 'BUENAVENTURA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76122, 'CAICEDONIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76736, 'SEVILLA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76001, 'CALI', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76130, 'CANDELARIA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76233, 'DAGUA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76275, 'FLORIDA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76364, 'JAMUNDÍ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76377, 'LA CUMBRE', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76520, 'PALMIRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76563, 'PRADERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76869, 'VIJES', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (76, 76892, 'YUMBO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (97, 97161, 'CARURÚ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (97, 97001, 'MITÚ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (97, 97511, 'PACOA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (97, 97777, 'PAPUNAHUA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (97, 97666, 'TARAIRA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (97, 97889, 'YAVARATÉ', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (99, 99773, 'CUMARIBO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (99, 99524, 'LA PRIMAVERA', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (99, 99001, 'PUERTO CARREÑO', FALSE, FALSE);
INSERT INTO tabla_municipios VALUES (99, 99624, 'SANTA ROSALÍA', FALSE, FALSE);

-- CARGAR EN TABLA_SITIOS
INSERT INTO tabla_sitios VALUES (1, 'Teatro Santander', 1, 'Desde 1932, el Teatro Santander ocupa un lugar privilegiado en el corazón de Bucaramanga. Ubicado en el Barrio Centro de la ciudad, junto al Parque Centenario, el Teatro Santander se distingue por su destacado carácter arquitectónico, sus exigentes condiciones técnicas y una oferta variada y de alta calidad.​', TRUE, 68001, 'Calle 33 #18-60', '7,12116°', '-73,12401°', 6076424232, 3245670437, 'https://www.teatrosantanderbga.com/');
INSERT INTO tabla_sitios VALUES (2, 'Neomundo - Centro de convenciones y eventos', 2, 'Neomundo se destaca como uno de los centros de convenciones y eventos más importantes de Colombia. Su oferta se organiza en cuatro líneas de negocio: Arrendamiento de Espacios para Eventos, Arrendamiento Inmobiliario, Operación Logística de Eventos y Proyectos Especiales.', TRUE, 68001, 'Calle 89 Transversal Oriental Metropolitana-69, Barrio, Cl. 100,', '7,10215°', '-73,10619°', 6077000260, 3023246560, 'https://neomundo.co/');

-- CARGAR EN TABLA_TIPO_INFRAEST_DISC
INSERT INTO tabla_tipo_infraest_disc VALUES (1, 'Ascensor' );
INSERT INTO tabla_tipo_infraest_disc VALUES (2, 'Rampa' );
INSERT INTO tabla_tipo_infraest_disc VALUES (3, 'Estacionamiento' );
INSERT INTO tabla_tipo_infraest_disc VALUES (4, 'Señalización en Braille' );

-- CARGAR EN TABLA_SITIOS_DISC
INSERT INTO tabla_sitios_disc VALUES (1, 1, 1, 'Ascensor en el lobby del Teatro Santander');
INSERT INTO tabla_sitios_disc VALUES (2, 1, 2, 'Rampa en la entrada del Teatro Santander');
INSERT INTO tabla_sitios_disc VALUES (3, 2, 1, 'Ascensor cerca a la entrada de Neomundo');
INSERT INTO tabla_sitios_disc VALUES (4, 2, 2, 'Rampa en la entrada y para acceder entre los pisos de Neomundo');
INSERT INTO tabla_sitios_disc VALUES (5, 2, 3, 'Señalización en braille en las distintos accesos de Neomundo');
