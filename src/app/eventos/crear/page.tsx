"use client"
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ChevronDown } from "lucide-react";
// imageCompression removed — file upload UI simplified
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AdditionalInfoSection } from "@/components/events/create-event/additional-info-section";
import { TicketSection } from "@/components/events/create-event/ticket-section";
import { MediaSection } from "@/components/events/create-event/media-section";
import { CreateSiteModal } from "@/components/events/create-event/create-site-modal";
import { useCreateEventForm } from "@/hooks/use-create-event-form";

export default function CrearEventoPage() {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const {
    authorized,
    categorias,
    tiposDeEvento,
    sitios,
    busquedaSitio,
    isSitiosOpen,
    showTelefono2,
    successDialogOpen,
    isLoading,
    today,
    formErrors,
    newEvent,
    setNewEvent,
    setBusquedaSitio,
    setIsSitiosOpen,
    setShowTelefono2,
    setSuccessDialogOpen,
    setFieldError,
    clearFieldError,
    sanitizeAlphanumSpace,
    sanitizeTextWithPunct,
    handleCupoChange,
    addBoletaField,
    updateBoleta,
    removeBoletaField,
    removeAllBoletas,
    addInfoItem,
    updateInfoItem,
    removeInfoItem,
    refreshSitios,
    handleAddEvent,
  } = useCreateEventForm();
  const [createSiteModalOpen, setCreateSiteModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />
      <main className="flex-grow bg-background">
        <div className="pt-24 pb-16">
          {authorized === false && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="bg-card rounded-3xl shadow-xl p-8 text-center">
                <h2 className="text-2xl font-semibold text-red-600">Acceso denegado</h2>
                <p className="mt-4 text-muted-foreground">No estás autorizado para crear eventos. Inicia sesión con una cuenta que tenga permisos.</p>
                <div className="mt-6">
                  <Button onClick={() => router.push('/')} className="bg-lime-600 text-white">Volver al inicio</Button>
                </div>
              </div>
            </div>
          )}
          {authorized === null ? (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
              <div className="text-muted-foreground">Comprobando permisos...</div>
            </div>
          ) : authorized === true ? (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 mt-8">
              {/* Header with back button */}
              <div className="flex items-center gap-4 mb-10">
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  className="rounded-full h-10 w-10 p-0 hover:bg-gray-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="ml-29 text-center">
                  <h1 className="text-5xl font-bold bg-gradient-to-tr from-fuchsia-700 to-red-600 bg-clip-text text-transparent">Crear Nuevo Evento</h1>
                  <p className="text-muted-foreground mt-2">Completa el formulario para crear el evento</p>
                </div>
              </div>

              {/* Form */}
              <div className="bg-card rounded-3xl shadow-xl p-8 space-y-6">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Nombre del Evento</Label>
                  <Input
                    id="title"
                    value={newEvent.nombre_evento}
                    onChange={(e) => {
                      const value = sanitizeAlphanumSpace(e.target.value, 50);
                      clearFieldError("nombre_evento");
                      setNewEvent({ ...newEvent, nombre_evento: value });
                    }}
                    placeholder="Nombre completo del evento"
                    className="rounded-xl"
                    maxLength={50}
                  />
                  {formErrors.nombre_evento && (
                    <p className="text-xs text-red-600">{formErrors.nombre_evento}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pulep_evento">PULEP del evento</Label>
                  <Input
                    id="pulep_evento"
                    value={newEvent.pulep_evento}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
                      clearFieldError("pulep_evento");
                      setNewEvent({ ...newEvent, pulep_evento: value });
                    }}
                    placeholder="Código del Portal Único de Espectáculos Públicos de las Artes Escénicas"
                    className="rounded-xl"
                    maxLength={8}
                  />
                  <p className="text-xs text-muted-foreground">Este código identifica públicamente tu evento</p>
                  {formErrors.pulep_evento && (
                    <p className="text-xs text-red-600">{formErrors.pulep_evento}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsable_evento">Nombre de la entidad responsable del evento</Label>
                  <Input
                    id="responsable_evento"
                    value={newEvent.responsable_evento}
                    onChange={(e) => {
                      const value = sanitizeAlphanumSpace(e.target.value, 40);
                      clearFieldError("responsable_evento");
                      setNewEvent({ ...newEvent, responsable_evento: value });
                    }}
                    placeholder="Nombre completo de la entidad responsable del evento"
                    className="rounded-xl"
                    maxLength={40}
                  />
                  {formErrors.responsable_evento && (
                    <p className="text-xs text-red-600">{formErrors.responsable_evento}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="id_tipo_evento">Categoría del Evento</Label>
                    <Select
                      value={String(newEvent.id_categoria_evento || 0)}
                      onValueChange={(value) => {
                        clearFieldError("id_categoria_evento");
                        setNewEvent({ ...newEvent, id_categoria_evento: Number(value), id_tipo_evento: 0 });
                      }}
                    >
                      <SelectTrigger className="w-80 rounded-xl cursor-pointer">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Selecciona una categoría</SelectItem>
                        {categorias.map((cat) => (
                          <SelectItem 
                            className="rounded-xl cursor-pointer"
                            key={cat.id_categoria_evento} value={String(cat.id_categoria_evento)}>
                              {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.id_categoria_evento && (
                      <p className="text-xs text-red-600">{formErrors.id_categoria_evento}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Tipo de Evento</Label>
                    <Select
                      value={String(newEvent.id_tipo_evento || 0)}
                      onValueChange={(value) =>
                        {
                          clearFieldError("id_tipo_evento");
                          setNewEvent({ ...newEvent, id_tipo_evento: Number(value) });
                        }
                      }
                      disabled={!tiposDeEvento.length}
                    >
                      <SelectTrigger className="w-80 rounded-xl cursor-pointer">
                        <SelectValue placeholder="Selecciona un tipo de evento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">(Selecciona un tipo)</SelectItem>
                        {tiposDeEvento.map((tipo) => (
                          <SelectItem 
                            className="rounded-xl cursor-pointer"
                            key={tipo.id_tipo_evento} value={String(tipo.id_tipo_evento)}>
                              {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.id_tipo_evento && (
                      <p className="text-xs text-red-600">{formErrors.id_tipo_evento}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="sitio">Sitio del evento</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="sitio"
                      value={busquedaSitio}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 50);
                        clearFieldError("id_sitio");
                        setBusquedaSitio(value);
                        setNewEvent({ ...newEvent, id_sitio: 0 });
                        setIsSitiosOpen(true);
                      }}
                      placeholder="Escribe el nombre del sitio donde será el evento"
                      className="rounded-xl"
                      maxLength={50}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsSitiosOpen((prev) => !prev)}
                      aria-expanded={isSitiosOpen}
                      aria-controls="sitios-dropdown"
                      className="shrink-0 rounded-xl"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${isSitiosOpen ? "rotate-180" : "rotate-0"}`} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateSiteModalOpen(true)}
                      className="shrink-0 rounded-xl"
                    >
                      + Sitio
                    </Button>
                  </div>
                  {formErrors.id_sitio && (
                    <p className="text-xs text-red-600">{formErrors.id_sitio}</p>
                  )}
                  {isSitiosOpen && (
                    <div
                      id="sitios-dropdown"
                      className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
                    >
                      {sitios.length > 0 ? (
                        <ul className="max-h-60 overflow-y-auto">
                          {sitios.map((sitio) => {
                            const isSelected = newEvent.id_sitio === sitio.id_sitio;

                            return (
                              <li
                                key={sitio.id_sitio}
                                onClick={() => {
                                  setBusquedaSitio(sitio.nombre_sitio);
                                  setNewEvent({ ...newEvent, id_sitio: sitio.id_sitio });
                                  setIsSitiosOpen(false);
                                }}
                                className={`px-4 py-2 cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "hover:bg-accent hover:text-accent-foreground"
                                }`}
                              >
                                {sitio.nombre_sitio}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          No se encontraron sitios para esa búsqueda.
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción del evento</Label>
                <Textarea
                  id="description"
                  value={newEvent.descripcion}
                  onChange={(e) => {
                    const value = sanitizeTextWithPunct(e.target.value, 200);
                    clearFieldError("descripcion");
                    setNewEvent({ ...newEvent, descripcion: value });
                  }}
                  placeholder="Descripción breve del evento"
                  className="rounded-xl min-h-[100px]"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {newEvent.descripcion.length}/200 caracteres (mínimo 10)
                </p>
                {formErrors.descripcion && (
                  <p className="text-xs text-red-600">{formErrors.descripcion}</p>
                )}
              </div>

              <AdditionalInfoSection
                items={newEvent.informacion_adicional_items || []}
                error={formErrors.informacion_adicional_items}
                onAdd={addInfoItem}
                onUpdate={updateInfoItem}
                onRemove={removeInfoItem}
                onClearError={() => clearFieldError("informacion_adicional_items")}
                sanitizeText={sanitizeTextWithPunct}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="telefono1">Teléfono del organizador del evento</Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.telefono_principal === "1"}
                      onChange={() => setNewEvent({ ...newEvent, telefono_principal: "1" })}
                      className="w-4 h-4"
                    />
                    Teléfono principal
                  </label>
                </div>
                <Input
                  id="telefono1"
                  value={newEvent.telefono1}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      clearFieldError("telefono1");
                      setNewEvent({ ...newEvent, telefono1: value });
                    }
                  }}
                  placeholder="Teléfono 1"
                  className="rounded-xl"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d*"
                />
                {formErrors.telefono1 && (
                  <p className="text-xs text-red-600">{formErrors.telefono1}</p>
                )}
              </div>

              {!showTelefono2 && (
                <Button
                  type="button"
                  onClick={() => setShowTelefono2(true)}
                  className="cursor-pointer rounded-md border px-2 py-1 bg-gradient-to-tr from-green-700 to-lime-500 text-white text-sm hover:bg-gradient-to-tr hover:from-green-600 hover:to-lime-400 hover:scale-102 w-45 text-center"
                >
                  + Agregar otro teléfono
                </Button>
              )}

              {showTelefono2 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="telefono2">Segundo teléfono del organizador del evento</Label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newEvent.telefono_principal === "2"}
                        onChange={() => setNewEvent({ ...newEvent, telefono_principal: "2" })}
                        className="w-4 h-4"
                      />
                      Teléfono principal
                    </label>
                  </div>
                  <Input
                    id="telefono2"
                    value={newEvent.telefono2 || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,10}$/.test(value)) {
                        clearFieldError("telefono2");
                        setNewEvent({ ...newEvent, telefono2: value });
                      }
                    }}
                    placeholder="Teléfono 2"
                    className="rounded-xl"
                    maxLength={10}
                    inputMode="numeric"
                    pattern="\d*"
                  />
                  {formErrors.telefono2 && (
                    <p className="text-xs text-red-600">{formErrors.telefono2}</p>
                  )}

                  <Button
                    type="button"
                    onClick={() => {
                      setShowTelefono2(false);
                      setNewEvent({ ...newEvent, telefono2: "", telefono_principal: "1" });
                    }}
                    className="cursor-pointer rounded-md border px-2 py-1 bg-gradient-to-tr from-fuchsia-700 to-red-500 text-white text-sm hover:bg-gradient-to-tr hover:from-fuchsia-600 hover:to-red-400 hover:scale-102 w-45 text-center"
                  >
                    – Quitar teléfono
                  </Button>
                </div>
              )}

              {/* Dates and Times */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha de inicio del evento</Label>
                  <DatePicker
                    id="fecha_inicio"
                    selected={newEvent.fecha_inicio}
                    onChange={(date) => {
                      clearFieldError("fecha_inicio");
                      setNewEvent({ ...newEvent, fecha_inicio: date });
                    }}
                    dateFormat="dd/MM/yyyy"
                    minDate={today ?? undefined}
                    placeholderText="01/01/2025"
                    className="cursor-pointer w-75 rounded-xl border-border bg-card text-foreground shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  />
                  {formErrors.fecha_inicio && (
                    <p className="text-xs text-red-600">{formErrors.fecha_inicio}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_final">Fecha final del evento</Label>
                  <DatePicker
                    id="fecha_final"
                    selected={newEvent.fecha_final}
                    onChange={(date) =>
                      {
                        clearFieldError("fecha_final");
                        setNewEvent({
                          ...newEvent,
                            fecha_final: date,
                        })
                      }
                    }
                    dateFormat="dd/MM/yyyy"
                    minDate={newEvent.fecha_inicio || today || undefined}
                    placeholderText="31/12/2025"
                    className="cursor-pointer w-75 rounded-xl border-border bg-card text-foreground shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  />
                  {formErrors.fecha_final && (
                    <p className="text-xs text-red-600">{formErrors.fecha_final}</p>
                  )}
                </div>
              </div>

              {/* Times */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="time">Hora de inicio</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.hora_inicio}
                    onChange={(e) => {
                      clearFieldError("hora_inicio");
                      setNewEvent({ ...newEvent, hora_inicio: e.target.value });
                    }}
                    className="w-75 rounded-xl"
                  />
                  {formErrors.hora_inicio && (
                    <p className="text-xs text-red-600">{formErrors.hora_inicio}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora final</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.hora_final}
                    onChange={(e) => {
                      clearFieldError("hora_final");
                      setNewEvent({ ...newEvent, hora_final: e.target.value });
                    }}
                    className="w-75 rounded-xl"
                  />
                  {formErrors.hora_final && (
                    <p className="text-xs text-red-600">{formErrors.hora_final}</p>
                  )}
                </div>
              </div>

              <TicketSection
                pago={newEvent.pago}
                reservarAnticipado={newEvent.reservar_anticipado}
                boletas={newEvent.boletas}
                error={formErrors.boletas}
                onTogglePago={(pago) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    pago,
                    reservar_anticipado: false,
                    boletas: pago ? prev.boletas : [{ nombre_boleto: "", precio_boleto: "", servicio: "" }],
                  }))
                }
                onToggleReserva={(value) => setNewEvent((prev) => ({ ...prev, reservar_anticipado: value }))}
                onAddBoleta={addBoletaField}
                onUpdateBoleta={updateBoleta}
                onRemoveBoleta={removeBoletaField}
                onRemoveAllBoletas={removeAllBoletas}
                onClearError={() => clearFieldError("boletas")}
                sanitizeAlphanum={sanitizeAlphanumSpace}
              />

              

              {/* Capacity */}
              <div className="space-y-2">
                <label htmlFor="attendees" className="block font-medium">
                  Aforo del evento
                </label>
                <input
                  id="attendees"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newEvent.cupo === "" ? "" : newEvent.cupo}
                  onChange={(e) => {
                    clearFieldError("cupo");
                    handleCupoChange(e.target.value);
                  }}
                  placeholder="100"
                  className="rounded-xl border px-2 py-1 w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Ingrese un número entero entre 20 y 5000
                </p>
                {formErrors.cupo && (
                  <p className="text-xs text-red-600">{formErrors.cupo}</p>
                )}
              </div>

              <MediaSection
                imageInputRef={imageInputRef}
                imagenes={newEvent.imagenes || []}
                imagenPrincipalIndex={newEvent.imagenPrincipalIndex || 0}
                documento={newEvent.documento}
                imagenesError={formErrors.imagenes}
                documentoError={formErrors.documento}
                onUpdateImages={(files) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    imagenes: files,
                    imagenPrincipalIndex:
                      files.length > 0
                        ? Math.min(Math.max(prev.imagenPrincipalIndex || 0, 0), files.length - 1)
                        : 0,
                  }))
                }
                onMoveImage={(index, direction) =>
                  setNewEvent((prev) => {
                    const files = [...(prev.imagenes || [])]
                    if (index < 0 || index >= files.length) return prev

                    const targetIndex = direction === "up" ? index - 1 : index + 1
                    if (targetIndex < 0 || targetIndex >= files.length) return prev

                    const temp = files[index]
                    files[index] = files[targetIndex]
                    files[targetIndex] = temp

                    let principalIndex = prev.imagenPrincipalIndex || 0
                    if (principalIndex === index) principalIndex = targetIndex
                    else if (principalIndex === targetIndex) principalIndex = index

                    return {
                      ...prev,
                      imagenes: files,
                      imagenPrincipalIndex: principalIndex,
                    }
                  })
                }
                onSetPrincipalImage={(index) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    imagenPrincipalIndex: index,
                  }))
                }
                onRemoveImage={(index) =>
                  setNewEvent((prev) => {
                    const updated = (prev.imagenes || []).filter((_, i) => i !== index)
                    if (updated.length === 0 && imageInputRef.current) {
                      imageInputRef.current.value = ""
                    }

                    const currentPrincipal = prev.imagenPrincipalIndex || 0
                    const nextPrincipal =
                      updated.length === 0
                        ? 0
                        : currentPrincipal === index
                          ? 0
                          : currentPrincipal > index
                            ? currentPrincipal - 1
                            : currentPrincipal

                    return {
                      ...prev,
                      imagenes: updated,
                      imagenPrincipalIndex: Math.min(nextPrincipal, Math.max(updated.length - 1, 0)),
                    }
                  })
                }
                onUpdateDocument={(file) => setNewEvent((prev) => ({ ...prev, documento: file }))}
                onSetImagesError={(message) => setFieldError("imagenes", message)}
                onClearImagesError={() => clearFieldError("imagenes")}
                onSetDocumentError={(message) => setFieldError("documento", message)}
                onClearDocumentError={() => clearFieldError("documento")}
              />

              {/* Buttons */}
              <div className="flex gap-50 pt-6 border-t">
                <Button
                  onClick={handleAddEvent}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-tr from-green-700 to-lime-500 hover:scale-103 hover:from-green-600 hover:to-lime-500 rounded-xl py-5 text-lg font-semibold"
                >
                  {isLoading ? "Creando..." : "Crear Evento"}
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1 rounded-xl py-5 text-lg hover:scale-103"
                >
                  Cancelar
                </Button>
              </div>
              {formErrors.general && (
                <p className="text-sm text-red-600">{formErrors.general}</p>
              )}
            </div>
          </div>
          ) : null}
        </div>
      </main>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              Evento creado exitosamente
            </DialogTitle>
            <DialogDescription>
              Tu evento se registró correctamente. Puedes ir al listado de eventos o quedarte en este formulario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuccessDialogOpen(false)}>
              Quedarme aquí
            </Button>
            <Button
              className="bg-gradient-to-tr from-green-700 to-lime-500 text-white"
              onClick={() => {
                setSuccessDialogOpen(false);
                router.push("/eventos");
              }}
            >
              Ir a eventos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateSiteModal
        open={createSiteModalOpen}
        onOpenChange={setCreateSiteModalOpen}
        onCreated={() => {
          void refreshSitios();
        }}
      />

      <Footer />
    </div>
    );
  }
