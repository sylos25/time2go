-- Script de Datos Iniciales para Prueba del Sistema de Inserción
-- Este script contiene datos mínimos necesarios para probar el módulo de inserción

-- Insertar País Base (Colombia)
INSERT INTO tabla_paises (id_pais, nombre_pais)
VALUES (1, 'Colombia')
ON CONFLICT DO NOTHING;

-- Insertar Departamento Base (Santander)
INSERT INTO tabla_departamentos (id_departamento, nombre_departamento, id_pais)
VALUES (68, 'Santander', 1)
ON CONFLICT DO NOTHING;

-- Insertar Municipios Base
INSERT INTO tabla_municipios (id_departamento, id_municipio, nombre_municipio, distrito, area_metropolitana)
VALUES 
  (68, 6801, 'Bucaramanga', FALSE, TRUE),
  (68, 6802, 'Floridablanca', FALSE, TRUE),
  (68, 6803, 'Girón', FALSE, TRUE),
  (68, 6804, 'Piedecuesta', FALSE, FALSE)
ON CONFLICT DO NOTHING;

-- Insertar Tipos de Sitios Base
INSERT INTO tabla_tipo_sitios (id_tipo_sitio, nombre_tipo_sitio)
VALUES 
  (1, 'Auditorio'),
  (2, 'Parque'),
  (3, 'Restaurante'),
  (4, 'Sala de Conciertos'),
  (5, 'Centro de Convenciones')
ON CONFLICT DO NOTHING;

-- Insertar Categorías de Eventos Base
INSERT INTO tabla_categorias_eventos (id_categoria_evento, nombre)
VALUES 
  (1, 'Música'),
  (2, 'Arte'),
  (3, 'Teatro'),
  (4, 'Gastronomía'),
  (5, 'Deportes'),
  (6, 'Tecnología'),
  (7, 'Conferencias')
ON CONFLICT DO NOTHING;

-- Insertar Tipos de Eventos Base
INSERT INTO tabla_tipo_eventos (id_tipo_evento, id_categoria_evento, nombre)
VALUES 
  (1, 1, 'Concierto Rock'),
  (2, 1, 'Concierto Pop'),
  (3, 1, 'Concierto Jazz'),
  (4, 2, 'Exposición'),
  (5, 3, 'Obra de Teatro'),
  (6, 4, 'Festival Gastronómico'),
  (7, 5, 'Partido de Fútbol'),
  (8, 6, 'Hackathon'),
  (9, 7, 'Charla Educativa')
ON CONFLICT DO NOTHING;

-- Insertar Categoría de Boletos Base
INSERT INTO tabla_categoria_boleto (id_categoria_boleto, nombre_categoria_boleto)
VALUES 
  (1, 'General'),
  (2, 'VIP'),
  (3, 'Infantil'),
  (4, 'Estudiante'),
  (5, 'Adulto Mayor')
ON CONFLICT DO NOTHING;

-- NOTAS IMPORTANTES:
-- 1. Los IDs deben ser únicos y no deben duplicarse
-- 2. Las claves foráneas deben existir antes de insertar registros que las referencien
-- 3. El orden de inserción es importante (padres antes que hijos)
-- 4. Si obtiene errores de integridad referencial, verifique que los IDs existan
-- 5. Para usuarios, use el módulo de inserción del dashboard para hash seguro de contraseñas

-- Después de ejecutar este script, podrá usar el módulo de inserción para:
-- - Agregar nuevos países
-- - Agregar nuevos sitios (que referencien id_tipo_sitio y id_municipio existentes)
-- - Agregar nuevos municipios (que referencien id_departamento existentes)
-- - Agregar nuevos usuarios
-- - Agregar nuevas categorías y tipos de eventos
