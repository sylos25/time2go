import { describe, expect, it } from "vitest"
import {
  dn,
  dnFem,
  formatHora12,
  formatReservaFecha,
  reservaDerivedLabels,
} from "./reserva-detalle-display"
import type { ReservaDetalle } from "./reserva-detalle-types"

describe("dn", () => {
  it("devuelve el texto recortado cuando hay valor", () => {
    expect(dn("  Concierto  ")).toBe("Concierto")
  })

  it("usa el fallback ante null, undefined o vacío", () => {
    expect(dn(null)).toBe("No registrado")
    expect(dn(undefined)).toBe("No registrado")
    expect(dn("   ")).toBe("No registrado")
    expect(dn("", "Otro")).toBe("Otro")
  })
})

describe("dnFem", () => {
  it("usa femenino por defecto", () => {
    expect(dnFem("")).toBe("No registrada")
  })
})

describe("formatHora12", () => {
  it("formatea TIME PostgreSQL a 12 h en es-CO", () => {
    const s = formatHora12("14:30:00")
    expect(s).toMatch(/2:30/)
    expect(s.toLowerCase()).toContain("p")
  })

  it("devuelve — ante valor vacío", () => {
    expect(formatHora12(null)).toBe("—")
    expect(formatHora12("")).toBe("—")
  })
})

describe("formatReservaFecha", () => {
  it("formatea fecha ISO en zona Bogotá", () => {
    const out = formatReservaFecha("2026-06-15T12:00:00.000Z")
    expect(out.length).toBeGreaterThan(4)
    expect(out).toMatch(/2026/)
  })

  it("devuelve — ante fecha inválida", () => {
    expect(formatReservaFecha("no-es-fecha")).toBe("—")
  })
})

function minimalReserva(over: Partial<ReservaDetalle> = {}): ReservaDetalle {
  return {
    id_reserva_evento: 1,
    id_evento: 10,
    id_publico_evento: null,
    nombre_evento: "Evento",
    tipo_documento: "CC",
    numero_documento: "123",
    nombres: null,
    apellidos: null,
    telefono_titular: null,
    correo_titular: null,
    cuantos_asistiran: 0,
    quienes_asistiran: "",
    pulep_evento: null,
    responsable_evento: null,
    cupo: 100,
    fecha_inicio: null,
    fecha_fin: null,
    hora_inicio: null,
    hora_final: null,
    gratis_pago: false,
    nombre_sitio: null,
    sitio_direccion: null,
    nombre_municipio: null,
    categoria_nombre: null,
    tipo_nombre: null,
    telefono_1: null,
    telefono_2: null,
    creador_nombres: null,
    creador_apellidos: null,
    url_imagen_evento: null,
    asistentes: [],
    ...over,
  }
}

describe("reservaDerivedLabels", () => {
  it("marca modalidad Gratis cuando gratis_pago es false", () => {
    const r = minimalReserva({ gratis_pago: false })
    expect(reservaDerivedLabels(r).modalidad).toBe("Gratis")
  })

  it("marca modalidad Pago cuando gratis_pago es true", () => {
    const r = minimalReserva({ gratis_pago: true })
    expect(reservaDerivedLabels(r).modalidad).toBe("Pago")
  })

  it("deduplica organizadores y teléfonos", () => {
    const r = minimalReserva({
      responsable_evento: "Ana",
      creador_nombres: "Ana",
      creador_apellidos: "López",
      telefono_1: "300",
      telefono_2: "300",
    })
    const d = reservaDerivedLabels(r)
    expect(d.organizadores).toContain("Ana")
    expect(d.telefonosOrganizador).toBe("300")
  })
})
