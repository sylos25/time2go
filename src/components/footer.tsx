import Link from "next/link"
import { Calendar, Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 via-purple-900 to-violet-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Información de la empresa */}
          <div>
            <h3 className="text-xl font-bold mb-4">Time2Go</h3>
            <p className="text-white/80 leading-relaxed">
              Tu plataforma para descubrir y disfrutar de los mejores eventos cerca de ti.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/eventos" className="text-white/80 hover:text-white transition-colors">
                  Explorar Eventos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-white/80 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="text-white/80 hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-white/80 hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/eventos?category=musica"
                  className="text-white/80 hover:text-white transition-colors flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Música
                </Link>
              </li>
              <li>
                <Link
                  href="/eventos?category=arte"
                  className="text-white/80 hover:text-white transition-colors flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Arte
                </Link>
              </li>
              <li>
                <Link
                  href="/eventos?category=gastronomia"
                  className="text-white/80 hover:text-white transition-colors flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Gastronomía
                </Link>
              </li>
              <li>
                <Link
                  href="/eventos?category=cultura"
                  className="text-white/80 hover:text-white transition-colors flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Cultura
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-white/80">
                <Mail className="h-4 w-4 mr-2" />
                info@time2go.com
              </li>
              <li className="flex items-center text-white/80">
                <Phone className="h-4 w-4 mr-2" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center text-white/80">
                <MapPin className="h-4 w-4 mr-2" />
                Ciudad, País
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
          <p>&copy; {new Date().getFullYear()} Time2Go. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
