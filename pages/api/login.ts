import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Email y contraseña requeridos" });

    const client = await pool.connect();
    try {
      // Usar los nombres reales de columna sin alias
      const q = `
        SELECT numero_documento, correo, nombres, contrasena_hash
        FROM tabla_usuarios
        WHERE correo = $1
        LIMIT 1
      `;
      const result = await client.query(q, [email]);
      if (result.rowCount === 0) return res.status(401).json({ message: "Credenciales inválidas" });

      const user = result.rows[0];

      // usar el nombre real del campo del hash
      const hash = user.contrasena_hash;
      if (!hash || typeof hash !== "string" || hash.trim() === "") {
        console.warn("Login: hash de contraseña ausente para usuario:", user.numero_documento ?? user.correo);
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const match = await bcrypt.compare(String(password), hash);
      if (!match) return res.status(401).json({ message: "Credenciales inválidas" });

      const jwtSecret = process.env.JWT_SECRET as string;
      if (!jwtSecret) return res.status(500).json({ message: "JWT_SECRET no configurado" });

      const expiresInSec = 60 * 60 * 24 * 7; // 7 días
      // incluir nombre real en el payload
      const token = jwt.sign(
        { id: user.numero_documento, email: user.correo, name: user.nombres },
        jwtSecret,
        { expiresIn: expiresInSec }
      );
      const expiresAt = Math.floor(Date.now() / 1000) + expiresInSec;

      return res.status(200).json({
        token,
        name: user.nombres || user.correo.split("@")[0],
        expiresAt,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Error interno" });
  }
}