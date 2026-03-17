import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { checkUserPermission, PERMISSION_IDS } from "@/lib/permissions"

type RoleRow = {
  id_rol: number
  nombre_rol: string
}

type AccessRow = {
  id_accesibilidad: number
  nombre_accesibilidad: string
}

const MAX_PAGE_SIZE = 100

const ensureAdmin = async (req: Request) => {
  const permission = await checkUserPermission(req, PERMISSION_IDS.GESTIONAR_ROLES)
  if (!permission.hasAccess) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: permission.error || "No autorizado para gestionar roles" },
        { status: permission.error?.includes("autenticado") ? 401 : 403 }
      ),
    }
  }

  if (permission.userRole !== 4) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Solo el rol Administrador puede acceder a esta sección" },
        { status: 403 }
      ),
    }
  }

  return { ok: true, requesterUserId: Number(permission.userId) }
}

export async function GET(req: Request) {
  const auth = await ensureAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") || "").trim()
    const roleIdRaw = Number(searchParams.get("roleId") || "4")
    const roleId = Number.isFinite(roleIdRaw) ? roleIdRaw : 4

    const pageRaw = Number(searchParams.get("page") || "1")
    const pageSizeRaw = Number(searchParams.get("pageSize") || "25")

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
    const pageSize =
      Number.isFinite(pageSizeRaw) && pageSizeRaw > 0
        ? Math.min(Math.floor(pageSizeRaw), MAX_PAGE_SIZE)
        : 25
    const offset = (page - 1) * pageSize

    const rolesRes = await pool.query<RoleRow>(
      "SELECT id_rol, nombre_rol FROM tabla_roles ORDER BY id_rol ASC"
    )

    const roleExists = rolesRes.rows.some((row) => Number(row.id_rol) === roleId)
    if (!roleExists) {
      return NextResponse.json({ ok: false, message: "El rol seleccionado no existe" }, { status: 400 })
    }

    const accessRes = await pool.query<AccessRow>(
      "SELECT id_accesibilidad, nombre_accesibilidad FROM tabla_accesibilidad_menu ORDER BY id_accesibilidad ASC"
    )

    const roleAccessRes = await pool.query<{ id_accesibilidad: number }>(
      "SELECT id_accesibilidad FROM tabla_accesibilidad_menu_x_rol WHERE id_rol = $1 ORDER BY id_accesibilidad ASC",
      [roleId]
    )

    const whereSql = q
      ? `
        WHERE (
          CONCAT(COALESCE(p.nombres, ''), ' ', COALESCE(p.apellidos, '')) ILIKE $1
          OR COALESCE(c.correo, '') ILIKE $1
          OR CAST(u.id_usuario AS TEXT) ILIKE $1
        )
      `
      : ""

    const totalQuery = `
      SELECT COUNT(1)::int AS total
      FROM tabla_usuarios u
      LEFT JOIN tabla_personas p ON p.id_usuario = u.id_usuario
      LEFT JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
      ${whereSql}
    `

    const usersQuery = `
      SELECT
        u.id_usuario,
        u.id_rol,
        r.nombre_rol,
        u.estado,
        p.nombres,
        p.apellidos,
        c.correo
      FROM tabla_usuarios u
      LEFT JOIN tabla_personas p ON p.id_usuario = u.id_usuario
      LEFT JOIN tabla_usuarios_credenciales c ON c.id_usuario = u.id_usuario
      LEFT JOIN tabla_roles r ON r.id_rol = u.id_rol
      ${whereSql}
      ORDER BY u.id_usuario ASC
      LIMIT $${q ? 2 : 1}
      OFFSET $${q ? 3 : 2}
    `

    const totalParams: Array<string> = q ? [`%${q}%`] : []
    const usersParams: Array<string | number> = q ? [`%${q}%`, pageSize, offset] : [pageSize, offset]

    const [totalRes, usersRes] = await Promise.all([
      pool.query<{ total: number }>(totalQuery, totalParams),
      pool.query(usersQuery, usersParams),
    ])

    const total = Number(totalRes.rows?.[0]?.total || 0)
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return NextResponse.json({
      ok: true,
      users: usersRes.rows || [],
      roles: rolesRes.rows || [],
      accessibilityItems: accessRes.rows || [],
      selectedRoleId: roleId,
      selectedRoleAccessIds: roleAccessRes.rows.map((row) => Number(row.id_accesibilidad)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
    })
  } catch (error) {
    console.error("/api/admin/role-access GET error:", error)
    return NextResponse.json({ ok: false, message: "Error del servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const auth = await ensureAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const action = String(body?.action || "")

    if (action === "updateUserRole") {
      const userId = Number(body?.userId)
      const newRoleId = Number(body?.newRoleId)

      if (!Number.isFinite(userId) || userId <= 0 || !Number.isFinite(newRoleId) || newRoleId <= 0) {
        return NextResponse.json({ ok: false, message: "Parámetros inválidos" }, { status: 400 })
      }

      if (auth.requesterUserId === userId) {
        return NextResponse.json(
          { ok: false, message: "No puedes cambiar tu propio rol por seguridad" },
          { status: 400 }
        )
      }

      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        const roleExistsRes = await client.query(
          "SELECT 1 FROM tabla_roles WHERE id_rol = $1 LIMIT 1",
          [newRoleId]
        )
        if (!roleExistsRes.rows.length) {
          await client.query("ROLLBACK")
          return NextResponse.json({ ok: false, message: "El rol destino no existe" }, { status: 400 })
        }

        const userRes = await client.query<{ id_rol: number }>(
          "SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
          [userId]
        )
        if (!userRes.rows.length) {
          await client.query("ROLLBACK")
          return NextResponse.json({ ok: false, message: "Usuario no encontrado" }, { status: 404 })
        }

        const currentRole = Number(userRes.rows[0].id_rol)
        if (currentRole === 4 && newRoleId !== 4) {
          const adminCountRes = await client.query<{ count: string }>(
            "SELECT COUNT(1)::text AS count FROM tabla_usuarios WHERE id_rol = 4"
          )
          const adminCount = Number(adminCountRes.rows?.[0]?.count || 0)
          if (adminCount <= 1) {
            await client.query("ROLLBACK")
            return NextResponse.json(
              { ok: false, message: "Debe existir al menos un Administrador activo en el sistema" },
              { status: 400 }
            )
          }
        }

        await client.query(
          "UPDATE tabla_usuarios SET id_rol = $1, fecha_actualizacion = NOW() WHERE id_usuario = $2",
          [newRoleId, userId]
        )

        await client.query("COMMIT")
        return NextResponse.json({ ok: true, message: "Rol de usuario actualizado correctamente" })
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      } finally {
        client.release()
      }
    }

    if (action === "setRoleAccess") {
      const roleId = Number(body?.roleId)
      const accessIdsRaw = Array.isArray(body?.accessIds) ? body.accessIds : []

      if (!Number.isFinite(roleId) || roleId <= 0) {
        return NextResponse.json({ ok: false, message: "Rol inválido" }, { status: 400 })
      }

      if (roleId === 4) {
        return NextResponse.json(
          { ok: false, message: "Por seguridad, los permisos del rol Administrador no se pueden editar" },
          { status: 400 }
        )
      }

      const dedupedAccessIds = Array.from(
        new Set(
          accessIdsRaw
            .map((value: unknown) => Number(value))
            .filter((value: number) => Number.isFinite(value) && value > 0)
        )
      )

      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        const roleExistsRes = await client.query(
          "SELECT 1 FROM tabla_roles WHERE id_rol = $1 LIMIT 1",
          [roleId]
        )
        if (!roleExistsRes.rows.length) {
          await client.query("ROLLBACK")
          return NextResponse.json({ ok: false, message: "El rol seleccionado no existe" }, { status: 400 })
        }

        if (dedupedAccessIds.length > 0) {
          const validAccessRes = await client.query<{ id_accesibilidad: number }>(
            "SELECT id_accesibilidad FROM tabla_accesibilidad_menu WHERE id_accesibilidad = ANY($1::int[])",
            [dedupedAccessIds]
          )
          const validSet = new Set(validAccessRes.rows.map((row) => Number(row.id_accesibilidad)))
          const invalidIds = dedupedAccessIds.filter((id) => !validSet.has(id))
          if (invalidIds.length > 0) {
            await client.query("ROLLBACK")
            return NextResponse.json(
              { ok: false, message: `IDs de accesibilidad inválidos: ${invalidIds.join(", ")}` },
              { status: 400 }
            )
          }
        }

        await client.query("DELETE FROM tabla_accesibilidad_menu_x_rol WHERE id_rol = $1", [roleId])

        if (dedupedAccessIds.length > 0) {
          const baseIdRes = await client.query<{ next_id: number }>(
            "SELECT COALESCE(MAX(id_accesibilidad_menu_x_rol), 0) + 1 AS next_id FROM tabla_accesibilidad_menu_x_rol"
          )
          const nextId = Number(baseIdRes.rows?.[0]?.next_id || 1)

          const valuesSql: string[] = []
          const params: Array<number> = []

          dedupedAccessIds.forEach((accessId, index) => {
            const idValue = nextId + index
            const paramBase = index * 3
            valuesSql.push(`($${paramBase + 1}, $${paramBase + 2}, $${paramBase + 3}, NOW(), NOW())`)
            params.push(idValue, accessId, roleId)
          })

          await client.query(
            `INSERT INTO tabla_accesibilidad_menu_x_rol (id_accesibilidad_menu_x_rol, id_accesibilidad, id_rol, fecha_creacion, fecha_actualizacion)
             VALUES ${valuesSql.join(", ")}`,
            params
          )
        }

        await client.query("COMMIT")
        return NextResponse.json({ ok: true, message: "Permisos del rol actualizados correctamente" })
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      } finally {
        client.release()
      }
    }

    return NextResponse.json({ ok: false, message: "Acción no soportada" }, { status: 400 })
  } catch (error) {
    console.error("/api/admin/role-access PUT error:", error)
    return NextResponse.json({ ok: false, message: "Error del servidor" }, { status: 500 })
  }
}
