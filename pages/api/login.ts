// pages/api/login.ts (si usas Next.js) o en tu ruta Express
import type { NextApiRequest, NextApiResponse } from "next";
import { loginSchema } from "@/schemas/loginSchema";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Datos inválidos", errors: parseResult.error.format() });
  }

  const { email, password } = parseResult.data;

  try {
    const result = await pool.query("SELECT * FROM tabla_usuarios WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "2h" }
    );

    return res.status(200).json({ message: "Login exitoso", token });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
}