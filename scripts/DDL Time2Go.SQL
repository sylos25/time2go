/*
|------------------------------------------------------------------------------------|
| DDL Time2Go                                                                       |
| AUTORES : BRAYHAN ORDUZ Y WILLIAM ROJAS                                           |
| FECHA   : 2025-07-06                                                              |
| DESCRIPCION: Script de creacion de tablas y relaciones para la aplicacion Time2Go |
|------------------------------------------------------------------------------------|
*/
-- BORRADO TABLAS
DROP TABLE IF EXISTS tabla_imagenes;
DROP TABLE IF EXISTS tabla_paises;
DROP TABLE IF EXISTS tabla_departamentos;
DROP TABLE IF EXISTS tabla_municipios;
DROP TABLE IF EXISTS tabla_tipo_sitios;
DROP TABLE IF EXISTS tabla_sitios;
DROP TABLE IF EXISTS tabla_tipo_infraest_disc;
DROP TABLE IF EXISTS tabla_sitios_disc;
DROP TABLE IF EXISTS tabla_menu;
DROP TABLE IF EXISTS tabla_roles;
DROP TABLE IF EXISTS tabla_usuarios;
DROP TABLE IF EXISTS tabla_menu_usuario;
DROP TABLE IF EXISTS tabla_baneados;
DROP TABLE IF EXISTS tabla_categorias_eventos;
DROP TABLE IF EXISTS tabla_tipos_eventos;
DROP TABLE IF EXISTS tabla_eventos;
DROP TABLE IF EXISTS tabla_valoraciones;
DROP TABLE IF EXISTS tabla_reservas_eventos;
DROP TABLE IF EXISTS tabla_costos;
DROP TABLE IF EXISTS tabla_costos_eventos;


CREATE TYPE tip_doc     AS ENUM ('Tarjeta de Identidad', 'Cédula de Ciudadanía', 'Cédula de Extranjería', 'Pasaporte');
CREATE TYPE tip_rol     AS ENUM ('Usuario', 'Promotor', 'Administrador', 'SuperAdministrador');
CREATE TYPE estado_pago AS ENUM ('Pendiente', 'Pagado', 'Fallido');

-- CREACION DE TABLAS

CREATE TABLE IF NOT EXISTS tabla_imagenes (
    id_imagen               SERIAL                      PRIMARY KEY,
    url_imagen              VARCHAR                     NOT NULL        UNIQUE,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP
);

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
    latitud                 DECIMAL(10,8)               NOT NULL        UNIQUE,
    longitud                DECIMAL(11,8)               NOT NULL        UNIQUE,
    telefono                DECIMAL(10,0)               NOT NULL        UNIQUE CHECK (telefono > 2999999999),
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
	numero_documento        VARCHAR(10)                 NOT NULL        UNIQUE,
	tipo_documento          tip_doc                     NOT NULL,
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
    id_rol                  INT                         NOT NULL,
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
    id_usuario              INT                         NOT NULL,
    motivo_ban              TEXT                        NOT NULL,
    incio_ban               TIMESTAMP                   NOT NULL,
    termina_ban             TIMESTAMP                   NOT NULL,
    responsable             INT                         NOT NULL,
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
    id_evento               SERIAL                      PRIMARY KEY,
    nombre_evento           VARCHAR                     NOT NULL        CHECK (char_length(nombre_evento) >= 6),
    id_usuario              INT                         NOT NULL,
    id_tipo_evento          INT                         NOT NULL,
    id_municipio            INT                         NOT NULL,
    id_sitio                INT                         NOT NULL,
    descripcion             TEXT                        NOT NULL,
    telefono                DECIMAL(10,0)               NOT NULL        UNIQUE CHECK (telefono > 2999999999),
    fecha_inicio            DATE                        NOT NULL,
    fecha_fin               DATE                        NOT NULL,
    dias_semana             VARCHAR                     NOT NULL,
    hora_inicio             TIME                        NOT NULL,
    hora_final              TIME                        NOT NULL,
    dinero                  BOOLEAN                     NOT NULL        DEFAULT FALSE,
    cupo                    INT                         NOT NULL        DEFAULT 0 CHECK (cupo >= 0),
    estado                  BOOLEAN                     NOT NULL        DEFAULT TRUE,
    id_imagen               INT                         NOT NULL,
    fecha_creacion          TIMESTAMP   WITH TIME ZONE  NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    fecha_desactivacion     TIMESTAMP   WITH TIME ZONE,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(numero_documento),
    FOREIGN KEY (id_tipo_evento) REFERENCES tabla_tipo_eventos(id_tipo_evento),
    FOREIGN KEY (id_municipio) REFERENCES tabla_municipios(id_municipio),
    FOREIGN KEY (id_sitio) REFERENCES tabla_sitios(id_sitio),
    FOREIGN KEY (id_imagen) REFERENCES tabla_imagenes(id_imagen)
);

CREATE TABLE IF NOT EXISTS tabla_valoraciones (
    id_valoracion           SERIAL                      PRIMARY KEY,
    id_usuario              INT                         NOT NULL,
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
    id_usuario              INT                         NOT NULL,
    id_evento               INT                         NOT NULL,
    fecha_reserva           TIMESTAMP                   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    estado                  BOOLEAN                     NOT NULL        DEFAULT 'TRUE',
    fecha_actualizacion     TIMESTAMP                   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(numero_documento),
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_costos (
    id_costo                INT                         PRIMARY KEY,
    Boleteria               VARCHAR                     NOT NULL,
    Costo                   DECIMAL(9,2)                NOT NULL,
    fecha_actualizacion     TIMESTAMP WITH TIME ZONE                    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tabla_costos_eventos (
    id_costo_eventos        SERIAL                      PRIMARY KEY,
    id_costo                INT                         NOT NULL,
    id_evento               INT                         NOT NULL,
    fecha_actualizacion     TIMESTAMP                   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_costo) REFERENCES tabla_costos(id_costo),
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

/*
CREATE TABLE IF NOT EXISTS tabla_facturas_encabezado (
    id_factura_encabezado   SERIAL                      PRIMARY KEY,
    id_usuario              INT                         NOT NULL,
    id_evento               INT                         NOT NULL,
    ip_transaccion          VARCHAR                     NOT NULL        UNIQUE,
    cant_entrada            INT                         NOT NULL        CHECK (cant_entrada > 0),
    total_pagar             DECIMAL(10,2)               NOT NULL        CHECK (total_pagar >= 0),
    fecha_pago              TIMESTAMP                   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    estado                  estado_pago                 NOT NULL        DEFAULT 'Pendiente'::estado_pago,
    metodo_pago             VARCHAR                     NOT NULL,
    fecha_actualizacion     TIMESTAMP WITH TIME ZONE                    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(id_usuario),
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_facturas_encabezado (
    id_factura_encabezado   SERIAL                      PRIMARY KEY,
    id_usuario              INT                         NOT NULL,
    id_evento               INT                         NOT NULL,
    ip_transaccion          VARCHAR                     NOT NULL        UNIQUE,
    cant_entrada            INT                         NOT NULL        CHECK (cant_entrada > 0),
    total_pagar             DECIMAL(10,2)               NOT NULL        CHECK (total_pagar >= 0),
    fecha_pago              TIMESTAMP                   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    estado                  estado_pago                 NOT NULL        DEFAULT 'Pendiente'::estado_pago,
    metodo_pago             VARCHAR                     NOT NULL,
    fecha_actualizacion     TIMESTAMP WITH TIME ZONE                    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(id_usuario),
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);

CREATE TABLE IF NOT EXISTS tabla_facturas_contenido (
    id_pago                 SERIAL                      PRIMARY KEY,
    id_usuario              INT                         NOT NULL,
    id_evento               INT                         NOT NULL,
    ip_transaccion          VARCHAR                     NOT NULL        UNIQUE,
    cant_entrada            INT                         NOT NULL        CHECK (cant_entrada > 0),
    total_pagar             DECIMAL(10,2)               NOT NULL        CHECK (total_pagar >= 0),
    fecha_pago              TIMESTAMP                   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    estado                  estado_pago                 NOT NULL        DEFAULT 'Pendiente'::estado_pago,
    metodo_pago             VARCHAR                     NOT NULL,
    fecha_actualizacion     TIMESTAMP WITH TIME ZONE                    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(id_usuario),
    FOREIGN KEY (id_evento) REFERENCES tabla_eventos(id_evento)
);


CREATE TABLE IF NOT EXISTS tabla_reembolsos (
    id_reembolso            SERIAL PRIMARY KEY,
    id_reserva_evento       INT NOT NULL,
    id_pago                 INT,
    id_usuario              INT NOT NULL,
    fecha_solicitud         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo_reembolso        TEXT NOT NULL,
    estado_reembolso        VARCHAR NOT NULL CHECK (estado_reembolso IN ('Pendiente', 'Aprobado', 'Rechazado')) DEFAULT 'Pendiente',
    ip_transaccion_reembolso VARCHAR,
    fecha_actualizacion     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_reserva_evento) REFERENCES tabla_reserva_eventos(id_reserva_evento),
    FOREIGN KEY (id_pago) REFERENCES tabla_pagos(id_pago),
    FOREIGN KEY (id_usuario) REFERENCES tabla_usuarios(id_usuario)
);*/


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

INSERT INTO tabla_usuarios (
    nombres, apellidos, tipo_documento, numero_documento, id_pais, id_ciudad, telefono, correo, contrasena_hash
) VALUES 
('Juan', 'Pérez', 'Cédula', '1234567890', 1, 1, 3001234567, 'juan@example.com', 'hash123'),
('Ana', 'López', 'Pasaporte', 'P987654321', 2, 3, 3123456789, 'ana@example.com', 'hash456');

INSERT INTO tabla_verificaciones (
    id_usuario, token, tipo_validacion, fecha_expiracion
) VALUES 
(1, 'token123', 'Validar correo', CURRENT_TIMESTAMP + INTERVAL '1 day');

INSERT INTO tabla_menu_usuario (id_menu_usuario, id_usuario, id_menu, permisos) VALUES 
(1, 1, 1, TRUE),
(2, 1, 2, TRUE);

INSERT INTO tabla_baneado (id_usuario, mot_ban) VALUES 
(2, 'Incumplimiento de normas');

INSERT INTO tabla_tipo_eventos (id_tipo_evento, nombre, descripcion) VALUES 
(1, 'Concierto', 'Eventos musicales en vivo'),
(2, 'Feria', 'Eventos de exposición y ventas');

INSERT INTO tabla_eventos (
    nombre_evento, id_tipo_evento, descripcion, id_pais, id_ciudad, direccion, telefono, fecha_inicio, fecha_fin, horario, costo, cupo, id_imagen
) VALUES 
('Festival Vallenato', 1, 'Música en vivo todo el día', 1, 1, 'Parque principal', 3123456789, '2025-07-01', '2025-07-03', '10am - 11pm', 50.00, 500, 1);

INSERT INTO tabla_valoraciones (id_usuario, id_evento, valoracion) VALUES 
(1, 1, 5);

INSERT INTO tabla_pagos (id_reserva_evento, ip_transaccion, valor_entrada, cant_entrada, total_pagar, estado, metodo_pago) VALUES 
(1, 'TX123456789', 50.00, 2, 100.00, 'Pagado', 'Tarjeta de crédito');

INSERT INTO tabla_reembolsos (id_reserva_evento, id_pago, id_usuario, motivo_reembolso, eestado_reembolso) VALUES 
(1, 1, 1, 'No pude asistir', 'Pendiente');


--CARGA TABLE DE ROLES
INSERT INTO tabla_roles VALUES  (1,'Usuario');

-- CARGA TABLE DE PAIS.
INSERT INTO tabla_paises VALUES  (1, 'Colombia')

-- CARGA TABLE DE DAPARTAMENTOS SEGÚN DANE.
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

-- CARGA DE MUNICIPIOS SEGÚN DANE.
INSERT INTO tabla_municipios VALUES (91,91263,'EL ENCANTO');
INSERT INTO tabla_municipios VALUES (91,91405,'LA CHORRERA');
INSERT INTO tabla_municipios VALUES (91,91407,'LA PEDRERA');
INSERT INTO tabla_municipios VALUES (91,91430,'LA VICTORIA');
INSERT INTO tabla_municipios VALUES (91,91001,'LETICIA');
INSERT INTO tabla_municipios VALUES (91,91460,'MIRITI - PARANÁ');
INSERT INTO tabla_municipios VALUES (91,91530,'PUERTO ALEGRIA');
INSERT INTO tabla_municipios VALUES (91,91536,'PUERTO ARICA');
INSERT INTO tabla_municipios VALUES (91,91540,'PUERTO NARIÑO');
INSERT INTO tabla_municipios VALUES (91,91669,'PUERTO SANTANDER');
INSERT INTO tabla_municipios VALUES (91,91798,'TARAPACÁ');
INSERT INTO tabla_municipios VALUES (05,05120,'CÁCERES');
INSERT INTO tabla_municipios VALUES (05,05154,'CAUCASIA');
INSERT INTO tabla_municipios VALUES (05,05250,'EL BAGRE');
INSERT INTO tabla_municipios VALUES (05,05495,'NECHÍ');
INSERT INTO tabla_municipios VALUES (05,05790,'TARAZÁ');
INSERT INTO tabla_municipios VALUES (05,05895,'ZARAGOZA');
INSERT INTO tabla_municipios VALUES (05,05142,'CARACOLÍ');
INSERT INTO tabla_municipios VALUES (05,05425,'MACEO');
INSERT INTO tabla_municipios VALUES (05,05579,'PUERTO BERRiO');
INSERT INTO tabla_municipios VALUES (05,05585,'PUERTO NARE');
INSERT INTO tabla_municipios VALUES (05,05591,'PUERTO TRIUNFO');
INSERT INTO tabla_municipios VALUES (05,05893,'YONDÓ');
INSERT INTO tabla_municipios VALUES (05,05031,'AMALFI');
INSERT INTO tabla_municipios VALUES (05,05040,'ANORÍ');
INSERT INTO tabla_municipios VALUES (05,05190,'CISNEROS');
INSERT INTO tabla_municipios VALUES (05,05604,'REMEDIOS');
INSERT INTO tabla_municipios VALUES (05,05670,'SAN ROQUE');
INSERT INTO tabla_municipios VALUES (05,05690,'SANTO DOMINGO');
INSERT INTO tabla_municipios VALUES (05,05736,'SEGOVIA');
INSERT INTO tabla_municipios VALUES (05,05858,'VEGACHÍ');
INSERT INTO tabla_municipios VALUES (05,05885,'YALÍ');
INSERT INTO tabla_municipios VALUES (05,05890,'YOLOMBÓ');
INSERT INTO tabla_municipios VALUES (05,05038,'ANGOSTURA');
INSERT INTO tabla_municipios VALUES (05,05086,'BELMIRA');
INSERT INTO tabla_municipios VALUES (05,05107,'BRICEÑO');
INSERT INTO tabla_municipios VALUES (05,05134,'CAMPAMENTO');
INSERT INTO tabla_municipios VALUES (05,05150,'CAROLINA');
INSERT INTO tabla_municipios VALUES (05,05237,'DON MATiAS');
INSERT INTO tabla_municipios VALUES (05,05264,'ENTRERRIOS');
INSERT INTO tabla_municipios VALUES (05,05310,'GÓMEZ PLATA');
INSERT INTO tabla_municipios VALUES (05,05315,'GUADALUPE');
INSERT INTO tabla_municipios VALUES (05,05361,'ITUANGO');
INSERT INTO tabla_municipios VALUES (05,05647,'SAN ANDRÉS');
INSERT INTO tabla_municipios VALUES (05,05658,'SAN JOSÉ DE LA MONTAÑA');
INSERT INTO tabla_municipios VALUES (05,05664,'SAN PEDRO');
INSERT INTO tabla_municipios VALUES (05,05686,'SANTA ROSA de osos');
INSERT INTO tabla_municipios VALUES (05,05819,'TOLEDO');
INSERT INTO tabla_municipios VALUES (05,05854,'VALDIVIA');
INSERT INTO tabla_municipios VALUES (05,05887,'YARUMAL');
INSERT INTO tabla_municipios VALUES (05,05004,'ABRIAQUÍ');
INSERT INTO tabla_municipios VALUES (05,05044,'ANZA');
INSERT INTO tabla_municipios VALUES (05,05059,'ARMENIA');
INSERT INTO tabla_municipios VALUES (05,05113,'BURITICÁ');
INSERT INTO tabla_municipios VALUES (05,05138,'CAÑASGORDAS');
INSERT INTO tabla_municipios VALUES (05,05234,'DABEIBA');
INSERT INTO tabla_municipios VALUES (05,05240,'EBÉJICO');
INSERT INTO tabla_municipios VALUES (05,05284,'FRONTINO');
INSERT INTO tabla_municipios VALUES (05,05306,'GIRALDO');
INSERT INTO tabla_municipios VALUES (05,05347,'HELICONIA');
INSERT INTO tabla_municipios VALUES (05,05411,'LIBORINA');
INSERT INTO tabla_municipios VALUES (05,05501,'OLAYA');
INSERT INTO tabla_municipios VALUES (05,05543,'PEQUE');
INSERT INTO tabla_municipios VALUES (05,05628,'SABANALARGA');
INSERT INTO tabla_municipios VALUES (05,05656,'SAN JERÓNIMO');
INSERT INTO tabla_municipios VALUES (05,05042,'SANTAFÉ DE ANTIOQUIA');
INSERT INTO tabla_municipios VALUES (05,05761,'SOPETRaN');
INSERT INTO tabla_municipios VALUES (05,05842,'URAMITA');
INSERT INTO tabla_municipios VALUES (05,05002,'ABEJORRAL');
INSERT INTO tabla_municipios VALUES (05,05021,'ALEJANDRÍA');
INSERT INTO tabla_municipios VALUES (05,05055,'ARGELIA');
INSERT INTO tabla_municipios VALUES (05,05148,'CARMEN DE VIBORAL');
INSERT INTO tabla_municipios VALUES (05,05197,'COCORNÁ');
INSERT INTO tabla_municipios VALUES (05,05206,'CONCEPCIÓN');
INSERT INTO tabla_municipios VALUES (05,05313,'GRANADA');
INSERT INTO tabla_municipios VALUES (05,05318,'GUARNE');
INSERT INTO tabla_municipios VALUES (05,05321,'GUATAPE');
INSERT INTO tabla_municipios VALUES (05,05376,'LA CEJA');
INSERT INTO tabla_municipios VALUES (05,05400,'LA UNIÓN');
INSERT INTO tabla_municipios VALUES (05,05440,'MARINILLA');
INSERT INTO tabla_municipios VALUES (05,05483,'NARIÑO');
INSERT INTO tabla_municipios VALUES (05,05541,'PEÑOL');
INSERT INTO tabla_municipios VALUES (05,05607,'RETIRO');
INSERT INTO tabla_municipios VALUES (05,05615,'RIONEGRO');
INSERT INTO tabla_municipios VALUES (05,05649,'SAN CARLOS');
INSERT INTO tabla_municipios VALUES (05,05652,'SAN FRANCISCO');
INSERT INTO tabla_municipios VALUES (05,05660,'SAN LUIS');
INSERT INTO tabla_municipios VALUES (05,05667,'SAN RAFAEL');
INSERT INTO tabla_municipios VALUES (05,05674,'SAN VICENTE');
INSERT INTO tabla_municipios VALUES (05,05697,'SANTUARIO');
INSERT INTO tabla_municipios VALUES (05,05756,'SONSON');
INSERT INTO tabla_municipios VALUES (05,05030,'AMAGa');
INSERT INTO tabla_municipios VALUES (05,05034,'ANDES');
INSERT INTO tabla_municipios VALUES (05,05036,'ANGELOPOLIS');
INSERT INTO tabla_municipios VALUES (05,05091,'BETANIA');
INSERT INTO tabla_municipios VALUES (05,05093,'BETULIA');
INSERT INTO tabla_municipios VALUES (05,05125,'CAICEDO');
INSERT INTO tabla_municipios VALUES (05,05145,'CARAMANTA');
INSERT INTO tabla_municipios VALUES (05,05101,'CIUDAD BOLÍVAR');
INSERT INTO tabla_municipios VALUES (05,05209,'CONCORDIA');
INSERT INTO tabla_municipios VALUES (05,05282,'FREDONIA');
INSERT INTO tabla_municipios VALUES (05,05353,'HISPANIA');
INSERT INTO tabla_municipios VALUES (05,05364,'JARDÍN');
INSERT INTO tabla_municipios VALUES (05,05368,'JERICÓ');
INSERT INTO tabla_municipios VALUES (05,05390,'LA PINTADA');
INSERT INTO tabla_municipios VALUES (05,05467,'MONTEBELLO');
INSERT INTO tabla_municipios VALUES (05,05576,'PUEBLORRICO');
INSERT INTO tabla_municipios VALUES (05,05642,'SALGAR');
INSERT INTO tabla_municipios VALUES (05,05679,'SANTA BaRBARA');
INSERT INTO tabla_municipios VALUES (05,05789,'TÁMESIS');
INSERT INTO tabla_municipios VALUES (05,05792,'TARSO');
INSERT INTO tabla_municipios VALUES (05,05809,'TITIRIBÍ');
INSERT INTO tabla_municipios VALUES (05,05847,'URRAO');
INSERT INTO tabla_municipios VALUES (05,05856,'VALPARAISO');
INSERT INTO tabla_municipios VALUES (05,05861,'VENECIA');
INSERT INTO tabla_municipios VALUES (05,05045,'APARTADÓ');
INSERT INTO tabla_municipios VALUES (05,05051,'ARBOLETES');
INSERT INTO tabla_municipios VALUES (05,05147,'CAREPA');
INSERT INTO tabla_municipios VALUES (05,05172,'CHIGORODÓ');
INSERT INTO tabla_municipios VALUES (05,05475,'MURINDÓ');
INSERT INTO tabla_municipios VALUES (05,05480,'MUTATA');
INSERT INTO tabla_municipios VALUES (05,05490,'NECOCLÍ');
INSERT INTO tabla_municipios VALUES (05,05659,'SAN JUAN DE URABA');
INSERT INTO tabla_municipios VALUES (05,05665,'SAN PEDRO DE URABA');
INSERT INTO tabla_municipios VALUES (05,05837,'TURBO');
INSERT INTO tabla_municipios VALUES (05,05873,'VIGÍA DEL FUERTE');
INSERT INTO tabla_municipios VALUES (05,05079,'BARBOSA');
INSERT INTO tabla_municipios VALUES (05,05088,'BELLO');
INSERT INTO tabla_municipios VALUES (05,05129,'CALDAS');
INSERT INTO tabla_municipios VALUES (05,05212,'COPACABANA');
INSERT INTO tabla_municipios VALUES (05,05266,'ENVIGADO');
INSERT INTO tabla_municipios VALUES (05,05308,'GIRARDOTA');
INSERT INTO tabla_municipios VALUES (05,05360,'ITAGUI');
INSERT INTO tabla_municipios VALUES (05,05380,'LA ESTRELLA');
INSERT INTO tabla_municipios VALUES (05,05001,'MEDELLÍN');
INSERT INTO tabla_municipios VALUES (05,05631,'SABANETA');
INSERT INTO tabla_municipios VALUES (81,81001,'ARAUCA');
INSERT INTO tabla_municipios VALUES (81,81065,'ARAUQUITA');
INSERT INTO tabla_municipios VALUES (81,81220,'CRAVO NORTE');
INSERT INTO tabla_municipios VALUES (81,81300,'FORTUL');
INSERT INTO tabla_municipios VALUES (81,81591,'PUERTO RONDÓN');
INSERT INTO tabla_municipios VALUES (81,81736,'SARAVENA');
INSERT INTO tabla_municipios VALUES (81,81794,'TAME');
INSERT INTO tabla_municipios VALUES (08,88564,'PROVIDENCIA Y SANTA CATALINA');
INSERT INTO tabla_municipios VALUES (08,88001,'SAN ANDRES');
INSERT INTO tabla_municipios VALUES (08,08001,'BARRANQUILLA');
INSERT INTO tabla_municipios VALUES (08,08296,'GALAPA');
INSERT INTO tabla_municipios VALUES (08,08433,'MALAMBO');
INSERT INTO tabla_municipios VALUES (08,08573,'PUERTO COLOMBIA');
INSERT INTO tabla_municipios VALUES (08,08758,'SOLEDAD');
INSERT INTO tabla_municipios VALUES (08,08137,'CAMPO DE LA CRUZ');
INSERT INTO tabla_municipios VALUES (08,08141,'CANDELARIA');
INSERT INTO tabla_municipios VALUES (08,08421,'LURUACO');
INSERT INTO tabla_municipios VALUES (08,08436,'MANATi');
INSERT INTO tabla_municipios VALUES (08,08606,'REPELON');
INSERT INTO tabla_municipios VALUES (08,08675,'SANTA LUCiA');
INSERT INTO tabla_municipios VALUES (08,08770,'SUAN');
INSERT INTO tabla_municipios VALUES (08,08078,'BARANOA');
INSERT INTO tabla_municipios VALUES (08,08520,'PALMAR DE VARELA');
INSERT INTO tabla_municipios VALUES (08,08558,'POLONUEVO');
INSERT INTO tabla_municipios VALUES (08,08560,'PONEDERA');
INSERT INTO tabla_municipios VALUES (08,08634,'Sabanagrande');
INSERT INTO tabla_municipios VALUES (08,08638,'SABANALARGA');
INSERT INTO tabla_municipios VALUES (08,08685,'Santo Tomas');
INSERT INTO tabla_municipios VALUES (08,08372,'JUAN DE ACOSTA');
INSERT INTO tabla_municipios VALUES (08,08549,'PIOJÓ');
INSERT INTO tabla_municipios VALUES (08,08832,'TUBARA');
INSERT INTO tabla_municipios VALUES (08,08849,'USIACURi');
INSERT INTO tabla_municipios VALUES (11,11001,'BOGOTA D.C.');
INSERT INTO tabla_municipios VALUES (13,13188,'CICUCO');
INSERT INTO tabla_municipios VALUES (13,13300,'HATILLO DE LOBA');
INSERT INTO tabla_municipios VALUES (13,13440,'MARGARITA');
INSERT INTO tabla_municipios VALUES (13,13468,'MOMPÓS');
INSERT INTO tabla_municipios VALUES (13,13650,'SAN FERNANDO');
INSERT INTO tabla_municipios VALUES (13,13780,'TALAIGUA NUEVO');
INSERT INTO tabla_municipios VALUES (13,13052,'ARJONA');
INSERT INTO tabla_municipios VALUES (13,13062,'ARROYOHONDO');
INSERT INTO tabla_municipios VALUES (13,13140,'CALAMAR');
INSERT INTO tabla_municipios VALUES (13,13001,'CARTAGENA');
INSERT INTO tabla_municipios VALUES (13,13222,'CLEMENCIA');
INSERT INTO tabla_municipios VALUES (13,13433,'MAHATES');
INSERT INTO tabla_municipios VALUES (13,13620,'SAN CRISTOBAL');
INSERT INTO tabla_municipios VALUES (13,13647,'SAN ESTANISLAO');
INSERT INTO tabla_municipios VALUES (13,13673,'SANTA CATALINA');
INSERT INTO tabla_municipios VALUES (13,13683,'SANTA ROSA DE LIMA');
INSERT INTO tabla_municipios VALUES (13,13760,'SOPLAVIENTO');
INSERT INTO tabla_municipios VALUES (13,13836,'TURBACO');
INSERT INTO tabla_municipios VALUES (13,13838,'TURBANA');
INSERT INTO tabla_municipios VALUES (13,13873,'VILLANUEVA');
INSERT INTO tabla_municipios VALUES (13,13030,'ALTOS DEL ROSARIO');
INSERT INTO tabla_municipios VALUES (13,13074,'BARRANCO DE LOBA');
INSERT INTO tabla_municipios VALUES (13,13268,'EL PEÑON');
INSERT INTO tabla_municipios VALUES (13,13580,'REGIDOR');
INSERT INTO tabla_municipios VALUES (13,13600,'RÍO VIEJO');
INSERT INTO tabla_municipios VALUES (13,13667,'SAN MARTIN DE LOBA');
INSERT INTO tabla_municipios VALUES (13,13042,'ARENAL');
INSERT INTO tabla_municipios VALUES (13,13160,'CANTAGALLO');
INSERT INTO tabla_municipios VALUES (13,13473,'MORALES');
INSERT INTO tabla_municipios VALUES (13,13670,'SAN PABLO');
INSERT INTO tabla_municipios VALUES (13,13688,'SANTA ROSA DEL SUR');
INSERT INTO tabla_municipios VALUES (13,13744,'SIMITÍ');
INSERT INTO tabla_municipios VALUES (13,13006,'ACHÍ');
INSERT INTO tabla_municipios VALUES (13,13430,'MAGANGUÉ');
INSERT INTO tabla_municipios VALUES (13,13458,'MONTECRISTO');
INSERT INTO tabla_municipios VALUES (13,13549,'PINILLOS');
INSERT INTO tabla_municipios VALUES (13,13655,'SAN JACINTO DEL CAUCA');
INSERT INTO tabla_municipios VALUES (13,13810,'TIQUISIO');
INSERT INTO tabla_municipios VALUES (13,13244,'CARMEN DE BOLÍVAR');
INSERT INTO tabla_municipios VALUES (13,13212,'CÓRDOBA');
INSERT INTO tabla_municipios VALUES (13,13248,'EL GUAMO');
INSERT INTO tabla_municipios VALUES (13,13442,'MARÍA LA BAJA');
INSERT INTO tabla_municipios VALUES (13,13654,'SAN JACINTO');
INSERT INTO tabla_municipios VALUES (13,13657,'SAN JUAN NEPOMUCENO');
INSERT INTO tabla_municipios VALUES (13,13894,'ZAMBRANO');
INSERT INTO tabla_municipios VALUES (15,15232,'CHÍQUIZA');
INSERT INTO tabla_municipios VALUES (15,15187,'CHIVATÁ');
INSERT INTO tabla_municipios VALUES (15,15204,'CÓMBITA');
INSERT INTO tabla_municipios VALUES (15,15224,'CUCAITA');
INSERT INTO tabla_municipios VALUES (15,15476,'MOTAVITA');
INSERT INTO tabla_municipios VALUES (15,15500,'OICATÁ');
INSERT INTO tabla_municipios VALUES (15,15646,'SAMACÁ');
INSERT INTO tabla_municipios VALUES (15,15740,'SIACHOQUE');
INSERT INTO tabla_municipios VALUES (15,15762,'SORA');
INSERT INTO tabla_municipios VALUES (15,15764,'SORACÁ');
INSERT INTO tabla_municipios VALUES (15,15763,'SOTAQUIRÁ');
INSERT INTO tabla_municipios VALUES (15,15814,'TOCA');
INSERT INTO tabla_municipios VALUES (15,15001,'TUNJA');
INSERT INTO tabla_municipios VALUES (15,15837,'TUTA');
INSERT INTO tabla_municipios VALUES (15,15861,'VENTAQUEMADA');
INSERT INTO tabla_municipios VALUES (15,15180,'CHISCAS');
INSERT INTO tabla_municipios VALUES (15,15223,'CUBARÁ');
INSERT INTO tabla_municipios VALUES (15,15244,'EL COCUY');
INSERT INTO tabla_municipios VALUES (15,15248,'EL ESPINO');
INSERT INTO tabla_municipios VALUES (15,15317,'GUACAMAYAS');
INSERT INTO tabla_municipios VALUES (15,15332,'GÜICÁN');
INSERT INTO tabla_municipios VALUES (15,15522,'PANQUEBA');
INSERT INTO tabla_municipios VALUES (15,15377,'LABRANZAGRANDE');
INSERT INTO tabla_municipios VALUES (15,15518,'PAJARITO');
INSERT INTO tabla_municipios VALUES (15,15533,'PAYA');
INSERT INTO tabla_municipios VALUES (15,15550,'PISBA');
INSERT INTO tabla_municipios VALUES (15,15090,'BERBEO');
INSERT INTO tabla_municipios VALUES (15,15135,'CAMPOHERMOSO');
INSERT INTO tabla_municipios VALUES (15,15455,'MIRAFLORES');
INSERT INTO tabla_municipios VALUES (15,15514,'PÁEZ');
INSERT INTO tabla_municipios VALUES (15,15660,'SAN EDUARDO');
INSERT INTO tabla_municipios VALUES (15,15897,'ZETAQUIRA');
INSERT INTO tabla_municipios VALUES (15,15104,'BOYACÁ');
INSERT INTO tabla_municipios VALUES (15,15189,'CIÉNEGA');
INSERT INTO tabla_municipios VALUES (15,15367,'JENESANO');
INSERT INTO tabla_municipios VALUES (15,15494,'NUEVO COLÓN');
INSERT INTO tabla_municipios VALUES (15,15599,'RAMIRIQUÍ');
INSERT INTO tabla_municipios VALUES (15,15621,'RONDÓN');
INSERT INTO tabla_municipios VALUES (15,15804,'TIBANÁ');
INSERT INTO tabla_municipios VALUES (15,15835,'TURMEQUÉ');
INSERT INTO tabla_municipios VALUES (15,15842,'UMBITA');
INSERT INTO tabla_municipios VALUES (15,15879,'VIRACACHÁ');
INSERT INTO tabla_municipios VALUES (15,15172,'CHINAVITA');
INSERT INTO tabla_municipios VALUES (15,15299,'GARAGOA');
INSERT INTO tabla_municipios VALUES (15,15425,'MACANAL');
INSERT INTO tabla_municipios VALUES (15,15511,'PACHAVITA');
INSERT INTO tabla_municipios VALUES (15,15667,'SAN LUIS DE GACENO');
INSERT INTO tabla_municipios VALUES (15,15690,'SANTA MARÍA');
INSERT INTO tabla_municipios VALUES (15,15097,'BOAVITA');
INSERT INTO tabla_municipios VALUES (15,15218,'COVARACHÍA');
INSERT INTO tabla_municipios VALUES (15,15403,'LA UVITA');
INSERT INTO tabla_municipios VALUES (15,15673,'SAN MATEO');
INSERT INTO tabla_municipios VALUES (15,15720,'SATIVANORTE');
INSERT INTO tabla_municipios VALUES (15,15723,'SATIVASUR');
INSERT INTO tabla_municipios VALUES (15,15753,'SOATÁ');
INSERT INTO tabla_municipios VALUES (15,15774,'SUSACÓN');
INSERT INTO tabla_municipios VALUES (15,15810,'TIPACOQUE');
INSERT INTO tabla_municipios VALUES (15,15106,'BRICEÑO');
INSERT INTO tabla_municipios VALUES (15,15109,'BUENAVISTA');
INSERT INTO tabla_municipios VALUES (15,15131,'CALDAS');
INSERT INTO tabla_municipios VALUES (15,15176,'CHIQUINQUIRÁ');
INSERT INTO tabla_municipios VALUES (15,15212,'COPER');
INSERT INTO tabla_municipios VALUES (15,15401,'LA VICTORIA');
INSERT INTO tabla_municipios VALUES (15,15442,'MARIPÍ');
INSERT INTO tabla_municipios VALUES (15,15480,'MUZO');
INSERT INTO tabla_municipios VALUES (15,15507,'OTANCHE');
INSERT INTO tabla_municipios VALUES (15,15531,'PAUNA');
INSERT INTO tabla_municipios VALUES (15,15572,'PUERTO BOYACa');
INSERT INTO tabla_municipios VALUES (15,15580,'QUÍPAMA');
INSERT INTO tabla_municipios VALUES (15,15632,'SABOYÁ');
INSERT INTO tabla_municipios VALUES (15,15676,'SAN MIGUEL DE SEMA');
INSERT INTO tabla_municipios VALUES (15,15681,'SAN PABLO BORBUR');
INSERT INTO tabla_municipios VALUES (15,15832,'TUNUNGUÁ');
INSERT INTO tabla_municipios VALUES (15,15022,'ALMEIDA');
INSERT INTO tabla_municipios VALUES (15,15236,'CHIVOR');
INSERT INTO tabla_municipios VALUES (15,15322,'GUATEQUE');
INSERT INTO tabla_municipios VALUES (15,15325,'GUAYATÁ');
INSERT INTO tabla_municipios VALUES (15,15380,'LA CAPILLA');
INSERT INTO tabla_municipios VALUES (15,15761,'SOMONDOCO');
INSERT INTO tabla_municipios VALUES (15,15778,'SUTATENZA');
INSERT INTO tabla_municipios VALUES (15,15798,'TENZA');
INSERT INTO tabla_municipios VALUES (15,15051,'ARCABUCO');
INSERT INTO tabla_municipios VALUES (15,15185,'CHITARAQUE');
INSERT INTO tabla_municipios VALUES (15,15293,'GACHANTIVÁ');
INSERT INTO tabla_municipios VALUES (15,15469,'MONIQUIRÁ');
INSERT INTO tabla_municipios VALUES (15,15600,'RÁQUIRA');
INSERT INTO tabla_municipios VALUES (15,15638,'SÁCHICA');
INSERT INTO tabla_municipios VALUES (15,15664,'SAN JOSÉ DE PARE');
INSERT INTO tabla_municipios VALUES (15,15696,'SANTA SOFÍA');
INSERT INTO tabla_municipios VALUES (15,15686,'SANTANA');
INSERT INTO tabla_municipios VALUES (15,15776,'SUTAMARCHÁN');
INSERT INTO tabla_municipios VALUES (15,15808,'TINJACÁ');
INSERT INTO tabla_municipios VALUES (15,15407,'VILLA DE LEYVA');
INSERT INTO tabla_municipios VALUES (15,15047,'AQUITANIA');
INSERT INTO tabla_municipios VALUES (15,15226,'CUÍTIVA');
INSERT INTO tabla_municipios VALUES (15,15272,'FIRAVITOBA');
INSERT INTO tabla_municipios VALUES (15,15296,'GAMEZA');
INSERT INTO tabla_municipios VALUES (15,15362,'IZA');
INSERT INTO tabla_municipios VALUES (15,15464,'MONGUA');
INSERT INTO tabla_municipios VALUES (15,15466,'MONGUÍ');
INSERT INTO tabla_municipios VALUES (15,15491,'NOBSA');
INSERT INTO tabla_municipios VALUES (15,15542,'PESCA');
INSERT INTO tabla_municipios VALUES (15,15759,'SOGAMOSO');
INSERT INTO tabla_municipios VALUES (15,15806,'TIBASOSA');
INSERT INTO tabla_municipios VALUES (15,15820,'TÓPAGA');
INSERT INTO tabla_municipios VALUES (15,15822,'TOTA');
INSERT INTO tabla_municipios VALUES (15,15087,'BELÉN');
INSERT INTO tabla_municipios VALUES (15,15114,'BUSBANZÁ');
INSERT INTO tabla_municipios VALUES (15,15162,'CERINZA');
INSERT INTO tabla_municipios VALUES (15,15215,'CORRALES');
INSERT INTO tabla_municipios VALUES (15,15238,'DUITAMA');
INSERT INTO tabla_municipios VALUES (15,15276,'FLORESTA');
INSERT INTO tabla_municipios VALUES (15,15516,'PAIPA');
INSERT INTO tabla_municipios VALUES (15,15693,'SAN ROSA VITERBO');
INSERT INTO tabla_municipios VALUES (15,15839,'TUTAZÁ');
INSERT INTO tabla_municipios VALUES (15,15092,'BETÉITIVA');
INSERT INTO tabla_municipios VALUES (15,15183,'CHITA');
INSERT INTO tabla_municipios VALUES (15,15368,'JERICÓ');
INSERT INTO tabla_municipios VALUES (15,15537,'PAZ DE RÍO');
INSERT INTO tabla_municipios VALUES (15,15757,'SOCHA');
INSERT INTO tabla_municipios VALUES (15,15755,'SOCOTÁ');
INSERT INTO tabla_municipios VALUES (15,15790,'TASCO');
INSERT INTO tabla_municipios VALUES (17,17272,'FILADELFIA');
INSERT INTO tabla_municipios VALUES (17,17388,'LA MERCED');
INSERT INTO tabla_municipios VALUES (17,17442,'MARMATO');
INSERT INTO tabla_municipios VALUES (17,17614,'RIOSUCIO');
INSERT INTO tabla_municipios VALUES (17,17777,'SUPÍA');
INSERT INTO tabla_municipios VALUES (17,17433,'MANZANARES');
INSERT INTO tabla_municipios VALUES (17,17444,'MARQUETALIA');
INSERT INTO tabla_municipios VALUES (17,17446,'MARULANDA');
INSERT INTO tabla_municipios VALUES (17,17541,'PENSILVANIA');
INSERT INTO tabla_municipios VALUES (17,17042,'ANSERMA');
INSERT INTO tabla_municipios VALUES (17,17088,'BELALCÁZAR');
INSERT INTO tabla_municipios VALUES (17,17616,'RISARALDA');
INSERT INTO tabla_municipios VALUES (17,17665,'SAN JOSÉ');
INSERT INTO tabla_municipios VALUES (17,17877,'VITERBO');
INSERT INTO tabla_municipios VALUES (17,17174,'CHINCHINa');
INSERT INTO tabla_municipios VALUES (17,17001,'MANIZALES');
INSERT INTO tabla_municipios VALUES (17,17486,'NEIRA');
INSERT INTO tabla_municipios VALUES (17,17524,'PALESTINA');
INSERT INTO tabla_municipios VALUES (17,17873,'VILLAMARiA');
INSERT INTO tabla_municipios VALUES (17,17013,'AGUADAS');
INSERT INTO tabla_municipios VALUES (17,17050,'ARANZAZU');
INSERT INTO tabla_municipios VALUES (17,17513,'PÁCORA');
INSERT INTO tabla_municipios VALUES (17,17653,'SALAMINA');
INSERT INTO tabla_municipios VALUES (17,17380,'LA DORADA');
INSERT INTO tabla_municipios VALUES (17,17495,'NORCASIA');
INSERT INTO tabla_municipios VALUES (17,17662,'SAMANÁ');
INSERT INTO tabla_municipios VALUES (17,17867,'VICTORIA');
INSERT INTO tabla_municipios VALUES (18,18029,'ALBANIA');
INSERT INTO tabla_municipios VALUES (18,18094,'BELÉN DE LOS ANDAQUIES');
INSERT INTO tabla_municipios VALUES (18,18150,'CARTAGENA DEL CHAIRÁ');
INSERT INTO tabla_municipios VALUES (18,18205,'CURRILLO');
INSERT INTO tabla_municipios VALUES (18,18247,'EL DONCELLO');
INSERT INTO tabla_municipios VALUES (18,18256,'EL PAUJIL');
INSERT INTO tabla_municipios VALUES (18,18001,'FLORENCIA');
INSERT INTO tabla_municipios VALUES (18,18410,'LA MONTAÑITA');
INSERT INTO tabla_municipios VALUES (18,18460,'MILaN');
INSERT INTO tabla_municipios VALUES (18,18479,'MORELIA');
INSERT INTO tabla_municipios VALUES (18,18592,'PUERTO RICO');
INSERT INTO tabla_municipios VALUES (18,18610,'SAN JOSE DEL FRAGUA');
INSERT INTO tabla_municipios VALUES (18,18753,'SAN VICENTE DEL CAGUÁN');
INSERT INTO tabla_municipios VALUES (18,18756,'SOLANO');
INSERT INTO tabla_municipios VALUES (18,18785,'SOLITA');
INSERT INTO tabla_municipios VALUES (18,18860,'VALPARAISO');
INSERT INTO tabla_municipios VALUES (85,85010,'AGUAZUL');
INSERT INTO tabla_municipios VALUES (85,85015,'CHAMEZA');
INSERT INTO tabla_municipios VALUES (85,85125,'HATO COROZAL');
INSERT INTO tabla_municipios VALUES (85,85136,'LA SALINA');
INSERT INTO tabla_municipios VALUES (85,85139,'MANÍ');
INSERT INTO tabla_municipios VALUES (85,85162,'MONTERREY');
INSERT INTO tabla_municipios VALUES (85,85225,'NUNCHÍA');
INSERT INTO tabla_municipios VALUES (85,85230,'OROCUÉ');
INSERT INTO tabla_municipios VALUES (85,85250,'PAZ DE ARIPORO');
INSERT INTO tabla_municipios VALUES (85,85263,'PORE');
INSERT INTO tabla_municipios VALUES (85,85279,'RECETOR');
INSERT INTO tabla_municipios VALUES (85,85300,'SABANALARGA');
INSERT INTO tabla_municipios VALUES (85,85315,'SÁCAMA');
INSERT INTO tabla_municipios VALUES (85,85325,'SAN LUIS DE PALENQUE');
INSERT INTO tabla_municipios VALUES (85,85400,'TÁMARA');
INSERT INTO tabla_municipios VALUES (85,85410,'TAURAMENA');
INSERT INTO tabla_municipios VALUES (85,85430,'TRINIDAD');
INSERT INTO tabla_municipios VALUES (85,85440,'VILLANUEVA');
INSERT INTO tabla_municipios VALUES (85,85001,'YOPAL');
INSERT INTO tabla_municipios VALUES (19,19130,'CAJIBÍO');
INSERT INTO tabla_municipios VALUES (19,19256,'EL TAMBO');
INSERT INTO tabla_municipios VALUES (19,19392,'LA SIERRA');
INSERT INTO tabla_municipios VALUES (19,19473,'MORALES');
INSERT INTO tabla_municipios VALUES (19,19548,'PIENDAMO');
INSERT INTO tabla_municipios VALUES (19,19001,'POPAYÁN');
INSERT INTO tabla_municipios VALUES (19,19622,'ROSAS');
INSERT INTO tabla_municipios VALUES (19,19760,'SOTARA');
INSERT INTO tabla_municipios VALUES (19,19807,'TIMBIO');
INSERT INTO tabla_municipios VALUES (19,19110,'BUENOS AIRES');
INSERT INTO tabla_municipios VALUES (19,19142,'CALOTO');
INSERT INTO tabla_municipios VALUES (19,19212,'CORINTO');
INSERT INTO tabla_municipios VALUES (19,19455,'MIRANDA');
INSERT INTO tabla_municipios VALUES (19,19513,'PADILLA');
INSERT INTO tabla_municipios VALUES (19,19573,'PUERTO TEJADA');
INSERT INTO tabla_municipios VALUES (19,19698,'SANTANDER DE QUILICHAO');
INSERT INTO tabla_municipios VALUES (19,19780,'SUAREZ');
INSERT INTO tabla_municipios VALUES (19,19845,'VILLA RICA');
INSERT INTO tabla_municipios VALUES (19,19318,'GUAPI');
INSERT INTO tabla_municipios VALUES (19,19418,'LOPEZ');
INSERT INTO tabla_municipios VALUES (19,19809,'TIMBIQUI');
INSERT INTO tabla_municipios VALUES (19,19137,'CALDONO');
INSERT INTO tabla_municipios VALUES (19,19355,'INZÁ');
INSERT INTO tabla_municipios VALUES (19,19364,'JAMBALO');
INSERT INTO tabla_municipios VALUES (19,19517,'PAEZ');
INSERT INTO tabla_municipios VALUES (19,19585,'PURACE');
INSERT INTO tabla_municipios VALUES (19,19743,'Silvia');
INSERT INTO tabla_municipios VALUES (19,19821,'TORIBIO');
INSERT INTO tabla_municipios VALUES (19,19824,'TOTORO');
INSERT INTO tabla_municipios VALUES (19,19022,'ALMAGUER');
INSERT INTO tabla_municipios VALUES (19,19050,'ARGELIA');
INSERT INTO tabla_municipios VALUES (19,19075,'BALBOA');
INSERT INTO tabla_municipios VALUES (19,19100,'BOLÍVAR');
INSERT INTO tabla_municipios VALUES (19,19290,'FLORENCIA');
INSERT INTO tabla_municipios VALUES (19,19397,'LA VEGA');
INSERT INTO tabla_municipios VALUES (19,19450,'MERCADERES');
INSERT INTO tabla_municipios VALUES (19,19532,'PATIA');
INSERT INTO tabla_municipios VALUES (19,19533,'PIAMONTE');
INSERT INTO tabla_municipios VALUES (19,19693,'SAN SEBASTIAN');
INSERT INTO tabla_municipios VALUES (19,19701,'SANTA ROSA');
INSERT INTO tabla_municipios VALUES (19,19785,'SUCRE');
INSERT INTO tabla_municipios VALUES (20,20045,'BECERRIL');
INSERT INTO tabla_municipios VALUES (20,20175,'CHIMICHAGUA');
INSERT INTO tabla_municipios VALUES (20,20178,'CHIRIGUANA');
INSERT INTO tabla_municipios VALUES (20,20228,'CURUMANÍ');
INSERT INTO tabla_municipios VALUES (20,20400,'LA JAGUA DE IBIRICO');
INSERT INTO tabla_municipios VALUES (20,20517,'PAILITAS');
INSERT INTO tabla_municipios VALUES (20,20787,'TAMALAMEQUE');
INSERT INTO tabla_municipios VALUES (20,20032,'ASTREA');
INSERT INTO tabla_municipios VALUES (20,20060,'BOSCONIA');
INSERT INTO tabla_municipios VALUES (20,20238,'EL COPEY');
INSERT INTO tabla_municipios VALUES (20,20250,'EL PASO');
INSERT INTO tabla_municipios VALUES (20,20013,'AGUSTÍN CODAZZI');
INSERT INTO tabla_municipios VALUES (20,20621,'LA PAZ');
INSERT INTO tabla_municipios VALUES (20,20443,'MANAURE');
INSERT INTO tabla_municipios VALUES (20,20570,'PUEBLO BELLO');
INSERT INTO tabla_municipios VALUES (20,20750,'SAN DIEGO');
INSERT INTO tabla_municipios VALUES (20,20001,'VALLEDUPAR');
INSERT INTO tabla_municipios VALUES (20,20011,'AGUACHICA');
INSERT INTO tabla_municipios VALUES (20,20295,'GAMARRA');
INSERT INTO tabla_municipios VALUES (20,20310,'GONZÁLEZ');
INSERT INTO tabla_municipios VALUES (20,20383,'LA GLORIA');
INSERT INTO tabla_municipios VALUES (20,20550,'PELAYA');
INSERT INTO tabla_municipios VALUES (20,20614,'RÍO DE ORO');
INSERT INTO tabla_municipios VALUES (20,20710,'SAN ALBERTO');
INSERT INTO tabla_municipios VALUES (20,20770,'SAN MARTÍN');
INSERT INTO tabla_municipios VALUES (27,27050,'ATRATO');
INSERT INTO tabla_municipios VALUES (27,27073,'BAGADÓ');
INSERT INTO tabla_municipios VALUES (27,27099,'BOJAYA');
INSERT INTO tabla_municipios VALUES (27,27245,'EL CARMEN DE ATRATO');
INSERT INTO tabla_municipios VALUES (27,27413,'LLORÓ');
INSERT INTO tabla_municipios VALUES (27,27425,'MEDIO ATRATO');
INSERT INTO tabla_municipios VALUES (27,27001,'QUIBDÓ');
INSERT INTO tabla_municipios VALUES (27,27600,'RIO QUITO');
INSERT INTO tabla_municipios VALUES (27,27006,'ACANDÍ');
INSERT INTO tabla_municipios VALUES (27,27086,'BELÉN DE BAJIRA');
INSERT INTO tabla_municipios VALUES (27,27150,'CARMÉN DEL DARIÉN');
INSERT INTO tabla_municipios VALUES (27,27615,'RIOSUCIO');
INSERT INTO tabla_municipios VALUES (27,27800,'UNGUÍA');
INSERT INTO tabla_municipios VALUES (27,27075,'BAHÍA SOLANO');
INSERT INTO tabla_municipios VALUES (27,27372,'JURADÓ');
INSERT INTO tabla_municipios VALUES (27,27495,'NUQUÍ');
INSERT INTO tabla_municipios VALUES (27,27025,'ALTO BAUDÓ');
INSERT INTO tabla_municipios VALUES (27,27077,'BAJO BAUDÓ');
INSERT INTO tabla_municipios VALUES (27,27250,'El Litoral del San Juan');
INSERT INTO tabla_municipios VALUES (27,27430,'MEDIO BAUDÓ');
INSERT INTO tabla_municipios VALUES (27,27135,'CANTON DE SAN PABLO');
INSERT INTO tabla_municipios VALUES (27,27160,'CERTEGUI');
INSERT INTO tabla_municipios VALUES (27,27205,'CONDOTO');
INSERT INTO tabla_municipios VALUES (27,27361,'ITSMINA');
INSERT INTO tabla_municipios VALUES (27,27450,'MEDIO SAN JUAN');
INSERT INTO tabla_municipios VALUES (27,27491,'NÓVITA');
INSERT INTO tabla_municipios VALUES (27,27580,'RÍO FRÍO');
INSERT INTO tabla_municipios VALUES (27,27660,'SAN JOSÉ DEL PALMAR');
INSERT INTO tabla_municipios VALUES (27,27745,'SIPÍ');
INSERT INTO tabla_municipios VALUES (27,27787,'TADÓ');
INSERT INTO tabla_municipios VALUES (27,27810,'UNION PANAMERICANA');
INSERT INTO tabla_municipios VALUES (23,23807,'TIERRALTA');
INSERT INTO tabla_municipios VALUES (23,23855,'VALENCIA');
INSERT INTO tabla_municipios VALUES (23,23168,'CHIMÁ');
INSERT INTO tabla_municipios VALUES (23,23300,'COTORRA');
INSERT INTO tabla_municipios VALUES (23,23417,'LORICA');
INSERT INTO tabla_municipios VALUES (23,23464,'MOMIL');
INSERT INTO tabla_municipios VALUES (23,23586,'PURÍSIMA');
INSERT INTO tabla_municipios VALUES (23,23001,'MONTERÍA');
INSERT INTO tabla_municipios VALUES (23,23090,'CANALETE');
INSERT INTO tabla_municipios VALUES (23,23419,'LOS CÓRDOBAS');
INSERT INTO tabla_municipios VALUES (23,23500,'MOÑITOS');
INSERT INTO tabla_municipios VALUES (23,23574,'PUERTO ESCONDIDO');
INSERT INTO tabla_municipios VALUES (23,23672,'SAN ANTERO');
INSERT INTO tabla_municipios VALUES (23,23675,'SAN BERNARDO DEL VIENTO');
INSERT INTO tabla_municipios VALUES (23,23182,'CHINÚ');
INSERT INTO tabla_municipios VALUES (23,23660,'SAHAGÚN');
INSERT INTO tabla_municipios VALUES (23,23670,'SAN ANDRÉS SOTAVENTO');
INSERT INTO tabla_municipios VALUES (23,23068,'AYAPEL');
INSERT INTO tabla_municipios VALUES (23,23079,'BUENAVISTA');
INSERT INTO tabla_municipios VALUES (23,23350,'LA APARTADA');
INSERT INTO tabla_municipios VALUES (23,23466,'MONTELÍBANO');
INSERT INTO tabla_municipios VALUES (23,23555,'PLANETA RICA');
INSERT INTO tabla_municipios VALUES (23,23570,'PUEBLO NUEVO');
INSERT INTO tabla_municipios VALUES (23,23580,'PUERTO LIBERTADOR');
INSERT INTO tabla_municipios VALUES (23,23162,'CERETÉ');
INSERT INTO tabla_municipios VALUES (23,23189,'CIÉNAGA DE ORO');
INSERT INTO tabla_municipios VALUES (23,23678,'SAN CARLOS');
INSERT INTO tabla_municipios VALUES (23,23686,'SAN PELAYO');
INSERT INTO tabla_municipios VALUES (25,25183,'CHOCONTÁ');
INSERT INTO tabla_municipios VALUES (25,25426,'MACHETA');
INSERT INTO tabla_municipios VALUES (25,25436,'MANTA');
INSERT INTO tabla_municipios VALUES (25,25736,'SESQUILÉ');
INSERT INTO tabla_municipios VALUES (25,25772,'SUESCA');
INSERT INTO tabla_municipios VALUES (25,25807,'TIBIRITA');
INSERT INTO tabla_municipios VALUES (25,25873,'VILLAPINZÓN');
INSERT INTO tabla_municipios VALUES (25,25001,'AGUA DE DIOS');
INSERT INTO tabla_municipios VALUES (25,25307,'GIRARDOT');
INSERT INTO tabla_municipios VALUES (25,25324,'GUATAQUÍ');
INSERT INTO tabla_municipios VALUES (25,25368,'JERUSALÉN');
INSERT INTO tabla_municipios VALUES (25,25483,'NARIÑO');
INSERT INTO tabla_municipios VALUES (25,25488,'NILO');
INSERT INTO tabla_municipios VALUES (25,25612,'RICAURTE');
INSERT INTO tabla_municipios VALUES (25,25815,'TOCAIMA');
INSERT INTO tabla_municipios VALUES (25,25148,'CAPARRAPÍ');
INSERT INTO tabla_municipios VALUES (25,25320,'GUADUAS');
INSERT INTO tabla_municipios VALUES (25,25572,'PUERTO SALGAR');
INSERT INTO tabla_municipios VALUES (25,25019,'ALBÁN');
INSERT INTO tabla_municipios VALUES (25,25398,'LA PEÑA');
INSERT INTO tabla_municipios VALUES (25,25402,'LA VEGA');
INSERT INTO tabla_municipios VALUES (25,25489,'NIMAIMA');
INSERT INTO tabla_municipios VALUES (25,25491,'NOCAIMA');
INSERT INTO tabla_municipios VALUES (25,25592,'QUEBRADANEGRA');
INSERT INTO tabla_municipios VALUES (25,25658,'SAN FRANCISCO');
INSERT INTO tabla_municipios VALUES (25,25718,'SASAIMA');
INSERT INTO tabla_municipios VALUES (25,25777,'SUPATÁ');
INSERT INTO tabla_municipios VALUES (25,25851,'ÚTICA');
INSERT INTO tabla_municipios VALUES (25,25862,'VERGARA');
INSERT INTO tabla_municipios VALUES (25,25875,'VILLETA');
INSERT INTO tabla_municipios VALUES (25,25293,'GACHALA');
INSERT INTO tabla_municipios VALUES (25,25297,'GACHETA');
INSERT INTO tabla_municipios VALUES (25,25299,'GAMA');
INSERT INTO tabla_municipios VALUES (25,25322,'GUASCA');
INSERT INTO tabla_municipios VALUES (25,25326,'GUATAVITA');
INSERT INTO tabla_municipios VALUES (25,25372,'JUNÍN');
INSERT INTO tabla_municipios VALUES (25,25377,'LA CALERA');
INSERT INTO tabla_municipios VALUES (25,25839,'UBALÁ');
INSERT INTO tabla_municipios VALUES (25,25086,'BELTRÁN');
INSERT INTO tabla_municipios VALUES (25,25095,'BITUIMA');
INSERT INTO tabla_municipios VALUES (25,25168,'CHAGUANÍ');
INSERT INTO tabla_municipios VALUES (25,25328,'GUAYABAL DE SIQUIMA');
INSERT INTO tabla_municipios VALUES (25,25580,'PULI');
INSERT INTO tabla_municipios VALUES (25,25662,'SAN JUAN DE RÍO SECO');
INSERT INTO tabla_municipios VALUES (25,25867,'VIANÍ');
INSERT INTO tabla_municipios VALUES (25,25438,'MEDINA');
INSERT INTO tabla_municipios VALUES (25,25530,'PARATEBUENO');
INSERT INTO tabla_municipios VALUES (25,25151,'CAQUEZA');
INSERT INTO tabla_municipios VALUES (25,25178,'CHIPAQUE');
INSERT INTO tabla_municipios VALUES (25,25181,'CHOACHÍ');
INSERT INTO tabla_municipios VALUES (25,25279,'FOMEQUE');
INSERT INTO tabla_municipios VALUES (25,25281,'FOSCA');
INSERT INTO tabla_municipios VALUES (25,25335,'GUAYABETAL');
INSERT INTO tabla_municipios VALUES (25,25339,'GUTIÉRREZ');
INSERT INTO tabla_municipios VALUES (25,25594,'QUETAME');
INSERT INTO tabla_municipios VALUES (25,25841,'UBAQUE');
INSERT INTO tabla_municipios VALUES (25,25845,'UNE');
INSERT INTO tabla_municipios VALUES (25,25258,'EL PEÑÓN');
INSERT INTO tabla_municipios VALUES (25,25394,'LA PALMA');
INSERT INTO tabla_municipios VALUES (25,25513,'PACHO');
INSERT INTO tabla_municipios VALUES (25,25518,'PAIME');
INSERT INTO tabla_municipios VALUES (25,25653,'SAN CAYETANO');
INSERT INTO tabla_municipios VALUES (25,25823,'TOPAIPI');
INSERT INTO tabla_municipios VALUES (25,25871,'VILLAGOMEZ');
INSERT INTO tabla_municipios VALUES (25,25885,'YACOPÍ');
INSERT INTO tabla_municipios VALUES (25,25126,'CAJICÁ');
INSERT INTO tabla_municipios VALUES (25,25175,'CHÍA');
INSERT INTO tabla_municipios VALUES (25,25200,'COGUA');
INSERT INTO tabla_municipios VALUES (25,25295,'GACHANCIPÁ');
INSERT INTO tabla_municipios VALUES (25,25486,'NEMOCoN');
INSERT INTO tabla_municipios VALUES (25,25758,'SOPÓ');
INSERT INTO tabla_municipios VALUES (25,25785,'TABIO');
INSERT INTO tabla_municipios VALUES (25,25817,'TOCANCIPÁ');
INSERT INTO tabla_municipios VALUES (25,25899,'ZIPAQUIRÁ');
INSERT INTO tabla_municipios VALUES (25,25099,'BOJACÁ');
INSERT INTO tabla_municipios VALUES (25,25214,'COTA');
INSERT INTO tabla_municipios VALUES (25,25260,'EL ROSAL');
INSERT INTO tabla_municipios VALUES (25,25269,'FACATATIVÁ');
INSERT INTO tabla_municipios VALUES (25,25286,'FUNZA');
INSERT INTO tabla_municipios VALUES (25,25430,'MADRID');
INSERT INTO tabla_municipios VALUES (25,25473,'MOSQUERA');
INSERT INTO tabla_municipios VALUES (25,25769,'SUBACHOQUE');
INSERT INTO tabla_municipios VALUES (25,25799,'TENJO');
INSERT INTO tabla_municipios VALUES ('25','25898','ZIPACoN');
INSERT INTO tabla_municipios VALUES ('25','25740','SIBATÉ');
INSERT INTO tabla_municipios VALUES ('25','25754','SOACHA');
INSERT INTO tabla_municipios VALUES ('25','25053','ARBELÁEZ');
INSERT INTO tabla_municipios VALUES ('25','25120','CABRERA');
INSERT INTO tabla_municipios VALUES ('25','25290','FUSAGASUGÁ');
INSERT INTO tabla_municipios VALUES ('25','25312','GRANADA');
INSERT INTO tabla_municipios VALUES ('25','25524','PANDI');
INSERT INTO tabla_municipios VALUES ('25','25535','PASCA');
INSERT INTO tabla_municipios VALUES ('25','25649','SAN BERNARDO');
INSERT INTO tabla_municipios VALUES ('25','25743','SILVANIA');
INSERT INTO tabla_municipios VALUES ('25','25805','TIBACUY');
INSERT INTO tabla_municipios VALUES ('25','25506','VENECIA');
INSERT INTO tabla_municipios VALUES ('25','25035','ANAPOIMA');
INSERT INTO tabla_municipios VALUES ('25','25040','ANOLAIMA');
INSERT INTO tabla_municipios VALUES ('25','25599','APULO');
INSERT INTO tabla_municipios VALUES ('25','25123','CACHIPAY');
INSERT INTO tabla_municipios VALUES ('25','25245','EL COLEGIO');
INSERT INTO tabla_municipios VALUES ('25','25386','LA MESA');
INSERT INTO tabla_municipios VALUES ('25','25596','QUIPILE');
INSERT INTO tabla_municipios VALUES ('25','25645','SAN ANTONIO DE TEQUENDAMA');
INSERT INTO tabla_municipios VALUES ('25','25797','TENA');
INSERT INTO tabla_municipios VALUES ('25','25878','VIOTÁ');
INSERT INTO tabla_municipios VALUES ('25','25154','CARMEN DE CARUPA');
INSERT INTO tabla_municipios VALUES ('25','25224','CUCUNUBÁ');
INSERT INTO tabla_municipios VALUES ('25','25288','FÚQUENE');
INSERT INTO tabla_municipios VALUES ('25','25317','GUACHETÁ');
INSERT INTO tabla_municipios VALUES ('25','25407','LENGUAZAQUE');
INSERT INTO tabla_municipios VALUES ('25','25745','SIMIJACA');
INSERT INTO tabla_municipios VALUES ('25','25779','SUSA');
INSERT INTO tabla_municipios VALUES ('25','25781','SUTATAUSA');
INSERT INTO tabla_municipios VALUES ('25','25793','TAUSA');
INSERT INTO tabla_municipios VALUES ('25','25843','UBATE');
INSERT INTO tabla_municipios VALUES ('94','94343','BARRANCO MINA');
INSERT INTO tabla_municipios VALUES ('94','94886','CACAHUAL');
INSERT INTO tabla_municipios VALUES ('94','94001','INÍRIDA');
INSERT INTO tabla_municipios VALUES ('94','94885','LA GUADALUPE');
INSERT INTO tabla_municipios VALUES ('94','94663','MAPIRIPaN');
INSERT INTO tabla_municipios VALUES ('94','94888','MORICHAL');
INSERT INTO tabla_municipios VALUES ('94','94887','PANA PANA');
INSERT INTO tabla_municipios VALUES ('94','94884','PUERTO COLOMBIA');
INSERT INTO tabla_municipios VALUES ('94','94883','SAN FELIPE');
INSERT INTO tabla_municipios VALUES ('95','95015','CALAMAR');
INSERT INTO tabla_municipios VALUES ('95','95025','EL RETORNO');
INSERT INTO tabla_municipios VALUES ('95','95200','MIRAFLORES');
INSERT INTO tabla_municipios VALUES ('95','95001','SAN JOSÉ DEL GUAVIARE');
INSERT INTO tabla_municipios VALUES ('41','41013','AGRADO');
INSERT INTO tabla_municipios VALUES ('41','41026','ALTAMIRA');
INSERT INTO tabla_municipios VALUES ('41','41298','GARZÓN');
INSERT INTO tabla_municipios VALUES ('41','41306','GIGANTE');
INSERT INTO tabla_municipios VALUES ('41','41319','GUADALUPE');
INSERT INTO tabla_municipios VALUES ('41','41548','PITAL');
INSERT INTO tabla_municipios VALUES ('41','41770','SUAZA');
INSERT INTO tabla_municipios VALUES ('41','41791','TARQUI');
INSERT INTO tabla_municipios VALUES ('41','41016','AIPE');
INSERT INTO tabla_municipios VALUES ('41','41020','ALGECIRAS');
INSERT INTO tabla_municipios VALUES ('41','41078','BARAYA');
INSERT INTO tabla_municipios VALUES ('41','41132','CAMPOALEGRE');
INSERT INTO tabla_municipios VALUES ('41','41206','COLOMBIA');
INSERT INTO tabla_municipios VALUES ('41','41349','HOBO');
INSERT INTO tabla_municipios VALUES ('41','41357','IQUIRA');
INSERT INTO tabla_municipios VALUES ('41','41001','NEIVA');
INSERT INTO tabla_municipios VALUES ('41','41524','PALERMO');
INSERT INTO tabla_municipios VALUES ('41','41615','RIVERA');
INSERT INTO tabla_municipios VALUES ('41','41676','SANTA MARÍA');
INSERT INTO tabla_municipios VALUES ('41','41799','TELLO');
INSERT INTO tabla_municipios VALUES ('41','41801','TERUEL');
INSERT INTO tabla_municipios VALUES ('41','41872','VILLAVIEJA');
INSERT INTO tabla_municipios VALUES ('41','41885','YAGUARÁ');
INSERT INTO tabla_municipios VALUES ('41','41378','LA ARGENTINA');
INSERT INTO tabla_municipios VALUES ('41','41396','LA PLATA');
INSERT INTO tabla_municipios VALUES ('41','41483','NÁTAGA');
INSERT INTO tabla_municipios VALUES ('41','41518','PAICOL');
INSERT INTO tabla_municipios VALUES ('41','41797','TESALIA');
INSERT INTO tabla_municipios VALUES ('41','41006','ACEVEDO');
INSERT INTO tabla_municipios VALUES ('41','41244','ELÍAS');
INSERT INTO tabla_municipios VALUES ('41','41359','ISNOS');
INSERT INTO tabla_municipios VALUES ('41','41503','OPORAPA');
INSERT INTO tabla_municipios VALUES ('41','41530','PALESTINA');
INSERT INTO tabla_municipios VALUES ('41','41551','PITALITO');
INSERT INTO tabla_municipios VALUES ('41','41660','SALADOBLANCO');
INSERT INTO tabla_municipios VALUES ('41','41668','SAN AGUSTÍN');
INSERT INTO tabla_municipios VALUES ('41','41807','TIMANÁ');
INSERT INTO tabla_municipios VALUES ('44','44035','ALBANIA');
INSERT INTO tabla_municipios VALUES ('44','44090','DIBULLA');
INSERT INTO tabla_municipios VALUES ('44','44430','MAICAO');
INSERT INTO tabla_municipios VALUES ('44','44560','MANAURE');
INSERT INTO tabla_municipios VALUES ('44','44001','RIOHACHA');
INSERT INTO tabla_municipios VALUES ('44','44847','URIBIA');
INSERT INTO tabla_municipios VALUES ('44','44078','BARRANCAS');
INSERT INTO tabla_municipios VALUES ('44','44098','DISTRACCION');
INSERT INTO tabla_municipios VALUES ('44','44110','EL MOLINO');
INSERT INTO tabla_municipios VALUES ('44','44279','FONSECA');
INSERT INTO tabla_municipios VALUES ('44','44378','HATONUEVO');
INSERT INTO tabla_municipios VALUES ('44','44420','LA JAGUA DEL PILAR');
INSERT INTO tabla_municipios VALUES ('44','44650','SAN JUAN DEL CESAR');
INSERT INTO tabla_municipios VALUES ('44','44855','URUMITA');
INSERT INTO tabla_municipios VALUES ('44','44874','VILLANUEVA');
INSERT INTO tabla_municipios VALUES ('47','47058','ARIGUANÍ');
INSERT INTO tabla_municipios VALUES ('47','47170','CHIBOLO');
INSERT INTO tabla_municipios VALUES ('47','47460','NUEVA GRANADA');
INSERT INTO tabla_municipios VALUES ('47','47555','PLATO');
INSERT INTO tabla_municipios VALUES ('47','47660','SABANAS DE SAN ANGEL');
INSERT INTO tabla_municipios VALUES ('47','47798','TENERIFE');
INSERT INTO tabla_municipios VALUES ('47','47030','ALGARROBO');
INSERT INTO tabla_municipios VALUES ('47','47053','ARACATACA');
INSERT INTO tabla_municipios VALUES ('47','47189','CIÉNAGA');
INSERT INTO tabla_municipios VALUES ('47','47268','EL RETEN');
INSERT INTO tabla_municipios VALUES ('47','47288','FUNDACION');
INSERT INTO tabla_municipios VALUES ('47','47570','PUEBLO VIEJO');
INSERT INTO tabla_municipios VALUES ('47','47980','ZONA BANANERA');
INSERT INTO tabla_municipios VALUES ('47','47161','CERRO SAN ANTONIO');
INSERT INTO tabla_municipios VALUES ('47','47205','CONCORDIA');
INSERT INTO tabla_municipios VALUES ('47','47258','EL PIÑON');
INSERT INTO tabla_municipios VALUES ('47','47541','PEDRAZA');
INSERT INTO tabla_municipios VALUES ('47','47551','PIVIJAY');
INSERT INTO tabla_municipios VALUES ('47','47605','REMOLINO');
INSERT INTO tabla_municipios VALUES ('47','47675','SALAMINA');
INSERT INTO tabla_municipios VALUES ('47','47745','SITIONUEVO');
INSERT INTO tabla_municipios VALUES ('47','47960','ZAPAYAN');
INSERT INTO tabla_municipios VALUES ('47','47001','SANTA MARTA');
INSERT INTO tabla_municipios VALUES ('47','47245','EL BANCO');
INSERT INTO tabla_municipios VALUES ('47','47318','GUAMAL');
INSERT INTO tabla_municipios VALUES ('47','47545','PIJIÑO DEL CARMEN');
INSERT INTO tabla_municipios VALUES ('47','47692','SAN SEBASTIAN DE BUENAVISTA');
INSERT INTO tabla_municipios VALUES ('47','47703','SAN ZENON');
INSERT INTO tabla_municipios VALUES ('47','47707','SANTA ANA');
INSERT INTO tabla_municipios VALUES ('47','47720','SANTA BARBARA DE PINTO');
INSERT INTO tabla_municipios VALUES ('50','50251','EL CASTILLO');
INSERT INTO tabla_municipios VALUES ('50','50270','EL DORADO');
INSERT INTO tabla_municipios VALUES ('50','50287','FUENTE DE ORO');
INSERT INTO tabla_municipios VALUES ('50','50313','GRANADA');
INSERT INTO tabla_municipios VALUES ('50','50350','LA MACARENA');
INSERT INTO tabla_municipios VALUES ('50','50370','LA URIBE');
INSERT INTO tabla_municipios VALUES ('50','50400','LEJANÍAS');
INSERT INTO tabla_municipios VALUES ('50','50325','MAPIRIPaN');
INSERT INTO tabla_municipios VALUES ('50','50330','MESETAS');
INSERT INTO tabla_municipios VALUES ('50','50450','PUERTO CONCORDIA');
INSERT INTO tabla_municipios VALUES ('50','50577','PUERTO LLERAS');
INSERT INTO tabla_municipios VALUES ('50','50590','PUERTO RICO');
INSERT INTO tabla_municipios VALUES ('50','50683','SAN JUAN DE ARAMA');
INSERT INTO tabla_municipios VALUES ('50','50711','VISTA HERMOSA');
INSERT INTO tabla_municipios VALUES ('50','50001','VILLAVICENCIO');
INSERT INTO tabla_municipios VALUES ('50','50006','ACACiAS');
INSERT INTO tabla_municipios VALUES ('50','50110','BARRANCA DE UPIA');
INSERT INTO tabla_municipios VALUES ('50','50150','CASTILLA LA NUEVA');
INSERT INTO tabla_municipios VALUES ('50','50226','CUMARAL');
INSERT INTO tabla_municipios VALUES ('50','50245','EL CALVARIO');
INSERT INTO tabla_municipios VALUES ('50','50318','GUAMAL');
INSERT INTO tabla_municipios VALUES ('50','50606','RESTREPO');
INSERT INTO tabla_municipios VALUES ('50','50680','SAN CARLOS GUAROA');
INSERT INTO tabla_municipios VALUES ('50','50686','SAN JUANITO');
INSERT INTO tabla_municipios VALUES ('50','50223','SAN LUIS DE CUBARRAL');
INSERT INTO tabla_municipios VALUES ('50','50689','SAN MARTÍN');
INSERT INTO tabla_municipios VALUES ('50','50124','CABUYARO');
INSERT INTO tabla_municipios VALUES ('50','50568','PUERTO GAITÁN');
INSERT INTO tabla_municipios VALUES ('50','50573','PUERTO LoPEZ');
INSERT INTO tabla_municipios VALUES ('52','52240','CHACHAGUI');
INSERT INTO tabla_municipios VALUES ('52','52207','CONSACA');
INSERT INTO tabla_municipios VALUES ('52','52254','EL PEÑOL');
INSERT INTO tabla_municipios VALUES ('52','52260','EL TAMBO');
INSERT INTO tabla_municipios VALUES ('52','52381','LA FLORIDA');
INSERT INTO tabla_municipios VALUES ('52','52480','NARIÑO');
INSERT INTO tabla_municipios VALUES ('52','52001','PASTO');
INSERT INTO tabla_municipios VALUES ('52','52683','SANDONÁ');
INSERT INTO tabla_municipios VALUES ('52','52788','TANGUA');
INSERT INTO tabla_municipios VALUES ('52','52885','YACUANQUER');
INSERT INTO tabla_municipios VALUES ('52','52036','ANCUYA');
INSERT INTO tabla_municipios VALUES ('52','52320','GUAITARILLA');
INSERT INTO tabla_municipios VALUES ('52','52385','LA LLANADA');
INSERT INTO tabla_municipios VALUES ('52','52411','LINARES');
INSERT INTO tabla_municipios VALUES ('52','52418','LOS ANDES');
INSERT INTO tabla_municipios VALUES ('52','52435','MALLAMA');
INSERT INTO tabla_municipios VALUES ('52','52506','OSPINA');
INSERT INTO tabla_municipios VALUES ('52','52565','PROVIDENCIA');
INSERT INTO tabla_municipios VALUES ('52','52612','RICAURTE');
INSERT INTO tabla_municipios VALUES ('52','52678','SAMANIEGO');
INSERT INTO tabla_municipios VALUES ('52','52699','SANTA CRUZ');
INSERT INTO tabla_municipios VALUES ('52','52720','SAPUYES');
INSERT INTO tabla_municipios VALUES ('52','52838','TUQUERRES');
INSERT INTO tabla_municipios VALUES ('52','52079','BARBACOAS');
INSERT INTO tabla_municipios VALUES ('52','52250','EL CHARCO');
INSERT INTO tabla_municipios VALUES ('52','52520','FRANCISCO PIZARRO');
INSERT INTO tabla_municipios VALUES ('52','52390','LA TOLA');
INSERT INTO tabla_municipios VALUES ('52','52427','Magui');
INSERT INTO tabla_municipios VALUES ('52','52473','MOSQUERA');
INSERT INTO tabla_municipios VALUES ('52','52490','OLAYA HERRERA');
INSERT INTO tabla_municipios VALUES ('52','52621','ROBERTO PAYAN');
INSERT INTO tabla_municipios VALUES ('52','52696','SANTA BaRBARA');
INSERT INTO tabla_municipios VALUES ('52','52835','TUMACO');
INSERT INTO tabla_municipios VALUES ('52','52019','ALBAN');
INSERT INTO tabla_municipios VALUES ('52','52051','ARBOLEDA');
INSERT INTO tabla_municipios VALUES ('52','52083','BELEN');
INSERT INTO tabla_municipios VALUES ('52','52110','BUESACO');
INSERT INTO tabla_municipios VALUES ('52','52203','COLON');
INSERT INTO tabla_municipios VALUES ('52','52233','CUMBITARA');
INSERT INTO tabla_municipios VALUES ('52','52256','EL ROSARIO');
INSERT INTO tabla_municipios VALUES ('52','52258','El Tablon de Gomez');
INSERT INTO tabla_municipios VALUES ('52','52378','LA CRUZ');
INSERT INTO tabla_municipios VALUES ('52','52399','LA UNION');
INSERT INTO tabla_municipios VALUES ('52','52405','LEIVA');
INSERT INTO tabla_municipios VALUES ('52','52540','POLICARPA');
INSERT INTO tabla_municipios VALUES ('52','52685','SAN BERNARDO');
INSERT INTO tabla_municipios VALUES ('52','52687','SAN LORENZO');
INSERT INTO tabla_municipios VALUES ('52','52693','SAN PABLO');
INSERT INTO tabla_municipios VALUES ('52','52694','SAN PEDRO DE CARTAGO');
INSERT INTO tabla_municipios VALUES ('52','52786','TAMINANGO');
INSERT INTO tabla_municipios VALUES ('52','52022','ALDANA');
INSERT INTO tabla_municipios VALUES ('52','52210','CONTADERO');
INSERT INTO tabla_municipios VALUES ('52','52215','CÓRDOBA');
INSERT INTO tabla_municipios VALUES ('52','52224','CUASPUD');
INSERT INTO tabla_municipios VALUES ('52','52227','CUMBAL');
INSERT INTO tabla_municipios VALUES ('52','52287','FUNES');
INSERT INTO tabla_municipios VALUES ('52','52317','GUACHUCAL');
INSERT INTO tabla_municipios VALUES ('52','52323','GUALMATAN');
INSERT INTO tabla_municipios VALUES ('52','52352','ILES');
INSERT INTO tabla_municipios VALUES ('52','52354','IMUES');
INSERT INTO tabla_municipios VALUES ('52','52356','IPIALES');
INSERT INTO tabla_municipios VALUES ('52','52560','POTOSÍ');
INSERT INTO tabla_municipios VALUES ('52','52573','PUERRES');
INSERT INTO tabla_municipios VALUES ('52','52585','PUPIALES');
INSERT INTO tabla_municipios VALUES ('54','54051','ARBOLEDAS');
INSERT INTO tabla_municipios VALUES ('54','54223','CUCUTILLA');
INSERT INTO tabla_municipios VALUES ('54','54313','GRAMALOTE');
INSERT INTO tabla_municipios VALUES ('54','54418','LOURDES');
INSERT INTO tabla_municipios VALUES ('54','54660','SALAZAR');
INSERT INTO tabla_municipios VALUES ('54','54680','SANTIAGO');
INSERT INTO tabla_municipios VALUES ('54','54871','VILLA CARO');
INSERT INTO tabla_municipios VALUES ('54','54109','BUCARASICA');
INSERT INTO tabla_municipios VALUES ('54','54250','EL TARRA');
INSERT INTO tabla_municipios VALUES ('54','54720','SARDINATA');
INSERT INTO tabla_municipios VALUES ('54','54810','TIBÚ');
INSERT INTO tabla_municipios VALUES ('54','54003','ABREGO');
INSERT INTO tabla_municipios VALUES ('54','54128','CACHIRÁ');
INSERT INTO tabla_municipios VALUES ('54','54206','CONVENCIÓN');
INSERT INTO tabla_municipios VALUES ('54','54245','EL CARMEN');
INSERT INTO tabla_municipios VALUES ('54','54344','HACARÍ');
INSERT INTO tabla_municipios VALUES ('54','54385','LA ESPERANZA');
INSERT INTO tabla_municipios VALUES ('54','54398','LA PLAYA');
INSERT INTO tabla_municipios VALUES ('54','54498','OCAÑA');
INSERT INTO tabla_municipios VALUES ('54','54670','SAN CALIXTO');
INSERT INTO tabla_municipios VALUES ('54','54800','TEORAMA');
INSERT INTO tabla_municipios VALUES ('54','54001','CÚCUTA');
INSERT INTO tabla_municipios VALUES ('54','54261','EL ZULIA');
INSERT INTO tabla_municipios VALUES ('54','54405','LOS PATIOS');
INSERT INTO tabla_municipios VALUES ('54','54553','PUERTO SANTANDER');
INSERT INTO tabla_municipios VALUES ('54','54673','SAN CAYETANO');
INSERT INTO tabla_municipios VALUES ('54','54874','VILLA DEL ROSARIO');
INSERT INTO tabla_municipios VALUES ('54','54125','CÁCOTA');
INSERT INTO tabla_municipios VALUES ('54','54174','CHITAGÁ');
INSERT INTO tabla_municipios VALUES ('54','54480','MUTISCUA');
INSERT INTO tabla_municipios VALUES ('54','54518','PAMPLONA');
INSERT INTO tabla_municipios VALUES ('54','54520','PAMPLONITA');
INSERT INTO tabla_municipios VALUES ('54','54743','SILOS');
INSERT INTO tabla_municipios VALUES ('54','54099','BOCHALEMA');
INSERT INTO tabla_municipios VALUES ('54','54172','CHINÁCOTA');
INSERT INTO tabla_municipios VALUES ('54','54239','DURANIA');
INSERT INTO tabla_municipios VALUES ('54','54347','HERRÁN');
INSERT INTO tabla_municipios VALUES ('54','54377','LABATECA');
INSERT INTO tabla_municipios VALUES ('54','54599','RAGONVALIA');
INSERT INTO tabla_municipios VALUES ('54','54820','TOLEDO');
INSERT INTO tabla_municipios VALUES ('86','86219','COLÓN');
INSERT INTO tabla_municipios VALUES ('86','86001','MOCOA');
INSERT INTO tabla_municipios VALUES ('86','86320','ORITO');
INSERT INTO tabla_municipios VALUES ('86','86568','PUERTO ASIS');
INSERT INTO tabla_municipios VALUES ('86','86569','PUERTO CAICEDO');
INSERT INTO tabla_municipios VALUES ('86','86571','PUERTO GUZMAN');
INSERT INTO tabla_municipios VALUES ('86','86573','PUERTO LEGUIZAMO');
INSERT INTO tabla_municipios VALUES ('86','86755','SAN FRANCISCO');
INSERT INTO tabla_municipios VALUES ('86','86757','SAN MIGUEL');
INSERT INTO tabla_municipios VALUES ('86','86760','SANTIAGO');
INSERT INTO tabla_municipios VALUES ('86','86749','SIBUNDOY');
INSERT INTO tabla_municipios VALUES ('86','86865','VALLE DEL GUAMUEZ');
INSERT INTO tabla_municipios VALUES ('86','86885','VILLA GARZON');
INSERT INTO tabla_municipios VALUES ('63','63001','ARMENIA');
INSERT INTO tabla_municipios VALUES ('63','63111','BUENAVISTA');
INSERT INTO tabla_municipios VALUES ('63','63130','CALARCA');
INSERT INTO tabla_municipios VALUES ('63','63212','CoRDOBA');
INSERT INTO tabla_municipios VALUES ('63','63302','GeNOVA');
INSERT INTO tabla_municipios VALUES ('63','63548','PIJAO');
INSERT INTO tabla_municipios VALUES ('63','63272','FILANDIA');
INSERT INTO tabla_municipios VALUES ('63','63690','SALENTO');
INSERT INTO tabla_municipios VALUES ('63','63190','CIRCASIA');
INSERT INTO tabla_municipios VALUES ('63','63401','LA TEBAIDA');
INSERT INTO tabla_municipios VALUES ('63','63470','Montengro');
INSERT INTO tabla_municipios VALUES ('63','63594','QUIMBAYA');
INSERT INTO tabla_municipios VALUES ('66','66170','DOSQUEBRADAS');
INSERT INTO tabla_municipios VALUES ('66','66400','LA VIRGINIA');
INSERT INTO tabla_municipios VALUES ('66','66440','MARSELLA');
INSERT INTO tabla_municipios VALUES ('66','66001','PEREIRA');
INSERT INTO tabla_municipios VALUES ('66','66682','SANTA ROSA DE CABAL');
INSERT INTO tabla_municipios VALUES ('66','66045','APÍA');
INSERT INTO tabla_municipios VALUES ('66','66075','BALBOA');
INSERT INTO tabla_municipios VALUES ('66','66088','BELÉN DE UMBRÍA');
INSERT INTO tabla_municipios VALUES ('66','66318','GUÁTICA');
INSERT INTO tabla_municipios VALUES ('66','66383','LA CELIA');
INSERT INTO tabla_municipios VALUES ('66','66594','QUINCHiA');
INSERT INTO tabla_municipios VALUES ('66','66687','SANTUARIO');
INSERT INTO tabla_municipios VALUES ('66','66456','MISTRATÓ');
INSERT INTO tabla_municipios VALUES ('66','66572','PUEBLO RICO');
INSERT INTO tabla_municipios VALUES ('68','68176','CHIMA');
INSERT INTO tabla_municipios VALUES ('68','68209','CONFINES');
INSERT INTO tabla_municipios VALUES ('68','68211','CONTRATACIÓN');
INSERT INTO tabla_municipios VALUES ('68','68245','EL GUACAMAYO');
INSERT INTO tabla_municipios VALUES ('68','68296','GALÁN');
INSERT INTO tabla_municipios VALUES ('68','68298','GAMBITA');
INSERT INTO tabla_municipios VALUES ('68','68320','GUADALUPE');
INSERT INTO tabla_municipios VALUES ('68','68322','GUAPOTÁ');
INSERT INTO tabla_municipios VALUES ('68','68344','HATO');
INSERT INTO tabla_municipios VALUES ('68','68500','OIBA');
INSERT INTO tabla_municipios VALUES ('68','68522','PALMAR');
INSERT INTO tabla_municipios VALUES ('68','68524','PALMAS DEL SOCORRO');
INSERT INTO tabla_municipios VALUES ('68','68720','SANTA HELENA DEL OPÓN');
INSERT INTO tabla_municipios VALUES ('68','68745','SIMACOTA');
INSERT INTO tabla_municipios VALUES ('68','68755','SOCORRO');
INSERT INTO tabla_municipios VALUES ('68','68770','SUAITA');
INSERT INTO tabla_municipios VALUES ('68','68147','CAPITANEJO');
INSERT INTO tabla_municipios VALUES ('68','68152','CARCASÍ');
INSERT INTO tabla_municipios VALUES ('68','68160','CEPITÁ');
INSERT INTO tabla_municipios VALUES ('68','68162','CERRITO');
INSERT INTO tabla_municipios VALUES ('68','68207','CONCEPCIÓN');
INSERT INTO tabla_municipios VALUES ('68','68266','ENCISO');
INSERT INTO tabla_municipios VALUES ('68','68318','GUACA');
INSERT INTO tabla_municipios VALUES ('68','68425','MACARAVITA');
INSERT INTO tabla_municipios VALUES ('68','68432','MÁLAGA');
INSERT INTO tabla_municipios VALUES ('68','68468','MOLAGAVITA');
INSERT INTO tabla_municipios VALUES ('68','68669','SAN ANDRÉS');
INSERT INTO tabla_municipios VALUES ('68','68684','SAN JOSÉ DE MIRANDA');
INSERT INTO tabla_municipios VALUES ('68','68686','SAN MIGUEL');
INSERT INTO tabla_municipios VALUES ('68','68051','ARATOCA');
INSERT INTO tabla_municipios VALUES ('68','68079','BARICHARA');
INSERT INTO tabla_municipios VALUES ('68','68121','CABRERA');
INSERT INTO tabla_municipios VALUES ('68','68167','CHARALÁ');
INSERT INTO tabla_municipios VALUES ('68','68217','COROMORO');
INSERT INTO tabla_municipios VALUES ('68','68229','CURITÍ');
INSERT INTO tabla_municipios VALUES ('68','68264','ENCINO');
INSERT INTO tabla_municipios VALUES ('68','68370','JORDÁN');
INSERT INTO tabla_municipios VALUES ('68','68464','MOGOTES');
INSERT INTO tabla_municipios VALUES ('68','68498','OCAMONTE');
INSERT INTO tabla_municipios VALUES ('68','68502','ONZAGA');
INSERT INTO tabla_municipios VALUES ('68','68533','PÁRAMO');
INSERT INTO tabla_municipios VALUES ('68','68549','PINCHOTE');
INSERT INTO tabla_municipios VALUES ('68','68679','SAN GIL');
INSERT INTO tabla_municipios VALUES ('68','68682','SAN JOAQUÍN');
INSERT INTO tabla_municipios VALUES ('68','68855','VALLE DE SAN JOSÉ');
INSERT INTO tabla_municipios VALUES ('68','68872','VILLANUEVA');
INSERT INTO tabla_municipios VALUES ('68','68081','BARRANCABERMEJA');
INSERT INTO tabla_municipios VALUES ('68','68092','BETULIA');
INSERT INTO tabla_municipios VALUES ('68','68235','EL CARMEN DE CHUCURÍ');
INSERT INTO tabla_municipios VALUES ('68','68575','PUERTO WILCHES');
INSERT INTO tabla_municipios VALUES ('68','68655','SABANA DE TORRES');
INSERT INTO tabla_municipios VALUES ('68','68689','SAN VICENTE DE CHUCURÍ');
INSERT INTO tabla_municipios VALUES ('68','68895','ZAPATOCA');
INSERT INTO tabla_municipios VALUES ('68','68001','BUCARAMANGA');
INSERT INTO tabla_municipios VALUES ('68','68132','CALIFORNIA');
INSERT INTO tabla_municipios VALUES ('68','68169','CHARTA');
INSERT INTO tabla_municipios VALUES ('68','68255','EL PLAYÓN');
INSERT INTO tabla_municipios VALUES ('68','68276','FLORIDABLANCA');
INSERT INTO tabla_municipios VALUES ('68','68307','GIRÓN');
INSERT INTO tabla_municipios VALUES ('68','68406','LEBRÍJA');
INSERT INTO tabla_municipios VALUES ('68','68418','LOS SANTOS');
INSERT INTO tabla_municipios VALUES ('68','68444','MATANZA');
INSERT INTO tabla_municipios VALUES ('68','68547','PIEDECUESTA');
INSERT INTO tabla_municipios VALUES ('68','68615','RIONEGRO');
INSERT INTO tabla_municipios VALUES ('68','68705','SANTA BÁRBARA');
INSERT INTO tabla_municipios VALUES ('68','68780','SURATA');
INSERT INTO tabla_municipios VALUES ('68','68820','TONA');
INSERT INTO tabla_municipios VALUES ('68','68867','VETAS');
INSERT INTO tabla_municipios VALUES ('68','68013','AGUADA');
INSERT INTO tabla_municipios VALUES ('68','68020','ALBANIA');
INSERT INTO tabla_municipios VALUES ('68','68077','BARBOSA');
INSERT INTO tabla_municipios VALUES ('68','68101','BOLÍVAR');
INSERT INTO tabla_municipios VALUES ('68','68179','CHIPATÁ');
INSERT INTO tabla_municipios VALUES ('68','68190','CIMITARRA');
INSERT INTO tabla_municipios VALUES ('68','68250','EL PEÑÓN');
INSERT INTO tabla_municipios VALUES ('68','68271','FLORIÁN');
INSERT INTO tabla_municipios VALUES ('68','68324','GUAVATÁ');
INSERT INTO tabla_municipios VALUES ('68','68327','GuEPSA');
INSERT INTO tabla_municipios VALUES ('68','68368','JESÚS MARÍA');
INSERT INTO tabla_municipios VALUES ('68','68377','LA BELLEZA');
INSERT INTO tabla_municipios VALUES ('68','68397','LA PAZ');
INSERT INTO tabla_municipios VALUES ('68','68385','LANDÁZURI');
INSERT INTO tabla_municipios VALUES ('68','68572','PUENTE NACIONAL');
INSERT INTO tabla_municipios VALUES ('68','68573','PUERTO PARRA');
INSERT INTO tabla_municipios VALUES ('68','68673','SAN BENITO');
INSERT INTO tabla_municipios VALUES ('68','68773','SUCRE');
INSERT INTO tabla_municipios VALUES ('68','68861','VÉLEZ');
INSERT INTO tabla_municipios VALUES ('70','70265','GUARANDA');
INSERT INTO tabla_municipios VALUES ('70','70429','MAJAGUAL');
INSERT INTO tabla_municipios VALUES ('70','70771','SUCRE');
INSERT INTO tabla_municipios VALUES ('70','70230','CHALÁN');
INSERT INTO tabla_municipios VALUES ('70','70204','COLOSO');
INSERT INTO tabla_municipios VALUES ('70','70473','MORROA');
INSERT INTO tabla_municipios VALUES ('70','70508','OVEJAS');
INSERT INTO tabla_municipios VALUES ('70','70001','SINCELEJO');
INSERT INTO tabla_municipios VALUES ('70','70221','COVEÑAS');
INSERT INTO tabla_municipios VALUES ('70','70523','PALMITO');
INSERT INTO tabla_municipios VALUES ('70','70713','SAN ONOFRE');
INSERT INTO tabla_municipios VALUES ('70','70820','SANTIAGO DE TOLÚ');
INSERT INTO tabla_municipios VALUES ('70','70823','TOLÚ VIEJO');
INSERT INTO tabla_municipios VALUES ('70','70110','BUENAVISTA');
INSERT INTO tabla_municipios VALUES ('70','70215','COROZAL');
INSERT INTO tabla_municipios VALUES ('70','70233','EL ROBLE');
INSERT INTO tabla_municipios VALUES ('70','70235','GALERAS');
INSERT INTO tabla_municipios VALUES ('70','70418','LOS PALMITOS');
INSERT INTO tabla_municipios VALUES ('70','70670','SAMPUÉS');
INSERT INTO tabla_municipios VALUES ('70','70702','SAN JUAN BETULIA');
INSERT INTO tabla_municipios VALUES ('70','70717','SAN PEDRO');
INSERT INTO tabla_municipios VALUES ('70','70742','SINCÉ');
INSERT INTO tabla_municipios VALUES ('70','70124','CAIMITO');
INSERT INTO tabla_municipios VALUES ('70','70400','LA UNIÓN');
INSERT INTO tabla_municipios VALUES ('70','70678','SAN BENITO ABAD');
INSERT INTO tabla_municipios VALUES ('70','70708','SAN MARCOS');
INSERT INTO tabla_municipios VALUES ('73','73030','AMBALEMA');
INSERT INTO tabla_municipios VALUES ('73','73055','ARMERO');
INSERT INTO tabla_municipios VALUES ('73','73270','FALAN');
INSERT INTO tabla_municipios VALUES ('73','73283','FRESNO');
INSERT INTO tabla_municipios VALUES ('73','73349','HONDA');
INSERT INTO tabla_municipios VALUES ('73','73443','MARIQUITA');
INSERT INTO tabla_municipios VALUES ('73','73520','PALOCABILDO');
INSERT INTO tabla_municipios VALUES ('73','73148','CARMEN DE APICALÁ');
INSERT INTO tabla_municipios VALUES ('73','73226','CUNDAY');
INSERT INTO tabla_municipios VALUES ('73','73352','ICONONZO');
INSERT INTO tabla_municipios VALUES ('73','73449','MELGAR');
INSERT INTO tabla_municipios VALUES ('73','73873','VILLARRICA');
INSERT INTO tabla_municipios VALUES ('73','73067','ATACO');
INSERT INTO tabla_municipios VALUES ('73','73168','CHAPARRAL');
INSERT INTO tabla_municipios VALUES ('73','73217','COYAIMA');
INSERT INTO tabla_municipios VALUES ('73','73483','NATAGAIMA');
INSERT INTO tabla_municipios VALUES ('73','73504','ORTEGA');
INSERT INTO tabla_municipios VALUES ('73','73555','PLANADAS');
INSERT INTO tabla_municipios VALUES ('73','73616','RIOBLANCO');
INSERT INTO tabla_municipios VALUES ('73','73622','RONCESVALLES');
INSERT INTO tabla_municipios VALUES ('73','73675','SAN ANTONIO');
INSERT INTO tabla_municipios VALUES ('73','73026','ALVARADO');
INSERT INTO tabla_municipios VALUES ('73','73043','ANZOÁTEGUI');
INSERT INTO tabla_municipios VALUES ('73','73124','CAJAMARCA');
INSERT INTO tabla_municipios VALUES ('73','73200','COELLO');
INSERT INTO tabla_municipios VALUES ('73','73268','ESPINAL');
INSERT INTO tabla_municipios VALUES ('73','73275','FLANDES');
INSERT INTO tabla_municipios VALUES ('73','73001','IBAGUe');
INSERT INTO tabla_municipios VALUES ('73','73547','PIEDRAS');
INSERT INTO tabla_municipios VALUES ('73','73624','ROVIRA');
INSERT INTO tabla_municipios VALUES ('73','73678','SAN LUIS');
INSERT INTO tabla_municipios VALUES ('73','73854','VALLE DE SAN JUAN');
INSERT INTO tabla_municipios VALUES ('73','73024','ALPUJARRA');
INSERT INTO tabla_municipios VALUES ('73','73236','DOLORES');
INSERT INTO tabla_municipios VALUES ('73','73319','GUAMO');
INSERT INTO tabla_municipios VALUES ('73','73563','PRADO');
INSERT INTO tabla_municipios VALUES ('73','73585','PURIFICACIÓN');
INSERT INTO tabla_municipios VALUES ('73','73671','SALDAÑA');
INSERT INTO tabla_municipios VALUES ('73','73770','SUÁREZ');
INSERT INTO tabla_municipios VALUES ('73','73152','CASABIANCA');
INSERT INTO tabla_municipios VALUES ('73','73347','HERVEO');
INSERT INTO tabla_municipios VALUES ('73','73408','LeRIDA');
INSERT INTO tabla_municipios VALUES ('73','73411','LiBANO');
INSERT INTO tabla_municipios VALUES ('73','73461','MURILLO');
INSERT INTO tabla_municipios VALUES ('73','73686','SANTA ISABEL');
INSERT INTO tabla_municipios VALUES ('73','73861','VENADILLO');
INSERT INTO tabla_municipios VALUES ('73','73870','VILLAHERMOSA');
INSERT INTO tabla_municipios VALUES ('76','76036','ANDALUCÍA');
INSERT INTO tabla_municipios VALUES ('76','76111','BUGA');
INSERT INTO tabla_municipios VALUES ('76','76113','BUGALAGRANDE');
INSERT INTO tabla_municipios VALUES ('76','76126','CALIMA');
INSERT INTO tabla_municipios VALUES ('76','76248','EL CERRITO');
INSERT INTO tabla_municipios VALUES ('76','76306','GINEBRA');
INSERT INTO tabla_municipios VALUES ('76','76318','GUACARÍ');
INSERT INTO tabla_municipios VALUES ('76','76606','RESTREPO');
INSERT INTO tabla_municipios VALUES ('76','76616','RIOFRIO');
INSERT INTO tabla_municipios VALUES ('76','76670','SAN PEDRO');
INSERT INTO tabla_municipios VALUES ('76','76828','TRUJILLO');
INSERT INTO tabla_municipios VALUES ('76','76834','TULUÁ');
INSERT INTO tabla_municipios VALUES ('76','76890','YOTOCO');
INSERT INTO tabla_municipios VALUES ('76','76020','ALCALa');
INSERT INTO tabla_municipios VALUES ('76','76041','ANSERMANUEVO');
INSERT INTO tabla_municipios VALUES ('76','76054','ARGELIA');
INSERT INTO tabla_municipios VALUES ('76','76100','BOLÍVAR');
INSERT INTO tabla_municipios VALUES ('76','76147','CARTAGO');
INSERT INTO tabla_municipios VALUES ('76','76243','EL ÁGUILA');
INSERT INTO tabla_municipios VALUES ('76','76246','EL CAIRO');
INSERT INTO tabla_municipios VALUES ('76','76250','EL DOVIO');
INSERT INTO tabla_municipios VALUES ('76','76400','LA UNIÓN');
INSERT INTO tabla_municipios VALUES ('76','76403','LA VICTORIA');
INSERT INTO tabla_municipios VALUES ('76','76497','OBANDO');
INSERT INTO tabla_municipios VALUES ('76','76622','ROLDANILLO');
INSERT INTO tabla_municipios VALUES ('76','76823','TORO');
INSERT INTO tabla_municipios VALUES ('76','76845','ULLOA');
INSERT INTO tabla_municipios VALUES ('76','76863','VERSALLES');
INSERT INTO tabla_municipios VALUES ('76','76895','ZARZAL');
INSERT INTO tabla_municipios VALUES ('76','76109','BUENAVENTURA');
INSERT INTO tabla_municipios VALUES ('76','76122','CAICEDONIA');
INSERT INTO tabla_municipios VALUES ('76','76736','SEVILLA');
INSERT INTO tabla_municipios VALUES ('76','76001','CALI');
INSERT INTO tabla_municipios VALUES ('76','76130','CANDELARIA');
INSERT INTO tabla_municipios VALUES ('76','76233','DAGUA');
INSERT INTO tabla_municipios VALUES ('76','76275','FLORIDA');
INSERT INTO tabla_municipios VALUES ('76','76364','JAMUNDÍ');
INSERT INTO tabla_municipios VALUES ('76','76377','LA CUMBRE');
INSERT INTO tabla_municipios VALUES ('76','76520','PALMIRA');
INSERT INTO tabla_municipios VALUES ('76','76563','PRADERA');
INSERT INTO tabla_municipios VALUES ('76','76869','VIJES');
INSERT INTO tabla_municipios VALUES ('76','76892','YUMBO');
INSERT INTO tabla_municipios VALUES ('97','97161','CARURU');
INSERT INTO tabla_municipios VALUES ('97','97001','MITÚ');
INSERT INTO tabla_municipios VALUES ('97','97511','PACOA');
INSERT INTO tabla_municipios VALUES ('97','97777','PAPUNAHUA');
INSERT INTO tabla_municipios VALUES ('97','97666','TARAIRA');
INSERT INTO tabla_municipios VALUES ('97','97889','YAVARATÉ');
INSERT INTO tabla_municipios VALUES ('99','99773','CUMARIBO');
INSERT INTO tabla_municipios VALUES ('99','99524','LA PRIMAVERA');
INSERT INTO tabla_municipios VALUES ('99','99001','PUERTO CARREÑO');
INSERT INTO tabla_municipios VALUES ('99','99624','SANTA ROSALÍA');
