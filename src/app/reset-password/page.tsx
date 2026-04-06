"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

import { PasswordInputField } from "@/components/shared/password/password-input-field"
import { PasswordPolicyHint } from "@/components/shared/password/password-policy-hint"
import { StatusMessage } from "@/components/shared/password/status-message"
import { useResetPasswordPage } from "@/hooks/use-reset-password-page"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get("token") ?? ""
  const {
    loadingToken,
    tokenError,
    newPassword,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    submitting,
    error,
    success,
    passwordMaxLength,
    setNewPassword,
    setConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleSubmit,
  } = useResetPasswordPage(token, router)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-12 px-4">
        <div className="max-w-xl mx-auto">
          <Card className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div
              className="h-24 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url(/images/banner_perfil.jpg)" }}
            />

            <div className="p-6 md:p-8 space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-tr from-green-600 to-lime-500 bg-clip-text text-transparent">
                  Restablecer Contraseña
                </h1>
                <p className="text-muted-foreground mt-2">
                  Ingresa una nueva contraseña para tu cuenta.
                </p>
              </div>

              {loadingToken && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Validando enlace de recuperación...</span>
                </div>
              )}

              {!loadingToken && tokenError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">No se puede usar este enlace</p>
                    <p className="text-red-600 text-sm mt-1">{tokenError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push("/auth")}
                    >
                      Volver a Iniciar Sesión
                    </Button>
                  </div>
                </div>
              )}

              {!loadingToken && !tokenError && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <PasswordInputField
                    id="new-password"
                    label="Nueva contraseña"
                    value={newPassword}
                    maxLength={passwordMaxLength}
                    onChange={(e) => setNewPassword(e.target.value)}
                    showPassword={showPassword}
                    onToggleVisibility={() => setShowPassword((prev) => !prev)}
                    placeholder="Ingresa tu nueva contraseña"
                    inputClassName="pr-10"
                  />

                  <PasswordInputField
                    id="confirm-password"
                    label="Confirmar contraseña"
                    value={confirmPassword}
                    maxLength={passwordMaxLength}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    showPassword={showConfirmPassword}
                    onToggleVisibility={() => setShowConfirmPassword((prev) => !prev)}
                    placeholder="Confirma tu nueva contraseña"
                    inputClassName="pr-10"
                  />

                  <PasswordPolicyHint />

                  <StatusMessage message={error} variant="error" />

                  <StatusMessage message={success} variant="success" />

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/auth")}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-tr from-green-600 to-lime-500 text-white"
                    >
                      {submitting ? "Guardando..." : "Guardar Contraseña"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
