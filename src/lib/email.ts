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


export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
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
    const bannerUrl = `https://res.cloudinary.com/dljthy97e/image/upload/v1770842202/banner_top_azaedp.jpg`

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Time2Go - Valida tu correo electrónico",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${bannerUrl}" alt="Banner" style="width: 100%; border-radius: 8px 8px 0 0; display: block;" />
          <div style="background-color: #e11d48; padding: 20px; border-radius: 0 0 8px 8px; color: white; text-align: center;">
            <h2 style="margin: 0;">Validación de Correo Electrónico</h2>
          </div>
          <div style="padding: 20px; background: #FBFEFF; border-radius: 0 0 8px 8px;">
            <p>¡Hola!</p>
            <p>Gracias por registrarte en Time2Go. Para completar tu registro, necesitas validar tu correo electrónico.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${validationUrl}" onmouseover="this.style.backgroundColor='#15803d'" onmouseout="this.style.backgroundColor='#16a34a'" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
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

export async function sendPasswordResetTokenEmail(
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

    const resetUrl = `${baseUrl}/reset-password?token=${token}`
    const bannerUrl = "https://res.cloudinary.com/dljthy97e/image/upload/v1770842202/banner_top_azaedp.jpg"

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Time2Go - Restablece tu contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${bannerUrl}" alt="Banner" style="width: 100%; border-radius: 8px 8px 0 0; display: block;" />
          <div style="background-color: #e11d48; padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h2 style="margin: 0;">Restablecimiento de Contraseña</h2>
          </div>
          <div style="padding: 20px; background: #FBFEFF; border-radius: 0 0 8px 8px;">
            <p>Hola,</p>
            <p>Has solicitado restablecer tu contraseña en Time2Go.</p>
            <p>Haz clic en el siguiente botón para continuar con el proceso:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" onmouseover="this.style.backgroundColor='#15803d'" onmouseout="this.style.backgroundColor='#16a34a'" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="color: #666;">O copia y pega este enlace en tu navegador:</p>
            <p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #15803d;">
              ${resetUrl}
            </p>
            <p style="color: #666;">
              <strong>Por seguridad:</strong> Este enlace expira en 10 minutos y solo puede utilizarse una vez.
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
    const bannerUrl = "https://res.cloudinary.com/dljthy97e/image/upload/v1770842202/banner_top_azaedp.jpg"

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
          <div style="background-color: #e11d48; padding: 20px; border-radius: 0 0 8px 8px; color: white;">
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

function sanitizeEmailHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>")
}

export async function sendEventApprovedEmail(
  email: string,
  eventName: string,
  baseUrl: string,
  eventId: number
): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("Email no configurado: falta EMAIL_USER o EMAIL_PASSWORD")
      return false
    }

    const bannerUrl = "https://res.cloudinary.com/dljthy97e/image/upload/v1770842202/banner_top_azaedp.jpg"
    const eventUrl = `${baseUrl.replace(/\/$/, "")}/eventos/${eventId}`
    const safeName = sanitizeEmailHtml(eventName)

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Time2Go - Evento aprobado: ${eventName.replace(/\s+/g, " ").slice(0, 120)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 15px;">
          <img src="${bannerUrl}" alt="Banner" style="width: 100%; border-radius: 8px 8px 0 0; display: block;" />
          <div style="background-color: #e11d48; padding: 20px; border-radius: 0; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 22px;">Evento aprobado</h2>
          </div>
          <div style="padding: 24px; background: #FBFEFF; border-radius: 0 0 8px 8px;">
            <p style="font-size: 15px;">¡Hola!</p>
            <p style="font-size: 15px;">Tu evento en <strong>Time2Go</strong> ya fue <strong>aprobado</strong> y puede mostrarse en el catálogo público.</p>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #15803d; margin: 20px 0;">
              <p style="margin: 0; color: #111827; font-size: 16px; font-weight: bold;">${safeName}</p>
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${eventUrl}" onmouseover="this.style.backgroundColor='#15803d'" onmouseout="this.style.backgroundColor='#16a34a'" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Ver evento
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">O abre este enlace en tu navegador:</p>
            <p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #15803d;">${eventUrl}</p>
            <hr style="border: none; border-top: 1px solid #F7FCFF; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">Este es un correo automático, por favor no respondas directamente a este mensaje.</p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Correo de evento aprobado enviado:", info.response)
    return true
  } catch (error) {
    console.error("Error enviando correo de evento aprobado:", error)
    return false
  }
}

export async function sendBanNotificationEmail(
  email: string,
  motivo: string,
  inicioBan?: Date,
  finBan?: Date,
  extra?: { categoriaBan?: string }
): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("Email no configurado: falta EMAIL_USER o EMAIL_PASSWORD")
      return false
    }

    const bannerUrl = "https://res.cloudinary.com/dljthy97e/image/upload/v1770842202/banner_top_azaedp.jpg"

    const categoria = (extra?.categoriaBan || "").trim()
    const sanitizedCategoria = categoria ? sanitizeEmailHtml(categoria) : ""

    const sanitizedMotivo = sanitizeEmailHtml(motivo)

    const formatDate = (date: Date) =>
      date.toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Bogota",
      })

    const fechaInicio = inicioBan ? formatDate(inicioBan) : formatDate(new Date())
    const fechaFin = finBan ? formatDate(finBan) : null

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Time2Go - Tu cuenta ha sido desactivada",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 15px;">
          <img src="${bannerUrl}" alt="Banner" style="width: 100%; border-radius: 8px 8px 0 0; display: block;" />
          <div style="background-color: #e11d48; padding: 20px; border-radius: 0; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 22px;">Cuenta Desactivada</h2>
          </div>
          <div style="padding: 24px; background: #FBFEFF; border-radius: 0 0 8px 8px;">
            <p style="font-size: 15px;">¡Hola!</p>
            <p style="font-size: 15px;">Te informamos que tu cuenta en <strong>Time2Go</strong> ha sido <strong>desactivada</strong> según el registro de moderación:</p>
            ${
              sanitizedCategoria
                ? `<div style="background: #fef2f2; padding: 12px 15px; border-radius: 6px; margin: 16px 0 0 0;">
              <p style="margin: 0; color: #991b1b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; font-weight: bold;">Categoría</p>
              <p style="margin: 6px 0 0 0; color: #111827; font-size: 15px;">${sanitizedCategoria}</p>
            </div>`
                : ""
            }
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; font-weight: bold;">Motivo</p>
              <p style="margin: 0; color: #111827; font-size: 15px;">
                ${sanitizedMotivo}
              </p>
            </div>
            <div style="background: #f9fafb; padding: 14px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0 0 6px 0; font-size: 14px; color: #555;">
                🕐 <strong>Inicio del ban:</strong> ${fechaInicio}
              </p>
              ${fechaFin ? `
              <p style="margin: 0; font-size: 14px; color: #555;">
                🕐 <strong>Fin del ban:</strong> ${fechaFin}
              </p>` : ""}
            </div>
            <p style="font-size: 15px; color: #666;">
              Si crees que esto es un error o deseas obtener más información, por favor contacta a nuestro equipo de soporte. Estaremos felices de ayudarte a resolver cualquier inconveniente.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${process.env.EMAIL_USER}" onmouseover="this.style.backgroundColor='#15803d'" onmouseout="this.style.backgroundColor='#16a34a'" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Contactar Soporte
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #F7FCFF; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              Este es un correo automático, por favor no respondas directamente a este mensaje.
            </p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Correo de baneo enviado:", info.response)
    return true
  } catch (error) {
    console.error("Error enviando correo de baneo:", error)
    return false
  }
}

export async function sendUnbanNotificationEmail(
  email: string
): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("Email no configurado: falta EMAIL_USER o EMAIL_PASSWORD")
      return false
    }

    const bannerUrl = "https://res.cloudinary.com/dljthy97e/image/upload/v1770842202/banner_top_azaedp.jpg"

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Time2Go - Tu cuenta ha sido reactivada",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 15px;">
          <img src="${bannerUrl}" alt="Banner" style="width: 100%; border-radius: 8px 8px 0 0; display: block;" />
          <div style="background-color: #e11d48; padding: 20px; border-radius: 0; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 22px;">Cuenta Reactivada</h2>
          </div>
          <div style="padding: 24px; background: #FBFEFF; border-radius: 0 0 8px 8px;">
            <p style="font-size: 15px;">¡Hola!</p>
            <p style="font-size: 15px;">Nos complace informarte que tu cuenta en <strong>Time2Go</strong> ha sido <strong>reactivada</strong> y ya puedes acceder con normalidad.</p>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #15803d; margin: 20px 0;">
              <p style="margin: 0; color: #111827; font-size: 15px;">
                🕐 <strong>Fecha de reactivación:</strong> ${new Date().toLocaleString("es-CO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "America/Bogota",
                })}
              </p>
            </div>
            <p style="font-size: 15px; color: #666;">
              Si tienes alguna duda o necesitas ayuda, no dudes en contactar a nuestro equipo de soporte.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${process.env.EMAIL_USER}" onmouseover="this.style.backgroundColor='#15803d'" onmouseout="this.style.backgroundColor='#16a34a'" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 15px;">
                Contactar Soporte
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #F7FCFF; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              Este es un correo automático, por favor no respondas directamente a este mensaje.
            </p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Correo de desbaneo enviado:", info.response)
    return true
  } catch (error) {
    console.error("Error enviando correo de desbaneo:", error)
    return false
  }
}