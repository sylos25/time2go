"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, LogOut, Settings, LayoutDashboard, Calendar } from "lucide-react"
import type { JSX } from "react"

interface HeaderProps {
  onAuthClick: (isLogin: boolean) => void
  isLoggedIn?: boolean
  isAdmin?: boolean
  userName?: string
}

export function Header({
  onAuthClick,
  isLoggedIn = false,
  isAdmin = false,
  userName = "Usuario",
}: HeaderProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState<any>(null);
  const logoutTimerRef = useRef<number | null>(null);

  const parseJwtExp = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp as number | undefined;
    } catch {
      return undefined;
    }
  };

  const scheduleAutoLogout = (expiresAtSec?: number) => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (!expiresAtSec) return;
    const ms = expiresAtSec * 1000 - Date.now();
    if (ms <= 0) {
      handleLogout();
      return;
    }
    logoutTimerRef.current = window.setTimeout(() => {
      handleLogout();
    }, ms);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Si ya hay token en localStorage al cargar la app
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("userName");
    if (token) {
      const exp = parseJwtExp(token);
      setUser({ token, name: storedName || undefined });
      if (exp) scheduleAutoLogout(exp);
    }
 
    const onLogin = (e: Event) => {
      const ev = e as CustomEvent;
      const detail = ev.detail ?? {};
      const token = detail.token || localStorage.getItem("token");
      const name = detail.name || detail.nombre || localStorage.getItem("userName") || "Usuario";
      if (token) localStorage.setItem("token", token);
      if (name) localStorage.setItem("userName", name);
      setUser({ token, name });
      const exp = detail.expiresAt || parseJwtExp(token || "");
      if (exp) scheduleAutoLogout(exp);
    };
    window.addEventListener("user:login", onLogin);
    return () => window.removeEventListener("user:login", onLogin);
  }, []);

  // derive login state and display name from local user state (fallback to props)
  const loggedIn = Boolean(user) || isLoggedIn;
  const displayName = (user?.name || user?.firstName || user?.name || user?.firstName || userName) as string;

  const navigationItems = [
    { name: "Inicio", path: "/" },
    { name: "Eventos", path: "/eventos" },
    { name: "Contacto", path: "/contacto" },
  ]

  const navigateTo = (path: string) => {
    router.push(path)
    setMenuOpen(false)
  }

  const handleLogout = () => {
    // limpiar estado y localStorage, notificar y redirigir
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUser(null);
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    window.dispatchEvent(new CustomEvent("user:logout"));
    router.push("/");
    setMenuOpen(false);
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
          scrolled
            ? "bg-gradient-to-r from-blue-900 via-purple-900 to-violet-900 backdrop-blur-md shadow-lg border-b border-white/10"
            : "bg-gradient-to-r from-blue-800 via-purple-800 to-violet-800 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10"
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
              <h1 className="text-xl lg:text-2xl font-bold text-white cursor-pointer">
                Time2Go
              </h1>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  className="text-white/90 hover:text-white font-medium transition-colors relative group cursor-pointer"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
                </button>
              ))}

              {!loggedIn ? (
                <Button
                  onClick={() => onAuthClick(true)}
                  className="bg-white text-purple-900 hover:bg-white/90 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-sm"
                >
                  Únete
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <Button
                      onClick={() => navigateTo("/dashboard")}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 font-medium rounded-sm"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 hover:bg-white/10 text-white rounded-sm">
                        <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center text-purple-900 font-medium">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{displayName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigateTo("/perfil")}>
                        <User className="h-4 w-4 mr-2" />
                        Mi Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigateTo("/mis-eventos")}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Mis Eventos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigateTo("/configuracion")}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configuración
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </nav>

            {/* Mobile CTA */}
            {!isLoggedIn ? (
              <Button
                onClick={() => onAuthClick(true)}
                size="sm"
                className="lg:hidden bg-white text-purple-900 hover:bg-white/90 rounded-sm"
              >
                Únete
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden hover:bg-white/10 rounded-sm">
                    <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center text-purple-900 font-medium text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigateTo("/dashboard")}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigateTo("/perfil")}>
                    <User className="h-4 w-4 mr-2" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo("/mis-eventos")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Mis Eventos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo("/configuracion")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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

          <div className="mt-8 pt-8 border-t border-white/20">
            {!isLoggedIn ? (
              <Button
                onClick={() => onAuthClick(true)}
                className="w-full bg-white text-purple-900 hover:bg-white/90 font-medium shadow-lg hover:shadow-xl transition-all rounded-sm"
              >
                Únete a Time2Go
              </Button>
            ) : (
              <div className="space-y-3">
                {isAdmin && (
                  <Button
                    onClick={() => navigateTo("/dashboard")}
                    variant="outline"
                    className="w-full border-red-400/30 text-red-400 hover:bg-red-400/10 bg-transparent rounded-sm"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
