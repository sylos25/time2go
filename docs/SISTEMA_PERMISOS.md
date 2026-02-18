# Sistema de Control de Acceso basado en Accesibilidad

## Descripción General

Este sistema implementa un control de acceso granular basado en tablas de accesibilidad, permitiendo asignar permisos específicos a diferentes roles de usuario de manera flexible y escalable.

## Estructura de Tablas

### tabla_accesibilidad_menu
Define las diferentes funcionalidades del sistema que pueden ser controladas:
- `id_accesibilidad`: ID único de la funcionalidad
- `nombre_accesibilidad`: Nombre descriptivo de la funcionalidad

### tabla_accesibilidad_menu_x_rol
Relaciona los roles con las accesibilidades, definiendo qué roles tienen acceso a qué funcionalidades:
- `id_accesibilidad`: Referencia a la funcionalidad
- `id_rol`: Referencia al rol que tiene acceso

## IDs de Accesibilidad Definidos

| ID | Funcionalidad | Descripción |
|----|---------------|-------------|
| 1  | Crear Eventos | Permite crear nuevos eventos |
| 2  | Editar Eventos | Permite editar eventos existentes |
| 3  | Eliminar Eventos | Permite eliminar eventos |
| 4  | Ver Usuarios | Permite ver la lista de usuarios |
| 5  | Gestionar Usuarios | Permite editar y administrar usuarios |
| 6  | Ver Dashboard | Permite acceder al panel de administración |
| 7  | Ver Estadísticas | Permite ver estadísticas del sistema |
| 8  | Validar Eventos | Permite aprobar/rechazar eventos |
| 9  | Gestionar Categorías | Permite administrar categorías de eventos |
| 10 | Gestionar Sitios | Permite administrar sitios/lugares |

## Implementación

### 1. API de Verificación de Permisos

**Endpoint:** `/api/permissions/check`

**Parámetros:**
- `id_accesibilidad` (requerido): ID de la funcionalidad a verificar
- `id_rol` (opcional): ID del rol. Si no se proporciona, se obtiene del usuario autenticado

**Ejemplo de uso:**
```typescript
const response = await fetch('/api/permissions/check?id_accesibilidad=1&id_rol=4');
const data = await response.json();
// data.hasAccess será true o false
```

### 2. Hook de React: usePermission

El hook `usePermission` facilita la verificación de permisos en componentes de React:

```typescript
import { usePermission, PERMISSIONS } from '@/hooks/use-permissions';

function MyComponent() {
  const userRole = 4; // Obtener del contexto o estado
  const { hasAccess, isLoading } = usePermission(PERMISSIONS.CREAR_EVENTOS, userRole);

  if (isLoading) return <div>Cargando...</div>;
  
  if (!hasAccess) return <div>No tienes permiso</div>;

  return <div>Contenido protegido</div>;
}
```

### 3. Constantes de Permisos

En `use-permissions.ts` se definen constantes para facilitar el uso:

```typescript
export const PERMISSIONS = {
  CREAR_EVENTOS: 1,
  VER_DASHBOARD: 6,
  // ... más permisos
} as const;
```

## Uso en el Header

El componente Header ha sido actualizado para usar este sistema:

```typescript
// Antes (hardcodeado):
const canCreate = userRole === 4;
const canDashboard = userRole === 4;

// Ahora (basado en accesibilidad):
const { hasAccess: canCreate } = usePermission(
  loggedIn ? PERMISSIONS.CREAR_EVENTOS : null, 
  userRole
);
const { hasAccess: canDashboard } = usePermission(
  loggedIn ? PERMISSIONS.VER_DASHBOARD : null, 
  userRole
);
```

## Instalación y Configuración

### Paso 1: Ejecutar el script SQL
Ejecuta el archivo `scripts/insertar-accesibilidad.sql` en tu base de datos PostgreSQL:

```bash
psql -U tu_usuario -d tu_base_de_datos -f scripts/insertar-accesibilidad.sql
```

O desde pgAdmin/DBeaver, abre y ejecuta el archivo.

### Paso 2: Verificar los datos
El script incluye consultas de verificación al final. Asegúrate de que:
- Las accesibilidades se hayan insertado correctamente
- Los permisos estén asignados al rol 4 (o los roles que uses)

### Paso 3: Ajustar permisos por rol
Edita el archivo SQL para agregar permisos a otros roles según tus necesidades:

```sql
-- Ejemplo: Dar permisos limitados al rol 2
INSERT INTO tabla_accesibilidad_menu_x_rol (id_accesibilidad_menu_x_rol, id_accesibilidad, id_rol) VALUES
(11, 1, 2),  -- Puede crear eventos
(12, 6, 2)   -- Puede ver dashboard
ON CONFLICT (id_accesibilidad_menu_x_rol) DO NOTHING;
```

## Agregar Nuevas Funcionalidades Protegidas

### 1. Definir la accesibilidad en la BD
```sql
INSERT INTO tabla_accesibilidad_menu (id_accesibilidad, nombre_accesibilidad) 
VALUES (11, 'Nueva Funcionalidad');
```

### 2. Asignar a roles
```sql
INSERT INTO tabla_accesibilidad_menu_x_rol (id_accesibilidad_menu_x_rol, id_accesibilidad, id_rol) 
VALUES (20, 11, 4);
```

### 3. Agregar constante en el código
```typescript
// En src/hooks/use-permissions.ts
export const PERMISSIONS = {
  // ... permisos existentes
  NUEVA_FUNCIONALIDAD: 11,
} as const;
```

### 4. Usar en componentes
```typescript
const { hasAccess } = usePermission(PERMISSIONS.NUEVA_FUNCIONALIDAD, userRole);

{hasAccess && (
  <button onClick={handleNuevaFuncionalidad}>
    Nueva Funcionalidad
  </button>
)}
```

## Ventajas del Sistema

1. **Flexible**: Puedes agregar nuevas funcionalidades sin modificar código
2. **Granular**: Control fino sobre cada funcionalidad
3. **Escalable**: Fácil de extender con nuevos roles y permisos
4. **Mantenible**: Cambios en permisos solo requieren updates en BD
5. **Auditable**: Todos los permisos están centralizados en la BD

## Consideraciones de Seguridad

1. **Validación en Backend**: Siempre valida permisos en el servidor, no solo en el frontend
2. **Token JWT**: El sistema usa el token del usuario para verificar su rol
3. **Session fallback**: Si no hay token, intenta obtener la sesión de las cookies
4. **Cache**: Considera implementar cache para evitar consultas repetidas

## Troubleshooting

### Los permisos no se actualizan
- Verifica que el usuario tenga `id_rol` correcto en `localStorage.getItem('userRole')`
- Borra la cache del navegador y vuelve a iniciar sesión
- Verifica que los datos estén en la BD con las consultas de verificación

### Error "Usuario no autenticado"
- Verifica que el token esté en localStorage: `localStorage.getItem('token')`
- Verifica que el token no haya expirado
- Intenta cerrar sesión y volver a iniciar

### Los permisos no coinciden
- Verifica la relación en `tabla_accesibilidad_menu_x_rol`
- Ejecuta las consultas de verificación del script SQL
- Revisa los logs del servidor en `/api/permissions/check`

## Próximos Pasos

1. Implementar permisos en más componentes (eventos/crear, dashboard, etc.)
2. Agregar cache en el hook para mejorar performance
3. Crear middleware para proteger rutas automáticamente
4. Implementar un panel de administración de permisos en el dashboard
