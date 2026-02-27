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

const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
]

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

  useEffect(() => {
    fetch("/api/llamar_pais")
      .then((res) => res.json())
      .then((data) => setListaPaises(data))
      .catch((err) => console.error("Error al cargar países:", err))
  }, [])

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
        if (focusable.length === 0) { e.preventDefault(); return }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (!e.shiftKey && active === last) { e.preventDefault(); first.focus() }
        else if (e.shiftKey && active === first) { e.preventDefault(); last.focus() }
      }
    }
    document.addEventListener("keydown", onKey, true)
    setTimeout(() => { acceptButtonRef.current?.focus() }, 0)
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

  const handleFirstnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) handleInputChange("firstName", value)
  }

  const handleLastnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) handleInputChange("lastName", value)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[0-9]*$/.test(value) && value.length <= 10) handleInputChange("telefono", value)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    handleInputChange("email", value)
    if (!emailRegex.test(value)) { setEmailError("Formato de correo inválido"); return }
    if (!isAllowedEmail(value)) { setEmailError("Solo se permiten dominios: gmail.com, outlook.com, yahoo.com, icloud.com, proton.me, protonmail.com."); return }
    setEmailError("")
  }

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    if (password.length > 12) errors.push("Máximo 12 caracteres")
    if (!/[a-zA-Z]/.test(password)) errors.push("Al menos una letra")
    if (!/[0-9]/.test(password)) errors.push("Al menos un número")
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("Al menos un carácter especial")
    return { isValid: errors.length === 0, errors }
  }

  const handleDuplicateModalClose = () => {
    setDuplicateModal({ open: false, duplicates: [], message: undefined })
  }

  const handleAccept = () => {
    setTerminosCondiciones(true)
    setTouchedTerminosCondiciones(true)
    setShowModal(false)
  }

  const handleReject = () => {
    setTerminosCondiciones(false)
    setShowModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistroError("")
    const requiredFields: (keyof FormFields)[] = ["firstName", "lastName", "pais", "telefono", "email", "password"]
    const missing = requiredFields.filter((f) => !formData[f] || String(formData[f]).trim() === "")
    if (missing.length > 0) {
      setTouchedFields((prev) => ({ ...prev, ...Object.fromEntries(missing.map((k) => [k, true])) }))
      setRegistroError("Por favor completa los campos obligatorios.")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) { setTouchedFields((prev) => ({ ...prev, email: true })); setRegistroError("Formato de correo inválido."); return }
    if (!isAllowedEmail(formData.email)) { setTouchedFields((prev) => ({ ...prev, email: true })); setRegistroError("Solo se permiten dominios: gmail.com, outlook.com, yahoo.com, icloud.com, proton.me, protonmail.com."); return }
    if (!terminosCondiciones) { setTouchedTerminosCondiciones(true); setRegistroError("Debe aceptar los términos y condiciones."); return }
    if (!formData.password || formData.password !== confirmPassword) { setTouchedFields((prev) => ({ ...prev, password: true })); setTouchedConfirmPassword(true); setRegistroError("Las contraseñas no coinciden."); return }
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) { setTouchedFields((prev) => ({ ...prev, password: true })); setRegistroError(`Contraseña inválida: ${passwordValidation.errors.join(", ")}`); return }
    try {
      const res = await fetch("/api/usuario_formulario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: formData.firstName, lastName: formData.lastName, pais: formData.pais, telefono: formData.telefono, email: formData.email, password: formData.password, terminosCondiciones }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRegistroError(data.error || "Error al crear usuario.")
        if (res.status === 409) setDuplicateModal({ open: true, duplicates: data.duplicates || [], message: data.error })
        return
      }
      setRegistroError("")
      setFormData(formDataInicial)
      setConfirmPassword("")
      setTerminosCondiciones(false)
      setTimeout(() => { onSuccess() }, 500)
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
            <Label htmlFor="firstname" className="text-sm font-medium">Nombres</Label>
            <input
              id="firstname" type="text" value={formData.firstName}
              onChange={handleFirstnameChange} onBlur={() => handleBlur("firstName")}
              className={`w-full border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 ${touchedFields.firstName && !formData.firstName ? "border-red-500 ring-red-500" : "border-gray-300"}`}
              placeholder="Ingrese sus nombres"
            />
            {touchedFields.firstName && !formData.firstName && <p className="text-red-500 text-xs -mt-0.5">Este campo es obligatorio</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname" className="text-sm font-medium">Apellidos</Label>
            <input
              id="lastName" type="text" value={formData.lastName}
              onChange={handleLastnameChange} onBlur={() => handleBlur("lastName")}
              className={`w-full border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 ${touchedFields.lastName && !formData.lastName ? "border-red-500 ring-red-500" : "border-gray-300"}`}
              placeholder="Ingrese sus apellidos"
            />
            {touchedFields.lastName && !formData.lastName && <p className="text-red-500 text-xs -mt-0.5">Este campo es obligatorio</p>}
          </div>
        </div>

        {/* País */}
        <div className="space-y-2">
          <Label htmlFor="pais" className="text-sm font-medium">País</Label>
          <select
            id="pais" value={formData.pais}
            onChange={(e) => handleInputChange("pais", e.target.value)} onBlur={() => handleBlur("pais")}
            className={`pl-3 pr-4 py-2 w-full border rounded-md text-sm bg-card cursor-pointer ${touchedFields.pais && !formData.pais ? "border-red-500 ring-red-500" : "border-gray-300"}`}
          >
            <option value="">Selecciona un país</option>
            {listaPaises.map((pais) => (<option key={pais.value} value={pais.value}>{pais.label}</option>))}
          </select>
          {touchedFields.pais && !formData.pais && <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-sm font-medium">Teléfono</Label>
          <input
            id="telefono" type="tel" placeholder="1234567890" value={formData.telefono}
            onChange={handlePhoneChange} onBlur={() => handleBlur("telefono")}
            className={`w-full border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 ${touchedFields.telefono && !formData.telefono ? "border-red-500 ring-red-500" : "border-gray-300"}`}
          />
          {touchedFields.telefono && !formData.telefono && <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email" type="text" value={formData.email}
            onChange={handleEmailChange} onBlur={() => handleBlur("email")}
            autoCapitalize="none"
            className={`w-full border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 ${(touchedFields.email && !formData.email) || emailError ? "border-red-500 ring-red-500" : "border-gray-300"}`}
            placeholder="ejemplo@correo.com"
          />
          {emailError && <p className="text-red-500 text-xs -mt-0.5">{emailError}</p>}
          {touchedFields.email && !formData.email && !emailError && <p className="text-red-500 text-xs -mt-0.5">Este campo es obligatorio</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
              value={formData.password} maxLength={12} onBlur={() => handleBlur("password")}
              onChange={(e) => {
                const value = e.target.value
                handleInputChange("password", value)
                if (value) setPasswordValidation(validatePassword(value))
                else setPasswordValidation({ isValid: false, errors: [] })
              }}
              className="pl-10 pr-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {touchedFields.password && !formData.password && <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>}
          {formData.password && (
            <div className={`p-3 rounded-lg text-sm ${passwordValidation.isValid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <p className={`font-semibold mb-2 ${passwordValidation.isValid ? "text-green-700" : "text-red-700"}`}>
                {passwordValidation.isValid ? "✓ Contraseña válida" : "Requisitos de contraseña:"}
              </p>
              {!passwordValidation.isValid && (
                <ul className="space-y-1 text-xs">
                  <li className={`flex items-center gap-2 ${/[a-zA-Z]/.test(formData.password) ? "text-green-600" : "text-red-600"}`}>{/[a-zA-Z]/.test(formData.password) ? "✓" : "✗"} Al menos una letra</li>
                  <li className={`flex items-center gap-2 ${/[0-9]/.test(formData.password) ? "text-green-600" : "text-red-600"}`}>{/[0-9]/.test(formData.password) ? "✓" : "✗"} Al menos un número</li>
                  <li className={`flex items-center gap-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "text-green-600" : "text-red-600"}`}>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "✓" : "✗"} Al menos un carácter especial</li>
                  <li className={`flex items-center gap-2 ${formData.password.length <= 12 ? "text-green-600" : "text-red-600"}`}>{formData.password.length <= 12 ? "✓" : "✗"} Máximo 12 caracteres ({formData.password.length}/12)</li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
              value={confirmPassword} maxLength={12}
              onChange={(e) => setConfirmPassword(e.target.value)} onBlur={() => setTouchedConfirmPassword(true)}
              className={`pl-10 pr-10 w-full border rounded-md py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.password && confirmPassword && formData.password !== confirmPassword ? "border-red-500 ring-red-500"
                : formData.password && confirmPassword && formData.password === confirmPassword ? "border-green-500 ring-green-500"
                : "border-gray-300"}`}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${formData.password === confirmPassword ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              {formData.password === confirmPassword
                ? <><span className="text-green-600 font-semibold">✓</span><p className="text-green-700">Las contraseñas coinciden</p></>
                : <><span className="text-red-600 font-semibold">✗</span><p className="text-red-700">Las contraseñas no coinciden</p></>}
            </div>
          )}
          {touchedConfirmPassword && !confirmPassword && <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>}
        </div>

        {/* Accept Terms */}
        <div className="space-y-1">
          <div className="flex items-start space-x-2">
            <Checkbox
              className="cursor-pointer mt-1"
              id="terminosCondiciones"
              checked={terminosCondiciones}
              onCheckedChange={(checked) => {
                if (checked) setShowModal(true)
                else setTerminosCondiciones(false)
                setTouchedTerminosCondiciones(true)
              }}
            />
            <Label htmlFor="terminosCondiciones" className="text-sm text-muted-foreground">
              Acepto los{" "}
              <Button type="button" variant="link" className="text-green-600 hover:text-lime-500 p-0 h-auto cursor-pointer" onClick={() => setShowModal(true)}>
                términos y condiciones de servicio
              </Button>
            </Label>
          </div>
          {touchedTerminosCondiciones && !terminosCondiciones && <p className="text-red-500 text-xs">Debe aceptar los términos y condiciones</p>}
        </div>

        {/* Modal de Política */}
        {showModal && (
          <div
            role="dialog" aria-modal="true" aria-labelledby="policy-title" aria-describedby="policy-body"
            className="fixed inset-0 z-[9999] bg-green-950/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
            onPointerDownCapture={(e) => { e.preventDefault(); e.stopPropagation() }}
            onMouseDownCapture={(e) => { e.preventDefault(); e.stopPropagation() }}
          >
            <div ref={modalRef} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-lime-500 px-6 py-5">
                <h2 id="policy-title" className="text-white font-bold text-lg leading-tight">
                  Términos y Condiciones
                </h2>
                <p className="text-white/80 text-xs mt-0.5">Time2Go · Ley 1581 de 2012</p>
              </div>

              {/* Contenido */}
              <div id="policy-body" className="px-6 py-5 max-h-[50vh] overflow-y-auto space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Autorización de tratamiento de datos</p>
                    <p className="text-sm text-gray-600 leading-relaxed">Al registrarse en Time2Go, el usuario autoriza de manera previa, expresa e informada el tratamiento de sus datos personales conforme a la Ley 1581 de 2012 y demás normas concordantes.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Finalidad del tratamiento</p>
                    <p className="text-sm text-gray-600 leading-relaxed">Los datos suministrados serán tratados para permitir el registro en la plataforma, brindar información sobre eventos en Bucaramanga y área metropolitana, enviar comunicaciones informativas y mejorar la experiencia del usuario.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Derechos del titular (Habeas Data)</p>
                    <p className="text-sm text-gray-600 leading-relaxed">El titular podrá ejercer en cualquier momento sus derechos de acceso, actualización, rectificación y supresión de datos, así como revocar la autorización otorgada, a través de nuestros canales de soporte.</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Para más información consulta nuestra{" "}
                    <a href="/legal#privacidad" target="_blank" className="text-green-600 hover:underline font-medium cursor-pointer">
                      Política de Privacidad completa
                    </a>
                    {" "}disponible en el sitio web.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
                <Button variant="outline" onClick={handleReject} className="border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer">
                  Rechazar
                </Button>
                <Button
                  ref={acceptButtonRef} onClick={handleAccept}
                  className="bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600 text-white font-semibold cursor-pointer"
                >
                  Aceptar y continuar
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-labelledby="dup-title">
          <div className="bg-card rounded-md p-6 w-full max-w-sm shadow-lg">
            <h3 id="dup-title" className="text-lg font-semibold mb-2">Campos ya registrados</h3>
            <p className="text-sm text-foreground mb-4">{duplicateModal.message}</p>
            {duplicateModal.duplicates.length > 0 && (
              <ul className="text-sm text-muted-foreground mb-4 list-disc list-inside">
                {duplicateModal.duplicates.map((dup, idx) => (<li key={idx}>{dup}</li>))}
              </ul>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleDuplicateModalClose} className="cursor-pointer">Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}