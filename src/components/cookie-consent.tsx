"use client"

import { useEffect, useState } from "react"
import { X, Cookie, ShieldCheck, BarChart2, Megaphone, RefreshCw } from "lucide-react"

const CONSENT_COOKIE = "cookie_consent"

function readConsent() {
  try {
    const v = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(CONSENT_COOKIE + '='))
    if (!v) return null
    return decodeURIComponent(v.split('=')[1])
  } catch {
    return null
  }
}

function setConsent(value: string) {
  const maxAge = 60 * 60 * 24 * 365
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`
}

function revokeConsent() {
  // Expira la cookie inmediatamente
  document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/`
}

// ─── Modal de política ───────────────────────────────────────────────────────
function CookiePolicyModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const sections = [
    {
      icon: <ShieldCheck className="h-5 w-5 text-green-600" />,
      title: "Cookies esenciales",
      badge: "Siempre activas",
      badgeColor: "bg-green-100 text-green-700",
      retention: "Duración de la sesión",
      description:
        "Necesarias para el funcionamiento del sitio. Incluyen cookies de sesión de autenticación (HttpOnly) y preferencias básicas de accesibilidad. Su base legal es el interés legítimo del responsable del tratamiento. No pueden desactivarse.",
    },
    {
      icon: <BarChart2 className="h-5 w-5 text-lime-600" />,
      title: "Cookies analíticas",
      badge: "Requieren consentimiento",
      badgeColor: "bg-lime-100 text-lime-700",
      retention: "Hasta 12 meses",
      description:
        "Recopilan información anónima o seudonimizada sobre cómo los usuarios interactúan con el sitio (páginas visitadas, tiempo de sesión, errores). Su base legal es el consentimiento explícito del titular. No identifican directamente a los usuarios.",
    },
    {
      icon: <Megaphone className="h-5 w-5 text-emerald-600" />,
      title: "Cookies de terceros",
      badge: "Requieren consentimiento",
      badgeColor: "bg-emerald-100 text-emerald-700",
      retention: "Según el tercero (máx. 24 meses)",
      description:
        "Instaladas por proveedores externos para medir el rendimiento de campañas y mostrar contenido relevante. Implican transferencia de datos a terceros. Su base legal es el consentimiento explícito del titular. Si las rechazas, no se compartirán datos con dichos terceros.",
    },
  ]

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-lime-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2">
                <Cookie className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Política de Cookies</h2>
                <p className="text-white/80 text-xs mt-0.5">Time2Go · Actualizada: enero 2026</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-4">

          <p className="text-sm text-gray-600 leading-relaxed">
            En cumplimiento de la <strong className="text-gray-800">Ley 1581 de 2012</strong> y el Decreto 1377 de 2013 (Colombia), te informamos sobre las cookies que utilizamos, su finalidad, base legal y el tiempo de retención de los datos asociados.
          </p>

          {/* Tipos de cookies */}
          <div className="space-y-3">
            {sections.map((s) => (
              <div key={s.title} className="border border-gray-100 rounded-xl p-4 hover:border-green-200 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-50 rounded-lg p-2 flex-shrink-0">{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">{s.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.badgeColor}`}>
                        {s.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-2">{s.description}</p>
                    <p className="text-xs text-gray-400">
                      <span className="font-medium text-gray-500">Retención:</span> {s.retention}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Derechos del titular */}
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Tus derechos (Habeas Data)</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Como titular de los datos tienes derecho a <strong>conocer, actualizar, rectificar y suprimir</strong> tu información, así como a <strong>revocar el consentimiento</strong> en cualquier momento. Para ejercerlos, contáctanos a través de nuestros canales de soporte.
            </p>
          </div>

          {/* Revocación */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-3">
            <RefreshCw className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Puedes <strong className="text-gray-700">revocar tu consentimiento</strong> en cualquier momento recargando la página y seleccionando "Rechazar", o borrando las cookies de tu navegador. Esto no afecta la licitud del tratamiento previo a la revocación.
            </p>
          </div>


        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-lime-500 text-white text-sm font-semibold hover:from-green-700 hover:to-lime-600 transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Banner principal ────────────────────────────────────────────────────────
export function CookieConsent() {
  const [loaded, setLoaded] = useState(false)
  const [consent, setConsentState] = useState<string | null>(null)
  const [showPolicy, setShowPolicy] = useState(false)

  useEffect(() => {
    setConsentState(readConsent())
    setLoaded(true)
  }, [])

  if (!loaded) return null
  if (consent) return null

  const accept = () => { setConsent('accepted'); setConsentState('accepted') }
  const reject = () => { setConsent('rejected'); setConsentState('rejected') }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-3xl w-[92%] bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-lime-400" />

        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="bg-green-50 rounded-xl p-2.5 flex-shrink-0">
            <Cookie className="h-5 w-5 text-green-600" />
          </div>

          <div className="flex-1 text-sm text-gray-600 leading-relaxed">
            <strong className="text-gray-800 font-semibold">Usamos cookies</strong> para mejorar tu experiencia y mantener la sesión, conforme a la Ley 1581 de 2012.{" "}
            <button
              onClick={() => setShowPolicy(true)}
              className="text-green-600 hover:text-green-700 underline underline-offset-2 font-medium transition-colors cursor-pointer"
            >
              Más información
            </button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={reject}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors font-medium cursor-pointer"
            >
              Rechazar
            </button>
            <button
              onClick={accept}
              className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white font-semibold transition-all cursor-pointer shadow-sm"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>

      {showPolicy && <CookiePolicyModal onClose={() => setShowPolicy(false)} />}
    </>
  )
}

export default CookieConsent