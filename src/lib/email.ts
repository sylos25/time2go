import nodemailer from "nodemailer"
import crypto from "crypto"

// Configurar el transporte de correo
// Usa variables de entorno para configurar tu proveedor de email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    // Allow self-signed certificates in non-production environments (useful for dev)
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
})


export function generateRandomPassword(): string {
  const length = 12
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export function generateEmailValidationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}


export async function sendEmailValidationEmail(
  email: string,
  token: string,
  baseUrl: string
): Promise<boolean> {
  try {
    // Validar configuración de email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("Email no configurado: falta EMAIL_USER o EMAIL_PASSWORD")
      return false
    }

    const validationUrl = `${baseUrl}/validate-email?token=${token}`
    const bannerUrl = `${baseUrl.replace(/\/$/, "")}/images/banner_top.jpg`

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Time2Go - Valida tu correo electrónico",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${bannerUrl}" alt="Banner" style="width: 100%; border-radius: 8px 8px 0 0; display: block;" />
          <div style="background: linear-gradient(to bottom left, #a21caf, #dc2626); padding: 20px; border-radius: 0 0 8px 8px; color: white; text-align: center;">
            <h2 style="margin: 0;">Validación de Correo Electrónico</h2>
          </div>
          <div style="padding: 20px; background: #FBFEFF; border-radius: 0 0 8px 8px;">
            <p>¡Hola!</p>
            <p>Gracias por registrarte en Time2Go. Para completar tu registro, necesitas validar tu correo electrónico.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${validationUrl}" style="background: linear-gradient(to top right, #15803d, #84cc16); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Validar Correo Electrónico
              </a>
            </div>
            <p style="color: #666;">
              O copia y pega este enlace en tu navegador:
            </p>
            <p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #15803d;">
              ${validationUrl}
            </p>
            <hr style="border: none; border-top: 1px solid #F7FCFF; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              Este enlace expirará en 24 horas. Si no solicitaste este registro, por favor ignora este correo.
            </p>
          </div>
        </div>
      `,
    }


    try {
      await transporter.verify()
      console.log("Transporter verificado: listo para enviar correos")
    } catch (verifyError) {
      console.error("Fallo al verificar transporter:", verifyError)
      // continuar e intentar enviar para capturar el error real
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Correo de validación enviado:", info.response)
    return true
  } catch (error) {
    console.error("Error enviando correo de validación:", error)
    return false
  }
}

export async function sendResetPasswordEmail(email: string, newPassword: string): Promise<boolean> {
  try {
    // Validar configuración de email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("Email no configurado: falta EMAIL_USER o EMAIL_PASSWORD")
      return false
    }

    const appBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000"
    const bannerUrl = `${appBaseUrl.replace(/\/$/, "")}/images/banner_top.jpg`

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Time2Go - Esta es tu nueva contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${bannerUrl}" alt="Banner" style="width: 100%; border-radius: 8px 8px 0 0; display: block;" />
          <div style="background: linear-gradient(to bottom left, #a21caf, #dc2626); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h2 style="margin: 0;">Restablecimiento de Contraseña</h2>
          </div>
          <div style="padding: 20px; background: #FBFEFF; border-radius: 0 0 8px 8px;">
            <p>Hola,</p>
            <p>Has solicitado restablecer tu contraseña en Time2Go. Tu nueva contraseña temporal es:</p>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #15803d; margin: 20px 0;">
              <p style="margin: 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #84cc16;">
                ${newPassword}
              </p>
            </div>
            <p style="color: #666;">
              <strong>Por seguridad:</strong> Te recomendamos cambiar esta contraseña en tu próximo inicio de sesión.
            </p>
            <p>Si no solicitaste este cambio, por favor ignora este correo.</p>
            <hr style="border: none; border-top: 1px solid #F7FCFF; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              Este es un correo automático, por favor no respondas directamente a este mensaje.
            </p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Correo enviado:", info.response)
    return true
  } catch (error) {
    console.error("Error enviando correo:", error)
    return false
  }
}

export async function sendContactMessageEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("Email no configurado: falta EMAIL_USER o EMAIL_PASSWORD")
      return false
    }

    const appBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000"
    const bannerUrl = `${appBaseUrl.replace(/\/$/, "")}/images/banner_top.jpg`

    const sanitizedMessage = message
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>")

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Contacto Time2Go: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto;">
          <img src="${bannerUrl}" alt="Banner" style="width: 100%; border-radius: 8px 8px 0 0; display: block;" />
          <div style="background: linear-gradient(to bottom left, #a21caf, #dc2626); padding: 20px; border-radius: 0 0 8px 8px; color: white;">
            <h2 style="margin: 0;">Nuevo mensaje desde Contáctanos</h2>
          </div>
          <div style="padding: 20px; background: #FBFEFF; border-radius: 0 0 8px 8px; color: #111827;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Correo:</strong> ${email}</p>
            <p><strong>Asunto:</strong> ${subject}</p>
            <div style="margin-top: 16px; padding: 14px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px;">
              ${sanitizedMessage}
            </div>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Correo de contacto enviado:", info.response)
    return true
  } catch (error) {
    console.error("Error enviando correo de contacto:", error)
    return false
  }
}
