import type { ChangeEventHandler, FocusEventHandler, ReactNode } from "react"

import { Eye, EyeOff, Lock } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PasswordInputFieldProps = {
  id: string
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onBlur: FocusEventHandler<HTMLInputElement>
  maxLength: number
  showPassword: boolean
  onToggleVisibility: () => void
  hasError: boolean
  errorMessage?: string
  placeholder?: string
  children?: ReactNode
}

export function PasswordInputField({
  id,
  label,
  value,
  onChange,
  onBlur,
  maxLength,
  showPassword,
  onToggleVisibility,
  hasError,
  errorMessage,
  placeholder = "••••••••",
  children,
}: PasswordInputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={maxLength}
          className={`w-full rounded-md border py-2 pl-10 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 ${
            hasError ? "border-red-500 ring-red-500" : "border-gray-300"
          }`}
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {errorMessage && <p className="mt-0.5 text-xs text-red-500">{errorMessage}</p>}
      {children}
    </div>
  )
}
