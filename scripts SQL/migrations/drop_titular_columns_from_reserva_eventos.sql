-- Ajuste de modelo: el titular se obtiene por FK (id_usuario) desde tabla_usuarios.
-- En tabla_reserva_eventos solo quedan datos de reserva y acompanante.

ALTER TABLE IF EXISTS tabla_reserva_eventos
    DROP COLUMN IF EXISTS titular_nombres,
    DROP COLUMN IF EXISTS titular_apellidos,
    DROP COLUMN IF EXISTS titular_telefono,
    DROP COLUMN IF EXISTS titular_correo;
