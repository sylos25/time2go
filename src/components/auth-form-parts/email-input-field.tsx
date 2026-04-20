import type { ChangeEventHandler, FocusEventHandler } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EmailInputFieldProps = {
  id?: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onBlur: FocusEventHandler<HTMLInputElement>
  maxLength: number
  hasError: boolean
  errorMessage?: string
  showRequiredError?: boolean
  placeholder?: string
}

export function EmailInputField({
  id = "email",
  value,
  onChange,
  onBlur,
  maxLength,
  hasError,
  errorMessage,
  showRequiredError = false,
  placeholder = "ejemplo@correo.com",
}: EmailInputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">Email</Label>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoCapitalize="none"
        maxLength={maxLength}
        className={`w-full rounded-md border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 ${
          hasError ? "border-red-500 ring-red-500" : "border-gray-300"
        }`}
        placeholder={placeholder}
      />
      {errorMessage && <p className="-mt-0.5 text-xs text-red-500">{errorMessage}</p>}
      {showRequiredError && !errorMessage && <p className="-mt-0.5 text-xs text-red-500">Este campo es obligatorio</p>}
    </div>
  )
}
