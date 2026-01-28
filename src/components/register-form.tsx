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
  tipDoc: string
  document: string
  firstName: string
  lastName: string
  pais: string | number
  telefono: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registroError, setRegistroError] = useState("")
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
    tipDoc: "",
    document: "",
    firstName: "",
    lastName: "",
    pais: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  }

  const [formData, setFormData] = useState<FormFields>(formDataInicial)
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
    acceptTerms: false,
  })

  // Cargar lista de países
  useEffect(() => {
    fetch("/api/llamar_pais")
      .then((res) => res.json())
      .then((data) => setListaPaises(data))
      .catch((err) => console.error("Error al cargar países:", err))
  }, [])

  // Control del focus en el modal de política
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

  const handleBlur = (field: keyof FormFields) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

  const handleInputChange = (field: keyof FormFields, value: string | boolean | number) => {
    setFormData((prev: FormFields) => ({ ...prev, [field]: value } as FormFields))
  }

  const handleTipDocChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    handleInputChange("tipDoc", value)
    handleInputChange("document", "")
  }

  const handleNumDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()

    if (formData.tipDoc === "Pasaporte") {
      if (/^[A-Z0-9]*$/.test(value)) {
        const lettersCount = (value.match(/[A-Z]/g) || []).length
        if (lettersCount < 3) {
          setFormData({ ...formData, document: value })
        } else {
          if (/^[A-Z]{3}[0-9]*$/.test(value)) {
            setFormData({ ...formData, document: value })
          }
        }
      }
    } else {
      if (/^[0-9]*$/.test(value)) {
        setFormData({ ...formData, document: value })
      }
    }
  }

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[0-9]*$/.test(value) && value.length <= 10) {
      handleInputChange("telefono", value)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    handleInputChange("email", value)
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

  const handleAccept = () => {
    handleInputChange("acceptTerms", true)
    setShowModal(false)
  }

  const handleReject = () => {
    setFormData(formDataInicial)
    setRegistroError("")
    setShowModal(false)
  }

  const handleDuplicateModalClose = () => {
    setDuplicateModal({ open: false, duplicates: [], message: undefined })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistroError("")

    // Validate required fields
    const requiredFields: (keyof FormFields)[] = [
      "tipDoc",
      "document",
      "firstName",
      "lastName",
      "pais",
      "telefono",
      "email",
      "password",
      "confirmPassword",
    ]
    const missing = requiredFields.filter((f) => !formData[f] || String(formData[f]).trim() === "")
    if (missing.length > 0) {
      setTouchedFields(
        (prev) => ({ ...prev, ...Object.fromEntries(missing.map((k) => [k, true])) })
      )
      setRegistroError("Por favor completa los campos obligatorios.")
      return
    }

    if (!formData.acceptTerms) {
      setTouchedFields((prev) => ({ ...prev, acceptTerms: true }))
      setRegistroError("Debe aceptar los términos y condiciones.")
      return
    }

    if (!formData.password || formData.password !== formData.confirmPassword) {
      setTouchedFields((prev) => ({ ...prev, password: true, confirmPassword: true }))
      setRegistroError("Las contraseñas no coinciden.")
      return
    }

    // Validar fortaleza de contraseña
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
          tipDoc: formData.tipDoc,
          document: formData.document,
          firstName: formData.firstName,
          lastName: formData.lastName,
          pais: formData.pais,
          telefono: formData.telefono,
          email: formData.email,
          password: formData.password,
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
      // Redirigir a auth con parámetro de registro exitoso
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
        {/* Tipo de Documento */}
        <div className="space-y-2">
          <Label htmlFor="tipDoc" className="text-sm font-medium">
            Tipo de Documento
          </Label>
          <select
            id="tipDoc"
            value={formData.tipDoc}
            onChange={handleTipDocChange}
            onBlur={() => handleBlur("tipDoc")}
            className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
              touchedFields.tipDoc && !formData.tipDoc ? "border-red-500 ring-red-500" : "border-gray-300"
            }`}
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
        </div>

        {/* Número de Documento */}
        <div className="space-y-2">
          <Label htmlFor="document" className="text-sm font-medium">
            Número de Documento
          </Label>
          <input
            id="document"
            value={formData.document}
            onChange={handleNumDocChange}
            disabled={!formData.tipDoc}
            aria-disabled={!formData.tipDoc}
            onBlur={() => handleBlur("document")}
            className={`w-full border rounded-md px-3 py-2 text-sm ${
              !formData.tipDoc ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-gray-700"
            } ${
              touchedFields.document && !formData.document ? "border-red-500 ring-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2`}
            placeholder="Ingrese el número de documento"
          />
          {touchedFields.document && !formData.document && (
            <p className="text-red-500 text-xs -mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* Nombres y Apellidos */}
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
              onBlur={() => handleBlur("firstName")}
              className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touchedFields.firstName && !formData.firstName ? "border-red-500 ring-red-500" : "border-gray-300"
              }`}
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
              onBlur={() => handleBlur("lastName")}
              className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touchedFields.lastName && !formData.lastName ? "border-red-500 ring-red-500" : "border-gray-300"
              }`}
              placeholder="Ingrese sus apellidos"
            />
            {touchedFields.lastName && !formData.lastName && (
              <p className="text-red-500 text-xs -mt-1">Este campo es obligatorio</p>
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
            className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              touchedFields.email && !formData.email ? "border-red-500 ring-red-500" : "border-gray-300"
            }`}
            placeholder="ejemplo@correo.com"
          />
          {touchedFields.email && !formData.email && (
            <p className="text-red-500 text-xs -mt-1">Este campo es obligatorio</p>
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
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              className={`pl-10 pr-10 w-full border rounded-md py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? "border-red-500 ring-red-500"
                  : formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
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
          {formData.confirmPassword && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
              formData.password === formData.confirmPassword
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}>
              {formData.password === formData.confirmPassword ? (
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
          
          {touchedFields.confirmPassword && !formData.confirmPassword && (
            <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>
          )}
        </div>

        {/* Accept Terms */}
        <div className="flex items-start space-x-2">
          <Checkbox
            className="cursor-pointer mt-1"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
          />
          <Label htmlFor="acceptTerms" className="text-sm text-gray-600">
            Acepto los{" "}
            <Button
              type="button"
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
        </div>

        {/* Modal de Política */}
        {showModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="policy-title"
            aria-describedby="policy-body"
            className="fixed inset-0 z-[9999] bg-black bg-opacity-75 flex items-center justify-center"
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
                Política de seguridad de la información
              </h2>
              <div id="policy-body" className="text-sm text-gray-700 space-y-3 mb-6">
                <p>Al registrarse en Time2Go, el usuario autoriza de manera previa, expresa e informada el tratamiento de sus datos personales conforme a lo establecido en la Ley 1581 de 2012 y demás normas concordantes.</p>
                <p>Los datos personales suministrados serán tratados por Time2Go con la finalidad de permitir el registro en la plataforma, brindar información sobre eventos en la ciudad de Bucaramanga, enviar comunicaciones informativas y mejorar la experiencia del usuario.</p>
                <p>El titular podrá ejercer en cualquier momento sus derechos de acceso, actualización, rectificación y supresión de datos, así como revocar la autorización otorgada, conforme a la Política de Tratamiento de Datos Personales, disponible en el sitio web.</p>
              </div>
              <div className="flex justify-center space-x-2">
                <Button variant="outline" onClick={handleReject}>
                  Rechazar
                </Button>
                <Button ref={acceptButtonRef} onClick={handleAccept}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-md">
                  Aceptar
                </Button>
              </div>
            </div>
          </div>
        )}

        {registroError && <p className="text-red-500 text-sm">{registroError}</p>}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 hover:from-blue-700 hover:via-purple-700 hover:to-violet-700 text-white font-medium py-6 rounded-sm text-lg"
        >
          Crear Cuenta
        </Button>
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
