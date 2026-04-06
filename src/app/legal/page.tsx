"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Scale, Shield, Cookie, Cpu, AlertTriangle, X } from "lucide-react"
import { Footer } from "@/components/footer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const sections = [
  {
    id: "condiciones",
    icon: Scale,
    title: "Condiciones del Servicio",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    content: [
      {
        subtitle: "Sistema de suspensiones y baneos",
        text: "Time2Go podrá suspender o banear cuentas de forma temporal o permanente cuando se detecte el incumplimiento de estas condiciones. Todo baneo se aplica por un motivo específico y catalogado, seleccionado por un moderador o administrador autorizado de la plataforma.",
      },
      {
        subtitle: "Categorías de infracción",
        text: "Las infracciones se agrupan en categorías: (i) identidad y verificación de cuenta; (ii) seguridad del sistema; (iii) fraude y transacciones; (iv) contenido inapropiado o ilegal; (v) comportamiento y reseñas; (vi) incumplimientos en organización de eventos; (vii) abuso de funciones del sistema; (viii) motivos administrativos. Cada categoría contiene motivos específicos disponibles en la plataforma.",
      },
      {
        subtitle: "Tipos de baneo y notificación",
        text: "Los baneos pueden ser temporales (con fecha de finalización definida) o permanentes, según la gravedad de la infracción. El usuario recibirá notificación del motivo específico del baneo. Durante un baneo temporal, el acceso a la plataforma quedará restringido hasta la fecha de finalización establecida.",
      },
      {
        subtitle: "Apelaciones",
        text: "El usuario baneado podrá solicitar revisión de la decisión a través de los canales de soporte de Time2Go dentro de los 15 días siguientes a la notificación del baneo. Time2Go se reserva la decisión final sobre la resolución de cada caso.",
      },
      {
        subtitle: "Aceptación de condiciones",
        text: "El uso de la plataforma Time2Go implica la aceptación plena de estas condiciones. Si no estás de acuerdo con alguna de ellas, debes abstenerte de usar el servicio.",
      },
      {
        subtitle: "Descripción del servicio",
        text: "Time2Go es una plataforma de descubrimiento y gestión de eventos culturales, deportivos y de entretenimiento. Actuamos como intermediarios entre organizadores de eventos y el público asistente.",
      },
      {
        subtitle: "Obligaciones del usuario",
        text: "El usuario se compromete a: (i) proporcionar información veraz en el registro; (ii) no usar la plataforma para fines ilícitos; (iii) respetar los derechos de otros usuarios y de los organizadores de eventos; (iv) no interferir con el funcionamiento técnico de la plataforma.",
      },
      {
        subtitle: "Obligaciones del organizador",
        text: "Los organizadores son responsables de la veracidad de la información de los eventos publicados, de contar con los permisos necesarios para su realización, y de dar cumplimiento a la normativa vigente aplicable a cada evento.",
      },
      {
        subtitle: "Reporte de eventos por usuarios",
        text: "Los usuarios autenticados pueden reportar un evento publicado cuando consideren que incumple las normas, eligiendo una categoría y un motivo predefinidos en la plataforma. Cada usuario puede enviar como máximo un reporte por evento. Los reportes deben hacerse de buena fe: el uso indebido o reiterado de la herramienta de reporte puede ser considerado una infracción y tratarse según las reglas de la comunidad y estas condiciones.",
      },
      {
        subtitle: "Tratamiento de reportes por el equipo Time2Go",
        text: "El personal autorizado (moderación y administración) revisará los reportes, podrá cambiar su estado (pendiente, en revisión, resuelto o desestimado) y registrará la actuación correspondiente. La decisión sobre la visibilidad del evento o medidas adicionales corresponde a Time2Go conforme a sus políticas internas y a la ley aplicable.",
      },
      {
        subtitle: "Limitación de responsabilidad",
        text: "Time2Go no se hace responsable de la cancelación, modificación o incumplimiento de los eventos por parte de los organizadores, ni de daños derivados del uso de la plataforma más allá de lo establecido por la ley colombiana aplicable.",
      },
      {
        subtitle: "Modificaciones",
        text: "Time2Go se reserva el derecho de modificar estas condiciones en cualquier momento. Los cambios serán notificados a los usuarios registrados y entrarán en vigor a los 15 días de su publicación.",
      },
      {
        subtitle: "Ley aplicable y jurisdicción",
        text: "Estas condiciones se rigen por las leyes de la República de Colombia. Cualquier controversia se someterá a los jueces y tribunales competentes del domicilio del responsable del servicio.",
      },
    ],
  },
  {
    id: "privacidad",
    icon: Shield,
    title: "Política de Privacidad",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    content: [
      {
        subtitle: "Responsable del tratamiento",
        text: "Time2Go es responsable del tratamiento de los datos personales recopilados a través de esta plataforma, en cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia.",
      },
      {
        subtitle: "Datos que recopilamos",
        text: "Recopilamos los datos que el usuario proporciona al registrarse (nombre, correo electrónico, número de teléfono), así como datos de uso de la plataforma generados de forma automática durante la navegación.",
      },
      {
        subtitle: "Finalidad del tratamiento",
        text: "Los datos se tratan para: (i) gestionar el registro y autenticación del usuario; (ii) permitir la reserva y gestión de eventos; (iii) enviar comunicaciones relacionadas con el servicio; (iv) gestionar reportes de eventos (incluida la categoría y el motivo elegidos, el texto opcional del usuario y el estado del trámite ante el equipo autorizado); (v) cumplir obligaciones legales.",
      },
      {
        subtitle: "Base legal",
        text: "El tratamiento se basa en el consentimiento explícito del titular otorgado al momento del registro, y en el cumplimiento de obligaciones legales aplicables.",
      },
      {
        subtitle: "Derechos del titular (Habeas Data)",
        text: "Como titular tienes derecho a conocer, actualizar, rectificar y suprimir tus datos personales, así como a revocar el consentimiento en cualquier momento. Para ejercer estos derechos, contacta nuestros canales de soporte.",
      },
      {
        subtitle: "Retención de datos",
        text: "Conservamos tus datos mientras mantengas una cuenta activa en la plataforma o mientras sean necesarios para los fines descritos, y en todo caso durante el tiempo exigido por la legislación colombiana aplicable.",
      },
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Política de Cookies",
    color: "text-lime-600",
    bg: "bg-lime-50",
    border: "border-lime-200",
    content: [
      {
        subtitle: "¿Qué son las cookies?",
        text: "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas una página web. Nos permiten recordar tus preferencias y mejorar tu experiencia de navegación.",
      },
      {
        subtitle: "Cookies esenciales",
        text: "Necesarias para el funcionamiento del sitio, como la gestión de la sesión de autenticación. Su base legal es el interés legítimo y no pueden desactivarse. Se eliminan al cerrar la sesión o tras un período máximo de inactividad.",
      },
      {
        subtitle: "Cookies analíticas",
        text: "Recopilan información anónima sobre el uso del sitio (páginas visitadas, tiempo de sesión). Su base legal es el consentimiento explícito del usuario. Retención: hasta 12 meses.",
      },
      {
        subtitle: "Cookies de terceros",
        text: "Instaladas por proveedores externos para medir el rendimiento de campañas. Implican transferencia de datos a dichos terceros. Su base legal es el consentimiento explícito. Retención: según el tercero, máximo 24 meses.",
      },
      {
        subtitle: "Gestión de preferencias",
        text: "Puedes aceptar o rechazar cookies no esenciales desde el banner que aparece al ingresar a la plataforma. Puedes revocar tu consentimiento en cualquier momento eliminando las cookies desde la configuración de tu navegador.",
      },
    ],
  },
  {
    id: "propiedad",
    icon: Cpu,
    title: "Propiedad Intelectual",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    content: [
      {
        subtitle: "Titularidad",
        text: "Todos los contenidos de la plataforma Time2Go — incluyendo, sin limitarse a, el diseño, logotipos, textos, imágenes, código fuente y estructura — son propiedad exclusiva de Time2Go o de sus licenciantes, y están protegidos por la legislación colombiana de derechos de autor (Ley 23 de 1982 y Decisión Andina 351 de 1993).",
      },
      {
        subtitle: "Uso permitido",
        text: "Se concede al usuario una licencia limitada, no exclusiva, intransferible y revocable para acceder y usar la plataforma exclusivamente para los fines previstos en estas condiciones. Queda prohibida cualquier reproducción, distribución, modificación o explotación comercial sin autorización expresa y escrita.",
      },
      {
        subtitle: "Contenido del usuario",
        text: "El usuario conserva la titularidad de los contenidos que publique en la plataforma (imágenes de eventos, descripciones, etc.), pero otorga a Time2Go una licencia mundial, no exclusiva y gratuita para mostrarlos dentro de la plataforma con la finalidad de prestar el servicio.",
      },
      {
        subtitle: "Marcas registradas",
        text: "El nombre 'Time2Go', el logotipo y demás signos distintivos son marcas de Time2Go. Su uso sin autorización expresa está prohibido y podrá dar lugar a las acciones legales correspondientes.",
      },
    ],
  },
]

export default function LegalPage() {
  const [showNotice, setShowNotice] = useState(false)

  useEffect(() => {
    // Mostrar el aviso al cargar la página
    setShowNotice(true)
  }, [])

  return (
    <>
      <main className="min-h-screen bg-background">
        {/* Dialog de aviso */}
        <Dialog open={showNotice} onOpenChange={setShowNotice}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <DialogTitle className="text-center text-xl">Aviso Legal Importante</DialogTitle>
              <DialogDescription className="text-center text-gray-600 mt-2">
                Al utilizar la plataforma Time2Go, aceptas cumplir con nuestras condiciones del servicio,
                política de privacidad y demás términos legales aquí descritos, incluidas las reglas sobre
                reportes de eventos y moderación. Te recomendamos leer detenidamente cada sección antes de continuar.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center mt-4">
              <Button 
                onClick={() => setShowNotice(false)}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                Entendido
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Hero */}
        <div className="bg-gradient-to-r from-green-600 to-lime-500 pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium mb-6">
              <Scale className="h-4 w-4" />
              Información legal
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Marco Legal
            </h1>
            <p className="text-white/85 text-lg max-w-2xl mx-auto leading-relaxed">
              Toda la información legal sobre el uso de Time2Go, el tratamiento de tus datos y tus derechos como usuario.
            </p>
            {/* Índice rápido */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido con Accordion */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Accordion type="multiple" defaultValue={["condiciones"]} className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  id={section.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-24 data-[state=open]:shadow-md transition-shadow"
                >
                  <AccordionTrigger className={`${section.bg} ${section.border} border-b px-6 py-5 hover:no-underline`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-white rounded-xl p-2.5 shadow-sm">
                        <Icon className={`h-5 w-5 ${section.color}`} />
                      </div>
                      <h2 className={`text-xl font-bold ${section.color}`}>{section.title}</h2>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-6">
                    <div className="space-y-5">
                      {section.content.map((item, i) => (
                        <div key={i} className="flex gap-4">
                          {/* Numeración */}
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full ${section.bg} ${section.color} flex items-center justify-center text-xs font-bold mt-0.5`}>
                            {i + 1}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-1">{item.subtitle}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          {/* Última actualización */}
          <div className="text-center py-6 border-t border-gray-200 mt-10">
            <p className="text-sm text-gray-400">
              Última actualización: enero 2026 ·{" "}
              <Link href="/" className="font-bold text-green-600 hover:underline text-lg">
                Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
