import type { NextApiRequest, NextApiResponse } from "next"
import { serializeCookie } from "@/lib/cookies"
import pool from "@/lib/db"

const GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { credential } = req.body || {}
    if (!credential) return res.status(400).json({ message: "Token requerido" })

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
      return res.status(500).json({ message: "Google Client ID no configurado" })
    }

    const verifyRes = await fetch(
      `${GOOGLE_TOKENINFO_URL}?id_token=${encodeURIComponent(String(credential))}`
    )

    if (!verifyRes.ok) {
      return res.status(401).json({ message: "Token de Google invalido" })
    }

    const tokenInfo = await verifyRes.json()

    if (tokenInfo.aud !== clientId) {
      return res.status(401).json({ message: "Audience no valido" })
    }

    const emailVerified =
      tokenInfo.email_verified === true || tokenInfo.email_verified === "true"
    if (!emailVerified) {
      return res.status(403).json({ message: "Email de Google no verificado" })
    }

    const igGoogle = String(tokenInfo.sub || "").trim()
    const email = String(tokenInfo.email || "").trim()
    const nombres = String(tokenInfo.given_name || "").trim()
    const apellidos = String(tokenInfo.family_name || "").trim()

    if (!igGoogle || !email) {
      return res.status(400).json({ message: "Datos de Google incompletos" })
    }

    const client = await pool.connect()
    try {
      const findQuery = `
        SELECT id_usuario, id_publico, correo, nombres, validacion_correo, ig_google
        FROM tabla_usuarios
        WHERE ig_google = $1 OR correo = $2
        LIMIT 1
      `
      const existing = await client.query(findQuery, [igGoogle, email])

      let user = existing.rows[0]

      if (user) {
        const updateQuery = `
          UPDATE tabla_usuarios
          SET ig_google = COALESCE(ig_google, $1),
              validacion_correo = TRUE,
              nombres = COALESCE(nombres, $3),
              apellidos = COALESCE(apellidos, $4),
              fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE id_usuario = $2
          RETURNING id_usuario, id_publico, correo, nombres
        `
        const updated = await client.query(updateQuery, [
          igGoogle,
          user.id_usuario,
          nombres || null,
          apellidos || null,
        ])
        user = updated.rows[0]
      } else {
        const insertQuery = `
          INSERT INTO tabla_usuarios (
            ig_google,
            nombres,
            apellidos,
            correo,
            validacion_correo,
            terminos_condiciones,
            estado,
            id_rol,
            fecha_registro,
            fecha_actualizacion
          ) VALUES ($1,$2,$3,$4,TRUE,TRUE,TRUE,1,NOW(),NOW())
          RETURNING id_usuario, id_publico, correo, nombres
        `
        const created = await client.query(insertQuery, [
          igGoogle,
          nombres || null,
          apellidos || null,
          email,
        ])
        user = created.rows[0]
      }

      const jwt = require("jsonwebtoken")
      const secret =
        process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "dev-secret"
      const expiresIn = 60 * 30
      const numeroDocumento = String(user.id_usuario)
      const token = jwt.sign(
        { numero_documento: numeroDocumento, name: user.nombres || email.split("@")[0] },
        secret,
        { expiresIn }
      )

      const secure = process.env.NODE_ENV === "production"
      const cookie = serializeCookie("token", token, {
        maxAge: expiresIn,
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        domain: process.env.COOKIE_DOMAIN,
      })

      res.setHeader("Set-Cookie", cookie)

      return res.status(200).json({
        success: true,
        token,
        numero_documento: numeroDocumento,
        id_publico: user.id_publico,
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
        name: user.nombres || email.split("@")[0],
      })
    } finally {
      client.release()
    }
  } catch (err) {
    console.error("Login Google error:", err)
    return res.status(500).json({ message: "Error interno" })
  }
}
