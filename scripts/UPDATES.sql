--UPDATES
/*UPTADE PAISES*/
CREATE OR REPLACE FUNCTION fun_update_paises(
    wid_pais        tabla_paises.id_pais%TYPE,
    wnombre_pais    tabla_paises.nombre_pais%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_paises 
    SET nombre_pais = wnombre_pais
    WHERE id_pais = wid_pais;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE DEPARTAMENTOS*/
CREATE OR REPLACE FUNCTION fun_update_departamentos(
    wid_departamento       tabla_departamentos.id_departamento%TYPE,
    wnombre_departamento   tabla_departamentos.nombre_departamento%TYPE,
    wid_pais               tabla_departamentos.id_pais%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_departamentos 
    SET nombre_departamento = wnombre_departamento, 
        id_pais = wid_pais
    WHERE id_departamento = wid_departamento;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE MUNICIPIOS*/
CREATE OR REPLACE FUNCTION fun_update_municipios(
    wid_departamento       tabla_municipios.id_departamento%TYPE,
    wid_municipio          tabla_municipios.id_municipio%TYPE,
    wnombre_municipio      tabla_municipios.nombre_municipio%TYPE
    wdistrito              tabla_municipios.distrito%TYPE
    warea_metropolitana    tabla_municipios.area_metropolitana%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_municipios 
    SET id_departamento = wid_departamento, 
        nombre_municipio = wnombre_municipio,
        distrito = wdistrito,
        area_metropolitana = warea_metropolitana
    WHERE id_municipio = wid_municipio;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE TIPO SITIOS*/
CREATE OR REPLACE FUNCTION fun_update_tipo_sitios(
    wid_tipo_sitio       tabla_tipo_sitios.id_tipo_sitio%TYPE,
    wnombre_tipo_sitio   tabla_tipo_sitios.nombre_tipo_sitio%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_tipo_sitios 
    SET nombre_tipo_sitio = wnombre_tipo_sitio
    WHERE id_tipo_sitio = wid_tipo_sitio;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE SITIOS*/
CREATE OR REPLACE FUNCTION fun_update_sitios(
    wid_sitio            tabla_sitios.id_sitio%TYPE,
    wnombre_sitio        tabla_sitios.nombre_sitio%TYPE
    wid_tipo_sitio       tabla_sitios.id_tipo_sitio%TYPE
    wdescripcion         tabla_sitios.descripcion%TYPE
    wacceso_discapacidad tabla_sitios.acceso_discapacidad%TYPE
    wid_municipio        tabla_sitios.id_municipio%TYPE
    wdireccion           tabla_sitios.direccion%TYPE
    wlatitud             tabla_sitios.latitud%TYPE
    wlongitud            tabla_sitios.longitud%TYPE
    wtelefono            tabla_sitios.telefono%TYPE
    wsitio_web           tabla_sitios.sitio_web%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_sitios 
    SET nombre_sitio = wnombre_sitio,
        id_tipo_sitio = wid_tipo_sitio,
        descripcion = wdescripcion,
        acceso_discapacidad = wacceso_discapacidad,
        id_municipio = wid_municipio,
        direccion = wdireccion,
        latitud = wlatitud,
        longitud = wlongitud,
        telefono = wtelefono,
        sitio_web = wsitio_web
    WHERE id_sitio = wid_sitio;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE TIPO INFRAEST DISC*/
CREATE OR REPLACE FUNCTION fun_update_tipo_infraest_disc(
    wid_tipo_sitio       tabla_tipo_sitios.id_tipo_sitio%TYPE,
    wnombre_tipo_sitio   tabla_tipo_sitios.nombre_tipo_sitio%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_tipo_infraest_disc 
    SET nombre_tipo_sitio = wnombre_tipo_sitio
    WHERE id_tipo_sitio = wid_tipo_sitio;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE SITIOS DISC*/
CREATE OR REPLACE FUNCTION fun_update_sitios_disc(
    wid_sitios_disc       tabla_sitios_disc.id_sitios_disc%TYPE,
    wid_sitio             tabla_sitios_disc.id_sitio%TYPE,
    wid_infraest_disc     tabla_sitios_disc.id_infraest_disc%TYPE
    wdescripcion          tabla_sitios_disc.descripcion%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_sitios_disc 
    SET wid_sitio = id_sitio,
        wid_infraest_disc = id_infraest_disc,
        wdescripcion = descripcion
    WHERE id_sitios_disc = wid_sitios_disc;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE MENU*/
CREATE OR REPLACE FUNCTION fun_update_menu(
    wid_menu         tabla_menu.id_menu%TYPE,
    wnombre_opcion   tabla_menu.nombre_opcion%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_menu 
    SET nombre_opcion = wnombre_opcion
    WHERE id_menu = wid_menu;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE ROLES*/
CREATE OR REPLACE FUNCTION fun_update_roles(
    wid_rol         tabla_roles.id_rol%TYPE,
    wnombre_rol     tabla_roles.nombre_rol%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_roles 
    SET nombre_rol = wnombre_rol
    WHERE id_rol = wid_rol;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE USUARIOS*/
CREATE OR REPLACE FUNCTION fun_update_usuario(
    wid_usuario                 tabla_usuarios.id_usuario%TYPE,
    wnombres                    tabla_usuarios.nombres%TYPE,
    wapellidos                  tabla_usuarios.apellidos%TYPE,
    wtipo_documento             tabla_usuarios.tipo_documento%TYPE,
    wnumero_documento           tabla_usuarios.numero_documento%TYPE,
    wid_pais                    tabla_usuarios.id_pais%TYPE,
    wtelefono                   tabla_usuarios.telefono%TYPE,
    wvalidacion_telefono        tabla_usuarios.validacion_telefono%TYPE,
    wcorreo                     tabla_usuarios.correo%TYPE,
    wvalidacion_correo          tabla_usuarios.validacion_correo%TYPE,
    wcontrasena_hash            tabla_usuarios.contrasena_hash%TYPE,
    westado_usuario             tabla_usuarios.estado_usuario%TYPE,
    wid_rol                     tabla_usuarios.id_rol%TYPE,
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_usuarios 
    SET nombres = wnombres,
        apellidos = wapellidos,
        tipo_documento = wtipo_documento,
        numero_documento = wnumero_documento, 
        id_pais = wid_pais, 
        telefono = wtelefono,
        validacion_telefono = wvalidacion_telefono
        correo = wcorreo,
        validacion_correo = wvalidacion_correo, 
        contrasena_hash = wcontrasena_hash, 
        estado = westado, 
        id_rol = wid_rol, 
    WHERE id_usuario = wid_usuario;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE MENU USUARIO*/
CREATE OR REPLACE FUNCTION fun_update_menu_usuario(
    wid_menu_usuario     tabla_menu_usuario.id_menu_usuario%TYPE,
    wid_rol              tabla_menu_usuario.id_rol%TYPE
    wid_menu             tabla_menu_usuario.id_menu%TYPE,
    wpermisos            tabla_menu_usuario.permisos%TYPE,
    wfecha_revocacion    tabla_menu_usuario.fecha_revocacion%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_menu_usuario 
    SET wid_rol = id_rol
        wid_menu = id_menu,
        wpermisos = permisos,
        wfecha_revocacion = fecha_revocacion
    WHERE id_menu_usuario = wid_menu_usuario;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE BANEADOS*/
CREATE OR REPLACE FUNCTION fun_update_baneados(
    wid_baneado         tabla_baneados.id_baneado%TYPE,
    wid_usuario         tabla_baneados.id_usuario%TYPE,
    wmotivo_ban         tabla_baneados.motivo_ban%TYPE,
    winicio_ban         tabla_baneados.incio_ban%TYPE,
    wresponsable        tabla_baneados.responsable%TYPE
)   RETURN BOOLEAN AS
$$
BEGIN
    UPDATE tabla_baneados
    SET wid_usuario = id_usuario,
        wmotivo_ban = motivo_ban,
        winicio_ban = incio_ban,
        wtermina_ban = termina_ban,
        wresponsable = responsable
    WHERE id_baneado = wid_baneado;
RETURN TRUE;
END;
$$

/*UPDATE CATEGORIAS EVENTOS*/
CREATE OR REPLACE FUNCTION fun_update_categorias_eventos(
    wid_categoria_evento     tabla_categorias_eventos.id_categoria_evento%TYPE,
    wnombre              tabla_categorias_eventos.nombre%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_categorias_eventos 
    SET wnombre = nombre
    WHERE id_categoria_evento = wid_categoria_evento;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE TIPOS EVENTOS*/
CREATE OR REPLACE FUNCTION fun_update_tipos_eventos(
    wid_tipo_evento                 tabla_tipos_eventos.id_tipo_evento%TYPE,
    wid_categoria_evento            tabla_tipos_eventos.id_categoria_evento%TYPE,
    wnombre                         tabla_tipos_eventos.nombre%TYPE,
)   RETURN BOOLEAN AS
$$
BEGIN
    UPDATE tabla_tipos_eventos
    SET wid_categoria_evento = id_categoria_evento,
        wnombre = nombre,
    WHERE id_tipo_evento = wid_tipo_evento;
RETURN TRUE;
END;
$$

/*UPDATE EVENTOS*/
CREATE OR REPLACE FUNCTION fun_update_eventos(
    wid_evento                   tabla_eventos.id_evento%TYPE,
    wnombre_evento               tabla_eventos.nombre_evento%TYPE,
    wid_usuario                  tabla_eventos.id_usuario%TYPE,    
    wid_tipo_evento              tabla_eventos.id_tipo_evento%TYPE,
    wid_municipio                tabla_eventos.id_municipio%TYPE,
    wid_sitio                    tabla_eventos.id_sitio%TYPE,
    wdescripcion                 tabla_eventos.descripcion%TYPE,
    wtelefono                    tabla_eventos.telefono%TYPE,
    wfecha_inicio                tabla_eventos.fecha_inicio%TYPE,
    wfecha_fin                   tabla_eventos.fecha_fin%TYPE,
    wdias_semana                 tabla_eventos.dias_semana%TYPE,
    whora_inicio                 tabla_eventos.hora_inicio%TYPE,
    whora_final                  tabla_eventos.hora_final%TYPE,
    wcosto                       tabla_eventos.costo%TYPE,
    wcupo                        tabla_eventos.cupo%TYPE,
    westado                      tabla_eventos.horario%TYPE,
    wid_imagen                   tabla_eventos.costo%TYPE,
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_eventos 
    SET nombre_evento = wnombre_evento,
        id_usuario = wid_usuario,
        id_tipo_evento = wid_tipo_evento, 
        id_municipio = wid_municipio,
        id_sitio = wid_sitio, 
        descripcion = wdescripcion, 
        telefono = wtelefono,
        fecha_inicio = wfecha_inicio, 
        fecha_fin = wfecha_fin, 
        dias_semana = wdias_semana,
        hora_inicio = whora_final, 
        costo = wcosto, 
        cupo = wcupo, 
        estado = westado, 
        id_imagen = wid_imagen
    WHERE id_evento = wid_evento;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE VALORACIONES*/
CREATE OR REPLACE FUNCTION fun_update_valoraciones(
    wid_valoracion          tabla_valoraciones.id_valoracion%TYPE,
    wid_usuario             tabla_valoraciones.id_usuario%TYPE,
    wid_evento              tabla_valoraciones.id_evento%TYPE,
    wcomentario             tabla_valoraciones.comentario%TYPE,
    wvaloracion             tabla_valoraciones.valoracion%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_valoraciones
    SET
        id_usuario = wid_usuario,
        id_evento = wid_evento,
        comentario = wcomentario,
        valoracion = wvaloracion
    WHERE id_valoracion = wid_valoracion;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE RESERVA EVENTOS*/
CREATE OR REPLACE FUNCTION fun_update_reserva_eventos(
    wid_reserva_evento      tabla_reserva_eventos.id_reserva_evento%TYPE,
    wid_usuario             tabla_reserva_eventos.id_usuario%TYPE,
    wid_evento              tabla_reserva_eventos.id_evento%TYPE,
    wcantidad_entradas      tabla_reserva_eventos.cantidad_entradas%TYPE,
    wmonto_total            tabla_reserva_eventos.monto_total%TYPE,
    westado                 tabla_reserva_eventos.estado%TYPE,
    wfecha_reserva          tabla_reserva_eventos.fecha_reserva%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_reserva_eventos 
    SET id_usuario = wid_usuario, 
        id_evento = wid_evento, 
        cantidad_entradas = wcantidad_entradas, 
        monto_total = wmonto_total, 
        estado = westado, 
        fecha_reserva = wfecha_reserva
    WHERE id_reserva_evento = wid_reserva_evento;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*UPDATE PAGOS*/
CREATE OR REPLACE FUNCTION fun_update_pagos(
    wid_pago                  tabla_pagos.id_pago%TYPE,
    wid_usuario               tabla_pagos.id_usuario%TYPE,
    wid_evento                tabla_pagos.id_evento%TYPE,
    wip_transaccion           tabla_pagos.ip_transaccion%TYPE,
    wcant_entrada             tabla_pagos.cant_entrada%TYPE,
    wtotal_pagar              tabla_pagos.total_pagar%TYPE,
    wfecha_pago               tabla_pagos.fecha_pago%TYPE,
    westado                   tabla_pagos.estado%TYPE,
    wmetodo_pago              tabla_pagos.metodo_pago%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_pagos 
    SET id_usuario = wid_usuario,
        id_evento = wid_evento,
        ip_transaccion = wip_transaccion,
        cant_entrada = wcant_entrada,
        total_pagar = wtotal_pagar,
        fecha_pago = wfecha_pago,
        estado = westado,
        metodo_pago = wmetodo_pago
    WHERE id_pago = wid_pago;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
/*
/*UPDATE REEMBOLSOS*/
CREATE OR REPLACE FUNCTION fun_update_reembolsos(
    wid_reembolso             tabla_reembolsos.id_reembolso%TYPE,
    wid_reserva_evento        tabla_reembolsos.id_reserva_evento%TYPE,
    wid_pago                  tabla_reembolsos.id_pago%TYPE,
    wid_usuario               tabla_reembolsos.id_usuario%TYPE,
    wmonto_devolver           tabla_reembolsos.monto_devolver%TYPE,
    wfecha_solicitud          tabla_reembolsos.fecha_solicitud%TYPE,
    wmotivo_reembolso         tabla_reembolsos.motivo_reembolso%TYPE,
    westado_reembolso         tabla_reembolsos.estado_reembolso%TYPE,
    wip_transaccion_reembolso tabla_reembolsos.ip_transaccion_reembolso%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_reembolsos 
    SET
        id_reserva_evento = wid_reserva_evento, 
        id_pago = wid_pago, 
        id_usuario = wid_usuario, 
        monto_devolver = wmonto_devolver, 
        fecha_solicitud = wfecha_solicitud, 
        motivo_reembolso = wmotivo_reembolso,
        estado_reembolso = westado_reembolso,
        ip_transaccion_reembolso = wip_transaccion_reembolso
    WHERE id_reembolso = wid_reembolso;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
*/