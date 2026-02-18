# Quick Start - Sistema de Control de Acceso

## 🚀 Pasos para Activar el Sistema

### 1. Ejecutar el Script SQL (REQUERIDO)
Ejecuta el archivo para crear los datos de accesibilidad en tu base de datos:

```bash
psql -U tu_usuario -d tu_base_de_datos -f scripts/insertar-accesibilidad.sql
```

O desde pgAdmin/DBeaver, abre y ejecuta: `scripts/insertar-accesibilidad.sql`

### 2. Verificar la Instalación
Después de ejecutar el script, verifica que los datos se insertaron correctamente:

```sql
-- Ver accesibilidades creadas
SELECT * FROM tabla_accesibilidad_menu ORDER BY id_accesibilidad;

-- Ver permisos asignados
SELECT 
    r.nombre_rol,
    am.nombre_accesibilidad
FROM tabla_accesibilidad_menu_x_rol axr
INNER JOIN tabla_roles r ON axr.id_rol = r.id_rol
INNER JOIN tabla_accesibilidad_menu am ON axr.id_accesibilidad = am.id_accesibilidad
ORDER BY r.id_rol, am.id_accesibilidad;
```

### 3. Reiniciar el Servidor de Desarrollo
```bash
# Detener el servidor (Ctrl+C)
# Iniciar de nuevo
npm run dev
# o
pnpm dev
```

### 4. Probar el Sistema
1. Inicia sesión con un usuario que tenga `id_rol = 4`
2. Verifica que puedas ver:
   - Botón "Crear Evento" en el header
   - Botón "Dashboard" en el header
3. Cierra sesión e inicia con un usuario de `id_rol = 1`
4. Verifica que NO veas estos botones

## 📋 Archivos Creados/Modificados

### Nuevos Archivos:
- ✅ `src/app/api/permissions/check/route.ts` - API de verificación de permisos
- ✅ `src/hooks/use-permissions.ts` - Hook de React para permisos
- ✅ `src/lib/permissions.ts` - Utilidades para backend
- ✅ `scripts/insertar-accesibilidad.sql` - Script de instalación
- ✅ `docs/SISTEMA_PERMISOS.md` - Documentación completa
- ✅ `docs/EJEMPLOS_PERMISOS.md` - Ejemplos de uso

### Archivos Modificados:
- ✅ `src/components/header.tsx` - Ahora usa el sistema de permisos

## 🔧 Configuración de Roles

Por defecto, el script asigna TODOS los permisos al `id_rol = 4`.

### Para agregar permisos a otros roles:

```sql
-- Ejemplo: Dar permisos al rol 2 (Organizador)
INSERT INTO tabla_accesibilidad_menu_x_rol (id_accesibilidad_menu_x_rol, id_accesibilidad, id_rol) VALUES
(11, 1, 2),  -- Puede crear eventos
(12, 2, 2),  -- Puede editar eventos
(13, 6, 2)   -- Puede ver dashboard
ON CONFLICT (id_accesibilidad_menu_x_rol) DO NOTHING;
```

### Para agregar permisos al rol 3 (Moderador):

```sql
INSERT INTO tabla_accesibilidad_menu_x_rol (id_accesibilidad_menu_x_rol, id_accesibilidad, id_rol) VALUES
(14, 4, 3),  -- Puede ver usuarios
(15, 7, 3),  -- Puede ver estadísticas
(16, 8, 3)   -- Puede validar eventos
ON CONFLICT (id_accesibilidad_menu_x_rol) DO NOTHING;
```

## 🎯 IDs de Accesibilidad Disponibles

| ID | Funcionalidad |
|----|---------------|
| 1  | Crear Eventos |
| 2  | Editar Eventos |
| 3  | Eliminar Eventos |
| 4  | Ver Usuarios |
| 5  | Gestionar Usuarios |
| 6  | Ver Dashboard |
| 7  | Ver Estadísticas |
| 8  | Validar Eventos |
| 9  | Gestionar Categorías |
| 10 | Gestionar Sitios |

## 📝 Uso Rápido en Componentes

```tsx
// En cualquier componente cliente
import { usePermission, PERMISSIONS } from '@/hooks/use-permissions';

function MyComponent() {
  const userRole = 4; // Obtener del contexto/localStorage
  const { hasAccess, isLoading } = usePermission(PERMISSIONS.CREAR_EVENTOS, userRole);

  if (isLoading) return <div>Cargando...</div>;
  if (!hasAccess) return <div>Sin acceso</div>;

  return <div>Contenido protegido</div>;
}
```

## 🔒 Proteger APIs

```typescript
// En cualquier route.ts
import { requirePermission, PERMISSION_IDS } from "@/lib/permissions";

export async function POST(req: Request) {
  // Verificar antes de procesar
  const error = await requirePermission(req, PERMISSION_IDS.CREAR_EVENTOS);
  if (error) return error;

  // Usuario tiene permiso, continuar...
}
```

## ⚠️ Troubleshooting

### El header no muestra los botones correctamente
1. Abre la consola del navegador (F12)
2. Ejecuta: `localStorage.getItem('userRole')`
3. Si es `null` o no es `'4'`, actualiza:
   ```javascript
   localStorage.setItem('userRole', '4');
   window.location.reload();
   ```

### Error al ejecutar el script SQL
- Verifica que las tablas `tabla_accesibilidad_menu` y `tabla_accesibilidad_menu_x_rol` existan en tu base de datos
- Verifica que la tabla `tabla_roles` tenga un rol con `id_rol = 4`
- Lee el error específico y ajusta los IDs según tu BD

### Los permisos no se actualizan
1. Limpia el localStorage:
   ```javascript
   localStorage.clear();
   ```
2. Cierra sesión y vuelve a iniciar
3. Verifica que el token sea válido

## 📚 Documentación Completa

Para más detalles, consulta:
- `docs/SISTEMA_PERMISOS.md` - Arquitectura y configuración completa
- `docs/EJEMPLOS_PERMISOS.md` - Ejemplos de uso en diferentes escenarios

## ✅ Checklist de Activación

- [ ] Ejecuté el script SQL `insertar-accesibilidad.sql`
- [ ] Verifiqué que los datos se insertaron correctamente
- [ ] Reinicié el servidor de desarrollo
- [ ] Probé con un usuario de rol 4 (debe ver botones)
- [ ] Probé con un usuario de rol 1 (NO debe ver botones)
- [ ] El header funciona correctamente

## 🎉 ¡Listo!

El sistema de control de acceso está activo. Ahora puedes:
- Agregar más accesibilidades según necesites
- Asignar permisos a diferentes roles
- Proteger nuevas rutas y componentes
- Ver la documentación para casos de uso avanzados
