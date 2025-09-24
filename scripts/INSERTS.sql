--INSERTS
/*INSERT PAISES*/
CREATE OR REPLACE FUNCTION fun_insert_pais(
    wid_pais        tabla_pais.id_pais%TYPE,
    wnombre_pais    tabla_pais.nombre_pais%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_paises (
        id_pais, nombre_pais
        )
    VALUES (
        wid_pais, wnombre_pais
        );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT DEPARTAMENTOS*/
CREATE OR REPLACE FUNCTION fun_insert_departamentos(
    wid_departamento        tabla_departamentos.id_departamento%TYPE,
    wnombre_departamento    tabla_departamentos.nombre_departamento%TYPE,
    wid_pais                tabla_departamentos.id_pais%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_departamentos (
        id_departamento, nombre_departamento, id_pais
    ) VALUES (
        wid_departamento, wnombre_departamento, wid_pais
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT MUNICIPIOS*/
CREATE OR REPLACE FUNCTION fun_insert_municipios(
    wid_departamento        tabla_municipios.id_departamento%TYPE,
    wid_municipio           tabla_municipios.id_municipio%TYPE,
    wnombre_municipio       tabla_municipios.nombre_municipio%TYPE,
    wdistrito               tabla_municipios.distrito%TYPE DEFAULT FALSE,
    warea_metropolitana     tabla_municipios.area_metropolitana%TYPE DEFAULT FALSE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_municipios (
        id_departamento, id_municipio, nombre_municipio, distrito, area_metropolitana
    ) VALUES (
        wid_departamento, wid_municipio, wnombre_municipio, wdistrito, warea_metropolitana
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT TIPOS DE SITIOS*/
CREATE OR REPLACE FUNCTION fun_insert_tipo_sitios(
    wid_tipo_sitio        tabla_tipo_sitios.id_tipo_sitio%TYPE,
    wnombre_tipo_sitio    tabla_tipo_sitios.nombre_tipo_sitio%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_tipo_sitios (
        id_tipo_sitio, nombre_tipo_sitio, 
    ) VALUES (
        wid_tipo_sitio, wnombre_tipo_sitio,
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT SITIOS*/
CREATE OR REPLACE FUNCTION fun_insert_sitios(
    wid_sitio           tabla_sitios.id_sitio%TYPE,
    wnombre_sitio       tabla_sitios.nombre_sitio%TYPE,
    wid_tipo_sitio      tabla_sitios.id_tipo_sitio%TYPE,
    wdescripcion        tabla_sitios.descripcion%TYPE,
    wacceso_discapacidad tabla_sitios.acceso_discapacidad%TYPE,
    wid_municipio       tabla_sitios.id_municipio%TYPE,
    wdireccion          tabla_sitios.direccion%TYPE,
    wlatitud            tabla_sitios.latitud%TYPE,
    wlongitud           tabla_sitios.longitud%TYPE,
    wtelefono           tabla_sitios.telefono%TYPE,
    wsitio_web          tabla_sitios.sitio_web%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_sitios (
        id_sitio, nombre_sitio, id_tipo_sitio, descripcion, id_municipio, direccion,
        latitud, longitud, telefono, sitio_web
    ) VALUES (
        wid_sitio, wnombre_sitio, wid_tipo_sitio, wdescripcion, wid_municipio, wdireccion,
        wlatitud, wlongitud, wtelefono, wsitio_web
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT TIPO INFRAEST DISC*/
CREATE OR REPLACE FUNCTION fun_insert_infraest_disc (
    wid_infraest_disc       tabla_tipo_infraest_disc.id_infraest_disc%TYPE,
    wnombre_infraest_disc   tabla_tipo_infraest_disc.nombre_infraest_disc%TYPE
)RETURN BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_tipo_infraest_disc (
        id_infraest_disc, nombre_infraest_disc)
    VALUES(
        wid_infraest_disc, wnombre_infraest_disc
    )
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


/*INSERT SITIOS DISC*/
CREATE OR REPLACE FUNCTION fun_insert_sitios_disc(
    wid_sitios_disc         tabla_sitios_disc.id_sitios_disc%TYPE,
    wid_sitio               tabla_sitios_disc.id_sitio%TYPE
    wid_infraest_disc       tabla_sitios_disc.id_infraest_disc%TYPE
    wdescripcion            tabla_sitios_disc.descripcion%TYPE
)RETURN BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_sitios_disc(
        id_sitios_disc, id_sitio, id_infraest_disc, descripcion
    )
    VALUES(
        wid_sitios_disc, wid_sitio, wid_infraest_disc, wdescripcion 
    )
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


/*INSERT MENU*/
CREATE OR REPLACE FUNCTION fun_insert_menu(
    wid_menu         tabla_menu.id_menu%TYPE,
    wnombre_opcion   tabla_menu.nombre_opcion%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_menu (id_menu, nombre_opcion)
    VALUES (wid_menu, wnombre_opcion);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT ROLES*/
CREATE OR REPLACE FUNCTION fun_insert_roles(
    wid_rol         tabla_roles.id_rol%TYPE,
    wnombre_rol     tabla_roles.nombre_rol%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_roles (id_rol, nombre_rol)
    VALUES (wid_rol, wnombre_rol);
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT USUARIO*/
CREATE OR REPLACE FUNCTION fun_insert_usuario(
    wnombres                    tabla_usuarios.nombres%TYPE,
    wapellidos                  tabla_usuarios.apellidos%TYPE,
    wtipo_documento             tabla_usuarios.tipo_documento%TYPE,
    wnumero_documento           tabla_usuarios.numero_documento%TYPE,
    wid_pais                    tabla_usuarios.id_pais%TYPE,
    wid_ciudad                  tabla_usuarios.id_ciudad%TYPE,
    wtelefono                   tabla_usuarios.telefono%TYPE,
    wcorreo                     tabla_usuarios.correo%TYPE,
    wcontrasena_hash            tabla_usuarios.contrasena_hash%TYPE
    wrol_usuario                tabla_usuarios.rol%TYPE,
    westado_usuario             tabla_usuarios.estado_usuario%TYPE,
    wdocumentos                 tabla_usuarios.documentacion%TYPE

) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_usuarios (
        tipo_documento, numero_documento, nombres, apellidos, id_pais, id_ciudad, 
        telefono, correo, contrasena_hash, rol_usuario, estado_usuario, preferencia_notificaciones, 
        documentos
    ) VALUES (
        wtipo_documento, wnumero_documento, wnombres, wapellidos, wid_pais, wid_ciudad, 
        wtelefono, wcorreo, wcontrasena_hash, wrol_usuario, westado_usuario, wpreferencia_notificaciones, 
        wdocumentos
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT MENU USUARIO*/
CREATE OR REPLACE FUNCTION fun_insert_menu_usuario(
    wid_menu_usuario     tabla_menu_usuario.id_menu_usuario%TYPE,
    wid_usuario          tabla_menu_usuario.id_usuario%TYPE,
    wid_menu             tabla_menu_usuario.id_menu%TYPE,
    wpermisos            tabla_menu_usuario.permisos%TYPE,
    wfecha_revocacion    tabla_menu_usuario.fecha_revocacion%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_menu_usuario (
        id_menu_usuario, id_usuario, id_menu, permisos, fecha_revocacion
    ) 
    VALUES (
        wid_menu_usuario, wid_usuario, wid_menu, wpermisos, wfecha_revocacion
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


/*INSERT TABLA BANEADO*/
CREATE OR REPLACE FUNCTION fun_insert_baneado(
    wid_usuario          tabla_baneado.id_usuario%TYPE,
    wmot_ban             tabla_baneado.mot_ban%TYPE,
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_baneado (
        id_usuario, mot_ban
    ) 
    VALUES (
        wid_usuario, wmot_ban
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT CATEGORIA EVENTO*/
CREATE OR REPLACE FUNCTION fun_insert_categoria_evento(
    wid_categoria_evento         tabla_categorias_eventos.id_categoria_evento%TYPE,
    wnombre                      tabla_categorias_eventos.nombre%TYPE,
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_categorias_eventos (
        id_categoria_evento, nombre
    ) VALUES (
        wid_categoria_evento, wnombre
    );
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql; 

/*INSERT TIPOS EVENTOS*/
CREATE OR REPLACE FUNCTION fun_insert_tipo_evento(
    wid_tipo_evento         tabla_tipo_evento.id_usuario%TYPE,
    wnombre              tabla_tipo_evento.id_evento%TYPE,
    wdescripcion             tabla_tipo_evento.descripcion%TYPE,
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_tipos_eventos (
        id_tipo_evento, nombre, descripcion
    ) VALUES (
        wid_tipo_evento, wnombre, wdescripcion
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql; 

/*INSERT EVENTOS*/
CREATE OR REPLACE FUNCTION fun_insert_eventos(
    wnombre_evento               tabla_eventos.nombre_evento%TYPE,
    wid_tipo_evento              tabla_eventos.id_tipo_evento%TYPE,
    wid_categoria                tabla_eventos.id_categoria%TYPE,
    wdescripcion                 tabla_eventos.descripcion%TYPE,
    wid_usuario                  tabla_eventos.id_usuario%TYPE,
    worganizador                 tabla_eventos.id_organizador%TYPE,
    wid_pais                     tabla_eventos.id_municipio%TYPE,
    wid_ciudad                   tabla_eventos.id_zona%TYPE,
    wdireccion                   tabla_eventos.direccion%TYPE,
    wcoordenadas                 tabla_eventos.coordenadas%TYPE,
    wtelefono                    tabla_eventos.telefono%TYPE,
    wfecha_inicio                tabla_eventos.fecha_inicio%TYPE,
    wfecha_fin                   tabla_eventos.fecha_fin%TYPE,
    whorario                     tabla_eventos.horario%TYPE,
    wcosto                       tabla_eventos.costo%TYPE,
    wcupo                        tabla_eventos.cupo%TYPE,
    waccesibilidad_discapaciados tabla_eventos.accesabilidad_discapacitados%TYPE,
    waccesibilidad               tabla_eventos.accesabilidad%TYPE,
    westado                      tabla_eventos.estado%TYPE,
    wid_imagen                   tabla_eventos.id_imagen%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_eventos (
        nombre_evento, id_tipo_evento, id_categoria, descripcion, id_usuario, organizador, 
        id_pais, id_ciudad, direccion, coordenadas, fecha_inicio, fecha_fin, horario, 
        costo, cupo, estado, accesabilidad_discapacitados, accesabilidad ,id_imagen
    ) VALUES (
        wnombre_evento, wid_tipo_evento, wid_categoria, wdescripcion, wid_usuario, worganizador, 
        wid_pais, wid_ciudad, wdireccion, wcoordenadas, wfecha_inicio, wfecha_fin, whorario, 
        wcosto, wcupo, waccesibilidad_discapaciados, waccesibilidad, westado, wid_imagen
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT VALORACIONES*/
CREATE OR REPLACE FUNCTION fun_insert_valoraciones(
    wid_usuario             tabla_valoraciones.id_usuario%TYPE,
    wid_evento              tabla_valoraciones.id_evento%TYPE,
    wcomentario             tabla_valoraciones.comentario%TYPE,
    wvaloracion             tabla_valoraciones.valoracion%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_valoraciones (
        id_usuario, id_evento, comentario, valoracion
    ) VALUES (
        wid_usuario, wid_evento, wcomentario, wvaloracion
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql; 

/*INSERT RESERVA DE EVENTOS*/
CREATE OR REPLACE FUNCTION fun_insert_reserva_eventos(
    wid_usuario             tabla_reserva_eventos.id_menu_usuario%TYPE,
    wid_evento              tabla_reserva_eventos.evento%TYPE,
    wfecha_reserva          tabla_reserva_eventos.fecha_reserva%TYPE
    westado                 tabla_reserva_eventos.estado%TYPE,
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_reserva_eventos (
        id_usuario, id_evento, fecha_reserva, estado
    ) VALUES (
        wid_usuario, wid_evento, wfecha_reserva, westado
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT PAGOS*/
CREATE OR REPLACE FUNCTION fun_insert_pagos(
    wid_reserva_evento               tabla_pagos.id_reserva_evento%TYPE,
    wip_transaccion                  tabla_pagos.ip_transaccion%TYPE,
    wmonto_pago                      tabla_pagos.monto_pago%TYPE,
    wfecha_pago                      tabla_pagos.monto_pago%TYPE,
    westado                          tabla_pagos.estado%TYPE,
    wmetodo_pago                     tabla_pagos.metodo_pago%TYPE,
    wreferencia_transaccion_pasarela tabla_pagos.referencia_transaccion_pasarela%TYPE,
    wemail_pago                      tabla_pagos.email_pago%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_pagos (
        id_reserva_evento, ip_transaccion, monto_pago, fecha_pago,
        estado, metodo_pago, referencia_transaccion_pasarela, email_pago
    ) VALUES (
        wid_reserva_evento, wip_transaccion, wmonto_pago, wfecha_pago,
        westado, wmetodo_pago, referencia_transaccion_pasarela, email_pago
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*INSERT REEMBOLSOS*/
CREATE OR REPLACE FUNCTION fun_insert_reembolsos(
    wid_reserva_evento        tabla_reembolsos.id_reserva_evento%TYPE,
    wid_pago                  tabla_reembolsos.id_pago%TYPE,
    wid_usuario               tabla_reembolsos.id_usuario%TYPE,
    wmonto_devolver           tabla_reembolsos.monto_devolver%TYPE,
    wfecha_solicitud          tabla_reembolsos.fecha_solicitud%TYPE,
    wmotivo_reembolso         tabla_reembolsos.motivo_reembolso%TYPE,
    westado_reembolso         tabla_reembolsos.estado_reembolso%TYPE,
    wfecha_reembolso          tabla_reembolsos.fecha_reembolso%TYPE,
    wip_transaccion_reembolso tabla_reembolsos.ip_transaccion_reembolso%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    INSERT INTO tabla_reembolsos (
        id_reserva_evento, id_pago, id_usuario, monto_devolver, fecha_solicitud, motivo_reembolso,
        estado_reembolso,ip_transaccion_reembolso,fecha_reembolso
    ) VALUES (
        wid_reserva_evento, wid_pago, wid_usuario, wmonto_devolver, wfecha_solicitud, wmotivo_reembolso,
        westado_reembolso, wip_transaccion_reembolso, wfecha_reembolso
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;