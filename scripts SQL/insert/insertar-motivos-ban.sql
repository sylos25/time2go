-- =============================================
-- CATEGORÍAS DE BAN
-- =============================================
INSERT INTO tabla_categoria_ban (id_categoria_ban, nombre_categoria) VALUES
(1, 'Cuenta y verificación'),
(2, 'Seguridad del sistema'),
(3, 'Fraude y transacciones'),
(4, 'Contenido inapropiado o ilegal'),
(5, 'Comportamiento y reseñas'),
(6, 'Organización de eventos'),
(7, 'Abuso del sistema'),
(8, 'Administrativo');


-- =============================================
-- MOTIVOS DE BAN
-- =============================================

-- Categoría 1: Cuenta y verificación
INSERT INTO tabla_motivos_ban (id_motivo_ban, id_categoria_ban, motivo_ban) VALUES
(1,  1, 'Uso de identidad falsa o suplantación de identidad'),
(2,  1, 'Provisión de datos personales falsos en la verificación'),
(3,  1, 'Creación de múltiples cuentas para evadir bloqueos o restricciones'),
(4,  1, 'Uso de bots o automatizaciones no autorizadas en la plataforma');

-- Categoría 2: Seguridad del sistema
INSERT INTO tabla_motivos_ban (id_motivo_ban, id_categoria_ban, motivo_ban) VALUES
(5,  2, 'Intento de hackeo o manipulación del sistema'),
(6,  2, 'Acceso no autorizado a cuentas ajenas'),
(7,  2, 'Explotación de vulnerabilidades del sistema (exploits)'),
(8,  2, 'Generación de intentos maliciosos y repetitivos de autenticación');

-- Categoría 3: Fraude y transacciones
INSERT INTO tabla_motivos_ban (id_motivo_ban, id_categoria_ban, motivo_ban) VALUES
(9,  3, 'Intento de fraude o manipulación en pagos de la plataforma'),
(10, 3, 'Solicitudes de reembolso fraudulentas o sin justificación válida'),
(11, 3, 'Compra o venta de entradas fuera del sistema oficial de la plataforma'),
(12, 3, 'Reventa ilegal o manipulación de precios dentro de la plataforma');

-- Categoría 4: Contenido inapropiado o ilegal
INSERT INTO tabla_motivos_ban (id_motivo_ban, id_categoria_ban, motivo_ban) VALUES
(13, 4, 'Publicación de contenido ilegal dentro de la plataforma'),
(14, 4, 'Publicación de contenido violento, amenazante o intimidatorio'),
(15, 4, 'Uso de lenguaje discriminatorio, racista o discurso de odio'),
(16, 4, 'Publicación de contenido sexual explícito o inapropiado'),
(17, 4, 'Difusión de información personal de otros usuarios (doxxing)');

-- Categoría 5: Comportamiento y reseñas
INSERT INTO tabla_motivos_ban (id_motivo_ban, id_categoria_ban, motivo_ban) VALUES
(18, 5, 'Publicación de valoraciones o reseñas falsas de forma reiterada'),
(19, 5, 'Spam en comentarios, reseñas o secciones de la plataforma'),
(20, 5, 'Acoso reiterado hacia otros usuarios de la plataforma'),
(21, 5, 'Amenazas hacia usuarios, moderadores o administradores del sistema');

-- Categoría 6: Organización de eventos
INSERT INTO tabla_motivos_ban (id_motivo_ban, id_categoria_ban, motivo_ban) VALUES
(22, 6, 'Cancelación reiterada de eventos sin justificación válida'),
(23, 6, 'Organización de eventos sin contar con los permisos legales requeridos'),
(24, 6, 'Publicación de eventos con información engañosa, falsa o fraudulenta'),
(25, 6, 'Incumplimiento de medidas de seguridad en eventos organizados'),
(26, 6, 'Reproducción de contenido con derechos de autor sin autorización en eventos'),
(27, 6, 'Incumplimiento deliberado de las normas de accesibilidad del sistema');

-- Categoría 7: Abuso del sistema
INSERT INTO tabla_motivos_ban (id_motivo_ban, id_categoria_ban, motivo_ban) VALUES
(28, 7, 'Creación de eventos falsos con intención de spam o engaño'),
(29, 7, 'Manipulación de algoritmos de visibilidad o búsqueda del sistema'),
(30, 7, 'Uso indebido y reiterado de herramientas de reporte con falsos reportes'),
(31, 7, 'Evasión deliberada de restricciones o penalizaciones activas');

-- Categoría 8: Administrativo
INSERT INTO tabla_motivos_ban (id_motivo_ban, id_categoria_ban, motivo_ban) VALUES
(32, 8, 'Incumplimiento reiterado de las normativas generales del software'),
(33, 8, 'Negativa a cumplir solicitudes o directrices del equipo administrativo'),
(34, 8, 'Conductas que afectan gravemente la experiencia de otros usuarios'),
(35, 8, 'Acciones que generan riesgo legal o reputacional para la plataforma');