# Ejemplos de Uso del Sistema de Permisos

## 1. Proteger Rutas de API

### Ejemplo: Proteger endpoint de creación de eventos

```typescript
// src/app/api/events/create/route.ts
import { NextResponse } from "next/server";
import { requirePermission, PERMISSION_IDS } from "@/lib/permissions";
import pool from "@/lib/db";

export async function POST(req: Request) {
  // Verificar permisos antes de procesar la solicitud
  const permissionError = await requirePermission(req, PERMISSION_IDS.CREAR_EVENTOS);
  if (permissionError) {
    return permissionError; // Retorna 401 o 403
  }

  // El usuario tiene permiso, continuar con la lógica
  try {
    const body = await req.json();
    // ... lógica para crear evento
    
    return NextResponse.json({ ok: true, message: "Evento creado" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Error al crear evento" },
      { status: 500 }
    );
  }
}
```

### Ejemplo: Endpoint para editar eventos

```typescript
// src/app/api/events/[id]/route.ts
import { NextResponse } from "next/server";
import { requirePermission, PERMISSION_IDS } from "@/lib/permissions";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const permissionError = await requirePermission(req, PERMISSION_IDS.EDITAR_EVENTOS);
  if (permissionError) return permissionError;

  // Lógica de edición
  // ...
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const permissionError = await requirePermission(req, PERMISSION_IDS.ELIMINAR_EVENTOS);
  if (permissionError) return permissionError;

  // Lógica de eliminación
  // ...
}
```

## 2. Usar en Componentes de Cliente

### Ejemplo: Proteger botones y acciones

```tsx
// src/components/event-card.tsx
"use client"

import { usePermission, PERMISSIONS } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";

export function EventCard({ event, userRole }: { event: any; userRole: number }) {
  const { hasAccess: canEdit } = usePermission(PERMISSIONS.EDITAR_EVENTOS, userRole);
  const { hasAccess: canDelete } = usePermission(PERMISSIONS.ELIMINAR_EVENTOS, userRole);

  return (
    <div className="event-card">
      <h3>{event.nombre_evento}</h3>
      <p>{event.descripcion}</p>
      
      <div className="actions">
        {canEdit && (
          <Button onClick={() => handleEdit(event.id)}>
            Editar
          </Button>
        )}
        
        {canDelete && (
          <Button variant="destructive" onClick={() => handleDelete(event.id)}>
            Eliminar
          </Button>
        )}
      </div>
    </div>
  );
}
```

### Ejemplo: Proteger navegación

```tsx
// src/components/sidebar.tsx
"use client"

import { usePermission, PERMISSIONS } from "@/hooks/use-permissions";
import Link from "next/link";

export function Sidebar({ userRole }: { userRole: number }) {
  const { hasAccess: canViewDashboard } = usePermission(PERMISSIONS.VER_DASHBOARD, userRole);
  const { hasAccess: canViewStats } = usePermission(PERMISSIONS.VER_ESTADISTICAS, userRole);
  const { hasAccess: canManageUsers } = usePermission(PERMISSIONS.GESTIONAR_USUARIOS, userRole);

  return (
    <nav>
      {canViewDashboard && (
        <Link href="/dashboard">
          Dashboard
        </Link>
      )}
      
      {canViewStats && (
        <Link href="/estadisticas">
          Estadísticas
        </Link>
      )}
      
      {canManageUsers && (
        <Link href="/usuarios">
          Gestionar Usuarios
        </Link>
      )}
    </nav>
  );
}
```

## 3. Verificación Manual de Permisos

### Ejemplo: Verificar antes de una acción

```tsx
"use client"

import { checkPermission, PERMISSIONS } from "@/hooks/use-permissions";

async function handleSubmit() {
  // Verificar permiso justo antes de la acción
  const canCreate = await checkPermission(PERMISSIONS.CREAR_EVENTOS);
  
  if (!canCreate) {
    alert("No tienes permiso para crear eventos");
    return;
  }

  // Proceder con la creación
  const response = await fetch("/api/events/create", {
    method: "POST",
    body: JSON.stringify(eventData),
  });
  
  // ...
}
```

## 4. Proteger Páginas Completas (Server Components)

### Ejemplo: Página de dashboard protegida

```tsx
// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { checkUserPermission, PERMISSION_IDS } from "@/lib/permissions";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  // Crear un Request mock para verificar permisos
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth");
  }

  // Nota: En Server Components, necesitas una implementación diferente
  // Esta es una aproximación, ajusta según tu arquitectura
  
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Contenido del dashboard */}
    </div>
  );
}
```

## 5. Hooks Avanzados

### Ejemplo: Hook personalizado para múltiples permisos

```typescript
// src/hooks/use-multi-permissions.ts
import { usePermission, PERMISSIONS } from "./use-permissions";

export function useMultiPermissions(userRole: number) {
  const { hasAccess: canCreate } = usePermission(PERMISSIONS.CREAR_EVENTOS, userRole);
  const { hasAccess: canEdit } = usePermission(PERMISSIONS.EDITAR_EVENTOS, userRole);
  const { hasAccess: canDelete } = usePermission(PERMISSIONS.ELIMINAR_EVENTOS, userRole);
  const { hasAccess: canViewDashboard } = usePermission(PERMISSIONS.VER_DASHBOARD, userRole);
  const { hasAccess: canManageUsers } = usePermission(PERMISSIONS.GESTIONAR_USUARIOS, userRole);

  return {
    canCreate,
    canEdit,
    canDelete,
    canViewDashboard,
    canManageUsers,
    isAdmin: canManageUsers, // Consideramos admin si puede gestionar usuarios
  };
}
```

### Uso del hook múltiple:

```tsx
"use client"

import { useMultiPermissions } from "@/hooks/use-multi-permissions";

export function EventManager({ userRole }: { userRole: number }) {
  const permissions = useMultiPermissions(userRole);

  return (
    <div>
      {permissions.canCreate && <CreateEventButton />}
      {permissions.canEdit && <EditEventButton />}
      {permissions.canDelete && <DeleteEventButton />}
      {permissions.isAdmin && <AdminPanel />}
    </div>
  );
}
```

## 6. Manejo de Loading States

### Ejemplo: Mostrar loading mientras se verifican permisos

```tsx
"use client"

import { usePermission, PERMISSIONS } from "@/hooks/use-permissions";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedContent({ userRole }: { userRole: number }) {
  const { hasAccess, isLoading } = usePermission(PERMISSIONS.VER_DASHBOARD, userRole);

  if (isLoading) {
    return <Skeleton className="w-full h-64" />;
  }

  if (!hasAccess) {
    return (
      <div className="text-center p-8">
        <h2>Acceso Denegado</h2>
        <p>No tienes permiso para ver este contenido.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Contenido protegido */}
    </div>
  );
}
```

## 7. Combinación de Permisos (OR/AND)

### Ejemplo: Mostrar contenido si tiene CUALQUIERA de los permisos

```tsx
"use client"

import { usePermission, PERMISSIONS } from "@/hooks/use-permissions";

export function ContentEditor({ userRole }: { userRole: number }) {
  const { hasAccess: canEdit } = usePermission(PERMISSIONS.EDITAR_EVENTOS, userRole);
  const { hasAccess: canDelete } = usePermission(PERMISSIONS.ELIMINAR_EVENTOS, userRole);

  // Mostrar si tiene alguno de los dos permisos
  const canManageContent = canEdit || canDelete;

  if (!canManageContent) {
    return null; // No mostrar nada
  }

  return (
    <div className="content-editor">
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </div>
  );
}
```

### Ejemplo: Requerir TODOS los permisos (AND)

```tsx
"use client"

import { usePermission, PERMISSIONS } from "@/hooks/use-permissions";

export function AdminPanel({ userRole }: { userRole: number }) {
  const { hasAccess: canManageUsers } = usePermission(PERMISSIONS.GESTIONAR_USUARIOS, userRole);
  const { hasAccess: canViewStats } = usePermission(PERMISSIONS.VER_ESTADISTICAS, userRole);

  // Solo mostrar si tiene ambos permisos
  if (!canManageUsers || !canViewStats) {
    return (
      <div>No tienes todos los permisos necesarios para acceder al panel de administración.</div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Panel completo */}
    </div>
  );
}
```

## 8. Testing

### Ejemplo: Test de permisos

```typescript
// __tests__/permissions.test.ts
import { checkPermission, PERMISSIONS } from "@/hooks/use-permissions";

describe("Permissions System", () => {
  beforeEach(() => {
    // Mock localStorage
    localStorage.setItem("token", "fake-token");
  });

  it("should allow admin to create events", async () => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ hasAccess: true }),
      })
    ) as jest.Mock;

    const canCreate = await checkPermission(PERMISSIONS.CREAR_EVENTOS, 4);
    expect(canCreate).toBe(true);
  });

  it("should deny regular user from accessing dashboard", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ hasAccess: false }),
      })
    ) as jest.Mock;

    const canViewDashboard = await checkPermission(PERMISSIONS.VER_DASHBOARD, 1);
    expect(canViewDashboard).toBe(false);
  });
});
```

## Notas Importantes

1. **Siempre valida en el backend**: El frontend es solo para UX, la seguridad real está en el servidor
2. **Cache de permisos**: Considera implementar cache para evitar múltiples llamadas
3. **Actualizar permisos**: Cuando un usuario cambie de rol, limpia el cache y recarga permisos
4. **Feedback al usuario**: Muestra mensajes claros cuando no tenga permisos
5. **Logging**: Registra intentos de acceso no autorizado para auditoría
