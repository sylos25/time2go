import { CheckCircle2, Circle } from "lucide-react"

import {
  hasPasswordLetter,
  hasPasswordNumber,
  hasPasswordSpecial,
  isPasswordLengthValid,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/password-policy"
import { cn } from "@/lib/utils"

type PasswordRequirementsProps = {
  password: string
  className?: string
}

export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  const rules = [
    {
      label: "Entre 8 y 20 caracteres",
      isMet: isPasswordLengthValid(password, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH),
    },
    {
      label: "Al menos una letra",
      isMet: hasPasswordLetter(password),
    },
    {
      label: "Al menos un número",
      isMet: hasPasswordNumber(password),
    },
    {
      label: "Al menos un carácter especial",
      isMet: hasPasswordSpecial(password),
    },
  ]

  return (
    <div className={cn("rounded-lg border border-border bg-muted/30 p-4", className)}>
      <p className="text-sm font-semibold text-foreground">Requisitos de contraseña</p>
      <ul className="mt-3 space-y-2">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-2 text-sm",
              rule.isMet ? "text-green-700 dark:text-green-400" : "text-muted-foreground"
            )}
          >
            {rule.isMet ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <Circle className="h-4 w-4 shrink-0" aria-hidden />
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
