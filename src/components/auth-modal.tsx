"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
  interface FormFields {
  tipDoc: string;
  document: string;
  firstName: string;
  lastName: string;
  pais: string | number;
  telefono: string;
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
  acceptTerms: boolean;
}

const formDataInicial: FormFields = {
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

  const [formData, setFormData] = useState<FormFields>(formDataInicial);
  const [showModal, setShowModal] = useState(false);
  const acceptButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<keyof FormFields, boolean>>({
    tipDoc: false,
    document: false,
    firstName: false,
    lastName: false,
    pais: false,
    telefono: false,
    email: false,
    password: false,
    confirmPassword: false,
    rememberMe: false,
    acceptTerms: false,
  });

  // Email field: when in login mode, keep the email input disabled until the user clicks it
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(() => !isLogin);
  const enableEmail = () => {
    setEmailEnabled(true);
    // focus after enabling
    setTimeout(() => emailInputRef.current?.focus(), 0);
  };
  const [duplicateModal, setDuplicateModal] = useState<{ open: boolean; duplicates: string[]; message?: string }>({ open: false, duplicates: [] });

  const handleBlur = (field: keyof FormFields) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };
 
// Esto es para el enfoque del teclado dentro del modal de política de seguridad de la información.  
      useEffect(() => {
        if (!showModal) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (e.key === 'Tab') {
            const container = modalRef.current;
            if (!container) return;
            const focusable = Array.from(
              container.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), textarea, input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
              )
            ).filter(Boolean);
            if (focusable.length === 0) {
              e.preventDefault();
              return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement as HTMLElement | null;
            if (!e.shiftKey && active === last) {
              e.preventDefault();
              first.focus();
            } else if (e.shiftKey && active === first) {
              e.preventDefault();
              last.focus();
            }
          }
        };

        document.addEventListener('keydown', onKey, true);

        setTimeout(() => {
          acceptButtonRef.current?.focus();
        }, 0);
        return () => {
          document.body.style.overflow = previousOverflow;
          document.removeEventListener('keydown', onKey, true);
        };
      }, [showModal]);

      const handleAccept = () => {
        handleInputChange("acceptTerms", true);
        setShowModal(false);
        setTimeout(() => {
          const cb = document.getElementById('acceptTerms') as HTMLElement | null;
          cb?.focus();
        }, 0);
      };

      const handleReject = () => {
        setFormData(formDataInicial);
        setRegistroError("");
        setRegistroExitoso(false);
        setShowModal(false);
        onClose();
      };


// Este useEffect  es para cargar la lista de países desde la API cuando el componente se monta.
      useEffect(() => {
        fetch("/api/llamar_pais")
          .then((res) => res.json())
          .then((data) => setListaPaises(data))
          .catch((err) => console.error("Error al cargar países:", err));
      }, []);
      const [listaPaises, setListaPaises] = useState<{ value: number; label: string }[]>([]);

      const handleInputChange = (field: keyof FormFields, value: string | boolean | number) => {
          setFormData((prev: FormFields) => ({ ...prev, [field]: value } as FormFields));
        };


// Mostrar mensaje de éxito por unos segundos después del registro exitoso.   
        useEffect(() => {
        if (registroExitoso) {
          const timer = setTimeout(() => setRegistroExitoso(false), 5000);
          return () => clearTimeout(timer);
        }
      }, [registroExitoso]);


// Resetear el formulario y estados cuando se cierra el modal.
      useEffect(() => {
        if (!isOpen) {
          setFormData(formDataInicial);
          setRegistroError("");
          setRegistroExitoso(false);
          setShowPassword(false);
          setShowConfirmPassword(false);
          setShowModal(false);
          setTouchedFields({
            tipDoc: false,
            document: false,
            firstName: false,
            lastName: false,
            pais: false,
            telefono: false,
            email: false,
            password: false,
            confirmPassword: false,
            rememberMe: false,
            acceptTerms: false,
          });
          // reset email enabled state when modal closes or mode changes
          setEmailEnabled(!isLogin);
        }
      }, [isOpen]); 


// Manejar el envío del formulario para login y registro.  
      const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!isLogin) {
            setRegistroError("");
            // Validate required fields and mark them as touched so UI shows red alerts
            const requiredFields: (keyof FormFields)[] = [
              'tipDoc', 'document', 'firstName', 'lastName', 'pais', 'telefono', 'email', 'password', 'confirmPassword'
            ];
            const missing = requiredFields.filter((f) => !formData[f] || String(formData[f]).trim() === "");
            if (missing.length > 0) {
              setTouchedFields((prev) => ({ ...prev, ...Object.fromEntries(missing.map((k) => [k, true])) }));
              setRegistroError("Por favor completa los campos obligatorios.");
              return;
            }

            if (!formData.acceptTerms) {
              setTouchedFields((prev) => ({ ...prev, acceptTerms: true }));
              setRegistroError("Debe aceptar los términos y condiciones.");
              return;
            }
            if (!formData.password || formData.password !== formData.confirmPassword) {
              setTouchedFields((prev) => ({ ...prev, password: true, confirmPassword: true }));
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
              if (res.status === 409) {
                // show duplicate modal with details when available
                setDuplicateModal({ open: true, duplicates: data.duplicates || [], message: data.error });
              }
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
        // validate required fields for login
        if (!formData.email || !formData.password) {
          if (!formData.email) setTouchedFields(prev => ({ ...prev, email: true }));
          if (!formData.password) setTouchedFields(prev => ({ ...prev, password: true }));
          return;
        }
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

          // guardar token, nombre y documento
          if (data.token) localStorage.setItem("token", data.token);
          if (data.numero_documento) localStorage.setItem("userDocument", String(data.numero_documento));
          const name = data.name || (formData.email ? formData.email.split("@")[0] : "Usuario");
          localStorage.setItem("userName", name);

          // notificar al header (incluye numero_documento)
          window.dispatchEvent(new CustomEvent("user:login", { detail: { token: data.token, name, expiresAt: data.expiresAt, numero_documento: data.numero_documento } }));

          // cerrar modal
          onClose();
        } catch (err) {
          console.error("Login error:", err);
        }
      };

  const handleDuplicateModalClose = () => {
    setDuplicateModal({ open: false, duplicates: [], message: undefined });
  };

  const handleSwitchToLoginFromDuplicate = () => {
    // Pre-fill email and switch to login mode
    setDuplicateModal({ open: false, duplicates: [], message: undefined });
    setEmailEnabled(true);
    setTouchedFields((prev) => ({ ...prev, email: true }));
    // Ensure parent toggles mode to login
    onToggleMode();
    // Focus email input after a tick
    setTimeout(() => emailInputRef.current?.focus(), 0);
  };


// Resetear el campo de número de documento cuando se cambia el tipo seleccionado. 
      const handleTipDocChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        handleInputChange("tipDoc", value);
        handleInputChange("document", "");
      };


// Para pasaporte: máximo 3 letras seguidas de números; para otros tipos: solo números.
      const handleNumDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();

        if (formData.tipDoc === "Pasaporte") {
          if (/^[A-Z0-9]*$/.test(value)) {
            const lettersCount = (value.match(/[A-Z]/g) || []).length;
            if (lettersCount < 3) {
              setFormData({ ...formData, document: value });
            } else {
              if (/^[A-Z]{3}[0-9]*$/.test(value)) {
                setFormData({ ...formData, document: value });
              }
            }
          }
        } else {
          if (/^[0-9]*$/.test(value)) {
            setFormData({ ...formData, document: value });
          }
        }
      };


// Permitir letras acentuadas y la letra ñ en nombres y apellidos.
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


// Esto es para números de teléfono en Colombia; ajustar según sea necesario para otros países. 
      const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[0-9]*$/.test(value) && value.length <= 10) {
          handleInputChange("telefono", value);
        }
      };


// Esto es una validación básica para el correo electrónico.
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
                  onBlur={() => handleBlur('tipDoc')}
                  className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${touchedFields.tipDoc && !formData.tipDoc ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Selecciona un tipo de documento</option>
                  <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                  <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                  <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
                {touchedFields.tipDoc && !formData.tipDoc && (
                  <p className="text-red-500 text-xs -mt-1">Este campo es obligatorio</p>
                )}
                <Label htmlFor="tipDoc" className="text-sm font-medium">
                  Número de Documento
                </Label>
                <input
                  id="document"
                  value={formData.document}
                  onChange={handleNumDocChange}
                  disabled={!formData.tipDoc}
                  aria-disabled={!formData.tipDoc}
                  onBlur={() => handleBlur('document')}
                  className={`w-full border rounded-md px-3 py-2 text-sm ${!formData.tipDoc ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700'} ${touchedFields.document && !formData.document ? "border-red-500 ring-red-500" : "border-gray-300"} focus:outline-none focus:ring-2`}
                  placeholder="Ingrese el número de documento"
                />
              {touchedFields.document && !formData.document && (
                <p className="text-red-500 text-xs -mt-1">Este campo es obligatorio</p>
              )} 
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
                  onBlur={() => handleBlur('firstName')}
                  required
                  className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${touchedFields.firstName && !formData.firstName ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                  placeholder="Ingrese sus nombres"
                />
                {touchedFields.firstName && !formData.firstName && (
                  <p className="text-red-500 text-xs -mt-1">Este campo es obligatorio</p>
                )} 
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
                    onBlur={() => handleBlur('lastName')}
                    className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${touchedFields.lastName && !formData.lastName ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                    placeholder="Ingrese sus apellidos"
                  />
                  {touchedFields.lastName && !formData.lastName && (
                    <p className="text-red-500 text-xs -mt-1">Este campo es obligatorio</p>
                  )} 
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
                onBlur={() => handleBlur('pais')}
                className={`pl-3 pr-4 py-2 w-full border rounded-md text-sm bg-white cursor-pointer ${touchedFields.pais && !formData.pais ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
              >
                <option value="">Selecciona un país</option>
                {listaPaises.map((pais) => (
                  <option key={pais.value} value={pais.value}>
                    {pais.label}
                  </option>
                ))}
              </select>
              {touchedFields.pais && !formData.pais && (
                <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>
              )}
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
                  onBlur={() => handleBlur('telefono')}
                    className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${touchedFields.telefono && !formData.telefono ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                />
                {touchedFields.telefono && !formData.telefono && (
                  <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
                <div
                    className={`relative ${isLogin && !emailEnabled ? 'cursor-text' : ''}`}
                    onMouseDown={(e) => {
                      if (isLogin && !emailEnabled) {
                        e.preventDefault();
                        enableEmail();
                      }
                    }}
                    onClick={() => {
                      if (isLogin && !emailEnabled) enableEmail();
                    }}
                    onKeyDown={(e) => {
                      // enable on Enter/Space or any printable key while not enabled
                      if (isLogin && !emailEnabled) {
                        const isPrintable = e.key.length === 1 || e.key === 'Enter' || e.key === ' ';
                        if (isPrintable) {
                          e.preventDefault();
                          enableEmail();
                        }
                      }
                    }}
                    role={isLogin && !emailEnabled ? 'button' : undefined}
                    tabIndex={isLogin && !emailEnabled ? 0 : undefined}
                  >
                    <Input
                      id="email"
                      ref={emailInputRef}
                      type="text"
                      value={formData.email}
                      onChange={handleEmailChange}
                      onMouseDown={(e) => {
                        if (isLogin && !emailEnabled) {
                          e.preventDefault();
                          enableEmail();
                        }
                      }}
                      onBlur={() => handleBlur('email')}
                      disabled={isLogin && !emailEnabled}
                      aria-disabled={isLogin && !emailEnabled}
                      className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLogin && !emailEnabled ? 'cursor-text' : ''} ${touchedFields.email && !formData.email ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                      placeholder="ejemplo@correo.com"
                    />
                </div>
              {touchedFields.email && !formData.email && (
                <p className="text-red-500 text-xs -mt-1">Este campo es obligatorio</p>
              )}
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
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`pl-10 pr-10 ${touchedFields.confirmPassword && !formData.confirmPassword ? 'border-red-500 ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 cursor-pointer" /> : <Eye className="h-4 w-4 cursor-pointer" />}
                </button>
                {touchedFields.confirmPassword && !formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>
                )}
                {touchedFields.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-0.5">Las contraseñas no coinciden</p>
                )}
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

      {touchedFields.acceptTerms && !formData.acceptTerms && (
        <p className="text-red-500 text-xs mt-0.5">Debe aceptar los términos y condiciones</p>
      )}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="policy-title"
          aria-describedby="policy-body"
          className="fixed inset-0 z-[9999] bg-black bg-opacity-75 flex items-center justify-center"
          onClick={(e) => {
            // prevent clicks on the backdrop from doing anything
            e.preventDefault();
            e.stopPropagation();
          }}
          onPointerDownCapture={(e) => {
            // stop pointer events in capture phase so parent Dialog doesn't receive them
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDownCapture={(e) => {
            // extra safety for browsers that fire mousedown to close overlays
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()} // prevent inner clicks from hitting backdrop
            className="bg-white p-6 w-full max-w-md rounded-lg shadow-xl max-h-[80vh] overflow-auto"
          >
            <h2 id="policy-title" className="text-lg font-semibold mb-4 text-center">Política de seguridad de la información</h2>
            <p id="policy-body" className="text-sm text-gray-700 mb-6 leading-relaxed">
              Time2Go (www.Time2Go.com) cuenta con medidas de seguridad de la información en los procesos, trámites, servicios, sistemas de información y su infraestructura permitiendo preservar la confidencialidad, integridad, disponibilidad y privacidad de los datos y la información que se administran en este, y en cumplimiento del marco jurídico correspondiente, con el objetivo de proporcionar una experiencia confiable, mediante un servicio seguro.
              En Time2Go (www.Time2Go.com) comprobamos y ponemos a prueba todas las etapas del ciclo de vida del desarrollo de este (Desarrollo, Pruebas, Producción) y realizamos evaluación constante del mismo, en cumplimiento de la Estrategia de Gobierno Digital (Decreto 1008 del 2018) y la Política Nacional de Seguridad Digital (CONPES 3854) con el objetivo de analizar los riesgos de seguridad digital a los cuales se encuentra expuesto el sitio web y lograr su adecuada mitigación.
              No nos hacemos responsables por cualquier falla en las medidas de seguridad cuando dicho incumplimiento se deba a circunstancias fuera de nuestro control, caso fortuito o fuerza mayor.
              Time2Go (www.Time2Go), se compromete a adoptar una política de confidencialidad y protección de datos, con el objeto de proteger la privacidad de la información personal obtenida a través de su sitio web.
            </p>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                id="policy-accept-button"
                ref={acceptButtonRef}
                type="button"
                onClick={handleAccept}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              >
                Aceptar
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Rechazar
              </button>
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

          {/* Duplicate fields popup */}
          {duplicateModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-labelledby="dup-title">
              <div className="bg-white rounded-md p-6 w-full max-w-sm shadow-lg">
                <h3 id="dup-title" className="text-lg font-semibold mb-2">Campos ya registrados</h3>
                <p className="text-sm text-gray-700 mb-4">{duplicateModal.message || 'Algunos campos que intentaste registrar ya existen.'}</p>
                {duplicateModal.duplicates.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-700 mb-4">
                    {duplicateModal.duplicates.map((d) => (
                      <li key={d}>
                        {d === 'correo' ? 'Correo electrónico' : d === 'telefono' ? 'Teléfono' : d === 'numero_documento' ? 'Número de documento' : d}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleDuplicateModalClose}>Cerrar</Button>
                  {duplicateModal.duplicates.includes('correo') && (
                    <Button onClick={handleSwitchToLoginFromDuplicate}>Iniciar sesión</Button>
                  )}
                </div>
              </div>
            </div>
          )}
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