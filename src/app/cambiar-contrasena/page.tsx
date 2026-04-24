"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  AlertCircle,
  Lock,
  Loader2,
  ArrowLeft,
  Rat,
} from "lucide-react"
import { getRoleBadgeClass } from "@/lib/role-badge"
import { PasswordInputField } from "@/components/shared/password/password-input-field"
import { PasswordRequirements } from "@/components/register-form-parts/password-requirements"
import { StatusMessage } from "@/components/shared/password/status-message"
import { useChangePasswordPage } from "@/hooks/use-change-password-page"
import { PASSWORD_MIN_LENGTH, validatePasswordPolicy } from "@/lib/password-policy"

export default function CambiarContrasenaPage() {
  const {
    user,
    loading,
    error,
    currentPassword,
    newPassword,
    confirmPassword,
    showPasswords,
    saving,
    successMessage,
    passwordError,
    passwordMaxLength,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    handleSubmit,
  } = useChangePasswordPage()
  const passwordValidation = validatePasswordPolicy(newPassword)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isLoggedIn={true} userName="Usuario" />
        <div className="pt-32 pb-12 px-4 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header isLoggedIn={true} userName="Usuario" />
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-foreground text-lg font-medium mb-4">
              {error || "Error al cargar los datos"}
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
              <Link href="/">Ir al Inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={true} userName={user.nombres} />

      <div className="pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Botón Atrás */}
          <Link
            href="/perfil"
            className="inline-flex items-center gap-2 text-green-700 hover:text-lime-500 mb-6 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al perfil</span>
          </Link>

          {/* Success Message */}
          <StatusMessage message={successMessage} variant="success" className="mb-6 p-4" />

          {/* Contenedor Principal */}
          <Card className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            {/* Encabezado */}
            <div 
              className="h-32 bg-cover bg-center bg-no-repeat" 
              style={{
                backgroundImage: 'url(/images/banner_perfil.jpg)'
              }}
            />

            <div className="px-8 pb-8">
              {/* Avatar y Nombre */}
              <div className="flex items-end gap-6 mb-8 relative -mt-12">
                <div className="w-32 h-32 rounded-lg bg-card flex items-center justify-center border-4 border-green-700 shadow-lg">
                  <Rat className="h-16 w-16 text-lime-500" />
                </div>
                <div className="flex-1 pb-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-tr from-green-600 to-lime-400 text-transparent bg-clip-text">
                    {user.nombres} {user.apellidos}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    {user.fecha_registro && (
                      <span className="text-muted-foreground text-sm">
                        Registrado el {new Date(user.fecha_registro).toLocaleDateString("es-ES")}
                      </span>
                    )}
                    <span
                      className={`inline-block px-3 py-1 ${getRoleBadgeClass(
                        user.nombre_rol,
                        user.id_rol,
                      )} text-white text-sm font-medium rounded-full`}
                    >
                      {user.nombre_rol || "Usuario"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulario de Cambio de Contraseña */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-lime-500">Cambiar Contraseña</h2>

                <StatusMessage message={passwordError} className="p-4" />

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Contraseña Actual */}
                  <PasswordInputField
                    id="current-password"
                    label="Contraseña Actual"
                    value={currentPassword}
                    maxLength={passwordMaxLength}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    showPassword={showPasswords.current}
                    onToggleVisibility={() => togglePasswordVisibility("current")}
                    labelClassName="text-green-700"
                    inputClassName="border-input text-foreground focus-visible:border-green-500 focus-visible:ring-green-500"
                    placeholder="Ingresa tu contraseña actual"
                  />

                  {/* Contraseña Nueva */}
                  <PasswordInputField
                    id="new-password"
                    label="Contraseña Nueva"
                    value={newPassword}
                    maxLength={passwordMaxLength}
                    onChange={(e) => setNewPassword(e.target.value)}
                    showPassword={showPasswords.new}
                    onToggleVisibility={() => togglePasswordVisibility("new")}
                    labelClassName="text-green-700"
                    inputClassName="border-input text-foreground focus-visible:border-green-500 focus-visible:ring-green-500"
                    placeholder="Ingresa tu nueva contraseña"
                  />

                  <PasswordRequirements
                    password={newPassword}
                    minLength={PASSWORD_MIN_LENGTH}
                    isValid={passwordValidation.isValid}
                  />

                  {/* Confirmar Contraseña */}
                  <PasswordInputField
                    id="confirm-password"
                    label="Confirmar Contraseña"
                    value={confirmPassword}
                    maxLength={passwordMaxLength}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    showPassword={showPasswords.confirm}
                    onToggleVisibility={() => togglePasswordVisibility("confirm")}
                    labelClassName="text-green-700"
                    inputClassName="border-input text-foreground focus-visible:border-green-500 focus-visible:ring-green-500"
                    placeholder="Confirma tu nueva contraseña"
                  >
                    {confirmPassword && (
                      <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                        newPassword === confirmPassword
                          ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                      }`}>
                        {newPassword === confirmPassword
                          ? <><span className="text-green-600 dark:text-green-400 font-semibold">✓</span><p className="text-green-700 dark:text-green-400">Las contraseñas coinciden</p></>
                          : <><span className="text-red-600 dark:text-red-400 font-semibold">✗</span><p className="text-red-700 dark:text-red-400">Las contraseñas no coinciden</p></>}
                      </div>
                    )}
                  </PasswordInputField>

                  {/* Botones */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-rose-600 hover:bg-rose-500 hover:scale-102 text-white font-medium flex items-center justify-center gap-2 transition-transform"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Cambiar Contraseña
                        </>
                      )}
                    </Button>
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      className="flex-1 border-green-600 dark:border-green-500 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-400 hover:scale-102 font-medium transition-transform"
                    >
                      <Link href="/perfil">Cancelar</Link>
                    </Button>
                  </div>
                </form>


              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
