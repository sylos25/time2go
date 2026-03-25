"use client"

import { useEffect, useState, useRef, useCallback } from "react"

const DEVTOOLS_THRESHOLD = 160   // px - umbral más alto para evitar falsos positivos
const BLOCK_AFTER_SECONDS = 2    // segundos continuos hasta bloquear
const CHECK_INTERVAL_MS = 500    // chequeo periódico de respaldo

function DevToolsBlocker() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        userSelect: "none",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            fill="#f87171"
          />
        </svg>
      </div>

      <h1 style={{
        color: "#f1f5f9",
        fontSize: "clamp(20px, 3vw, 28px)",
        fontWeight: 700,
        margin: "0 0 12px",
        textAlign: "center",
        letterSpacing: "-0.5px",
      }}>
        Acceso restringido
      </h1>

      <p style={{
        color: "#94a3b8",
        fontSize: "clamp(13px, 2vw, 15px)",
        margin: "0 0 8px",
        textAlign: "center",
        maxWidth: "360px",
        lineHeight: 1.6,
        padding: "0 24px",
      }}>
        Las herramientas de desarrollo están bloqueadas en esta plataforma.
      </p>

      <p style={{
        color: "#64748b",
        fontSize: "clamp(11px, 1.5vw, 13px)",
        margin: 0,
        textAlign: "center",
      }}>
        Cierra el inspector para continuar navegando.
      </p>

      <div style={{ marginTop: "36px", display: "flex", gap: "8px", alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1",
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

function checkDevToolsOpen(): boolean {
  // Método 1: Diferencia de tamaño de ventana
  const widthDiff = window.outerWidth - window.innerWidth
  const heightDiff = window.outerHeight - window.innerHeight
  
  // Solo considerar si la diferencia es significativa (DevTools suele ocupar >160px)
  const sizeCheck = widthDiff > DEVTOOLS_THRESHOLD || heightDiff > DEVTOOLS_THRESHOLD
  
  return sizeCheck
}

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState(false)
  const secondsRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const initializedRef = useRef(false)

  const evaluate = useCallback(() => {
    if (checkDevToolsOpen()) {
      secondsRef.current += CHECK_INTERVAL_MS / 1000
      if (secondsRef.current >= BLOCK_AFTER_SECONDS) {
        setBlocked(true)
      }
    } else {
      secondsRef.current = 0
      setBlocked(false)
    }
  }, [])

  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (initializedRef.current) return
    initializedRef.current = true

    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168.")

    // Desactivar en entorno local para desarrollo
    if (isLocal) return

    // Esperar un momento antes de empezar a detectar para evitar falsos positivos al cargar
    const initTimeout = setTimeout(() => {
      // ── Bloqueos de teclado ──────────────────────────────────────────────
      const handleContextMenu = (e: MouseEvent) => e.preventDefault()

      const handleKeyDown = (e: KeyboardEvent) => {
        // Bloquear DevTools
        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && e.key === "I") ||
          (e.ctrlKey && e.shiftKey && e.key === "i") ||
          (e.ctrlKey && e.shiftKey && e.key === "J") ||
          (e.ctrlKey && e.shiftKey && e.key === "j") ||
          (e.ctrlKey && e.shiftKey && e.key === "C") ||
          (e.ctrlKey && e.shiftKey && e.key === "c") ||
          (e.ctrlKey && e.key === "U") ||
          (e.ctrlKey && e.key === "u")
        ) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }

        // Bloquear cerrar pestaña/ventana (Ctrl+W, Alt+F4)
        if (
          (e.ctrlKey && e.key === "w") ||
          (e.ctrlKey && e.key === "W") ||
          (e.altKey && e.key === "F4")
        ) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }

        // Bloquear navegación con teclado (Alt+Izquierda, Alt+Derecha, Backspace para navegar)
        if (
          (e.altKey && e.key === "ArrowLeft") ||
          (e.altKey && e.key === "ArrowRight") ||
          (e.key === "Backspace" && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA")
        ) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      }

      // Bloquear navegación hacia atrás/adelante con el mouse
      const handleMouseNav = (e: MouseEvent) => {
        // Botones 3 y 4 del mouse son "atrás" y "adelante"
        if (e.button === 3 || e.button === 4) {
          e.preventDefault()
          e.stopPropagation()
        }
      }

      // Bloquear el evento beforeunload para evitar navegación accidental
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        // Solo mostrar advertencia si está bloqueado
        if (blocked) {
          e.preventDefault()
          e.returnValue = ""
          return ""
        }
      }

      // Bloquear navegación con popstate (botones atrás/adelante del navegador)
      const handlePopState = (e: PopStateEvent) => {
        // Volver a la página actual para bloquear la navegación
        window.history.pushState(null, "", window.location.href)
      }

      // Inicializar el historial para poder interceptar popstate
      window.history.pushState(null, "", window.location.href)

      document.addEventListener("contextmenu", handleContextMenu)
      document.addEventListener("keydown", handleKeyDown, true)
      document.addEventListener("mousedown", handleMouseNav)
      window.addEventListener("beforeunload", handleBeforeUnload)
      window.addEventListener("popstate", handlePopState)

      // ── Detección reactiva al resize ───────────────────────────────────
      const handleResize = () => {
        if (checkDevToolsOpen()) {
          secondsRef.current += 0.5
          if (secondsRef.current >= BLOCK_AFTER_SECONDS) {
            setBlocked(true)
          }
        } else {
          secondsRef.current = 0
          setBlocked(false)
        }
      }

      window.addEventListener("resize", handleResize)

      // ── Chequeo periódico de respaldo ──────────────────────────────────
      intervalRef.current = setInterval(evaluate, CHECK_INTERVAL_MS)

      // Cleanup function guardada para el return
      const cleanup = () => {
        document.removeEventListener("contextmenu", handleContextMenu)
        document.removeEventListener("keydown", handleKeyDown, true)
        document.removeEventListener("mousedown", handleMouseNav)
        window.removeEventListener("beforeunload", handleBeforeUnload)
        window.removeEventListener("popstate", handlePopState)
        window.removeEventListener("resize", handleResize)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }

      // Guardar cleanup en ref para usarlo en el return del useEffect
      ;(window as any).__securityCleanup = cleanup
    }, 1000) // Esperar 1 segundo antes de iniciar detección

    return () => {
      clearTimeout(initTimeout)
      if ((window as any).__securityCleanup) {
        (window as any).__securityCleanup()
        delete (window as any).__securityCleanup
      }
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [evaluate, blocked])

  return (
    <>
      {blocked && <DevToolsBlocker />}
      {children}
    </>
  )
}
