-- Ejecutar en BD existente: actualiza la etiqueta del rol id 2 (sin cambiar el id).
UPDATE tabla_roles
SET nombre_rol = 'Organizador'
WHERE id_rol = 2
  AND (nombre_rol ILIKE 'Promotor' OR nombre_rol = 'promotor');
