-- Cargar en tabla_roles.
INSERT INTO tabla_roles 
		    VALUES  (1,'Usuario'),
				    (2,'Promotor'),
				    (3,'Moderador'),
				    (4,'Administrador');

-- Cargar en tabla_accesibilidad_menu.
INSERT INTO tabla_accesibilidad_menu 
			VALUES (1, 'Crear Evento', NOW(), NOW()),
				   (2, 'Gestionar Reservas', NOW(), NOW()),
				   (3, 'Gestionar Eventos', NOW(), NOW()),
				   (4, 'Ver Dashboard', NOW(), NOW()),
				   (5, 'Agregar Data', NOW(), NOW()),
				   (6, 'Editar Data', NOW(), NOW()),
				   (7, 'Eliminar Data', NOW(), NOW()),
				   (8, 'Gestionar Usuarios', NOW(), NOW()),
				   (9, 'Gestionar Roles', NOW(), NOW()),
				   (10, 'Gestionar Accesibilidad al Sistema', NOW(), NOW()),
				   (11, 'Gestionar Baneados', NOW(), NOW());

-- Cargar en tabla_accesibilidad_menu_x_rol.
INSERT INTO tabla_accesibilidad_menu_x_rol 
			VALUES (1, 1, 2, NOW(), NOW()),
				   (2, 1, 3, NOW(), NOW()),
				   (3, 1, 4, NOW(), NOW()),
				   (4, 2, 2, NOW(), NOW()),
				   (5, 2, 3, NOW(), NOW()),
				   (6, 2, 4, NOW(), NOW()),
				   (7, 3, 4, NOW(), NOW()),
				   (8, 4, 3, NOW(), NOW()),
				   (9, 4, 4, NOW(), NOW()),
				   (10, 5, 3, NOW(), NOW()),
				   (11, 5, 4, NOW(), NOW()),
				   (12, 6, 3, NOW(), NOW()),
				   (13, 6, 4, NOW(), NOW()),
				   (14, 7, 4, NOW(), NOW()),
				   (15, 8, 4, NOW(), NOW()),
				   (16, 9, 4, NOW(), NOW()),
				   (17, 10, 4, NOW(), NOW()),
				   (18, 11, 4, NOW(), NOW());

-- Cargar en tabla_usuarios.
INSERT INTO tabla_usuarios (id_rol, terminos_condiciones, estado, fecha_registro, fecha_actualizacion, fecha_desactivacion)
    		VALUES (1, TRUE, TRUE, NOW(), NOW(), NOW()),
				   (2, TRUE, TRUE, NOW(), NOW(), NOW()),
				   (3, TRUE, TRUE, NOW(), NOW(), NOW()),
				   (4, TRUE, TRUE, NOW(), NOW(), NOW());

INSERT INTO tabla_personas (id_usuario, nombres, apellidos, id_pais, telefono, fecha_creacion, fecha_actualizacion)
    		VALUES (1, 'Usuario', 'Prueba', 6, 3001234567, NOW(), NOW()),
				   (2, 'Promotor', 'Prueba', 6, 3007654321, NOW(), NOW()),
				   (3, 'Moderador', 'Prueba', 6, 3001122334, NOW(), NOW()),
				   (4, 'Administrador', 'Prueba', 6, 3009876543, NOW(), NOW());

INSERT INTO tabla_usuarios_credenciales (id_usuario, correo, contrasena_hash, id_google, validacion_correo, fecha_creacion, fecha_actualizacion)
    		VALUES (1, 'usuario_prueba@correo.com', crypt('Usuario123.', gen_salt('bf', 12)), NULL, TRUE, NOW(), NOW()),
				   (2, 'promotor_prueba@correo.com', crypt('Promotor123.', gen_salt('bf', 12)), NULL, TRUE, NOW(), NOW()),
				   (3, 'moderador_prueba@correo.com', crypt('Moderador123.', gen_salt('bf', 12)), NULL, TRUE, NOW(), NOW()),
				   (4, 'administrador_prueba@correo.com', crypt('Administrador123.', gen_salt('bf', 12)), NULL, TRUE, NOW(), NOW());

-- Cargar en tabla_categoria_eventos.
INSERT INTO tabla_categoria_eventos (id_categoria_evento, nombre) 
			VALUES (1, 'Música'),
				   (2, 'Cultura y Arte'),
				   (3, 'Deportes');

-- Cargar en tabla_tipo_eventos.
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) 
			VALUES (1, 1, 'Concierto'),
				   (2, 1, 'Festival de Música'),
				   (3, 1, 'Sesión acústica'),
				   (4, 1, 'Tributo'),
				   (5, 1, 'Show DJ'),
				   (6, 2, 'Obra de teatro'),
				   (7, 2, 'Exposición'),
				   (8, 2, 'Cine-foro'),
				   (9, 2, 'Danza'),
				   (10, 2, 'Performance'),
				   (11, 2, 'Festival de baile'),
				   (12, 3, 'Torneo'),
				   (13, 3, 'Partido amistoso'),
				   (14, 3, 'Carrera 5k'),
				   (15, 3, 'Clase deportiva'),
				   (16, 3, 'Exhibición deportiva');

-- Cargar en tabla_tipo_sitios.
INSERT INTO tabla_tipo_sitios (id_tipo_sitio, nombre_tipo_sitio) 
			VALUES (1, 'Teatro'),
				   (2, 'Centro de convenciones'),
				   (3, 'Museo'),
				   (4, 'Cancha de Barrio'),
				   (5, 'Parque'),
				   (6, 'Estadio'),
				   (7, 'Parque Recreativo');

-- Cargar en tabla_sitios.
INSERT INTO tabla_sitios (id_sitio, nombre_sitio, id_tipo_sitio, id_municipio, direccion, latitud, longitud, sitio_web) 
			VALUES (1, 'Teatro Santander', 1, 68001, 'Calle 33 #18-60.', '7,12116°', '-73,12401°', 'https://www.teatrosantanderbga.com/'),
				   (2, 'Neomundo - Centro de convenciones y eventos', 2, 68001, 'Calle 89 Transversal Oriental Metropolitana-69, Barrio, Cl. 100.', '7,10215°', '-73,10619°', 'https://neomundo.co/'),
				   (3, 'Museo de Arte Moderno de Bucaramanga MAMB', 3, 68001, 'Calle 37 #26-16.', '7,11996°', '-73,11686°', NULL),
				   (4, 'Cancha de tierra del barrio La Cumbre', 4, 68276, 'Calle 34 con Carrera 8e.', '7,07904°', '-73,08879°', NULL),
				   (5, 'Parque de Morrorico', 5, 68001, 'Comuna 14 Morrorico.', '7,13288°', '-73,10624°', NULL),
				   (6, 'Parque Temático', 5, 68547, 'Cl. 2a #8-22.', '6,99446°', '-73,05165°', NULL),
				   (7, 'Estadio municipal villa Concha', 6, 68547, 'I-45A #9-43, La Castallena.', '6,99533°', '-73,05006°', NULL),
				   (8, 'Parque recrear Juan Pablo II', 7, 68307, 'a 37-60,, Cra. 22b #37-2', '7,0732°', '-73,1689°', NULL);

-- Cargar en tabla_sitios_telefonos.
INSERT INTO tabla_sitios_telefonos (id_sitio, telefono, es_principal) 
			VALUES (1, 6076424232, TRUE),
				   (1, 3245670437, FALSE),
				   (2, 6077000260, TRUE),
				   (2, 3023246560, FALSE),
				   (3, 6076450483, TRUE),
				   (7, 3173552126, TRUE);

-- Cargar en tabla_tipo_infraestructura_discapacitados.
INSERT INTO tabla_tipo_infraestructura_discapacitados (id_infraestructura_discapacitados, nombre_infraestructura_discapacitados) 
		    VALUES (1, 'Ascensor'),
				   (2, 'Rampa'),
				   (3, 'Estacionamiento'),
				   (4, 'Señalización en Braille');

-- Cargar en tabla_sitios_discapacitados.
INSERT INTO tabla_sitios_discapacitados (id_sitios_discapacitados, id_sitio, id_infraestructura_discapacitados, descripcion) 
		    VALUES (1, 1, 2, 'Rampa en la entrada del Teatro Santander'),
				   (2, 2, 2, 'Rampa en la entrada y para acceder entre los pisos de Neomundo'),
				   (3, 2, 3, 'Señalización para discapacitados en Neomundo'),
				   (4, 6, 2, 'Rampa de acceso al Parque Temático');
