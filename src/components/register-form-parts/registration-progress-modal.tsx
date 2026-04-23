"use client"

import { CheckCircle2, Circle, Loader2, UserCheck } from "lucide-react"

export type RegisterStep = "idle" | "validating" | "creating" | "success"

interface RegistrationProgressModalProps {
  step: RegisterStep
}

const STEPS: { key: Exclude<RegisterStep, "idle">; label: string; sublabel: string }[] = [
  {
    key: "validating",
    label: "Verificando datos",
    sublabel: "Comprobando que todo esté correcto",
  },
  {
    key: "creating",
    label: "Creando tu cuenta",
    sublabel: "Registrando tus datos de forma segura",
  },
  {
    key: "success",
    label: "Cuenta creada exitosamente",
    sublabel: "Ya puedes iniciar sesión",
  },
]

const STEP_ORDER: Exclude<RegisterStep, "idle">[] = ["validating", "creating", "success"]

function getStepStatus(
  stepKey: Exclude<RegisterStep, "idle">,
  currentStep: RegisterStep,
): "done" | "active" | "pending" {
  const currentIndex = STEP_ORDER.indexOf(currentStep as Exclude<RegisterStep, "idle">)
  const stepIndex = STEP_ORDER.indexOf(stepKey)
  if (currentIndex === -1) return "pending"
  if (stepIndex < currentIndex) return "done"
  if (stepIndex === currentIndex) return "active"
  return "pending"
}

export function RegistrationProgressModal({ step }: RegistrationProgressModalProps) {
  if (step === "idle") return null

  const isSuccess = step === "success"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Progreso del registro"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-sm mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Barra de progreso superior */}
        <div className="h-1.5 bg-muted w-full">
          <div
            className="h-full bg-green-500 transition-all duration-700 ease-in-out rounded-full"
            style={{
              width:
                step === "validating" ? "33%" : step === "creating" ? "66%" : "100%",
            }}
          />
        </div>

        <div className="px-6 py-8 flex flex-col items-center gap-6">
          {/* Ícono central */}
          <div
            className={`flex items-center justify-center rounded-full transition-all duration-500 ${
              isSuccess
                ? "w-20 h-20 bg-green-100 dark:bg-green-900/40"
                : "w-20 h-20 bg-green-50 dark:bg-green-900/20"
            }`}
          >
            {isSuccess ? (
              <UserCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
            ) : (
              <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
            )}
          </div>

          {/* Título y subtítulo */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              {isSuccess ? "¡Registro completado!" : "Procesando tu solicitud"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSuccess
                ? "Revisa tu correo para verificar tu cuenta."
                : "Por favor, no cierres esta ventana."}
            </p>
          </div>

          {/* Lista de pasos */}
          <div className="w-full space-y-3">
            {STEPS.map((s) => {
              const status = getStepStatus(s.key, step)
              return (
                <div key={s.key} className="flex items-center gap-3">
                  {/* Ícono del paso */}
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    {status === "done" && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {status === "active" && (
                      <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                    )}
                    {status === "pending" && (
                      <Circle className="w-5 h-5 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Texto del paso */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-tight transition-colors duration-300 ${
                        status === "done"
                          ? "text-green-600 dark:text-green-400"
                          : status === "active"
                            ? "text-foreground"
                            : "text-muted-foreground/50"
                      }`}
                    >
                      {s.label}
                    </p>
                    {status === "active" && (
                      <p className="text-xs text-muted-foreground mt-0.5">{s.sublabel}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
