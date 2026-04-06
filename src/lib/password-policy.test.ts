import { describe, expect, it } from "vitest"

import {
  getPasswordPolicyMessage,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePasswordPolicy,
} from "./password-policy"

describe("validatePasswordPolicy", () => {
  it("acepta una contraseña válida", () => {
    const result = validatePasswordPolicy("Abcd1234!")

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("rechaza cuando no cumple largo mínimo", () => {
    const result = validatePasswordPolicy("A1!")

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain(
      `La contraseña debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres`
    )
  })

  it("rechaza cuando falta letra, número o caracter especial", () => {
    const onlyLetters = validatePasswordPolicy("abcdefgh")
    const withoutSpecial = validatePasswordPolicy("Abcd1234")
    const withoutNumber = validatePasswordPolicy("Abcdefg!")

    expect(onlyLetters.errors).toContain("Debe incluir al menos un número")
    expect(onlyLetters.errors).toContain("Debe incluir al menos un carácter especial")
    expect(withoutSpecial.errors).toContain("Debe incluir al menos un carácter especial")
    expect(withoutNumber.errors).toContain("Debe incluir al menos un número")
  })
})

describe("getPasswordPolicyMessage", () => {
  it("retorna el mensaje estándar con límites por defecto", () => {
    expect(getPasswordPolicyMessage()).toBe(
      "La contraseña debe tener entre 8 y 20 caracteres e incluir al menos una letra, un número y un carácter especial."
    )
  })

  it("permite construir el mensaje con límites personalizados", () => {
    expect(getPasswordPolicyMessage(10, 30)).toBe(
      "La contraseña debe tener entre 10 y 30 caracteres e incluir al menos una letra, un número y un carácter especial."
    )
  })
})
