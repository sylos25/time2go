"use client"

import type React from "react"

import { useState,useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, User, Chrome, Facebook, Phone, IdCard } from "lucide-react"


interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  isLogin: boolean
  onToggleMode: () => void
}

export function AuthModal({ isOpen, onClose, isLogin, onToggleMode }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const formDataInicial = {
  tipDoc: "",
  document: "",
  firstName: "",
  lastName: "",
  pais: "",
  telefono: "",
  email: "",
  password: "",
  confirmPassword: "",
  rememberMe: false,
  acceptTerms: false,
};
const [formData, setFormData] = useState(formDataInicial);

// LLamar los paises que estan en BD.
    useEffect(() => {
      fetch("/api/llamar_pais")
        .then((res) => res.json())
        .then((data) => setListaPaises(data))
        .catch((err) => console.error("Error al cargar países:", err));
    }, []);
    const [listaPaises, setListaPaises] = useState<{ value: number; label: string }[]>([]);
    const handleInputChange = (field: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }

// Ocultar mensaje (Perfil creado exitosamente) despues de 5 segundos    
    useEffect(() => {
    if (registroExitoso) {
      const timer = setTimeout(() => setRegistroExitoso(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [registroExitoso]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const endpoint = isLogin ? "/api/login" : "/api/usuario_formulario";
  const payload = isLogin
    ? { email: formData.email, password: formData.password }
    : formData;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Error en la autenticación");
    }

    if (isLogin) {
      localStorage.setItem("token", data.token);
      console.log("Login exitoso:", data);
    } else {
      console.log("Usuario registrado:", data);
      setRegistroExitoso(true); // ← activa el mensaje
      setFormData(formDataInicial); // ← limpia todos los campos
    }

  } catch (error) {
    console.error("Error:", error);
  }
};

  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            {isLogin ? "Bienvenido de vuelta" : "Únete a Time2Go"}
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2 " >
            {isLogin
              ? "Inicia sesión para continuar con tu experiencia"
              : "Crea tu cuenta y descubre eventos increíbles"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="tipoDoc" className="text-sm font-medium">
                  Tipo de Documento
                </Label>
                <select
                  id="tipDoc"
                  value={formData.tipDoc}
                  onChange={(e) => handleInputChange("tipDoc", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                  <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                  <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
            )}
          {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="documento" className="text-sm font-medium">
                  Número de Documento
                </Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="document"
                    placeholder="123456789"
                    value={formData.document}
                    onChange={(e) => handleInputChange("document", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  Nombre
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Apellido
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="lastName"
                    placeholder="Pérez"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}
          {!isLogin && (
            <div className="space-y-2">
            <label htmlFor="pais" className="text-sm font-medium">
              País
            </label>
            <div className="relative">
              <select
                id="pais"
                value={formData.pais}
                onChange={(e) => handleInputChange("pais", e.target.value)}
                className="pl-3 pr-4 py-2 w-full border rounded-md text-sm bg-white"
              >
                <option value="">Selecciona un país</option>
                {listaPaises.map((pais) => (
                  <option key={pais.value} value={pais.value}>
                    {pais.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-sm font-medium">
                Teléfono
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="3001234567"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="nick@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4 cursor-pointer" /> : <Eye className="h-4 w-4 cursor-pointer" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 cursor-pointer" /> : <Eye className="h-4 w-4 cursor-pointer" />}
                </button>
              </div>
            </div>
          )}

          {isLogin ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  className="cursor-pointer"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Recordarme
                </Label>
              </div>
              <Button variant="link" className="text-sm text-blue-600 hover:text-blue-500 p-0 cursor-pointer">
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Checkbox
              className="cursor-pointer"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
              />
              <Label htmlFor="acceptTerms" className="text-sm text-gray-600 ">
                Acepto los{" "}
                <Button variant="link" className="text-blue-600 hover:text-blue-500 p-0 h-auto cursor-pointer">
                  términos y condiciones
                </Button>
              </Label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </Button>
        </form>

        {registroExitoso && (
          <p className="text-green-600 font-medium mt-2">
            Perfil creado exitosamente
          </p>
        )}

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">{isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}</span>
          <Button
            variant="link"
            onClick={onToggleMode}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 ml-1 p-0 cursor-pointer"
          >
            {isLogin ? "Regístrate aquí" : "Inicia sesión"}
          </Button>
        </div>
      </DialogContent>  
    </Dialog>
  )
}