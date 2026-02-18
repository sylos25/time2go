-- Cargar en tabla_categoria_eventos.
INSERT INTO tabla_categoria_eventos (id_categoria_evento, nombre) VALUES (1, 'Música');
INSERT INTO tabla_categoria_eventos (id_categoria_evento, nombre) VALUES (2, 'Cultura y Arte');
INSERT INTO tabla_categoria_eventos (id_categoria_evento, nombre) VALUES (3, 'Deportes');

-- Cargar en tabla_tipo_eventos.
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (1, 1, 'Concierto');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (2, 1, 'Festival de Música');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (3, 1, 'Sesión acústica');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (4, 1, 'Tributo');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (5, 1, 'Show DJ');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (6, 2, 'Obra de teatro');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (7, 2, 'Exposición');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (8, 2, 'Cine-foro');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (9, 2, 'Danza');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (10, 2, 'Performance');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (11, 2, 'Festival de baile');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (12, 3, 'Torneo');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (13, 3, 'Partido amistoso');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (14, 3, 'Carrera 5k');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (15, 3, 'Clase deportiva');
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre) VALUES (16, 3, 'Exhibición deportiva');

-- Cargar en tabla_tipo_sitios.
INSERT INTO tabla_tipo_sitios (id_tipo_sitio, nombre_tipo_sitio) VALUES (1, 'Teatro');
INSERT INTO tabla_tipo_sitios (id_tipo_sitio, nombre_tipo_sitio) VALUES (2, 'Centro de convenciones');
INSERT INTO tabla_tipo_sitios (id_tipo_sitio, nombre_tipo_sitio) VALUES (3, 'Museo');
INSERT INTO tabla_tipo_sitios (id_tipo_sitio, nombre_tipo_sitio) VALUES (4, 'Cancha de Barrio');
INSERT INTO tabla_tipo_sitios (id_tipo_sitio, nombre_tipo_sitio) VALUES (5, 'Parque');
INSERT INTO tabla_tipo_sitios (id_tipo_sitio, nombre_tipo_sitio) VALUES (6, 'Estadio');
INSERT INTO tabla_tipo_sitios (id_tipo_sitio, nombre_tipo_sitio) VALUES (7, 'Parque Recreativo');

-- Cargar en tabla_sitios.
INSERT INTO tabla_sitios (id_sitio, nombre_sitio, id_tipo_sitio, acceso_discapacidad, id_municipio, direccion, latitud, longitud, telefono_1, telefono_2, sitio_web) VALUES (1, 'Teatro Santander', 1, TRUE, 68001, 'Calle 33 #18-60.', '7,12116°', '-73,12401°', 6076424232, 3245670437, 'https://www.teatrosantanderbga.com/');
INSERT INTO tabla_sitios (id_sitio, nombre_sitio, id_tipo_sitio, acceso_discapacidad, id_municipio, direccion, latitud, longitud, telefono_1, telefono_2, sitio_web) VALUES (2, 'Neomundo - Centro de convenciones y eventos', 2, TRUE, 68001, 'Calle 89 Transversal Oriental Metropolitana-69, Barrio, Cl. 100.', '7,10215°', '-73,10619°', 6077000260, 3023246560, 'https://neomundo.co/');
INSERT INTO tabla_sitios (id_sitio, nombre_sitio, id_tipo_sitio, acceso_discapacidad, id_municipio, direccion, latitud, longitud, telefono_1, telefono_2, sitio_web) VALUES (3, 'Museo de Arte Moderno de Bucaramanga MAMB', 3, FALSE, 68001, 'Calle 37 #26-16.', '7,11996°', '-73,11686°', 6076450483, NULL, NULL);
INSERT INTO tabla_sitios (id_sitio, nombre_sitio, id_tipo_sitio, acceso_discapacidad, id_municipio, direccion, latitud, longitud, telefono_1, telefono_2, sitio_web) VALUES (4, 'Cancha de tierra del barrio La Cumbre', 4, FALSE, 68276, 'Calle 34 con Carrera 8e.', '7,07904°', '-73,08879°', NULL, NULL, NULL);
INSERT INTO tabla_sitios (id_sitio, nombre_sitio, id_tipo_sitio, acceso_discapacidad, id_municipio, direccion, latitud, longitud, telefono_1, telefono_2, sitio_web) VALUES (5, 'Parque de Morrorico', 5, FALSE, 68001, 'Comuna 14 Morrorico.', '7,13288°', '-73,10624°', NULL, NULL, NULL);
INSERT INTO tabla_sitios (id_sitio, nombre_sitio, id_tipo_sitio, acceso_discapacidad, id_municipio, direccion, latitud, longitud, telefono_1, telefono_2, sitio_web) VALUES (6, 'Parque Temático', 5, TRUE, 68547, 'Cl. 2a #8-22.', '6,99446°', '-73,05165°', NULL, NULL, NULL);
INSERT INTO tabla_sitios (id_sitio, nombre_sitio, id_tipo_sitio, acceso_discapacidad, id_municipio, direccion, latitud, longitud, telefono_1, telefono_2, sitio_web) VALUES (7, 'Estadio municipal villa Concha', 6, FALSE, 68547, 'I-45A #9-43, La Castallena.', '6,99533°', '-73,05006°', 3173552126, NULL, NULL);
INSERT INTO tabla_sitios (id_sitio, nombre_sitio, id_tipo_sitio, acceso_discapacidad, id_municipio, direccion, latitud, longitud, telefono_1, telefono_2, sitio_web) VALUES (8, 'Parque recrear Juan Pablo II', 7, FALSE, 68307, 'a 37-60,, Cra. 22b #37-2', '7,0732°', '-73,1689°', NULL, NULL, NULL);

-- Cargar en tabla_tipo_infraestructura_discapacitados.
INSERT INTO tabla_tipo_infraestructura_discapacitados (id_infraestructura_discapacitados, nombre_infraestructura_discapacitados) VALUES (1, 'Ascensor');
INSERT INTO tabla_tipo_infraestructura_discapacitados (id_infraestructura_discapacitados, nombre_infraestructura_discapacitados) VALUES (2, 'Rampa');
INSERT INTO tabla_tipo_infraestructura_discapacitados (id_infraestructura_discapacitados, nombre_infraestructura_discapacitados) VALUES (3, 'Estacionamiento');
INSERT INTO tabla_tipo_infraestructura_discapacitados (id_infraestructura_discapacitados, nombre_infraestructura_discapacitados) VALUES (4, 'Señalización en Braille');

-- Cargar en tabla_sitios_discapacitados.
INSERT INTO tabla_sitios_discapacitados (id_sitios_discapacitados, id_sitio, id_infraestructura_discapacitados, descripcion) VALUES (1, 1, 2, 'Rampa en la entrada del Teatro Santander');
INSERT INTO tabla_sitios_discapacitados (id_sitios_discapacitados, id_sitio, id_infraestructura_discapacitados, descripcion) VALUES (2, 2, 2, 'Rampa en la entrada y para acceder entre los pisos de Neomundo');
INSERT INTO tabla_sitios_discapacitados (id_sitios_discapacitados, id_sitio, id_infraestructura_discapacitados, descripcion) VALUES (3, 2, 3, 'Señalización para discapacitados en Neomundo');
INSERT INTO tabla_sitios_discapacitados (id_sitios_discapacitados, id_sitio, id_infraestructura_discapacitados, descripcion) VALUES (4, 6, 2, 'Rampa de acceso al Parque Temático');

INSERT INTO tabla_eventos (
    id_publico_evento, pulep_evento, nombre_evento, responsable_evento,
    id_usuario, id_categoria_evento, id_tipo_evento, id_sitio,
    descripcion, informacion_adicional,
    telefono_1, telefono_2,
    fecha_inicio, fecha_fin, hora_inicio, hora_final,
    gratis_pago, cupo, reservar_anticipado, estado
) VALUES (
    'EVT-001-2026', 'PULEP-001', 'Torneo de Fútbol Amistoso', 'Liga Deportiva La Cumbre',
    4, 3, 12, 4,
    'Un torneo de fútbol amistoso para promover la actividad física y la camaradería entre los participantes.',
    'El torneo se llevará a cabo en la cancha de tierra del barrio La Cumbre. Se esperan equipos de distintos barrios del municipio. Se contará con árbitros certificados, hidratación para los participantes y premiación al finalizar el evento.',
    3123456789, NULL,
    '2026-09-15', '2026-09-15', '10:00:00', '16:00:00',
    FALSE, 60, TRUE, FALSE
);

INSERT INTO tabla_eventos (
    id_publico_evento, pulep_evento, nombre_evento, responsable_evento,
    id_usuario, id_categoria_evento, id_tipo_evento, id_sitio,
    descripcion, informacion_adicional,
    telefono_1, telefono_2,
    fecha_inicio, fecha_fin, hora_inicio, hora_final,
    gratis_pago, cupo, reservar_anticipado, estado
) VALUES (
    'EVT-002-2026', 'PULEP-002', 'Fiesta de La Cumbia', 'Corporación Cultural del Nororiente',
    4, 2, 11, 5,
    'Una celebración vibrante con música, baile y gastronomía. Disfruta de la cultura local en un ambiente festivo al ritmo de la cumbia.',
    'El evento contará con grupos de danza folclórica, gastronomía típica de la región, stands artesanales y presentaciones musicales en vivo. Apto para toda la familia. No se permite el ingreso de bebidas alcohólicas externas.',
    3109876543, NULL,
    '2026-10-05', '2026-10-05', '18:00:00', '23:00:00',
    FALSE, 200, TRUE, FALSE
);

INSERT INTO tabla_imagenes_eventos (url_imagen_evento, id_evento) VALUES ('https://res.cloudinary.com/dljthy97e/image/upload/v1769572316/Cancha_leopardo_clbqwx.png',  (SELECT id_evento FROM tabla_eventos WHERE id_publico_evento = 'EVT-001-2026'));
INSERT INTO tabla_imagenes_eventos (url_imagen_evento, id_evento) VALUES ('https://res.cloudinary.com/dljthy97e/image/upload/v1769572322/Microfutbol_ni%C3%B1o2_bea1sl.jpg',    (SELECT id_evento FROM tabla_eventos WHERE id_publico_evento = 'EVT-001-2026'));
INSERT INTO tabla_imagenes_eventos (url_imagen_evento, id_evento) VALUES ('https://res.cloudinary.com/dljothy97e/image/upload/v1769572317/Microfutbol_ni%C3%B1o1_at3cnl.jpg',    (SELECT id_evento FROM tabla_eventos WHERE id_publico_evento = 'EVT-001-2026'));
INSERT INTO tabla_imagenes_eventos (url_imagen_evento, id_evento) VALUES ('https://res.cloudinary.com/dljthy97e/image/upload/v1769572316/Microfutbol_joven_kvtx0h.jpg',          (SELECT id_evento FROM tabla_eventos WHERE id_publico_evento = 'EVT-001-2026'));
INSERT INTO tabla_imagenes_eventos (url_imagen_evento, id_evento) VALUES ('https://res.cloudinary.com/dljthy97e/image/upload/v1769572316/Microfutbol_adulto_uuupv8.jpg',         (SELECT id_evento FROM tabla_eventos WHERE id_publico_evento = 'EVT-001-2026'));