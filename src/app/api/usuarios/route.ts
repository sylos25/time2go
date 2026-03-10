import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

export async function GET(req: Request) {
  try {
    // Accept Bearer token or session cookie (like /api/me)
    const authHeader = req.headers.get("authorization") || "";
    let requesterId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const payload = verifyToken(token);
      const userIdFromToken = payload?.id_usuario;
      if (!payload || !userIdFromToken) {
        return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
      }
      requesterId = String(userIdFromToken);
    } else {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        const token = cookies["token"];
        if (token) {
          const payload = verifyToken(token);
          const userIdFromToken = payload?.id_usuario;
          if (payload && userIdFromToken) {
            requesterId = String(userIdFromToken);
          }
        }
      }
      if (!requesterId) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
      }
    }

    const roleRes = await pool.query(
      "SELECT id_rol FROM tabla_usuarios WHERE id_usuario = $1 LIMIT 1",
      [requesterId]
    );
    const role = roleRes.rows && roleRes.rows[0] ? Number(roleRes.rows[0].id_rol) : null;
    if (role !== 4 && role !== 3) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const roleRaw = url.searchParams.get("role");
    const rolesRaw = url.searchParams.get("roles");
    const estadoRaw = url.searchParams.get("estado");
    const qParam = (url.searchParams.get("q") || "").trim();

    const pageRaw = Number(url.searchParams.get("page") || "1");
    const pageSizeRaw = Number(url.searchParams.get("pageSize") || "25");

    const roleParam = roleRaw && Number.isFinite(Number(roleRaw)) ? Number(roleRaw) : null;
    const rolesParam = rolesRaw
      ? rolesRaw
          .split(",")
          .map((value) => Number(value.trim()))
          .filter((value) => Number.isFinite(value))
      : null;
    const estadoParam =
      estadoRaw === null ? null : String(estadoRaw).toLowerCase() === "true";
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
    const pageSize =
      Number.isFinite(pageSizeRaw) && pageSizeRaw > 0
        ? Math.min(Math.floor(pageSizeRaw), 200)
        : 25;

    const result = await pool.query(
      `SELECT fn_listar_usuarios_paginado_json($1, $2, $3, $4, $5, $6) AS payload`,
      [
        roleParam,
        rolesParam && rolesParam.length > 0 ? rolesParam : null,
        estadoParam,
        qParam || null,
        page,
        pageSize,
      ]
    );

    const payload = result.rows?.[0]?.payload || {
      usuarios: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 1,
        hasPrev: false,
        hasNext: false,
      },
    };

    return NextResponse.json({ ok: true, ...payload });
  } catch (err) {
    console.error("/api/usuarios error:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}