"use client"

import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r  from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r  from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Time2Go
            </h3>
          </div>
        </div>

        <Separator className="bg-gray-800 mb-8" />

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <a href="/terminos-uso" className="text-gray-400 hover:text-white transition-colors">
            Términos de uso
          </a>
          <a href="/legal" className="text-gray-400 hover:text-white transition-colors">
            Legal
          </a>
          <a href="/pqr" className="text-gray-400 hover:text-white transition-colors">
            PQR
          </a>
          <a href="/sobre-nosotros" className="text-gray-400 hover:text-white transition-colors">
            Sobre nosotros
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Time2Go. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
