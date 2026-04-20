"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { EmailInputField } from "@/components/auth-form-parts/email-input-field"
import { PasswordInputField } from "@/components/auth-form-parts/password-input-field"
import { DuplicateFieldsModal } from "@/components/register-form-parts/duplicate-fields-modal"
import { PasswordRequirements } from "@/components/register-form-parts/password-requirements"
import { TermsConditionsModal } from "@/components/register-form-parts/terms-conditions-modal"
import { useRegisterForm } from "@/hooks/use-register-form"

interface RegisterFormProps {
  onSuccess: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const {
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
  } = useRegisterForm(onSuccess)

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombres y Apellidos */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstname" className="text-sm font-medium">Nombres</Label>
            <input
              id="firstname" type="text" value={formData.firstName}
              onChange={(e) => handleNameChange("firstName", e)} onBlur={() => handleBlur("firstName")}
              maxLength={MAX_NAME_LENGTH}
              className={`w-full border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 ${touchedFields.firstName && !formData.firstName ? "border-red-500 ring-red-500" : "border-gray-300"}`}
              placeholder="Ingrese sus nombres"
            />
            {touchedFields.firstName && !formData.firstName && <p className="text-red-500 text-xs -mt-0.5">Este campo es obligatorio</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname" className="text-sm font-medium">Apellidos</Label>
            <input
              id="lastName" type="text" value={formData.lastName}
              onChange={(e) => handleNameChange("lastName", e)} onBlur={() => handleBlur("lastName")}
              maxLength={MAX_NAME_LENGTH}
              className={`w-full border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 ${touchedFields.lastName && !formData.lastName ? "border-red-500 ring-red-500" : "border-gray-300"}`}
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
            onChange={handleCountryChange} onBlur={() => handleBlur("pais")}
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
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            className={`w-full border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 ${(touchedFields.telefono && !formData.telefono) || phoneError ? "border-red-500 ring-red-500" : "border-gray-300"}`}
          />
          {phoneError && <p className="text-red-500 text-xs mt-0.5">{phoneError}</p>}
          {touchedFields.telefono && !formData.telefono && <p className="text-red-500 text-xs mt-0.5">Este campo es obligatorio</p>}
        </div>

        {/* Email */}
        <EmailInputField
          value={formData.email}
          onChange={handleEmailChange}
          onBlur={() => handleBlur("email")}
          maxLength={EMAIL_MAX_LENGTH}
          hasError={(touchedFields.email && !formData.email) || Boolean(emailError)}
          errorMessage={emailError}
          showRequiredError={touchedFields.email && !formData.email}
        />

        {/* Password */}
        <div className="space-y-2">
          <PasswordInputField
            id="password"
            label="Contraseña"
            value={formData.password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur("password")}
            maxLength={PASSWORD_MAX_LENGTH}
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)}
            hasError={touchedFields.password && !formData.password}
            errorMessage={touchedFields.password && !formData.password ? "Este campo es obligatorio" : undefined}
          >
          <PasswordRequirements
            password={formData.password}
            minLength={PASSWORD_MIN_LENGTH}
            isValid={passwordValidation.isValid}
          />
          </PasswordInputField>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <PasswordInputField
            id="confirmPassword"
            label="Confirmar Contraseña"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onBlur={() => setTouchedConfirmPassword(true)}
            maxLength={PASSWORD_MAX_LENGTH}
            showPassword={showConfirmPassword}
            onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
            hasError={Boolean(formData.password && confirmPassword && formData.password !== confirmPassword)}
            errorMessage={touchedConfirmPassword && !confirmPassword ? "Este campo es obligatorio" : undefined}
          >
          {confirmPassword && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${formData.password === confirmPassword ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              {formData.password === confirmPassword
                ? <><span className="text-green-600 font-semibold">✓</span><p className="text-green-700">Las contraseñas coinciden</p></>
                : <><span className="text-red-600 font-semibold">✗</span><p className="text-red-700">Las contraseñas no coinciden</p></>}
            </div>
          )}
          </PasswordInputField>
        </div>

        {/* Accept Terms */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <Checkbox
              className="cursor-pointer mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              id="terminosCondiciones"
              checked={terminosCondiciones}
              onCheckedChange={(checked) => {
                handleTermsCheckedChange(Boolean(checked))
              }}
            />
            <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
              <div className="flex items-center gap-1">
                <Label htmlFor="terminosCondiciones" className="cursor-pointer">
                  Acepto los
                </Label>
                <Button type="button" variant="link" className="text-green-600 hover:text-lime-500 p-0 h-auto cursor-pointer align-baseline" onClick={openTermsModal}>
                  términos y condiciones de servicio
                </Button>
              </div>
              <p>(incluye privacidad, baneos y reporte de eventos).</p>
            </div>
          </div>
          {touchedTerminosCondiciones && !terminosCondiciones && <p className="text-red-500 text-xs">Debe aceptar los términos y condiciones</p>}
        </div>

        {registroError && <p className="w-80 mx-auto text-center text-red-500 text-sm">{registroError}</p>}
        <div className="flex flex-col items-center space-y-4">
          <Button
            type="submit"
            className="w-80 bg-rose-600 text-white font-medium py-6 rounded-sm text-lg transition-all duration-300 ease-in-out hover:scale-103 hover:bg-rose-500 hover:text-white">
            Crear Cuenta
          </Button>
        </div>
      </form>

      <TermsConditionsModal open={showModal} onAccept={handleAcceptTerms} onReject={handleRejectTerms} />

      <DuplicateFieldsModal
        open={duplicateModal.open}
        duplicates={duplicateModal.duplicates}
        message={duplicateModal.message}
        onClose={handleDuplicateModalClose}
      />
    </>
  )
}