"use client"

import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-zinc-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/logo.png"
            alt="Time2Go Logo"
            width={200}
            height={200}
          />
        </div>

        <hr className="border-zinc-700 my-8" />

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <a href="/legal" className="text-gray-400 hover:text-white transition-colors text-sm">
            Legal
          </a>
          <a href="/contacto" className="text-gray-400 hover:text-white transition-colors text-sm">
            PQR
          </a>
          <a href="/contacto" className="text-gray-400 hover:text-white transition-colors text-sm">
            Sobre nosotros
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Time2Go. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}