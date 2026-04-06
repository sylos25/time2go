import { buildEventSummary, type EventSummary } from "../lib/reserva-evento";

type ReservationEventSummaryProps =
  | {
      variant?: "detailed";
      event?: Record<string, any> | null;
      summary?: EventSummary | null;
    }
  | {
      variant: "compact";
      event: Record<string, any> | null;
      summary?: EventSummary | null;
    };

export function ReservationEventSummary({
  event,
  summary,
  variant = "detailed",
}: ReservationEventSummaryProps) {
  if (variant === "compact") {
    if (!event) {
      return null;
    }

    const fecha = event.fecha_inicio ? new Date(event.fecha_inicio).toLocaleDateString("es-ES") : "";
    const hora = event.hora_inicio ? String(event.hora_inicio).slice(0, 5) : "";

    return (
      <div className="rounded-lg bg-muted/50 p-4 text-sm">
        <p className="font-semibold text-foreground">{event.nombre_evento}</p>
        <p className="text-muted-foreground">
          {fecha}
          {hora ? ` · ${hora}` : ""}
        </p>
      </div>
    );
  }

  const parsedSummary = summary ?? (event ? buildEventSummary(event) : null);

  if (!parsedSummary) {
    return null;
  }

  const getValue = (label: string) => {
    return parsedSummary.items.find((item) => item.label === label)?.value || "No registrado";
  };

  return (
    <div className="rounded-lg bg-muted/50 p-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Categoría</p>
          <p className="font-medium text-foreground">{getValue("Categoría")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Tipo de evento</p>
          <p className="font-medium text-foreground">{getValue("Tipo de evento")}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground">Fecha</p>
          <p className="font-medium text-foreground">{getValue("Fecha")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Hora</p>
          <p className="font-medium text-foreground">{getValue("Hora")}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground">Organizadores</p>
          <p className="font-medium text-foreground">{getValue("Organizadores")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">PULEP</p>
          <p className="font-medium text-foreground">{getValue("PULEP")}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground">Aforo</p>
          <p className="font-medium text-foreground">{getValue("Aforo")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Lugar</p>
          <p className="font-medium text-foreground">{getValue("Lugar")}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground">Dirección</p>
          <p className="font-medium text-foreground">{getValue("Dirección")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Ciudad</p>
          <p className="font-medium text-foreground">{getValue("Ciudad")}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground">Teléfonos organizador</p>
          <p className="font-medium text-foreground">{getValue("Teléfonos organizador")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Modalidad</p>
          <p className="font-medium text-foreground">{getValue("Modalidad")}</p>
        </div>
      </div>
    </div>
  );
}
