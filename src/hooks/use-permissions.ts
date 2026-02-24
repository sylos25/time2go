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
        const token = localStorage.getItem('token');
        
        const params = new URLSearchParams({
          id_accesibilidad: String(idAccesibilidad),
        });

        if (idRol !== undefined) {
          params.append('id_rol', String(idRol));
        }

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/permissions/check?${params.toString()}`, {
          headers,
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
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams({
      id_accesibilidad: String(idAccesibilidad),
    });

    if (idRol !== undefined) {
      params.append('id_rol', String(idRol));
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/permissions/check?${params.toString()}`, {
      headers,
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
 */
export const PERMISSIONS = {
  CREAR_EVENTOS: 1,
  VER_DASHBOARD: 4,
  GESTIONAR_EVENTOS: 3,
} as const;
