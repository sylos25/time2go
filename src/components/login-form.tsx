"use client"

import { AlertCircle } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"
import { EmailInputField } from "@/components/auth-form-parts/email-input-field"
import { PasswordInputField } from "@/components/auth-form-parts/password-input-field"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ResetPasswordDialog } from "@/components/reset-password-dialog"
import { useLoginForm } from "@/hooks/use-login-form"

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    email,
    emailValidationError,
    error,
    password,
    rememberMe,
    resetPasswordOpen,
    shouldRenderTurnstile,
    showPassword,
    touchedFields,
    turnstileError,
    turnstileKey,
    turnstileSiteKey,
    turnstileStrictMode,
    EMAIL_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
    handleBlur,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    setRememberMe,
    setResetPasswordOpen,
    setShowPassword,
    setTurnstileError,
    setTurnstileKey,
    setTurnstileToken,
  } = useLoginForm(onSuccess)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <EmailInputField
        value={email}
        onChange={handleEmailChange}
        onBlur={() => handleBlur("email")}
        maxLength={EMAIL_MAX_LENGTH}
        hasError={touchedFields.email && !email}
        showRequiredError={touchedFields.email && !email}
      />

      <PasswordInputField
        id="password"
        label="Contraseña"
        value={password}
        onChange={handlePasswordChange}
        onBlur={() => handleBlur("password")}
        maxLength={PASSWORD_MAX_LENGTH}
        showPassword={showPassword}
        onToggleVisibility={() => setShowPassword(!showPassword)}
        hasError={touchedFields.password && !password}
        errorMessage={touchedFields.password && !password ? "Este campo es obligatorio" : undefined}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            className="cursor-pointer"
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <Label htmlFor="rememberMe" className="text-sm text-muted-foreground">
            Recordarme
          </Label>
        </div>
        <Button 
          type="button"
          variant="link" 
          className="text-sm text-green-600 hover:text-lime-500 p-0 cursor-pointer"
          onClick={() => setResetPasswordOpen(true)}
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </div>

      {/* Turnstile Captcha */}
      {shouldRenderTurnstile && (
        <div className="flex justify-center">
          <Turnstile
            key={turnstileKey}
            siteKey={turnstileSiteKey}
            onSuccess={(token) => {
              setTurnstileToken(token)
              setTurnstileError("")
            }}
            onError={() => {
              setTurnstileToken(null)
              if (turnstileStrictMode) {
                setTurnstileError("Error al cargar el captcha. Por favor, intenta nuevamente.")
              }
            }}
            onExpire={() => {
              setTurnstileToken(null)
              if (turnstileStrictMode) {
                setTurnstileError("La verificación del captcha ha expirado. Por favor, intenta nuevamente.")
              }
            }}
          />
        </div>
      )}

      {(turnstileError || error) && (
        <div className="space-y-2">
          {turnstileError && (
            <div className="w-full px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600" />
              <p className="text-xs leading-snug text-red-700">{turnstileError}</p>
            </div>
          )}

          {error && (
            <div className={`w-full px-3 py-2 rounded-lg flex items-start gap-2 ${
              emailValidationError 
                ? "bg-yellow-50 border border-yellow-200" 
                : "bg-red-50 border border-red-200"
            }`}>
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                emailValidationError ? "text-yellow-600" : "text-red-600"
              }`} />
              <p className={`text-xs leading-snug ${
                emailValidationError ? "text-yellow-800" : "text-red-700"
              }`}>
                {error}
              </p>
            </div>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-80 bg-gradient-to-tr from-fuchsia-700 to-red-500 text-white font-medium py-6 rounded-sm text-lg transition-all duration-300 ease-in-out hover:scale-103 hover:from-fuchsia-600 hover:to-red-500 hover:text-white"
      >
        Iniciar Sesión
      </Button>

      <ResetPasswordDialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen} />
    </form>
  )
}
