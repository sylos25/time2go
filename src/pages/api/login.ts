import { NextApiRequest, NextApiResponse } from "next";
import { serializeCookie } from "@/lib/cookies";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password, turnstileToken } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Email y contraseña requeridos" });

    // Verificar token de Cloudflare Turnstile
    const turnstileSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET
    if (!turnstileSecret) {
      console.warn('Turnstile secret no configurado; omitiendo verificación de captcha')
    } else {
      if (!turnstileToken) return res.status(400).json({ message: 'Captcha requerido' })

      const params = new URLSearchParams()
      params.append('secret', turnstileSecret)
      params.append('response', String(turnstileToken))
      // incluir IP remota si está disponible
      const remoteIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
      if (remoteIp) params.append('remoteip', String(remoteIp))

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      const verifyJson = await verifyRes.json()
      if (!verifyJson.success) {
        console.warn('Turnstile verification failed', verifyJson)
        return res.status(403).json({ message: 'Falló la verificación del captcha', error: 'turnstile_failed', details: verifyJson['error-codes'] })
      }
    }

    const client = await pool.connect();
    try {
      const q = `
        SELECT id_usuario, correo, nombres, contrasena_hash, validacion_correo
        FROM tabla_usuarios
        WHERE correo = $1
        LIMIT 1
      `;
      const result = await client.query(q, [email]);
      if (result.rowCount === 0) return res.status(401).json({ message: "Credenciales inválidas" });

      const user = result.rows[0];
      
      // Verificar que el email ha sido validado
      if (!user.validacion_correo) {
        return res.status(403).json({ 
          error: "Email no validado",
          message: "Debes validar tu correo electrónico antes de poder acceder. Revisa tu buzón de entrada y haz clic en el link de validación.",
          requiresEmailValidation: true
        });
      }

      const hash = user.contrasena_hash;
      if (!hash || typeof hash !== "string" || hash.trim() === "") {
        console.warn("Login: hash de contraseña ausente para usuario:", user.id_usuario ?? user.correo);
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const match = await bcrypt.compare(String(password), hash);
      if (!match) return res.status(401).json({ message: "Credenciales inválidas" });

      // Generate JWT token so client can store session in localStorage
      const jwt = require('jsonwebtoken');
      const secret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || 'dev-secret';
      const expiresIn = 60 * 30; // 30 minutes
      // Keep the token claim name for compatibility, but store id_usuario
      const token = jwt.sign({ numero_documento: user.id_usuario, name: user.nombres || user.correo.split('@')[0] }, secret, { expiresIn });

      const secure = process.env.NODE_ENV === 'production';
      const cookie = serializeCookie('token', token, {
        maxAge: expiresIn,
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
      });

      res.setHeader('Set-Cookie', cookie);

      return res.status(200).json({
        success: true,
        token,
        numero_documento: user.id_usuario,
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