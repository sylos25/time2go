const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ContactPayload = {
  name: string
  email: string
  subject: string
  message: string
}

export function parseContactPayload(body: unknown): ContactPayload {
  const source = (body ?? {}) as Record<string, unknown>

  return {
    name: String(source.name || "").trim(),
    email: String(source.email || "").trim().toLowerCase(),
    subject: String(source.subject || "").trim(),
    message: String(source.message || "").trim(),
  }
}

export function validateContactPayload(payload: ContactPayload): string | null {
  if (!payload.name || !payload.email || !payload.subject || !payload.message) {
    return "Todos los campos son obligatorios"
  }

  if (!EMAIL_REGEX.test(payload.email)) {
    return "Correo electrónico inválido"
  }

  if (payload.name.length > 120 || payload.subject.length > 200 || payload.message.length > 5000) {
    return "Uno o más campos superan la longitud permitida"
  }

  return null
}
