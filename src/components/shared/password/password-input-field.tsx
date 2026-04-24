import type { ChangeEventHandler, ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type PasswordInputFieldProps = {
  id: string
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  showPassword: boolean
  onToggleVisibility: () => void
  placeholder?: string
  maxLength?: number
  labelClassName?: string
  inputClassName?: string
  children?: ReactNode
}

export function PasswordInputField({
  id,
  label,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  placeholder = "••••••••",
  maxLength,
  labelClassName,
  inputClassName,
  children,
}: PasswordInputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn("font-medium", labelClassName)}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          className={cn("pr-10", inputClassName)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {children}
    </div>
  )
}
