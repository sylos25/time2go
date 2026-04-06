-- Normaliza el modelo de reservas:
-- 1) tabla_reserva_eventos queda como cabecera (usuario/evento)
-- 2) acompanantes se almacenan en tabla_reserva_asistentes

ALTER TABLE IF EXISTS tabla_reserva_eventos
    DROP COLUMN IF EXISTS tipo_documento,
    DROP COLUMN IF EXISTS numero_documento,
    DROP COLUMN IF EXISTS lleva_acompanante,
    DROP COLUMN IF EXISTS acompanante_tipo_documento,
    DROP COLUMN IF EXISTS acompanante_numero_documento,
    DROP COLUMN IF EXISTS acompanante_nombres,
    DROP COLUMN IF EXISTS acompanante_apellidos,
    DROP COLUMN IF EXISTS acompanante_telefono,
    DROP COLUMN IF EXISTS acompanante_correo;

CREATE TABLE IF NOT EXISTS tabla_reserva_asistentes (
    id_reserva_asistente                    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reserva_evento                       INT                          NOT NULL,
    tipo_documento                          tip_doc                      NOT NULL,
    numero_documento                        VARCHAR                      NOT NULL,
    nombres                                 VARCHAR                      NOT NULL        CHECK (char_length(nombres) >= 3),
    apellidos                               VARCHAR                      NOT NULL        CHECK (char_length(apellidos) >= 3),
    telefono                                DECIMAL(10,0)               NOT NULL        CHECK (telefono > 2999999999),
    correo                                  VARCHAR                      NOT NULL,
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_reserva_asistente_doc UNIQUE (id_reserva_evento, numero_documento),
    FOREIGN KEY (id_reserva_evento)         REFERENCES  tabla_reserva_eventos(id_reserva_evento)
);
