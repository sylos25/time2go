export const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
]

export const EMAIL_MAX_LENGTH = 50
export const PASSWORD_MAX_LENGTH = 30
export const REGISTER_PASSWORD_LENGTH = 8

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_LETTER_REGEX = /[a-zA-Z]/
const PASSWORD_NUMBER_REGEX = /[0-9]/
const PASSWORD_SPECIAL_REGEX = /[!#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/

export const EMAIL_INVALID_FORMAT_ERROR = "Formato de correo inválido"
export const EMAIL_INVALID_DOMAIN_ERROR = "Solo se permiten dominios: gmail.com, outlook.com, yahoo.com, icloud.com, proton.me, protonmail.com."

export const sanitizeEmail = (value: string, maxLength = EMAIL_MAX_LENGTH): string => {
  return value.toLowerCase().replace(/\s+/g, "").replace(/[<>]/g, "").slice(0, maxLength)
}

export const sanitizePassword = (value: string, maxLength = PASSWORD_MAX_LENGTH): string => {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").replace(/@/g, "").slice(0, maxLength)
}

export const isAllowedEmail = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase()
  return ALLOWED_EMAIL_DOMAINS.includes(domain || "")
}

export const getEmailError = (email: string): string => {
  if (!EMAIL_REGEX.test(email)) return EMAIL_INVALID_FORMAT_ERROR
  if (!isAllowedEmail(email)) return EMAIL_INVALID_DOMAIN_ERROR
  return ""
}

export const hasPasswordLetter = (password: string): boolean => PASSWORD_LETTER_REGEX.test(password)

export const hasPasswordNumber = (password: string): boolean => PASSWORD_NUMBER_REGEX.test(password)

export const hasPasswordSpecial = (password: string): boolean => PASSWORD_SPECIAL_REGEX.test(password)

export const validateRegisterPassword = (
  password: string,
  requiredLength = REGISTER_PASSWORD_LENGTH
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  if (password.length !== requiredLength) errors.push(`Debe tener exactamente ${requiredLength} caracteres`)
  if (!hasPasswordLetter(password)) errors.push("Al menos una letra")
  if (!hasPasswordNumber(password)) errors.push("Al menos un número")
  if (!hasPasswordSpecial(password)) errors.push("Al menos un carácter especial")
  return { isValid: errors.length === 0, errors }
}
