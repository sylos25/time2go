import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

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
        // Check for existing email / phone / document before inserting
        const dupCheck = await pool.query(
          `SELECT correo, telefono, numero_documento FROM tabla_usuarios WHERE correo = $1 OR telefono = $2 OR numero_documento = $3`,
          [email, telefono, document]
        );

        if ((dupCheck?.rowCount ?? 0) > 0) {
          const duplicates: string[] = [];
          const rows = dupCheck.rows;
          if (rows.some((r: any) => r.correo === email)) duplicates.push('correo');
          if (rows.some((r: any) => r.telefono === telefono)) duplicates.push('telefono');
          if (rows.some((r: any) => r.numero_documento === document)) duplicates.push('numero_documento');

          const fieldNames = duplicates.map((d) => {
            if (d === 'correo') return 'correo electrónico';
            if (d === 'telefono') return 'teléfono';
            if (d === 'numero_documento') return 'número de documento';
            return d;
          });

          res.status(409).json({
            error: `Los siguientes campos ya están registrados: ${fieldNames.join(', ')}`,
            duplicates,
          });
          return;
        }
      
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
          `INSERT INTO tabla_usuarios (
            tipo_documento,
            numero_documento,
            nombres,
            apellidos,
            id_pais,
            telefono,
            correo,
            contrasena_hash
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
          [
            tipDoc,
            document,
            firstName,
            lastName,
            pais,
            telefono,
            email,
            hashedPassword,
          ]
        );
      
        console.log("Usuario insertado:", result.rows[0]);
      
        res.status(201).json({ usuario: result.rows[0] });
      } catch (error: any) {
        console.error("Error al insertar usuario:", error);
        // Postgres unique violation code is 23505
        if (error && error.code === '23505') {
          const detail = String(error.detail || '');
          const constraint = String(error.constraint || '');
          const duplicates: string[] = [];
          if (detail.toLowerCase().includes('correo') || constraint.toLowerCase().includes('correo')) duplicates.push('correo');
          if (detail.toLowerCase().includes('telefono') || constraint.toLowerCase().includes('telefono')) duplicates.push('telefono');
          if (
            detail.toLowerCase().includes('numero_documento') ||
            detail.toLowerCase().includes('numero documento') ||
            constraint.toLowerCase().includes('numero_documento') ||
            constraint.toLowerCase().includes('pkey') && detail.toLowerCase().includes('numero')
          ) {
            duplicates.push('numero_documento');
          }

          const fieldNames = duplicates.map((d) => {
            if (d === 'correo') return 'correo electrónico';
            if (d === 'telefono') return 'teléfono';
            if (d === 'numero_documento') return 'número de documento';
            return d;
          });

          if (duplicates.length > 0) {
            res.status(409).json({ error: `Los siguientes campos ya están registrados: ${fieldNames.join(', ')}`, duplicates });
            return;
          }

          // fallback generic unique violation
          res.status(409).json({ error: 'Valor duplicado en la base de datos' });
          return;
        }
        res.status(500).json({ error: "Error al crear usuario" });
      }
      
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}