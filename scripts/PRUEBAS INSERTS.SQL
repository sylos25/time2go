CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO tabla_usuarios VALUES ('Cédula de Ciudadanía', '1095951827', 'Brayhan Jahir', 'Orduz Perez', 1, 3143413720, TRUE, 'bryhanorduz14@gmail.com', TRUE, crypt('BhyOP06*', gen_salt('bf', 12)), NOW (), NULL, TRUE, 4, NOW());
INSERT INTO tabla_usuarios VALUES ('Cédula de Ciudadanía', '1095581203', 'William', 'Rojas', 1, 3167598925, TRUE, 'willirojasorduz@gmail.com', TRUE, crypt('William15.', gen_salt('bf', 12)), NOW (), NULL, TRUE, 4, NOW());
INSERT INTO tabla_tipo_sitios VALUES (4, 'Cancha de Barrio'); 

INSERT INTO tabla_sitios VALUES (4, 'Cancha de tierra del barrio La Cumbre', 4, 'El escenario deportivo del barrio La Cumbre es un espacio comunitario dedicado a la práctica de diversas disciplinas deportivas y actividades recreativas. Ubicado en el corazón del barrio, este lugar ofrece a los residentes y visitantes un entorno propicio para el ejercicio físico, la socialización y el desarrollo de habilidades deportivas.', FALSE, 68276, 'Calle 34 con Carrera 8e, Floridablanca.', '7,07904°', '-73,08879°', NULL, NULL, NULL);

INSERT INTO tabla_eventos VALUES (10, 'Torneo de Fútbol Amistoso', '1095951827', 3, 12, 4, 68276, 'Un torneo de fútbol amistoso para promover la actividad física y la camaradería entre los participantes.', 3123456789, NULL, '2026-09-15', '2026-09-15', '10:00:00', '16:00:00', NULL, FALSE, 60, TRUE, NOW(), NULL, NULL); 



FALTA POR MODIFICAR

INSERT INTO tabla_imagenes_eventos VALUES
(10, 'https://res.cloudinary.com/dljthy97e/image/upload/v1769572316/Cancha_leopardo_clbqwx.png', 10, NOW(), NOW()),
(11, 'https://res.cloudinary.com/dljthy97e/image/upload/v1769572322/Microfutbol_ni%C3%B1o2_bea1sl.jpg', 10, NOW(), NOW()),
(12, 'https://res.cloudinary.com/dljthy97e/image/upload/v1769572317/Microfutbol_ni%C3%B1o1_at3cnl.jpg', 10, NOW(), NOW()),
(13, 'https://res.cloudinary.com/dljthy97e/image/upload/v1769572316/Microfutbol_joven_kvtx0h.jpg', 10, NOW(), NOW()),
(14, 'https://res.cloudinary.com/dljthy97e/image/upload/v1769572316/Microfutbol_adulto_uuupv8.jpg', 10, NOW(), NOW());
