"use client"

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import type { RegisterStep } from "@/components/register-form-parts/registration-progress-modal"

import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  REGISTER_PASSWORD_LENGTH,
  getEmailError,
  sanitizeEmail,
  sanitizePassword,
  validateRegisterPassword,
} from "@/lib/auth-form-validation"

type FormFields = {
  firstName: string
  lastName: string
  pais: string | number
  telefono: string
  email: string
  password: string
}

type DuplicateModalState = {
  open: boolean
  duplicates: string[]
  message?: string
}

const MAX_NAME_LENGTH = 50
const PHONE_LENGTH = 10
const PASSWORD_MIN_LENGTH = REGISTER_PASSWORD_LENGTH

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
const DIGITS_REGEX = /^\d+$/
const DIGITS_PARTIAL_REGEX = /^\d*$/

const formDataInicial: FormFields = {
  firstName: "",
  lastName: "",
  pais: "",
  telefono: "",
  email: "",
  password: "",
}

export function useRegisterForm(onSuccess: () => void) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [terminosCondiciones, setTerminosCondiciones] = useState(false)
  const [registroError, setRegistroError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: false,
    errors: [],
  })
  const [listaPaises, setListaPaises] = useState<{ value: number; label: string }[]>([])
  const [duplicateModal, setDuplicateModal] = useState<DuplicateModalState>({ open: false, duplicates: [] })
  const [registerStep, setStep] = useState<RegisterStep>("idle")

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

  const handleBlur = (field: keyof FormFields) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

  const handleInputChange = <K extends keyof FormFields>(field: K, value: FormFields[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const touchField = (field: keyof FormFields) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

  const touchMultipleFields = (fields: (keyof FormFields)[]) => {
    setTouchedFields((prev) => ({ ...prev, ...Object.fromEntries(fields.map((field) => [field, true])) }))
  }

  const handleNameChange = (field: "firstName" | "lastName", event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (NAME_REGEX.test(value) && value.length <= MAX_NAME_LENGTH) {
      handleInputChange(field, value)
    }
  }

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (DIGITS_PARTIAL_REGEX.test(value) && value.length <= PHONE_LENGTH) {
      handleInputChange("telefono", value)
      if (phoneError) setPhoneError("")
    }
  }

  const validatePhone = (phone: string): boolean => {
    if (!DIGITS_REGEX.test(phone)) return false
    if (phone.length !== PHONE_LENGTH) return false
    return Number(phone) > 2999999999
  }

  const handlePhoneBlur = () => {
    handleBlur("telefono")
    if (formData.telefono && !validatePhone(formData.telefono)) {
      setPhoneError("El número de teléfono debe tener 10 dígitos válidos.")
    } else {
      setPhoneError("")
    }
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeEmail(event.target.value)
    handleInputChange("email", value)
    setEmailError(getEmailError(value))
  }

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    handleInputChange("pais", event.target.value)
  }

  const validatePassword = (password: string) => {
    return validateRegisterPassword(password, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = sanitizePassword(event.target.value)
    handleInputChange("password", value)
    if (value) setPasswordValidation(validatePassword(value))
    else setPasswordValidation({ isValid: false, errors: [] })
  }

  const handleConfirmPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(sanitizePassword(event.target.value))
  }

  const handleTermsCheckedChange = (checked: boolean) => {
    setTerminosCondiciones(checked)
    setTouchedTerminosCondiciones(true)
  }

  const handleDuplicateModalClose = () => {
    setDuplicateModal({ open: false, duplicates: [], message: undefined })
  }

  const handleAcceptTerms = () => {
    setTerminosCondiciones(true)
    setTouchedTerminosCondiciones(true)
    setShowModal(false)
  }

  const handleRejectTerms = () => {
    setTerminosCondiciones(false)
    setShowModal(false)
  }

  const openTermsModal = () => setShowModal(true)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setRegistroError("")
    setEmailError("")

    const sanitizedEmail = sanitizeEmail(formData.email)
    const sanitizedPassword = sanitizePassword(formData.password)
    const sanitizedConfirmPassword = sanitizePassword(confirmPassword)

    if (sanitizedEmail !== formData.email || sanitizedPassword !== formData.password) {
      setFormData((prev) => ({
        ...prev,
        email: sanitizedEmail,
        password: sanitizedPassword,
      }))
    }
    if (sanitizedConfirmPassword !== confirmPassword) setConfirmPassword(sanitizedConfirmPassword)

    const requiredFields: (keyof FormFields)[] = ["firstName", "lastName", "pais", "telefono", "email", "password"]
    const normalizedFormData: FormFields = {
      ...formData,
      email: sanitizedEmail,
      password: sanitizedPassword,
    }
    const missing = requiredFields.filter((field) => !normalizedFormData[field] || String(normalizedFormData[field]).trim() === "")

    if (missing.length > 0) {
      touchMultipleFields(missing)
      setRegistroError("Por favor completa los campos obligatorios.")
      return
    }

    if (!validatePhone(normalizedFormData.telefono)) {
      touchField("telefono")
      setPhoneError("El número de teléfono debe tener 10 dígitos válidos.")
      setRegistroError("El número de teléfono no es válido.")
      return
    }

    const normalizedEmailError = getEmailError(normalizedFormData.email)
    if (normalizedEmailError) {
      touchField("email")
      setEmailError(normalizedEmailError)
      setRegistroError(normalizedEmailError)
      return
    }

    if (!terminosCondiciones) {
      setTouchedTerminosCondiciones(true)
      setRegistroError("Debe aceptar los términos y condiciones.")
      return
    }

    if (!normalizedFormData.password || normalizedFormData.password !== sanitizedConfirmPassword) {
      touchField("password")
      setTouchedConfirmPassword(true)
      setRegistroError("Las contraseñas no coinciden.")
      return
    }

    const currentPasswordValidation = validatePassword(normalizedFormData.password)
    if (!currentPasswordValidation.isValid) {
      touchField("password")
      setRegistroError(`Contraseña inválida: ${currentPasswordValidation.errors.join(", ")}`)
      return
    }

    setStep("validating")

    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 700))
      setStep("creating")

      const response = await fetch("/api/usuario_formulario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: normalizedFormData.firstName,
          lastName: normalizedFormData.lastName,
          pais: normalizedFormData.pais,
          telefono: normalizedFormData.telefono,
          email: normalizedFormData.email,
          password: normalizedFormData.password,
          terminosCondiciones,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setStep("idle")
        setRegistroError(data.error || "Error al crear usuario.")
        if (response.status === 409) {
          setDuplicateModal({ open: true, duplicates: data.duplicates || [], message: data.error })
        }
        return
      }

      setStep("success")
      setRegistroError("")
      setFormData(formDataInicial)
      setConfirmPassword("")
      setTerminosCondiciones(false)
      setTouchedConfirmPassword(false)
      setTouchedTerminosCondiciones(false)
      setTouchedFields({
        firstName: false,
        lastName: false,
        pais: false,
        telefono: false,
        email: false,
        password: false,
      })
      setPasswordValidation({ isValid: false, errors: [] })

      await new Promise<void>((resolve) => setTimeout(resolve, 1800))
      setStep("idle")
      onSuccess()
    } catch (err) {
      console.error("Registro error:", err)
      setStep("idle")
      setRegistroError("Error de red. Intenta nuevamente.")
    }
  }

  return {
    registerStep,
    confirmPassword,
    duplicateModal,
    emailError,
    formData,
    listaPaises,
    phoneError,
    registroError,
    showConfirmPassword,
    showModal,
    showPassword,
    terminosCondiciones,
    touchedConfirmPassword,
    touchedFields,
    touchedTerminosCondiciones,
    passwordValidation,
    EMAIL_MAX_LENGTH,
    MAX_NAME_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    handleAcceptTerms,
    handleBlur,
    handleConfirmPasswordChange,
    handleCountryChange,
    handleDuplicateModalClose,
    handleEmailChange,
    handleNameChange,
    handlePasswordChange,
    handlePhoneBlur,
    handlePhoneChange,
    handleRejectTerms,
    handleSubmit,
    handleTermsCheckedChange,
    openTermsModal,
    setShowConfirmPassword,
    setShowPassword,
    setTouchedConfirmPassword,
  }
}
