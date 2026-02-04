# Guía de Uso - Sistema de Inserción de Datos en Dashboard

## Descripción General
Se ha agregado un nuevo módulo al dashboard que permite insertar datos en la base de datos de forma segura y validada. El sistema está dividido en 6 tablas principales con sus respectivos formularios y validaciones.

## Ubicación
- **Menú del Dashboard:** "Insertar Datos" (icono de base de datos)
- **Archivo Componente:** `src/components/dashboard/insert-data-tab.tsx`
- **Archivo API:** `src/app/api/admin/insert-data/route.ts`

## Tablas Disponibles

### 1. **Países (tabla_paises)**
- **ID País** (requerido): Identificador numérico único
- **Nombre del País** (requerido): Nombre del país (mínimo 3 caracteres)

### 2. **Sitios (tabla_sitios)**
- **ID Sitio** (requerido): Identificador único del sitio
- **Nombre del Sitio** (requerido): Nombre descriptivo (mínimo 3 caracteres)
- **ID Tipo de Sitio** (requerido): Referencia a tabla_tipo_sitios
- **Descripción** (requerido): Descripción detallada del sitio
- **¿Acceso para Discapacitados?** (opcional): Checkbox booleano
- **ID Municipio** (requerido): Referencia a tabla_municipios
- **Dirección** (requerido): Dirección única (mínimo 6 caracteres)
- **Latitud** (requerido): Coordenada de ubicación
- **Longitud** (requerido): Coordenada de ubicación
- **Teléfono 1** (requerido): Número telefónico válido
- **Teléfono 2** (opcional): Número telefónico adicional
- **Sitio Web** (opcional): URL del sitio

### 3. **Municipios (tabla_municipios)**
- **ID Departamento** (requerido): Referencia a tabla_departamentos
- **ID Municipio** (requerido): Identificador único
- **Nombre del Municipio** (requerido): Nombre (mínimo 3 caracteres)
- **¿Es Distrito?** (opcional): Checkbox booleano
- **¿Es Área Metropolitana?** (opcional): Checkbox booleano

### 4. **Usuarios (tabla_usuarios)**
- **Número de Documento** (requerido): Cédula o identificación única
- **Tipo de Documento** (requerido): Selecciona entre:
  - Cédula de Ciudadanía
  - Cédula de Extranjería
  - Pasaporte
- **Nombres** (requerido): Nombre completo (mínimo 3 caracteres)
- **Apellidos** (requerido): Apellido completo (mínimo 3 caracteres)
- **ID País** (requerido): Referencia a tabla_paises
- **Correo Electrónico** (requerido): Email válido (mínimo 14 caracteres)
- **Contraseña** (requerido): Se almacena hasheada con bcrypt (10 rondas)
- **¿Email Validado?** (opcional): Marca si el email está verificado
- **Teléfono** (opcional): Número telefónico

### 5. **Categorías de Eventos (tabla_categorias_eventos)**
- **ID Categoría** (requerido): Identificador único
- **Nombre de la Categoría** (requerido): Nombre único (mínimo 3 caracteres)

### 6. **Tipos de Eventos (tabla_tipo_eventos)**
- **ID Tipo de Evento** (requerido): Identificador único
- **ID Categoría del Evento** (requerido): Referencia a tabla_categorias_eventos
- **Nombre del Tipo de Evento** (requerido): Nombre único (mínimo 3 caracteres)

## Funcionalidades del Sistema

### ✓ Características Implementadas
1. **Interfaz de Tabs:** Selecciona fácilmente entre diferentes tablas
2. **Formularios Dinámicos:** Campos adaptados a cada tabla
3. **Validación de Campos:** Campos requeridos marcados con asterisco rojo
4. **Hash de Contraseñas:** Las contraseñas se almacenan seguras con bcrypt
5. **Manejo de Errores:** Mensajes claros para:
   - Integridad referencial (claves foráneas no existen)
   - Violación de unicidad (registros duplicados)
   - Campos obligatorios faltantes
   - Valores demasiado largos
6. **Feedback Visual:** Mensajes de éxito o error después de cada inserción
7. **Reseteo de Formulario:** Se limpia después de una inserción exitosa

### 🔒 Seguridad
- Las contraseñas se hashean automáticamente con bcrypt (10 rondas de salt)
- Validación de integridad referencial en base de datos
- Manejo de errores SQL sin exponer información sensible

## Validaciones y Restricciones

### Por Tabla
- **Paises/Municipios/Sitios/Categorías:** IDs deben ser únicos
- **Usuarios:** Email y documento deben ser únicos y válidos
- **Directrices de longitud:** Campos de texto tienen límites mínimos y máximos
- **Referencias Foráneas:** Se validan automáticamente en base de datos

### Errores Comunes
| Error | Causa | Solución |
|-------|-------|----------|
| "El registro ya existe" | ID o valor duplicado | Usa un ID único |
| "Clave foránea no existe" | Referencia inválida | Verifica que el ID referenciado exista |
| "Falta un campo obligatorio" | Campo requerido vacío | Completa todos los campos marcados con * |
| "El valor es demasiado largo" | Texto excede límite | Acorta el contenido |

## API Endpoint

**Ruta:** `POST /api/admin/insert-data`

**Request:**
```json
{
  "table": "usuarios",
  "data": {
    "numero_documento": "1234567890",
    "tipo_documento": "Cédula de Ciudadanía",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "id_pais": 1,
    "correo": "juan.perez@example.com",
    "contrasena": "MiContraseña123!",
    "validacion_correo": false,
    "telefono": 3001234567
  }
}
```

**Response (Éxito - 201):**
```json
{
  "success": true,
  "message": "Datos insertados exitosamente en usuarios",
  "data": { /* fila insertada */ }
}
```

**Response (Error - 400/500):**
```json
{
  "error": "Descripción del error"
}
```

## Próximas Mejoras Sugeridas
1. Agregar más tablas (tabla_departamentos, tabla_tipo_sitios)
2. Implementar edición de registros existentes
3. Agregar eliminación de registros
4. Importación masiva desde CSV
5. Exportación de datos
6. Sistema de permisos/roles para acceso al módulo
7. Auditoría de cambios
8. Validación en cliente antes de enviar al servidor

## Notas Importantes
- ⚠️ Este módulo es para administradores únicamente
- Los datos insertados no se pueden revertir fácilmente
- Verifica bien los datos antes de insertar
- Las claves foráneas deben existir previamente en la BD
