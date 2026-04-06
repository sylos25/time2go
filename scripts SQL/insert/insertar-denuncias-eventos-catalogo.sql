-- Catálogo inicial: categorías y motivos (estructura con PK simple id_motivo_denuncia_evento).
-- Ejecutar tras crear tablas con DDL Time2Go.SQL actualizado.

INSERT INTO tabla_categoria_denuncia_evento (id_categoria_denuncia, nombre_categoria_denuncia)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Contenido o información'),
  (2, 'Fraude y pagos'),
  (3, 'Seguridad o conducta'),
  (4, 'Derechos y legalidad')
ON CONFLICT (id_categoria_denuncia) DO NOTHING;

-- nombre_motivo: etiqueta breve (gestión / listados). descripcion_motivo: texto para el formulario público (opcional si coincide con el nombre).
INSERT INTO tabla_motivos_denuncia_eventos (id_categoria_denuncia, nombre_motivo, descripcion_motivo)
VALUES
  (1, 'Información engañosa', 'Información falsa o engañosa sobre el evento, fecha o lugar'),
  (1, 'Contenido explícito o violento', 'Imágenes o texto con contenido sexual explícito o violento'),
  (1, 'Spam o publicidad', 'Spam, publicidad masiva o contenido no relacionado con cultura'),
  (2, 'Pagos fuera de la plataforma', 'Solicitud de pago por fuera de la plataforma o métodos no oficiales'),
  (2, 'Precios o cobros sospechosos', 'Precios o condiciones de pago que parecen fraudulentas o duplicadas'),
  (3, 'Acoso u odio', 'Acoso, amenazas o lenguaje de odio en la descripción o enlaces'),
  (3, 'Datos personales expuestos', 'Datos personales expuestos sin consentimiento en el contenido del evento'),
  (4, 'Posible infracción de autor', 'Posible infracción de derechos de autor en imágenes o descripción'),
  (4, 'Posible ilegalidad', 'El evento podría ser ilegal o incumplir normativa local aplicable')
ON CONFLICT (nombre_motivo) DO NOTHING;
