/*DELETE IMAGENES*/
CREATE OR REPLACE FUNCTION fun_delete_imagenes(
    wid_imagen tabla_imagenes.id_imagen%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_imagenes
    WHERE id_imagen = wid_imagen;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE PAISES*/
CREATE OR REPLACE FUNCTION fun_delete_paises(
    wid_pais tabla_paises.id_pais%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_paises
    WHERE id_pais = wid_pais;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE DEPARTAMENTOS*/
CREATE OR REPLACE FUNCTION fun_delete_departamentos(
    wid_departamento       tabla_departamentos.id_departamento%TYPE
) RETURN BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_departamentos
    where id_departamento = wid_departamento
RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


/*DELETE MUNICIPIOS*/
CREATE OR REPLACE FUNCTION fun_delete_municipios(
    wid_municipio tabla_municipios.id_municipio%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_municipios
    WHERE id_municipio = wid_municipio;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE TIPO SITIOS*/
CREATE OR REPLACE FUNCTION fun_delete_tipo_sitios(
    wid_tipo_sitio tabla_tipo_sitios.id_tipo_sitio%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_tipo_sitios
    WHERE id_tipo_sitio = wid_tipo_sitio;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE SITIOS*/
CREATE OR REPLACE FUNCTION fun_delete_sitios(
    wid_sitio tabla_sitios.id_sitio%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_sitios
    WHERE id_sitio = wid_sitio;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE TIPO INFRAEST DISC*/
CREATE OR REPLACE FUNCTION fun_delete_tipo_infraset_disc(
    wid_infraest_disc tabla_tipo_infraset_disc.id_infraest_disc%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_tipo_infraset_disc
    WHERE id_infraest_disc = wid_infraest_disc;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE SITIOS DISC*/
CREATE OR REPLACE FUNCTION fun_delete_sitios_disc(
    wid_sitios_disc tabla_sitios_disc.id_sitios_disc%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_sitios_disc
    WHERE id_sitios_disc = wid_sitios_disc;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE MENU*/
CREATE OR REPLACE FUNCTION fun_delete_menu(
    wid_menu tabla_menu.id_menu%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_menu
    WHERE id_menu = wid_menu;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE ROLES*/
CREATE OR REPLACE FUNCTION fun_delete_roles(
    wid_rol tabla_roles.id_rol%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_roles
    WHERE id_rol = wid_rol;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE USUARIO*/
CREATE OR REPLACE FUNCTION fun_delete_usuario(
    wid_usuario tabla_usuarios.id_usuario%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    UPDATE tabla_usuarios
    SET estado = FALSE,
        fecha_eliminacion = CURRENT_TIMESTAMP
    WHERE id_usuario = wid_usuario
      AND estado = TRUE;

    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;


/*DELETE MENU USUARIO*/
CREATE OR REPLACE FUNCTION fun_delete_menu_usuario(
    wid_menu_usuario tabla_menu_usuario.id_menu_usuario%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_menu_usuario
    WHERE id_menu_usuario = wid_menu_usuario;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE BANEADO*/
CREATE OR REPLACE FUNCTION fun_delete_baneado(
    wid_baneado tabla_baneado.id_baneado%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_baneado
    WHERE id_baneado = wid_baneado;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE CATEGORIA EVENTOS*/
CREATE OR REPLACE FUNCTION fun_delete_categoria_eventos(
    wid_categoria_evento tabla_categorias_eventos.id_categoria_evento%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_categorias_eventos
    WHERE id_categoria_evento = wid_categoria_evento;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE TIPO EVENTOS*/
CREATE OR REPLACE FUNCTION fun_delete_tipo_eventos(
    wid_tipo_evento tabla_tipo_eventos.id_tipo_evento%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_tipo_eventos
    WHERE id_tipo_evento = wid_tipo_evento;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE EVENTOS*/
CREATE OR REPLACE FUNCTION fun_delete_eventos(
    wid_evento tabla_eventos.id_evento%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_eventos
    WHERE id_evento = wid_evento;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


/*DELETE VALORACIONES*/
CREATE OR REPLACE FUNCTION fun_delete_valoraciones(
    wid_valoracion tabla_valoraciones.id_valoracion%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_valoraciones
    WHERE id_valoracion = wid_valoracion;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE RESERVA EVENTOS*/
CREATE OR REPLACE FUNCTION fun_delete_reserva_eventos(
    wid_reserva_evento tabla_reserva_eventos.id_reserva_evento%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_reserva_eventos
    WHERE id_reserva_evento = wid_reserva_evento;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*DELETE PAGOS*/
CREATE OR REPLACE FUNCTION fun_delete_pagos(
    wid_pago tabla_pagos.id_pago%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_pagos
    WHERE id_pago = wid_pago;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

/*
/*DELETE REEMBOLSOS*/
CREATE OR REPLACE FUNCTION fun_delete_reembolsos(
    wid_reembolso tabla_reembolsos.id_reembolso%TYPE
) RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM tabla_reembolsos
    WHERE id_reembolso = wid_reembolso;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
*/