import type { LucideIcon } from "lucide-react"
import { BarChart3, Clock, Mail, MapPin, Shield, Zap } from "lucide-react"

export type ContactInfoItem = {
  icon: LucideIcon
  title: string
  details: string[]
}

export type SoftwareFeatureItem = {
  icon: LucideIcon
  title: string
  description: string
}

export type FaqItem = {
  question: string
  answer: string
}

export const contactInfo: ContactInfoItem[] = [
  {
    icon: Mail,
    title: "Email",
    details: ["time2go.jowibra@gmail.com"],
  },
  {
    icon: MapPin,
    title: "Oficina Principal",
    details: ["Carrera 27 Cl 15 N-s", "Bucaramanga"],
  },
]

export const softwareFeatures: SoftwareFeatureItem[] = [
  {
    icon: Zap,
    title: "Rápido y Eficiente",
    description: "Procesamiento de peticiones en menos de un día.",
  },
  {
    icon: Shield,
    title: "Seguro y Confiable",
    description: "Encriptación de datos de extremo a extremo y cumplimiento con estándares PCI-DSS.",
  },
  {
    icon: BarChart3,
    title: "Analíticas Avanzadas",
    description: "Dashboard completo con métricas de ventas, asistencia y comportamiento de usuarios.",
  },
  {
    icon: Clock,
    title: "Soporte 24/7",
    description: "Equipo dedicado disponible para resolver cualquier incidencia en minutos.",
  },
]

export const faqs: FaqItem[] = [
  {
    question: "¿Cómo puedo crear un evento en Time2Go?",
    answer: "Inicia sesión con tu perfil de organizador y en el menú encontrarás una opción llamada 'Crear Evento'.",
  },
  {
    question: "¿Cómo puedo ser organizador?",
    answer: "Crea una cuenta, entra al perfil y envía el formulario para ser validado como organizador; nosotros nos encargamos del resto.",
  },
]
