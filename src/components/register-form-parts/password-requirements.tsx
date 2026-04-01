import {
  PASSWORD_MAX_LENGTH,
  hasPasswordLetter,
  hasPasswordNumber,
  hasPasswordSpecial,
} from "@/lib/auth-form-validation"

type PasswordRequirementsProps = {
  password: string
  minLength: number
  isValid: boolean
}

export function PasswordRequirements({ password, minLength, isValid }: PasswordRequirementsProps) {
  const lengthValid = password.length >= minLength && password.length <= PASSWORD_MAX_LENGTH

  return (
    <div className={`rounded-lg border p-3 text-sm ${isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
      <p className={`mb-2 font-semibold ${isValid ? "text-green-700" : "text-red-700"}`}>Requisitos de contraseña:</p>
      <ul className="space-y-1 text-xs">
        <li className={`flex items-center gap-2 ${hasPasswordLetter(password) ? "text-green-600" : "text-red-600"}`}>
          {hasPasswordLetter(password) ? "✓" : "✗"} Al menos una letra
        </li>
        <li className={`flex items-center gap-2 ${hasPasswordNumber(password) ? "text-green-600" : "text-red-600"}`}>
          {hasPasswordNumber(password) ? "✓" : "✗"} Al menos un número
        </li>
        <li className={`flex items-center gap-2 ${hasPasswordSpecial(password) ? "text-green-600" : "text-red-600"}`}>
          {hasPasswordSpecial(password) ? "✓" : "✗"} Al menos un carácter especial
        </li>
        <li className={`flex items-center gap-2 ${lengthValid ? "text-green-600" : "text-red-600"}`}>
          {lengthValid ? "✓" : "✗"} Entre 8 y 20 caracteres ({password.length})
        </li>
      </ul>
    </div>
  )
}
