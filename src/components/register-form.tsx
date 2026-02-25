"use client"

import { useState, useRef, useEffect } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface RegisterFormProps {
  onSuccess: () => void
}

interface FormFields {
  firstName: string
  lastName: string
  pais: string | number
  telefono: string
  email: string
  password: string
}

// Dominios de correo permitidos
const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
]

// Función para validar si el dominio es permitido
const isAllowedEmail = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase()
  return ALLOWED_EMAIL_DOMAINS.includes(domain || "")
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [terminosCondiciones, setTerminosCondiciones] = useState(false)
  const [registroError, setRegistroError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] })
  const acceptButtonRef = useRef<HTMLButtonElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const [listaPaises, setListaPaises] = useState<{ value: number; label: string }[]>([])
  const [duplicateModal, setDuplicateModal] = useState<{
    open: boolean
    duplicates: string[]
    message?: string
  }>({ open: false, duplicates: [] })

  const formDataInicial: FormFields = {
    firstName: "",
    lastName: "",
    pais: "",
    telefono: "",
    email: "",
    password: "",
  }

  const [formData, setFormData] = useState<FormFields>(formDataInicial)
  const [touchedFields, setTouchedFields] = useState<Record<keyof FormFields, boolean>>({
    firstName: false,
    lastName: false,
    pais: false,
    telefono: false,
    email: false,
    password: false,
  })
  const [touchedConfirmPassword, setTouchedConfirmPassword] = useState(false)
  const [touchedTerminosCondiciones, setTouchedTerminosCondiciones] = useState(false)

// Hace un llamado a los paises
    useEffect(() => {
      fetch("/api/llamar_pais")
        .then((res) => res.json())
        .then((data) => setListaPaises(data))
        .catch((err) => console.error("Error al cargar países:", err))
    }, [])

// Control del focus en el modal de políticas
  useEffect(() => {
    if (!showModal) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      if (e.key === "Tab") {
        const container = modalRef.current
        if (!container) return
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(Boolean)
        if (focusable.length === 0) {
          e.preventDefault()
          return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        } else if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        }
      }
    }
    document.addEventListener("keydown", onKey, true)
    setTimeout(() => {
      acceptButtonRef.current?.focus()
    }, 0)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKey, true)
    }
  }, [showModal])




// Funciones para manejar cambios y validaciones de campos  
  const handleBlur = (field: keyof FormFields) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

// Función para manejar cambios en los campos del formulario  
  const handleInputChange = (field: keyof FormFields, value: string | boolean | number) => {
    setFormData((prev: FormFields) => ({ ...prev, [field]: value } as FormFields))
  }

// Funciones para manejar el control en los campos de texto con validación de caracteres permitidos (nombres, apellidos)  
  const handleFirstnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
      handleInputChange("firstName", value)
    }
  }

  const handleLastnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
      handleInputChange("lastName", value)
    }
  }

// Función para manejar el control en el campo de teléfono con validación de caracteres permitidos  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[0-9]*$/.test(value) && value.length <= 10) {
      handleInputChange("telefono", value)
    }
  }

// Función para manejar el control en el campo de email con validación de caracteres permitidos  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    handleInputChange("email", value)
    if (!emailRegex.test(value)) {
      setEmailError("Formato de correo inválido")
      return
    }
    if (!isAllowedEmail(value)) {
      setEmailError("Solo se permiten dominios: gmail.com, outlook.com, yahoo.com, icloud.com, proton.me, protonmail.com.")
      return
    }
    setEmailError("")
  }

// Función para validar contraseña
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    if (password.length > 12) {
      errors.push("Máximo 12 caracteres")
    }
    if (!/[a-zA-Z]/.test(password)) {
      errors.push("Al menos una letra")
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Al menos un número")
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Al menos un carácter especial")
    }
    return {
      isValid: errors.length === 0,
      errors,
    }
  }

// Función para manejar el cierre del modal de campos duplicados  
  const handleDuplicateModalClose = () => {
    setDuplicateModal({ open: false, duplicates: [], message: undefined })
  }

// Funciones para manejar la aceptación y rechazo de términos y condiciones en el modal
  const handleAccept = () => {
    setTerminosCondiciones(true)
    setTouchedTerminosCondiciones(true)
    setShowModal(false)
  }

  const handleReject = () => {
    setTerminosCondiciones(false)
    setShowModal(false)
  }

// Función para manejar el envío del formulario con validaciones y comunicación con el backend  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistroError("")

// Validar campos obligatorios
    const requiredFields: (keyof FormFields)[] = [
      "firstName",
      "lastName",
      "pais",
      "telefono",
      "email",
      "password",
    ]
    const missing = requiredFields.filter((f) => !formData[f] || String(formData[f]).trim() === "")
    if (missing.length > 0) {
      setTouchedFields(
        (prev) => ({ ...prev, ...Object.fromEntries(missing.map((k) => [k, true])) })
      )
      setRegistroError("Por favor completa los campos obligatorios.")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setTouchedFields((prev) => ({ ...prev, email: true }))
      setRegistroError("Formato de correo inválido.")
      return
    }
    if (!isAllowedEmail(formData.email)) {
      setTouchedFields((prev) => ({ ...prev, email: true }))
      setRegistroError("Solo se permiten dominios: gmail.com, outlook.com, yahoo.com, icloud.com, proton.me, protonmail.com.")
      return
    }
    if (!terminosCondiciones) {
      setTouchedTerminosCondiciones(true)
      setRegistroError("Debe aceptar los términos y condiciones.")
      return
    }
    if (!formData.password || formData.password !== confirmPassword) {
      setTouchedFields((prev) => ({ ...prev, password: true }))
      setTouchedConfirmPassword(true)
      setRegistroError("Las contraseñas no coinciden.")
      return
    }
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      setTouchedFields((prev) => ({ ...prev, password: true }))
      setRegistroError(`Contraseña inválida: ${passwordValidation.errors.join(", ")}`)
      return
    }
    try {
      const res = await fetch("/api/usuario_formulario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          pais: formData.pais,
          telefono: formData.telefono,
          email: formData.email,
          password: formData.password,
          terminosCondiciones: terminosCondiciones,
        }),
      })   

      const data = await res.json()
      if (!res.ok) {
        console.error("Registro fallido:", data)
        setRegistroError(data.error || "Error al crear usuario.")
        if (res.status === 409) {
          setDuplicateModal({ open: true, duplicates: data.duplicates || [], message: data.error })
        }
        return
      }
      
      setRegistroError("")
      setFormData(formDataInicial)
      setConfirmPassword("")
      setTerminosCondiciones(false)
      setTimeout(() => {
        onSuccess()
      }, 500)
    } catch (err) {
      console.error("Registro error:", err)
      setRegistroError("Error de red. Intenta nuevamente.")
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombres y Apellidos */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstname" className="text-sm font-medium">
              Nombres
            </Label>
            <input
              id="firstname"
              type="text"
              value={formData.firstName}
              onChange={handleFirstnameChange}
              onBlur={() => handleBlur("firstName")}
              className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touchedFields.firstName && !formData.firstName ? "border-red-500 ring-red-500" : "border-gray-300"
              }`}
              placeholder="Ingrese sus nombres"
            />
            {touchedFields.firstName && !formData.firstName && (
              <p className="text-red-500 text-xs -mt-0.5">Este campo es obligatorio</p>
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
              onBlur={() => handleBlur("lastName")}
              className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touchedFields.lastName && !formData.lastName ? "border-red-500 ring-red-500" : "border-gray-300"
              }`}
              placeholder="Ingrese sus apellidos"
            />
            {touchedFields.lastName && !formData.lastName && (
              <p className="text-red-500 text-xs -mt-0.5">Este campo es obligatorio</p>
            )}
          </div>
        </div>


        {/* País */}
        <div className="space-y-2">
          <Label htmlFor="pais" className="text-sm font-medium">
            País
          </Label>
          <select
            id="pais"
            value={formData.pais}
            onChange={(e) => handleInputChange("pais", e.target.value)}
            onBlur={() => handleBlur("pais")}
            className={`pl-3 pr-4 py-2 w-full border rounded-md text-sm bg-white cursor-pointer ${
              touchedFields.pais && !formData.pais ? "border-red-500 ring-red-500" : "border-gray-300"
            }`}
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

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-sm font-medium">
            Teléfono
          </Label>
          <input
            id="telefono"
            type="tel"
            placeholder="1234567890"
            value={formData.telefono}
            onChange={handlePhoneChange}
            onBlur={() => handleBlur("telefono")}
            className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              touchedFields.telefono && !formData.telefono ? "border-red-500 ring-red-500" : "border-gray-300"
            }`}
          />
          {touchedFields.telefono && !formData.telefono && (
            <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="text"
            value={formData.email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur("email")}
            autoCapitalize="none"
            className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              (touchedFields.email && !formData.email) || emailError ? "border-red-500 ring-red-500" : "border-gray-300"
            }`}
            placeholder="ejemplo@correo.com"
          />
          {emailError && (
            <p className="text-red-500 text-xs -mt-0.5">{emailError}</p>
          )}
          {touchedFields.email && !formData.email && !emailError && (
            <p className="text-red-500 text-xs -mt-0.5">Este campo es obligatorio</p>
          )}
        </div>

        {/* Password */}
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
              maxLength={12}
              onBlur={() => handleBlur("password")}
              onChange={(e) => {
                const value = e.target.value
                handleInputChange("password", value)
                if (value) {
                  setPasswordValidation(validatePassword(value))
                } else {
                  setPasswordValidation({ isValid: false, errors: [] })
                }
              }}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 cursor-pointer" />
              ) : (
                <Eye className="h-4 w-4 cursor-pointer" />
              )}
            </button>
          </div>
          {touchedFields.password && !formData.password && (
            <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>
          )}
          
          {/* Requisitos de contraseña */}
          {formData.password && (
            <div className={`p-3 rounded-lg text-sm ${
              passwordValidation.isValid 
                ? "bg-green-50 border border-green-200" 
                : "bg-red-50 border border-red-200"
            }`}>
              <p className={`font-semibold mb-2 ${
                passwordValidation.isValid ? "text-green-700" : "text-red-700"
              }`}>
                {passwordValidation.isValid ? "✓ Contraseña válida" : "Requisitos de contraseña:"}
              </p>
              {!passwordValidation.isValid && (
                <ul className="space-y-1 text-xs">
                  <li className={`flex items-center gap-2 ${
                    /[a-zA-Z]/.test(formData.password) ? "text-green-600" : "text-red-600"
                  }`}>
                    {/[a-zA-Z]/.test(formData.password) ? "✓" : "✗"} Al menos una letra
                  </li>
                  <li className={`flex items-center gap-2 ${
                    /[0-9]/.test(formData.password) ? "text-green-600" : "text-red-600"
                  }`}>
                    {/[0-9]/.test(formData.password) ? "✓" : "✗"} Al menos un número
                  </li>
                  <li className={`flex items-center gap-2 ${
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "text-green-600" : "text-red-600"
                  }`}>
                    {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "✓" : "✗"} Al menos un carácter especial
                  </li>
                  <li className={`flex items-center gap-2 ${
                    formData.password.length <= 12 ? "text-green-600" : "text-red-600"
                  }`}>
                    {formData.password.length <= 12 ? "✓" : "✗"} Máximo 12 caracteres ({formData.password.length}/12)
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password */}
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
              value={confirmPassword}
              maxLength={12}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouchedConfirmPassword(true)}
              className={`pl-10 pr-10 w-full border rounded-md py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.password && confirmPassword && formData.password !== confirmPassword
                  ? "border-red-500 ring-red-500"
                  : formData.password && confirmPassword && formData.password === confirmPassword
                  ? "border-green-500 ring-green-500"
                  : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 cursor-pointer" />
              ) : (
                <Eye className="h-4 w-4 cursor-pointer" />
              )}
            </button>
          </div>
          
          {/* Validación de contraseña confirmada */}
          {confirmPassword && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
              formData.password === confirmPassword
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}>
              {formData.password === confirmPassword ? (
                <>
                  <span className="text-green-600 font-semibold">✓</span>
                  <p className="text-green-700">Las contraseñas coinciden</p>
                </>
              ) : (
                <>
                  <span className="text-red-600 font-semibold">✗</span>
                  <p className="text-red-700">Las contraseñas no coinciden</p>
                </>
              )}
            </div>
          )}
          
          {touchedConfirmPassword && !confirmPassword && (
            <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>
          )}
        </div>

        {/* Accept Terms */}
        <div className="space-y-1">
          <div className="flex items-start space-x-2">
            <Checkbox
              className="cursor-pointer mt-1"
              id="terminosCondiciones"
              checked={terminosCondiciones}
              onCheckedChange={(checked) => {
                if (checked) {
                  setShowModal(true)
                } else {
                  setTerminosCondiciones(false)
                }
                setTouchedTerminosCondiciones(true)
              }}
            />
            <Label htmlFor="terminosCondiciones" className="text-sm text-gray-600">
              Acepto los{" "}
              <Button
                type="button"
                variant="link"
                className="text-green-600 hover:text-lime-500 p-0 h-auto cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                términos y condiciones de servicio
              </Button>
            </Label>
          </div>
          {touchedTerminosCondiciones && !terminosCondiciones && (
            <p className="text-red-500 text-xs">Debe aceptar los términos y condiciones</p>
          )}
        </div>

        {/* Modal de Política */}
        {showModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="policy-title"
            aria-describedby="policy-body"
            className="fixed inset-0 z-[9999] bg-black bg-opacity-40 flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onPointerDownCapture={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onMouseDownCapture={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 w-full max-w-md rounded-lg shadow-xl max-h-[80vh] overflow-auto"
            >
              <h2 id="policy-title" className="text-lg font-semibold mb-4 text-center">
                Politica de seguridad de la informacion
              </h2>
              <div id="policy-body" className="text-sm text-gray-700 space-y-3 mb-6">
                <p>Al registrarse en Time2Go, el usuario autoriza de manera previa, expresa e informada el tratamiento de sus datos personales conforme a lo establecido en la Ley 1581 de 2012 y demas normas concordantes.</p>
                <p>Los datos personales suministrados seran tratados por Time2Go con la finalidad de permitir el registro en la plataforma, brindar informacion sobre eventos en la ciudad de Bucaramanga, enviar comunicaciones informativas y mejorar la experiencia del usuario.</p>
                <p>El titular podra ejercer en cualquier momento sus derechos de acceso, actualizacion, rectificacion y supresion de datos, asi como revocar la autorizacion otorgada, conforme a la Politica de Tratamiento de Datos Personales, disponible en el sitio web.</p>
              </div>
              <div className="flex gap-10 justify-center">
                <Button variant="outline" onClick={handleReject} className="hover:scale-103">
                  Rechazar
                </Button>
                <Button
                  ref={acceptButtonRef}
                  onClick={handleAccept}
                  className="bg-gradient-to-tr from-green-600 to-lime-500 hover:scale-103 hover:bg-gradient-to-tr hover:from-green-500 hover:to-lime-500 text-white font-medium rounded-md"
                >
                  Aceptar
                </Button>
              </div>
            </div>
          </div>
        )}

        {registroError && <p className="text-red-500 text-sm">{registroError}</p>}
        <div className="flex flex-col items-center space-y-4">
        <Button
          type="submit"
          className="w-80 bg-gradient-to-tr from-fuchsia-700 to-red-500 text-white font-medium py-6 rounded-sm text-lg transition-all duration-300 ease-in-out hover:scale-103 hover:from-fuchsia-600 hover:to-red-500 hover:text-white">
          Crear Cuenta
        </Button>
        </div>
      </form>

      {/* Duplicate Modal */}
      {duplicateModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dup-title"
        >
          <div className="bg-white rounded-md p-6 w-full max-w-sm shadow-lg">
            <h3 id="dup-title" className="text-lg font-semibold mb-2">
              Campos ya registrados
            </h3>
            <p className="text-sm text-gray-700 mb-4">{duplicateModal.message}</p>
            {duplicateModal.duplicates.length > 0 && (
              <ul className="text-sm text-gray-600 mb-4 list-disc list-inside">
                {duplicateModal.duplicates.map((dup, idx) => (
                  <li key={idx}>{dup}</li>
                ))}
              </ul>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleDuplicateModalClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
