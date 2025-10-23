"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import type { JSX } from "react";


interface HeaderProps {
  onAuthClick: (isLogin: boolean) => void
}

export function Header({ onAuthClick }: HeaderProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigationItems = [
    { name: "Inicio", path: "/" },
    { name: "Eventos", path: "/eventos" },
    { name: "Contacto", path: "/contacto" },
  ]

  const navigateTo = (path: string) => {
    console.log("[v0] Navigating to:", path)
    router.push(path)
    setMenuOpen(false)
  }

  return (
    <>
      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20" : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Logo */}
            <button
              onClick={() => navigateTo("/")}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 relative">
                <Image src="/images/logo.svg?height=48&width=48" alt="Time2Go Logo" fill className="object-contain" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent cursor-pointer">
                Time2Go
              </h1>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group cursor-pointer"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                </button>
              ))}
              <Button
                onClick={() => onAuthClick(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Únete
              </Button>
            </nav>

            {/* Mobile CTA */}
            <Button
              onClick={() => onAuthClick(true)}
              size="sm"
              className="lg:hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-500 text-white"
            >
              Únete
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav
        className={`fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 z-40 lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-24 px-6">
          <ul className="space-y-4">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => navigateTo(item.path)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium text-lg py-4 px-4 rounded-xl hover:bg-blue-50 transition-all w-full text-left group"
                >
                  <span className="w-2 h-2 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Button
              onClick={() => onAuthClick(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Únete a Time2Go
            </Button>
          </div>
        </div>
      </nav>
    </>
  )
}
