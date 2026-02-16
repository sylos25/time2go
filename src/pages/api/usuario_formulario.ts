import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendEmailValidationEmail, generateEmailValidationToken } from "@/lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const {
        firstName,
        lastName,
        pais,
        telefono,
        email,
        password,
        terminosCondiciones,
    } = req.body;

    try {
        console.log("Datos recibidos del frontend:", req.body);
        // Check for existing email / phone before inserting
        const dupCheck = await pool.query(
          `SELECT correo, telefono FROM tabla_usuarios WHERE correo = $1 OR telefono = $2`,
          [email, telefono]
        );

        if ((dupCheck?.rowCount ?? 0) > 0) {
          const duplicates: string[] = [];
          const rows = dupCheck.rows;
          if (rows.some((r: any) => r.correo === email)) duplicates.push('correo');
          if (rows.some((r: any) => r.telefono === telefono)) duplicates.push('telefono');

          const fieldNames = duplicates.map((d) => {
            if (d === 'correo') return 'correo electrónico';
            if (d === 'telefono') return 'teléfono';
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
            nombres,
            apellidos,
            id_pais,
            telefono,
            correo,
            contrasena_hash,
            terminos_condiciones,
            id_rol,
            estado
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id_usuario, id_publico, correo`,
          [
            firstName,
            lastName,
            pais,
            telefono,
            email,
            hashedPassword,
            terminosCondiciones,
            1,
            true,
          ]
        );
      
        const usuario = result.rows[0];
        console.log("Usuario insertado:", usuario);

        // Generar token de validación y enviar email
        try {
          const token = generateEmailValidationToken();
          const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

          // Guardar el token en la base de datos
          await pool.query(
            `INSERT INTO tabla_validacion_email_tokens (id_usuario, token, fecha_expiracion)
             VALUES ($1, $2, $3)`,
            [usuario.id_usuario, token, expirationTime]
          );

          // Obtener la URL base del sitio
          const protocol = req.headers['x-forwarded-proto'] || 'http';
          const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
          const baseUrl = `${protocol}://${host}`;

          // Enviar el email de validación
          const emailSent = await sendEmailValidationEmail(email, token, baseUrl);

          if (emailSent) {
            console.log("Email de validación enviado a:", email);
          } else {
            console.error("Error al enviar email de validación");
          }
        } catch (emailError) {
          console.error("Error en el proceso de validación de email:", emailError);
          // No es un error crítico, el usuario se creó exitosamente
        }
      
        res.status(201).json({ usuario });
      } catch (error: any) {
        console.error("Error al insertar usuario:", error);
        // Postgres unique violation code is 23505
        if (error && error.code === '23505') {
          const detail = String(error.detail || '');
          const constraint = String(error.constraint || '');
          const duplicates: string[] = [];
          if (detail.toLowerCase().includes('correo') || constraint.toLowerCase().includes('correo')) duplicates.push('correo');
          if (detail.toLowerCase().includes('telefono') || constraint.toLowerCase().includes('telefono')) duplicates.push('telefono');

          const fieldNames = duplicates.map((d) => {
            if (d === 'correo') return 'correo electrónico';
            if (d === 'telefono') return 'teléfono';
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