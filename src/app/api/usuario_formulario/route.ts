import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import {
  generateEmailValidationToken,
  sendEmailValidationEmail,
} from "@/lib/email";

export async function POST(req: Request) {
  const {
    firstName,
    lastName,
    pais,
    telefono,
    email,
    password,
    terminosCondiciones,
  } = (await req.json()) as {
    firstName: string;
    lastName: string;
    pais: string | number;
    telefono: string;
    email: string;
    password: string;
    terminosCondiciones: boolean;
  };

  try {
    const dupCheck = await pool.query(
      `SELECT correo, telefono FROM tabla_usuarios WHERE correo = $1 OR telefono = $2`,
      [email, telefono]
    );

    if ((dupCheck.rowCount ?? 0) > 0) {
      const duplicates: string[] = [];
      const rows = dupCheck.rows as Array<{ correo?: string; telefono?: string }>;

      if (rows.some((row) => row.correo === email)) {
        duplicates.push("correo");
      }

      if (rows.some((row) => row.telefono === telefono)) {
        duplicates.push("telefono");
      }

      const fieldNames = duplicates.map((duplicate) => {
        if (duplicate === "correo") {
          return "correo electrónico";
        }
        if (duplicate === "telefono") {
          return "teléfono";
        }
        return duplicate;
      });

      return NextResponse.json(
        {
          error: `Los siguientes campos ya están registrados: ${fieldNames.join(", ")}`,
          duplicates,
        },
        { status: 409 }
      );
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

    const usuario = result.rows[0] as { id_usuario: string | number; correo: string };

    try {
      const token = generateEmailValidationToken();
      const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await pool.query(
        `INSERT INTO tabla_validacion_email_tokens (id_usuario, token, fecha_expiracion)
         VALUES ($1, $2, $3)`,
        [usuario.id_usuario, token, expirationTime]
      );

      const url = new URL(req.url);
      const baseUrl = `${url.protocol}//${url.host}`;

      const emailSent = await sendEmailValidationEmail(email, token, baseUrl);
      if (!emailSent) {
        console.error("Error al enviar email de validación");
      }
    } catch (emailError) {
      console.error("Error en validación de email:", emailError);
    }

    return NextResponse.json({ usuario }, { status: 201 });
  } catch (error: unknown) {
    const dbError = error as { code?: string; detail?: string; constraint?: string };

    if (dbError && dbError.code === "23505") {
      const detail = String(dbError.detail || "").toLowerCase();
      const constraint = String(dbError.constraint || "").toLowerCase();
      const duplicates: string[] = [];

      if (detail.includes("correo") || constraint.includes("correo")) {
        duplicates.push("correo");
      }

      if (detail.includes("telefono") || constraint.includes("telefono")) {
        duplicates.push("telefono");
      }

      const fieldNames = duplicates.map((duplicate) => {
        if (duplicate === "correo") {
          return "correo electrónico";
        }
        if (duplicate === "telefono") {
          return "teléfono";
        }
        return duplicate;
      });

      if (duplicates.length > 0) {
        return NextResponse.json(
          {
            error: `Los siguientes campos ya están registrados: ${fieldNames.join(
              ", "
            )}`,
            duplicates,
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Valor duplicado en la base de datos" },
        { status: 409 }
      );
    }

    console.error("Error al insertar usuario:", error);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
