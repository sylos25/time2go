import { useState, useEffect } from 'react';

/**
 * Hook para verificar permisos de acceso basados en la tabla de accesibilidad
 * @param idAccesibilidad - ID de la accesibilidad a verificar (ej: 1 crear evento, 4 dashboard)
 * @param idRol - (opcional) ID del rol. Si no se proporciona, se usa el del usuario autenticado
 * @returns objeto con hasAccess (boolean) e isLoading (boolean)
 */
export function usePermission(idAccesibilidad: number | null, idRol?: number) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!idAccesibilidad) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    const checkPermission = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          id_accesibilidad: String(idAccesibilidad),
        });

        if (idRol !== undefined) {
          params.append('id_rol', String(idRol));
        }

        const response = await fetch(`/api/permissions/check?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setHasAccess(data.hasAccess || false);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [idAccesibilidad, idRol]);

  return { hasAccess, isLoading };
}

/**
 * Función helper para verificar permisos de forma síncrona
 * Útil cuando ya tienes el rol del usuario
 */
export async function checkPermission(
  idAccesibilidad: number,
  idRol?: number
): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      id_accesibilidad: String(idAccesibilidad),
    });

    if (idRol !== undefined) {
      params.append('id_rol', String(idRol));
    }

    const response = await fetch(`/api/permissions/check?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.hasAccess || false;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Constantes para los IDs de accesibilidad
 * Sincronizado con tabla_accesibilidad_menu:
 *  1 Crear Evento | 2 Dashboard | 3 Resumen General | 4 Gestión de Eventos
 */
export const PERMISSIONS = {
  CREAR_EVENTOS: 1,
  VER_DASHBOARD: 2,
  RESUMEN_GENERAL: 3,
  GESTIONAR_EVENTOS: 4,
} as const;
