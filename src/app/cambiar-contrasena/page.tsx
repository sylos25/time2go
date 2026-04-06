"use client"

import { useRouter } from "next/navigation"
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
import { PasswordPolicyHint } from "@/components/shared/password/password-policy-hint"
import { StatusMessage } from "@/components/shared/password/status-message"
import { useChangePasswordPage } from "@/hooks/use-change-password-page"

export default function CambiarContrasenaPage() {
  const router = useRouter()
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
  } = useChangePasswordPage(router)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isLoggedIn={true} userName="Usuario" />
        <div className="pt-32 pb-12 px-4 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
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
            <Button
              onClick={() => router.push("/")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Ir al Inicio
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
          <button
            onClick={() => router.push("/perfil")}
            className="flex items-center gap-2 text-green-700 hover:text-lime-500 mb-6 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al perfil</span>
          </button>

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
                    inputClassName="border-input text-foreground"
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
                    inputClassName="border-input text-foreground"
                    placeholder="Ingresa tu nueva contraseña"
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
                    inputClassName="border-input text-foreground"
                    placeholder="Confirma tu nueva contraseña"
                  />

                  {/* Botones */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-gradient-to-tr from-fuchsia-700 to-red-500 hover:from-fuchsia-600 hover:to-red-500 hover:scale-102 text-white font-medium flex items-center justify-center gap-2"
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
                      type="button"
                      onClick={() => router.push("/perfil")}
                      variant="outline"
                      className="flex-1 border-border text-foreground hover:bg-accent hover:scale-102 font-medium"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>

                {/* Información adicional */}
                <div className="mt-6">
                  <h3 className="font-semibold text-foreground mb-2">Recomendaciones de Seguridad:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Usa entre 8 y 20 caracteres</li>
                    <li>• Incluye al menos una letra, un número y un carácter especial</li>
                    <li>• Evita usar información personal (nombre, fecha de nacimiento)</li>
                    <li>• No compartas tu contraseña con nadie</li>
                  </ul>
                  <PasswordPolicyHint className="mt-3 p-4" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
