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
  const [registroError, setRegistroError] = useState("");
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
  const [showModal, setShowModal] = useState(false);

// Para manejar la ventana emergente de 'Política de seguridad de la información'.
  const handleAccept = () => {
    handleInputChange("acceptTerms", true);
    setShowModal(false);
  };

  const handleReject = () => {
    setFormData({ acceptTerms: false });
    setShowModal(false);
    alert("Formulario cerrado");
  };


  // LLamar los paises que estan en BD.
      useEffect(() => {
        fetch("/api/llamar_pais")
          .then((res) => res.json())
          .then((data) => setListaPaises(data))
          .catch((err) => console.error("Error al cargar países:", err));
      }, []);
      const [listaPaises, setListaPaises] = useState<{ value: number; label: string }[]>([]);

      const handleInputChange = (field: keyof FormData, value: string) => {
          setFormData((prev) => ({ ...prev, [field]: value }));
        };

  // Ocultar mensaje (Perfil creado exitosamente) despues de 5 segundos    
      useEffect(() => {
      if (registroExitoso) {
        const timer = setTimeout(() => setRegistroExitoso(false), 5000);
        return () => clearTimeout(timer);
      }
    }, [registroExitoso]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Registro
      if (!isLogin) {
        setRegistroError("");
        // validaciones básicas
        if (!formData.acceptTerms) {
          setRegistroError("Debe aceptar los términos y condiciones.");
          return;
        }
        if (!formData.password || formData.password !== formData.confirmPassword) {
          setRegistroError("Las contraseñas no coinciden.");
          return;
        }

      try {
        const res = await fetch("/api/usuario_formulario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipDoc: formData.tipDoc,
            document: formData.document,
            firstName: formData.firstName,
            lastName: formData.lastName,
            pais: formData.pais,
            telefono: formData.telefono,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("Registro fallido:", data);
          setRegistroError(data.error || "Error al crear usuario.");
          return;
        }

        setRegistroError("");
        setRegistroExitoso(true);
        // cambiar a modo login para que el usuario pueda iniciar sesión
        onToggleMode();
        // cerrar modal poco después
        setTimeout(() => onClose(), 800);
      } catch (err) {
        console.error("Registro error:", err);
        setRegistroError("Error de red. Intenta nuevamente.");
      }

      return;
    }

    // Login existente
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Login failed:", data);
        // mostrar error al usuario según tu UI
        return;
      }

      // guardar token y nombre
      if (data.token) localStorage.setItem("token", data.token);
      const name = data.name || (formData.email ? formData.email.split("@")[0] : "Usuario");
      localStorage.setItem("userName", name);

      // notificar al header
      window.dispatchEvent(new CustomEvent("user:login", { detail: { token: data.token, name, expiresAt: data.expiresAt } }));

      // cerrar modal
      onClose();
    } catch (err) {
      console.error("Login error:", err);
    }
  };


// Lógica para manejar los cambios en el select de tipo de documento 
const handleTipDocChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value;
  handleInputChange("tipDoc", value);
  handleInputChange("document", "");
};

// Validar el campo de número de documento según el tipo seleccionado, que no exceda 10 caracteres y que cumpla con el formato adecuado.
  const handleNumDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (!formData.tipDoc) return;
    if (value.length > 10) return;
    if (formData.tipDoc === "Pasaporte") {
      if (/^[A-Z0-9]*$/.test(value)) {
        const lettersCount = (value.match(/[A-Z]/g) || []).length;
        if (lettersCount < 3) {
          handleInputChange("document", value);
        } else {
          if (/^[A-Z]{3}[0-9]*$/.test(value)) {
            handleInputChange("document", value);
          }
        }
      }
    } else {
      if (/^[0-9]*$/.test(value)) {
        handleInputChange("document", value);
      }
    }
  };

// Validar que los campos de nombre y apellido solo contengan letras y espacios.
  const handleFirstnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
      handleInputChange("firstName", value);
    }
  };

  const handleLastnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
      handleInputChange("lastName", value);
    }
  };

//Validar que el campo de teléfono solo contenga números y tenga un máximo de 10 dígitos.  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 10) {
      handleInputChange("telefono", value);
    }
  };

// Validar que el campo de correo tenga un formato válido.
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInputChange("email", value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value) && value !== "") {
      console.log("Correo inválido");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
            {isLogin ? "Bienvenido de vuelta" : "Únete a Time2Go"}
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2 " >
            {isLogin
              ? "Inicia sesión para continuar con tu experiencia"
              : "Crea tu cuenta y descubre eventos increíbles"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="tipDoc" className="text-sm font-medium">
                  Tipo de Documento
                </Label>
                <select
                  id="tipDoc"
                  value={formData.tipDoc}
                  onChange={handleTipDocChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">
                    Selecciona un tipo de documento
                  </option>
                  <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                  <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                  <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
            )}

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="document" className="text-sm font-medium">
                Número de Documento
              </Label>
              <input
                id="document"
                value={formData.document}
                onChange={handleNumDocChange}
                disabled={!formData.tipDoc} // 👈 bloquea si está en "Selecciona un tipo de documento"
                className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 
                  ${!formData.tipDoc ? "bg-gray-100 cursor-not-allowed" : ""} 
                  focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Ingrese el número de documento"
              />
            </div>

            )}

          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="text-sm font-medium">
                  Nombres
                </Label>
                <input
                  id="firstname"
                  type="text"
                  value={formData.firstName}
                  onChange={handleFirstnameChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese sus nombres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastname" className="text-sm font-medium">
                  Apellidos
                </Label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleLastnameChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese sus apellidos"
                  />
                </div>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
            <Label htmlFor="pais" className="text-sm font-medium">
              País
            </Label>
            <div className="relative">
              <select
                id="pais"
                value={formData.pais}
                onChange={(e) => handleInputChange("pais", e.target.value)}
                className="pl-3 pr-4 py-2 w-full border rounded-md text-sm bg-white cursor-pointer"
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
                <input
                  id="telefono"
                  type="tel"
                  placeholder="1234567890"
                  value={formData.telefono}
                  onChange={handlePhoneChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
              <input
                id="email"
                type="text"
                value={formData.email}
                onChange={handleEmailChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ejemplo@correo.com"
              />
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
        onCheckedChange={(checked) =>
          handleInputChange("acceptTerms", checked as boolean)
        }
      />
      <Label
        htmlFor="acceptTerms"
        className="text-sm text-gray-600"
      >
        Acepto los{" "}
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-500 p-0 h-auto cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          Política de seguridad de la información.
        </Button>
      </Label>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">
              Política de seguridad de la información
            </h2>
            <p className="text-sm text-gray-700 mb-6">
              Time2Go (www.Time2Go.com) cuenta con medidas de seguridad de la información en los procesos, trámites, servicios, sistemas de información y su infraestructura permitiendo preservar la confidencialidad, integridad, disponibilidad y privacidad de los datos y la información que se administran en este, y en cumplimiento del marco jurídico correspondiente, con el objetivo de proporcionar una experiencia confiable, mediante un servicio seguro.
              En Time2Go (www.Time2Go.com) comprobamos y ponemos a prueba todas las etapas del ciclo de vida del desarrollo de este (Desarrollo, Pruebas, Producción) y realizamos evaluación constante del mismo, en cumplimiento de la Estrategia de Gobierno Digital (Decreto 1008 del 2018) y la Política Nacional de Seguridad Digital (CONPES 3854) con el objetivo de analizar los riesgos de seguridad digital a los cuales se encuentra expuesto el sitio web y lograr su adecuada mitigación
              No nos hacemos responsables por cualquier falla en las medidas de seguridad cuando dicho incumplimiento se deba a circunstancias fuera de nuestro control, caso fortuito o fuerza mayor.
              Time2Go (www.Time2Go), se compromete a adoptar una política de confidencialidad y protección de datos, con el objeto de proteger la privacidad de la información personal obtenida a través de su sitio web.
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleReject}>
                Rechazar
              </Button>
              <Button onClick={handleAccept}>
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 hover:from-blue-700 hover:via-purple-700 hover:to-violet-700 text-white font-medium rounded-sm"
          >
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </Button>
        </form>

        {registroExitoso && (
          <p className="text-green-600 font-medium mt-2">
            Perfil creado exitosamente
          </p>
        )}

        <div className="text-center text-sm">
          <span className="text-sm text-gray-600">{isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}</span>
          <Button
            variant="link"
            onClick={onToggleMode}
            className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
          >
            {isLogin ? "Regístrate aquí" : "Inicia sesión"}
          </Button>
        </div>
      </DialogContent>  
    </Dialog>
  )
}