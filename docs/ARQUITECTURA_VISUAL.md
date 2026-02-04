# 🏗️ Arquitectura del Sistema de Inserción de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                      USUARIO EN NAVEGADOR                       │
│                                                                 │
│  Dashboard → Menu → "Insertar Datos" → Click                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Client)                      │
│                                                                 │
│  📁 src/components/dashboard/insert-data-tab.tsx              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  InsertDataTab Component                │  │
│  │                                                          │  │
│  │  • Tabs (6 tablas): Países, Sitios, Municipios,       │  │
│  │    Usuarios, Categorías, Tipos de Eventos             │  │
│  │                                                          │  │
│  │  • Formularios Dinámicos:                              │  │
│  │    - Text inputs                                        │  │
│  │    - Email/Password                                     │  │
│  │    - Selectores                                         │  │
│  │    - Checkboxes                                         │  │
│  │    - Textareas                                          │  │
│  │                                                          │  │
│  │  • Validación Cliente:                                 │  │
│  │    - Campos requeridos marcados                        │  │
│  │    - Tipos de dato validados                           │  │
│  │    - Formato de email validado                         │  │
│  │                                                          │  │
│  │  • Manejo de Estado:                                   │  │
│  │    - formData: objeto con valores                      │  │
│  │    - selectedTable: tabla actual                       │  │
│  │    - message: error/éxito                              │  │
│  │    - loading: estado de carga                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│              [Usuario completa formulario]                      │
│              [Click en "Insertar Datos"]                        │
│                            │                                    │
│                            ▼                                    │
│              handleSubmit() → POST request                      │
│              ┌────────────────────────────────────────┐         │
│              │ Payload JSON:                          │         │
│              │ {                                      │         │
│              │   "table": "usuarios",                 │         │
│              │   "data": { ... campos ... }          │         │
│              │ }                                      │         │
│              └────────────────────────────────────────┘         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTPS Request
                 │ POST /api/admin/insert-data
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND API (Next.js Route Handler)                │
│                                                                 │
│  📁 src/app/api/admin/insert-data/route.ts                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              export async function POST()                │  │
│  │                                                          │  │
│  │  1️⃣ PARSING:                                           │  │
│  │     - const { table, data } = await req.json()         │  │
│  │     - Validar que table y data existan                 │  │
│  │                                                          │  │
│  │  2️⃣ ROUTING POR TABLA:                                │  │
│  │     - switch(table) {                                  │  │
│  │       - case "paises": ...                             │  │
│  │       - case "municipios": ...                         │  │
│  │       - case "sitios": ...                             │  │
│  │       - case "usuarios": ...                           │  │
│  │       - case "categorias_eventos": ...                 │  │
│  │       - case "tipo_eventos": ...                       │  │
│  │     }                                                  │  │
│  │                                                          │  │
│  │  3️⃣ PROCESAMIENTO ESPECIAL:                            │  │
│  │     - Si tabla = "usuarios":                           │  │
│  │       • const hashedPassword =                         │  │
│  │         await bcrypt.hash(data.contrasena, 10)       │  │
│  │       • Reemplazar contraseña por hash                │  │
│  │                                                          │  │
│  │  4️⃣ CONSTRUCCIÓN DE QUERY:                            │  │
│  │     - query: string SQL parametrizado                 │  │
│  │     - values: array con parámetros                    │  │
│  │                                                          │  │
│  │  5️⃣ EJECUCIÓN:                                        │  │
│  │     - result = await pool.query(query, values)        │  │
│  │                                                          │  │
│  │  6️⃣ RESPUESTA:                                        │  │
│  │     - Si éxito (200): JSON con datos insertados       │  │
│  │     - Si error: Manejo específico por código SQL       │  │
│  │       • 23505: "Registro ya existe"                   │  │
│  │       • 23503: "Clave foránea no existe"             │  │
│  │       • 23502: "Campo obligatorio faltante"          │  │
│  │       • 22001: "Valor muy largo"                      │  │
│  │                                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  tabla_paises                   INSERT nueva fila       │   │
│  │  ├─ id_pais (PK)                        ↓              │   │
│  │  └─ nombre_pais (UNIQUE, CHECK len≥3)  VALIDADO       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  tabla_municipios                                       │   │
│  │  ├─ id_departamento (FK)  ◄─ Validado               │   │
│  │  ├─ id_municipio (PK)                                  │   │
│  │  ├─ nombre_municipio (CHECK len≥3)                     │   │
│  │  ├─ distrito (BOOLEAN)                                 │   │
│  │  └─ area_metropolitana (BOOLEAN)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  tabla_sitios                                           │   │
│  │  ├─ id_sitio (PK)                                       │   │
│  │  ├─ nombre_sitio (CHECK len≥3)                          │   │
│  │  ├─ id_tipo_sitio (FK)  ◄─ Validado                 │   │
│  │  ├─ descripcion (TEXT)                                 │   │
│  │  ├─ acceso_discapacidad (BOOLEAN)                      │   │
│  │  ├─ id_municipio (FK)  ◄─ Validado                 │   │
│  │  ├─ direccion (UNIQUE, CHECK len≥6)                    │   │
│  │  ├─ latitud (UNIQUE)                                   │   │
│  │  ├─ longitud (UNIQUE)                                  │   │
│  │  ├─ telefono_1 (CHECK > 2999999999)                    │   │
│  │  ├─ telefono_2 (UNIQUE, OPTIONAL)                      │   │
│  │  └─ sitio_web (OPTIONAL, UNIQUE)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  tabla_usuarios                                         │   │
│  │  ├─ numero_documento (PK, UNIQUE)                       │   │
│  │  ├─ tipo_documento (ENUM)                              │   │
│  │  ├─ nombres (CHECK len≥3)                              │   │
│  │  ├─ apellidos (CHECK len≥3)                            │   │
│  │  ├─ id_pais (FK)  ◄─ Validado                       │   │
│  │  ├─ correo (UNIQUE, CHECK len≥14)  ◄─ HASHEADO   │   │
│  │  ├─ contrasena_hash (bcrypt) ◄─ HASHEADO (bcrypt) │   │
│  │  ├─ validacion_correo (BOOLEAN)                        │   │
│  │  └─ telefono (UNIQUE, OPTIONAL)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  tabla_categorias_eventos                               │   │
│  │  ├─ id_categoria_evento (PK)                           │   │
│  │  └─ nombre (UNIQUE, CHECK len≥3)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  tabla_tipo_eventos                                     │   │
│  │  ├─ id_tipo_evento (PK)                                │   │
│  │  ├─ id_categoria_evento (FK)  ◄─ Validado           │   │
│  │  └─ nombre (UNIQUE, CHECK len≥3)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│         ✅ INSERT ejecutado ✅                                  │
│         ✅ CONSTRAINTS validados ✅                             │
│         ✅ Fila insertada en tabla ✅                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Response JSON
                 │ {
                 │   "success": true,
                 │   "message": "Datos insertados...",
                 │   "data": { fila insertada }
                 │ }
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND (React Client) - Respuesta                │
│                                                                 │
│  handleSubmit() recibe respuesta                               │
│                                                                 │
│  ✅ SI ÉXITO (200):                                           │
│     - setMessage({ type: "success", text: "✓ Datos..." })    │
│     - setFormData({}) // Limpiar formulario                   │
│     - Mostrar mensaje verde por 5 segundos                    │
│                                                                 │
│  ❌ SI ERROR:                                                 │
│     - setMessage({ type: "error", text: "error description"})│
│     - Mostrar mensaje rojo                                    │
│     - NO limpiar formulario (usuario puede corregir)         │
│                                                                 │
│  Usuario ve:                                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ✅ Datos insertados exitosamente en [tabla]           │  │
│  │                                                          │  │
│  │ [Formulario limpio y listo para insertar más]          │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos Detallado

### Usuario Input → Frontend Processing
```
User fills form → onChange updates state → formData object
         ↓
Fields validated (client-side)
         ↓
Form submitted → handleSubmit preventDefault
         ↓
POST request to /api/admin/insert-data
```

### Backend Processing
```
Receive JSON → Parse table & data
         ↓
Switch by table name
         ↓
Build SQL query with parameters
         ↓
If users table → Hash password with bcrypt
         ↓
Execute query with pool.query(query, values)
         ↓
Handle response/error
```

### Database Validation
```
SQL received → Check constraints
         ↓
PRIMARY KEY: Unique?
FOREIGN KEY: Referenced record exists?
CHECK: Values meet criteria?
UNIQUE: No duplicates?
         ↓
If all pass → INSERT row
If any fail → Return error code (23505, 23503, etc)
```

### Response to Frontend
```
Backend returns JSON
         ↓
Frontend checks response.ok
         ↓
Success → Show green message, clear form
Error → Show red message with description
```

---

## 📊 Validaciones en Cascada

```
┌──────────────────────────────────────────────┐
│ 1️⃣ CLIENT-SIDE VALIDATION (HTML5 + React) │
│    • required attribute                       │
│    • type validation (email, number, etc)     │
│    • onChange handlers                        │
│    → Previene envíos inválidos                │
└──────────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────────┐
│ 2️⃣ SERVER-SIDE VALIDATION (Node.js)        │
│    • Validation of table name                │
│    • Check data object exists                │
│    • Type coercion (string → number)         │
│    → Previene inyección SQL                  │
└──────────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────────┐
│ 3️⃣ DATABASE VALIDATION (PostgreSQL)        │
│    • PRIMARY KEY constraints                 │
│    • FOREIGN KEY constraints                 │
│    • UNIQUE constraints                      │
│    • CHECK constraints                       │
│    • Data type validation                    │
│    → Garantiza integridad de datos          │
└──────────────────────────────────────────────┘
                    ▼
         ✅ Row inserted safely ✅
```

---

## 🔒 Seguridad en Capas

```
CAPA 1: Frontend
├─ Validación de entrada
├─ Tipos de datos
└─ Campos requeridos

CAPA 2: API
├─ Validación de tabla
├─ Validación de datos
├─ Bcrypt para contraseñas
└─ SQL parametrizado (sin inyección)

CAPA 3: Base de Datos
├─ Constraints de tipo
├─ Constraints de unicidad
├─ Constraints de referencia
└─ Límites de longitud

RESULTADO: 🔐 Datos seguros 🔐
```

---

## 🎯 Puntos Clave

1. **Componente Dinámico** - Un componente que maneja 6 tablas
2. **API Flexible** - Switch statement para diferentes tablas
3. **Seguridad Multicapa** - Validación en cliente, servidor y BD
4. **Manejo de Errores** - Mensajes específicos por tipo de error
5. **UX Limpia** - Formulario se limpia tras éxito
6. **Escalable** - Fácil agregar más tablas

---

**Esta arquitectura garantiza que los datos sean válidos, seguros y consistentes en todo momento.** ✅
