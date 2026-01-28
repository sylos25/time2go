"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
  onAuthClick?: (isLogin: boolean) => void
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
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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
      performLogout();
      return;
    }
    logoutTimerRef.current = window.setTimeout(() => {
      performLogout();
    }, ms);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const pathname = usePathname();

  useEffect(() => {
    // Read token from localStorage on mount and on route change to keep session
    const syncFromStorage = () => {
      const token = localStorage.getItem("token");
      const storedName = localStorage.getItem("userName");
      const storedDoc = localStorage.getItem("userDocument");
      if (token) {
        const exp = parseJwtExp(token);
        setUser({ token, name: storedName || undefined, numero_documento: storedDoc || undefined });
        if (exp) scheduleAutoLogout(exp);
      }
      // if no token, don't immediately clear user here — we'll validate session with the server
    };

    const validateSession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // If token exists, validate locally by expiry to avoid unnecessary server calls
          const exp = parseJwtExp(token);
          if (exp && exp * 1000 <= Date.now()) {
            // expired token
            performLogout();
            return;
          }

          // Token seems valid locally — optimistically set user from localStorage
          const storedName = localStorage.getItem('userName');
          setUser({ token, name: storedName || (user as any)?.name });
          if (exp) scheduleAutoLogout(exp);

          // Also validate token with the server in background (silent clear if invalid)
          try {
            const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
              // token not valid on server -> clear silently
              clearSessionSilent();
              return;
            }
            const data = await res.json();
            if (data?.ok && data.user) {
              const name = data.user.nombres || data.user.correo || storedName || user?.name;
              const numero_documento = data.user.numero_documento || localStorage.getItem('userDocument') || undefined;
              if (numero_documento) localStorage.setItem('userDocument', String(numero_documento));
              setUser({ token, name, numero_documento });
            } else {
              clearSessionSilent();
            }
          } catch (err) {
            console.error('validateSession server check error', err);
          }

          return;
        }

        // No token in localStorage — maybe server session (cookie) exists; ask /api/me
        const res = await fetch('/api/me');
        if (!res.ok) {
          // session invalid — clear silently so we don't interrupt navigation
          clearSessionSilent();
          return;
        }
        const data = await res.json();
        if (data?.ok && data.user) {
          const name = data.user.nombres || data.user.correo || localStorage.getItem('userName') || user?.name;
          const tokenFromStorage = localStorage.getItem('token') || (user as any)?.token;
          const numero_documento = data.user.numero_documento || localStorage.getItem('userDocument') || undefined;
          if (numero_documento) localStorage.setItem('userDocument', String(numero_documento));
          setUser({ token: tokenFromStorage, name, numero_documento });
          const expFromToken = tokenFromStorage ? parseJwtExp(tokenFromStorage) : undefined;
          if (expFromToken) scheduleAutoLogout(expFromToken);
        } else {
          // server said no session — clear silently
          clearSessionSilent();
        }
      } catch (err) {
        console.error('validateSession error', err);
      }
    };

    syncFromStorage();
    validateSession();

    const onLogin = (e: Event) => {
      const ev = e as CustomEvent;
      const detail = ev.detail ?? {};
      const token = detail.token || localStorage.getItem("token");
      const name = detail.name || detail.nombre || localStorage.getItem("userName") || "Usuario";
      const numero_documento = detail.numero_documento || localStorage.getItem("userDocument") || undefined;
      if (token) localStorage.setItem("token", token);
      if (name) localStorage.setItem("userName", name);
      if (numero_documento) localStorage.setItem("userDocument", String(numero_documento));
      setUser({ token, name, numero_documento });
      const exp = detail.expiresAt || parseJwtExp(token || "");
      if (exp) scheduleAutoLogout(exp);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        // if token removed in another tab, logout here
        if (!e.newValue) {
          performLogout();
        } else {
          // new token added/updated -> re-validate session
          syncFromStorage();
          validateSession();
        }
      }
      if (e.key === "userName") {
        // just sync name
        const storedName = localStorage.getItem('userName');
        setUser((prev: any) => (prev ? { ...prev, name: storedName || prev.name } : prev));
      }
    };

    window.addEventListener("user:login", onLogin);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("user:login", onLogin);
      window.removeEventListener("storage", onStorage);
    };
  }, [pathname]);

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

  const performLogout = () => {
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
    setLogoutDialogOpen(false);
  }

  // Silent session clear: clear auth state without redirecting (used for background checks)
  const clearSessionSilent = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUser(null);
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    // do not dispatch user:logout or redirect here to avoid interrupting navigation
  }

  const handleLogout = () => {
    // abrir modal de confirmación en lugar de confirmar inmediato
    setLogoutDialogOpen(true);
  }

  return (
    <>
      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Logout confirmation modal */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cierre de sesión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas cerrar sesión? Se cerrará tu sesión actual.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>Cancelar</Button>
            <Button onClick={performLogout} className="bg-red-600 text-white">Cerrar sesión</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <div className="w-10 h-10 lg:w-40 lg:h-50 relative">
                <Image src="/images/logo.png?height=48&width=48" alt="Time2Go Logo" fill className="object-contain" />
              </div>
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
                  onClick={() => router.push("/auth")}
                  className="bg-white text-purple-900 hover:bg-white/90 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-sm"
                >
                  Únete
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateTo("/eventos/crear")}
                    className="text-white/90 hover:text-white font-medium transition-colors relative group cursor-pointer flex items-center"
                  >
                    Crear Evento
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
                  </button>

                  <button
                    onClick={() => navigateTo("/dashboard")}
                    className="text-white/90 hover:text-white font-medium transition-colors relative group cursor-pointer flex items-center"
                  >
                    Dashboard
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
                  </button>

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
                        <DropdownMenuItem onClick={() => navigateTo("/perfil")} className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          Mi Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigateTo("/mis-eventos")} className="cursor-pointer">
                          <Calendar className="h-4 w-4 mr-2" />
                          Mis Eventos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigateTo("/configuracion")} className="cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Configuración
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
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
                onClick={() => router.push("/auth")}
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
                  <DropdownMenuItem onClick={() => navigateTo("/dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateTo("/perfil")} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo("/mis-eventos")} className="cursor-pointer">
                    <Calendar className="h-4 w-4 mr-2" />
                    Mis Eventos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo("/configuracion")} className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
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
                onClick={() => router.push("/auth")}
                className="w-full bg-white text-purple-900 hover:bg-white/90 font-medium shadow-lg hover:shadow-xl transition-all rounded-sm"
              >
                Únete a Time2Go
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => navigateTo("/dashboard")}
                  variant="outline"
                  className="w-full border-red-400/30 text-red-400 hover:bg-red-400/10 bg-transparent rounded-sm cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
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
