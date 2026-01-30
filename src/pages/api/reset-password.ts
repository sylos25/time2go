import { NextApiRequest, NextApiResponse } from "next"
import { Pool } from "pg"
import bcrypt from "bcrypt"
import { sendResetPasswordEmail, generateRandomPassword } from "@/lib/email"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Método no permitido" })
  }

  try {
    const { email } = req.body

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Correo electrónico requerido" })
    }

    const client = await pool.connect()
    try {
      const userQuery = `
        SELECT numero_documento, correo, nombres
        FROM tabla_usuarios
        WHERE correo = $1
        LIMIT 1
      `
      const userResult = await client.query(userQuery, [email])

      if (userResult.rowCount === 0) {
        return res.status(200).json({
          success: true,
          message: "Si el correo existe, recibirás una nueva contraseña",
        })
      }

      const user = userResult.rows[0]


      const newPassword = generateRandomPassword()
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Actualizar contraseña en la base de datos
      const updateQuery = `
        UPDATE tabla_usuarios
        SET contrasena_hash = $1
        WHERE numero_documento = $2
      `
      await client.query(updateQuery, [hashedPassword, user.numero_documento])


      const emailSent = await sendResetPasswordEmail(email, newPassword)

      if (!emailSent) {
        console.error("Error enviando correo a:", email)
        return res.status(500).json({
          error: "Error al enviar el correo. Intenta nuevamente más tarde.",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Nueva contraseña enviada al correo",
      })
    } finally {
      client.release()
    }
  } catch (err) {
    console.error("Reset password error:", err)
    return res.status(500).json({ error: "Error interno del servidor" })
  }
}
