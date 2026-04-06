import { MapPin } from "lucide-react"

export function SitiosMapaHero() {
  return (
    <div className="relative z-10 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-6 py-8 shadow-lg sm:px-10 sm:py-10">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-300/20 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-32 h-24 w-24 rounded-full bg-emerald-300/20 blur-2xl" />
      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif" }}
          >
            Agregar Sitio
          </h1>
          <p className="mt-1.5 text-sm text-emerald-200">
            Selecciona la ubicacion en el mapa y completa los datos del sitio
          </p>
        </div>
      </div>
    </div>
  )
}
