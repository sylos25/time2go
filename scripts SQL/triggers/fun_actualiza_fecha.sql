-- Trigger para actualizar la columna fecha_actualizacion en tablas que la poseen.

CREATE OR REPLACE FUNCTION fun_actualiza_fecha()
RETURNS TRIGGER AS $$
BEGIN
  -- Evita sobrescribir la fecha cuando el UPDATE no cambia datos reales.
  IF to_jsonb(NEW) - 'fecha_actualizacion' IS DISTINCT FROM to_jsonb(OLD) - 'fecha_actualizacion' THEN
    NEW.fecha_actualizacion := CURRENT_TIMESTAMP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_update_tabla_paises ON tabla_paises;
CREATE TRIGGER trig_update_tabla_paises
BEFORE UPDATE ON tabla_paises
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_departamentos ON tabla_departamentos;
CREATE TRIGGER trig_update_tabla_departamentos
BEFORE UPDATE ON tabla_departamentos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_municipios ON tabla_municipios;
CREATE TRIGGER trig_update_tabla_municipios
BEFORE UPDATE ON tabla_municipios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_tipo_sitios ON tabla_tipo_sitios;
CREATE TRIGGER trig_update_tabla_tipo_sitios
BEFORE UPDATE ON tabla_tipo_sitios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_sitios ON tabla_sitios;
CREATE TRIGGER trig_update_tabla_sitios
BEFORE UPDATE ON tabla_sitios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_sitios_telefonos ON tabla_sitios_telefonos;
CREATE TRIGGER trig_update_tabla_sitios_telefonos
BEFORE UPDATE ON tabla_sitios_telefonos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_tipo_infraestructura_discapacitados ON tabla_tipo_infraestructura_discapacitados;
CREATE TRIGGER trig_update_tabla_tipo_infraestructura_discapacitados
BEFORE UPDATE ON tabla_tipo_infraestructura_discapacitados
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_sitios_discapacitados ON tabla_sitios_discapacitados;
CREATE TRIGGER trig_update_tabla_sitios_discapacitados
BEFORE UPDATE ON tabla_sitios_discapacitados
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_roles ON tabla_roles;
CREATE TRIGGER trig_update_tabla_roles
BEFORE UPDATE ON tabla_roles
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_usuarios ON tabla_usuarios;
CREATE TRIGGER trig_update_tabla_usuarios
BEFORE UPDATE ON tabla_usuarios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_personas ON tabla_personas;
CREATE TRIGGER trig_update_tabla_personas
BEFORE UPDATE ON tabla_personas
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_usuarios_credenciales ON tabla_usuarios_credenciales;
CREATE TRIGGER trig_update_tabla_usuarios_credenciales
BEFORE UPDATE ON tabla_usuarios_credenciales
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_accesibilidad_menu ON tabla_accesibilidad_menu;
CREATE TRIGGER trig_update_tabla_accesibilidad_menu
BEFORE UPDATE ON tabla_accesibilidad_menu
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_accesibilidad_menu_x_rol ON tabla_accesibilidad_menu_x_rol;
CREATE TRIGGER trig_update_tabla_accesibilidad_menu_x_rol
BEFORE UPDATE ON tabla_accesibilidad_menu_x_rol
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_baneados ON tabla_baneados;
CREATE TRIGGER trig_update_tabla_baneados
BEFORE UPDATE ON tabla_baneados
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_categoria_eventos ON tabla_categoria_eventos;
CREATE TRIGGER trig_update_tabla_categoria_eventos
BEFORE UPDATE ON tabla_categoria_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_tipo_eventos ON tabla_tipo_eventos;
CREATE TRIGGER trig_update_tabla_tipo_eventos
BEFORE UPDATE ON tabla_tipo_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_eventos ON tabla_eventos;
CREATE TRIGGER trig_update_tabla_eventos
BEFORE UPDATE ON tabla_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_eventos_telefonos ON tabla_eventos_telefonos;
CREATE TRIGGER trig_update_tabla_eventos_telefonos
BEFORE UPDATE ON tabla_eventos_telefonos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_evento_informacion_importante ON tabla_evento_informacion_importante;
CREATE TRIGGER trig_update_tabla_evento_informacion_importante
BEFORE UPDATE ON tabla_evento_informacion_importante
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_imagenes_eventos ON tabla_imagenes_eventos;
CREATE TRIGGER trig_update_tabla_imagenes_eventos
BEFORE UPDATE ON tabla_imagenes_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_documentos_usuarios ON tabla_documentos_usuarios;
CREATE TRIGGER trig_update_tabla_documentos_usuarios
BEFORE UPDATE ON tabla_documentos_usuarios
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_valoraciones ON tabla_valoraciones;
CREATE TRIGGER trig_update_tabla_valoraciones
BEFORE UPDATE ON tabla_valoraciones
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_reserva_eventos ON tabla_reserva_eventos;
CREATE TRIGGER trig_update_tabla_reserva_eventos
BEFORE UPDATE ON tabla_reserva_eventos
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_reserva_asistentes ON tabla_reserva_asistentes;
CREATE TRIGGER trig_update_tabla_reserva_asistentes
BEFORE UPDATE ON tabla_reserva_asistentes
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_boleteria ON tabla_boleteria;
CREATE TRIGGER trig_update_tabla_boleteria
BEFORE UPDATE ON tabla_boleteria
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();

DROP TRIGGER IF EXISTS trig_update_tabla_links ON tabla_links;
CREATE TRIGGER trig_update_tabla_links
BEFORE UPDATE ON tabla_links
FOR EACH ROW EXECUTE FUNCTION fun_actualiza_fecha();
