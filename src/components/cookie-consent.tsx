"use client"

import { useEffect, useState } from "react"

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
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  const sameSite = '; SameSite=Lax'
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/` + sameSite + secure
}

export function CookieConsent() {
  const [consent, setConsentState] = useState<string | null>(null)

  useEffect(() => {
    setConsentState(readConsent())
  }, [])

  if (consent) return null

  const accept = () => {
    setConsent('accepted')
    setConsentState('accepted')
  }

  const reject = () => {
    setConsent('rejected')
    setConsentState('rejected')
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-3xl w-[92%] bg-white/95 border border-gray-200 shadow-lg rounded-md p-4 flex flex-col md:flex-row items-start md:items-center gap-3">
      <div className="flex-1 text-sm text-gray-800">
        <strong className="block font-medium mb-1">Usamos cookies</strong>
        Utilizamos cookies propias y de terceros para mejorar tu experiencia, mantener la sesión y analizar el uso. Puedes aceptar o rechazar cookies no esenciales. <a href="/politicas/cookies" className="underline text-lime-600 ml-1">Más información</a>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={reject} className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 cursor-pointer">Rechazar</button>
        <button onClick={accept} className="px-4 py-2 text-sm rounded-md bg-lime-600 text-white cursor-pointer">Aceptar</button>
      </div>
    </div>
  )
}

export default CookieConsent
