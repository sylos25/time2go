/*
|------------------------------------------------------------------------------------|
| INSERTAR DATOS DE ACCESIBILIDAD - Time2Go                                         |
| DESCRIPCIÓN: Script para insertar los registros de accesibilidad del menú y       |
|              asignar permisos a los roles                                          |
|------------------------------------------------------------------------------------|
*/

-- ============================
-- TABLA: tabla_accesibilidad_menu
-- ============================
-- Insertar las diferentes accesibilidades del sistema

INSERT INTO tabla_accesibilidad_menu (id_accesibilidad, nombre_accesibilidad) VALUES
(1, 'Crear Eventos'),
(2, 'Editar Eventos'),
(3, 'Eliminar Eventos'),
(4, 'Ver Usuarios'),
(5, 'Gestionar Usuarios'),
(6, 'Ver Dashboard'),
(7, 'Ver Estadísticas'),
(8, 'Validar Eventos'),
(9, 'Gestionar Categorías'),
(10, 'Gestionar Sitios')
ON CONFLICT (id_accesibilidad) DO NOTHING;

-- ============================
-- TABLA: tabla_accesibilidad_menu_x_rol
-- ============================
-- Asignar permisos a los roles
-- Nota: Ajusta los id_rol según tu configuración de roles
-- Ejemplo: id_rol 1 = Usuario Regular, id_rol 4 = Administrador/Organizador

-- Permisos para Rol 4 (Administrador/Organizador)
INSERT INTO tabla_accesibilidad_menu_x_rol (id_accesibilidad_menu_x_rol, id_accesibilidad, id_rol) VALUES
-- Crear Eventos (id_accesibilidad = 1)
(1, 1, 4),
-- Editar Eventos (id_accesibilidad = 2)
(2, 2, 4),
-- Eliminar Eventos (id_accesibilidad = 3)
(3, 3, 4),
-- Ver Usuarios (id_accesibilidad = 4)
(4, 4, 4),
-- Gestionar Usuarios (id_accesibilidad = 5)
(5, 5, 4),
-- Ver Dashboard (id_accesibilidad = 6)
(6, 6, 4),
-- Ver Estadísticas (id_accesibilidad = 7)
(7, 7, 4),
-- Validar Eventos (id_accesibilidad = 8)
(8, 8, 4),
-- Gestionar Categorías (id_accesibilidad = 9)
(9, 9, 4),
-- Gestionar Sitios (id_accesibilidad = 10)
(10, 10, 4)
ON CONFLICT (id_accesibilidad_menu_x_rol) DO NOTHING;

-- Si tienes más roles, puedes agregar más permisos aquí
-- Ejemplo para Rol 2 (Organizador con permisos limitados):
-- INSERT INTO tabla_accesibilidad_menu_x_rol (id_accesibilidad_menu_x_rol, id_accesibilidad, id_rol) VALUES
-- (11, 1, 2),  -- Puede crear eventos
-- (12, 2, 2),  -- Puede editar eventos
-- (13, 6, 2)   -- Puede ver dashboard
-- ON CONFLICT (id_accesibilidad_menu_x_rol) DO NOTHING;

-- Ejemplo para Rol 3 (Moderador):
-- INSERT INTO tabla_accesibilidad_menu_x_rol (id_accesibilidad_menu_x_rol, id_accesibilidad, id_rol) VALUES
-- (14, 4, 3),  -- Puede ver usuarios
-- (15, 7, 3),  -- Puede ver estadísticas
-- (16, 8, 3)   -- Puede validar eventos
-- ON CONFLICT (id_accesibilidad_menu_x_rol) DO NOTHING;

-- ============================
-- VERIFICACIÓN
-- ============================
-- Consultar las accesibilidades creadas
SELECT * FROM tabla_accesibilidad_menu ORDER BY id_accesibilidad;

-- Consultar los permisos asignados por rol
SELECT 
    axr.id_accesibilidad_menu_x_rol,
    r.id_rol,
    r.nombre_rol,
    am.id_accesibilidad,
    am.nombre_accesibilidad
FROM tabla_accesibilidad_menu_x_rol axr
INNER JOIN tabla_roles r ON axr.id_rol = r.id_rol
INNER JOIN tabla_accesibilidad_menu am ON axr.id_accesibilidad = am.id_accesibilidad
ORDER BY r.id_rol, am.id_accesibilidad;

-- Verificar qué roles tienen acceso a "Crear Eventos" (id_accesibilidad = 1)
SELECT 
    r.id_rol,
    r.nombre_rol,
    am.nombre_accesibilidad
FROM tabla_accesibilidad_menu_x_rol axr
INNER JOIN tabla_roles r ON axr.id_rol = r.id_rol
INNER JOIN tabla_accesibilidad_menu am ON axr.id_accesibilidad = am.id_accesibilidad
WHERE am.id_accesibilidad = 1;

-- Verificar qué roles tienen acceso a "Ver Dashboard" (id_accesibilidad = 6)
SELECT 
    r.id_rol,
    r.nombre_rol,
    am.nombre_accesibilidad
FROM tabla_accesibilidad_menu_x_rol axr
INNER JOIN tabla_roles r ON axr.id_rol = r.id_rol
INNER JOIN tabla_accesibilidad_menu am ON axr.id_accesibilidad = am.id_accesibilidad
WHERE am.id_accesibilidad = 6;
