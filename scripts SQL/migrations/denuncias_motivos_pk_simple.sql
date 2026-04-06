-- Migración desde PK compuesta en tabla_motivos_denuncia_eventos hacia id_motivo_denuncia_evento (PK simple).
-- Requisito: aceptar pérdida de filas en tabla_denuncia_eventos (TRUNCATE).
-- Luego ejecutar scripts SQL/insert/insertar-denuncias-eventos-catalogo.sql

BEGIN;

TRUNCATE TABLE tabla_denuncia_eventos;

ALTER TABLE tabla_denuncia_eventos
  DROP CONSTRAINT IF EXISTS tabla_denuncia_eventos_id_categoria_denuncia_id_motivo_denuncia_fkey;

ALTER TABLE tabla_denuncia_eventos
  DROP COLUMN IF EXISTS id_categoria_denuncia,
  DROP COLUMN IF EXISTS id_motivo_denuncia;

DROP TABLE IF EXISTS tabla_motivos_denuncia_eventos CASCADE;

CREATE TABLE tabla_motivos_denuncia_eventos (
    id_motivo_denuncia_evento               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_categoria_denuncia                   INT                          NOT NULL,
    nombre_motivo                           VARCHAR                      NOT NULL       UNIQUE  CHECK (char_length(nombre_motivo) >= 3),
    descripcion_motivo                      VARCHAR                      NULL           CHECK (descripcion_motivo IS NULL OR char_length(descripcion_motivo) >= 10),
    fecha_creacion                          TIMESTAMP   WITH TIME ZONE   NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion                     TIMESTAMP   WITH TIME ZONE                  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria_denuncia)     REFERENCES  tabla_categoria_denuncia_evento(id_categoria_denuncia)
);

ALTER TABLE tabla_denuncia_eventos
  ADD COLUMN id_motivo_denuncia_evento INT NOT NULL REFERENCES tabla_motivos_denuncia_eventos(id_motivo_denuncia_evento);

COMMIT;
