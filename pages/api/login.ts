import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import bcrypt from "bcrypt";

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
      const q = `
        SELECT numero_documento, correo, nombres, contrasena_hash
        FROM tabla_usuarios
        WHERE correo = $1
        LIMIT 1
      `;
      const result = await client.query(q, [email]);
      if (result.rowCount === 0) return res.status(401).json({ message: "Credenciales inválidas" });

      const user = result.rows[0];
      const hash = user.contrasena_hash;
      if (!hash || typeof hash !== "string" || hash.trim() === "") {
        console.warn("Login: hash de contraseña ausente para usuario:", user.numero_documento ?? user.correo);
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const match = await bcrypt.compare(String(password), hash);
      if (!match) return res.status(401).json({ message: "Credenciales inválidas" });

      // Generate JWT token so client can store session in localStorage
      const jwt = require('jsonwebtoken');
      const secret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || 'dev-secret';
      const expiresIn = 60 * 30; // 30 minutes
      // Use numero_documento as the stable user identifier in tokens
      const token = jwt.sign({ numero_documento: user.numero_documento, name: user.nombres || user.correo.split('@')[0] }, secret, { expiresIn });

      return res.status(200).json({
        success: true,
        token,
        numero_documento: user.numero_documento,
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
        name: user.nombres || user.correo.split("@")[0],
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Error interno" });
  }
}