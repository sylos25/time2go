import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../src/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const {
        tipDoc,
        document,
        firstName,
        lastName,
        pais,
        telefono,
        email,
        password,
        confirmPassword,
        rememberMe,
        acceptTerms,
    } = req.body;

    try {
        console.log("Datos recibidos del frontend:", req.body);
      
        const result = await pool.query(
          `INSERT INTO tabla_usuarios (
            tipo_documento,
            numero_documento,
            nombres,
            apellidos,
            id_pais,
            telefono,
            correo,
            contrasena_hash,
            recordar,
            aceptar_terminos
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
          [
            tipDoc,
            document,
            firstName,
            lastName,
            pais,
            telefono,
            email,
            password,
            rememberMe,
            acceptTerms,
          ]
        );
      
        console.log("Usuario insertado:", result.rows[0]);
      
        res.status(201).json({ usuario: result.rows[0] });
      } catch (error) {
        console.error("Error al insertar usuario:", error);
        res.status(500).json({ error: "Error al crear usuario" });
      }
      
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}