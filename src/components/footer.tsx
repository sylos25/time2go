"use client"

import { Separator } from "@/components/ui/separator"
import Image from "next/image";import { FC } from "react";  

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand Section */}
        <div className="flex justify-center">
          <Image
          src="/images/logo_azul.png"
          alt="Time2Go Logo"
          width={200}   // ajusta al tamaño real que quieras
          height={200}
        />
        </div>
        
        
        <hr className="bg-gray-800 my-8" />

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
