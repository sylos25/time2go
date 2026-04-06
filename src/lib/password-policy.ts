export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 20

const PASSWORD_LETTER_REGEX = /[a-zA-Z]/
const PASSWORD_NUMBER_REGEX = /[0-9]/
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/

export type PasswordValidationResult = {
  isValid: boolean
  errors: string[]
}

export function validatePasswordPolicy(
  password: string,
  minLength = PASSWORD_MIN_LENGTH,
  maxLength = PASSWORD_MAX_LENGTH
): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < minLength || password.length > maxLength) {
    errors.push(`La contraseña debe tener entre ${minLength} y ${maxLength} caracteres`)
  }
  if (!PASSWORD_LETTER_REGEX.test(password)) errors.push("Debe incluir al menos una letra")
  if (!PASSWORD_NUMBER_REGEX.test(password)) errors.push("Debe incluir al menos un número")
  if (!PASSWORD_SPECIAL_REGEX.test(password)) errors.push("Debe incluir al menos un carácter especial")

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function getPasswordPolicyMessage(
  minLength = PASSWORD_MIN_LENGTH,
  maxLength = PASSWORD_MAX_LENGTH
): string {
  return `La contraseña debe tener entre ${minLength} y ${maxLength} caracteres e incluir al menos una letra, un número y un carácter especial.`
}
