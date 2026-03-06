-- Trigger para actualizar las fechas.

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