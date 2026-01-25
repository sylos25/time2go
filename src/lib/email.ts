import nodemailer from "nodemailer"

// Configurar el transporte de correo
// Usa variables de entorno para configurar tu proveedor de email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
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


export async function sendResetPasswordEmail(email: string, newPassword: string): Promise<boolean> {
  try {
    // Validar configuración de email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("Email no configurado: falta EMAIL_USER o EMAIL_PASSWORD")
      return false
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Time2Go - Esta es tu nueva contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #2563eb, #9333ea, #7c3aed); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h2 style="margin: 0;">Restablecimiento de Contraseña</h2>
          </div>
          <div style="padding: 20px; background: #f9fafb; border-radius: 0 0 8px 8px;">
            <p>Hola,</p>
            <p>Has solicitado restablecer tu contraseña en Time2Go. Tu nueva contraseña temporal es:</p>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <p style="margin: 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #1f2937;">
                ${newPassword}
              </p>
            </div>
            <p style="color: #666;">
              <strong>Por seguridad:</strong> Te recomendamos cambiar esta contraseña en tu próximo inicio de sesión.
            </p>
            <p>Si no solicitaste este cambio, por favor ignora este correo.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
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
