import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"

type TermsConditionsModalProps = {
  open: boolean
  onAccept: () => void
  onReject: () => void
}

export function TermsConditionsModal({ open, onAccept, onReject }: TermsConditionsModalProps) {
  const acceptButtonRef = useRef<HTMLButtonElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (event.key === "Tab") {
        const container = modalRef.current
        if (!container) return

        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(Boolean)

        if (focusable.length === 0) {
          event.preventDefault()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement | null

        if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        } else if (event.shiftKey && active === first) {
          event.preventDefault()
          last.focus()
        }
      }
    }

    document.addEventListener("keydown", onKey, true)
    setTimeout(() => {
      acceptButtonRef.current?.focus()
    }, 0)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKey, true)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-title"
      aria-describedby="policy-body"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-green-950/30 p-4 backdrop-blur-sm"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onPointerDownCapture={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onMouseDownCapture={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <div ref={modalRef} onClick={(event) => event.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-green-600 px-6 py-5">
          <h2 id="policy-title" className="text-lg text-center font-bold leading-tight text-white">Términos y Condiciones</h2>
          <p className="mt-0.5 text-xs text-center text-white/80">Time2Go · Ley 1581 de 2012</p>
        </div>

        <div id="policy-body" className="max-h-[50vh] space-y-4 overflow-y-auto px-6 py-5">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">1</div>
            <div>
              <p className="mb-1 text-sm font-semibold text-gray-800">Autorización de tratamiento de datos</p>
              <p className="text-sm leading-relaxed text-gray-600">Al registrarse en Time2Go, el usuario autoriza de manera previa, expresa e informada el tratamiento de sus datos personales conforme a la Ley 1581 de 2012 y demás normas concordantes.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-lime-100 text-xs font-bold text-lime-700">2</div>
            <div>
              <p className="mb-1 text-sm font-semibold text-gray-800">Finalidad del tratamiento</p>
              <p className="text-sm leading-relaxed text-gray-600">Los datos suministrados serán tratados para permitir el registro en la plataforma, brindar información sobre eventos en Bucaramanga y área metropolitana, enviar comunicaciones informativas y mejorar la experiencia del usuario.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">3</div>
            <div>
              <p className="mb-1 text-sm font-semibold text-gray-800">Derechos del titular (Habeas Data)</p>
              <p className="text-sm leading-relaxed text-gray-600">El titular podrá ejercer en cualquier momento sus derechos de acceso, actualización, rectificación y supresión de datos, así como revocar la autorización otorgada, a través de nuestros canales de soporte.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">4</div>
            <div>
              <p className="mb-1 text-sm font-semibold text-gray-800">Suspensiones y baneos</p>
              <p className="text-sm leading-relaxed text-gray-600">Time2Go podrá suspender o banear tu cuenta por incumplimiento de las normas de la plataforma. Todo baneo se aplica por un motivo específico y catalogado. Los baneos pueden ser temporales o permanentes según la gravedad de la infracción.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-lime-100 text-xs font-bold text-lime-800">5</div>
            <div>
              <p className="mb-1 text-sm font-semibold text-gray-800">Reporte de eventos</p>
              <p className="text-sm leading-relaxed text-gray-600">
                Podrás reportar eventos usando categorías y motivos definidos por la plataforma. Solo se admite un reporte por usuario y evento. El uso abusivo o en mala fe de los reportes puede conllevar medidas sobre tu cuenta. El equipo revisará los casos según las condiciones del servicio.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-green-100 bg-green-50 p-3">
            <p className="text-xs leading-relaxed text-gray-500">
              Para más información consulta las <a href="/legal#privacidad" target="_blank" className="cursor-pointer font-medium text-green-600 hover:underline">Políticas de Privacidad</a>, disponible en el sitio web.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <Button variant="outline" onClick={onReject} className="cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-100">
            Rechazar
          </Button>
          <Button
            ref={acceptButtonRef}
            onClick={onAccept}
            className="cursor-pointer bg-green-600 font-semibold text-white hover:bg-green-500"
          >
            Aceptar y continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
