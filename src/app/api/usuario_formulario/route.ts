import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import {
  generateEmailValidationToken,
  sendEmailValidationEmail,
} from "@/lib/email";

const PASSWORD_LENGTH = 8;

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length !== PASSWORD_LENGTH) errors.push("La contraseña debe tener exactamente 8 caracteres");
  if (!/[a-zA-Z]/.test(password)) errors.push("Debe incluir al menos una letra");
  if (!/[0-9]/.test(password)) errors.push("Debe incluir al menos un número");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("Debe incluir al menos un carácter especial");
  return errors;
}

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
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { error: `Contraseña inválida: ${passwordErrors.join(", ")}` },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
    const emailExists = await client.query(
      `SELECT 1 FROM tabla_usuarios_credenciales WHERE correo = $1 LIMIT 1`,
      [email]
    );

    const phoneExists = await client.query(
      `SELECT 1 FROM tabla_personas WHERE telefono = $1 LIMIT 1`,
      [telefono]
    );

    if ((emailExists.rowCount ?? 0) > 0 || (phoneExists.rowCount ?? 0) > 0) {
      const duplicates: string[] = [];

      if ((emailExists.rowCount ?? 0) > 0) {
        duplicates.push("correo");
      }

      if ((phoneExists.rowCount ?? 0) > 0) {
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
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO tabla_usuarios (
        terminos_condiciones,
        id_rol,
        estado
      ) VALUES ($1,$2,$3) RETURNING id_usuario, id_publico`,
      [terminosCondiciones, 1, true]
    );

    const usuarioBase = result.rows[0] as { id_usuario: string | number; id_publico: string };

    await client.query(
      `INSERT INTO tabla_personas (
        id_usuario,
        nombres,
        apellidos,
        id_pais,
        telefono
      ) VALUES ($1,$2,$3,$4,$5)`,
      [usuarioBase.id_usuario, firstName, lastName, pais, telefono]
    );

    await client.query(
      `INSERT INTO tabla_usuarios_credenciales (
        id_usuario,
        correo,
        contrasena_hash,
        validacion_correo
      ) VALUES ($1,$2,$3,$4) RETURNING correo`,
      [usuarioBase.id_usuario, email, hashedPassword, false]
    );

    await client.query("COMMIT");

    const usuarioInterno = {
      id_usuario: usuarioBase.id_usuario,
      id_publico: usuarioBase.id_publico,
      correo: email,
    };

    try {
      const token = generateEmailValidationToken();
      const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await pool.query(
        `INSERT INTO tabla_validacion_email_tokens (id_usuario, token, fecha_expiracion)
         VALUES ($1, $2, $3)`,
        [usuarioInterno.id_usuario, token, expirationTime]
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

    return NextResponse.json(
      {
        usuario: {
          id_publico: usuarioInterno.id_publico,
          correo: usuarioInterno.correo,
        },
      },
      { status: 201 }
    );
    } catch (txError) {
      await client.query("ROLLBACK");
      throw txError;
    } finally {
      client.release();
    }
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
