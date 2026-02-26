"use client";

import { useEffect, useState } from "react";

const relativeFormatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function formatRelativeTime(dateInput: string | Date) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "Fecha desconocida";

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 60) return relativeFormatter.format(diffSeconds, "second");

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return relativeFormatter.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return relativeFormatter.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) return relativeFormatter.format(diffDays, "day");

  const diffWeeks = Math.round(diffDays / 7);
  if (Math.abs(diffWeeks) < 5) return relativeFormatter.format(diffWeeks, "week");

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) return relativeFormatter.format(diffMonths, "month");

  const diffYears = Math.round(diffDays / 365);
  return relativeFormatter.format(diffYears, "year");
}

export default function Valoraciones({ eventId }: { eventId: number }) {
  const [valoraciones, setValoraciones] = useState<any[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchValoraciones = async () => {
    try {
      setErrorMessage("");
      const res = await fetch(`/api/events/${eventId}/valoraciones`);
      const json = await res.json();
      if (json.ok) setValoraciones(json.valoraciones);
      else setValoraciones([]);
    } catch (err) {
      console.error(err);
      setValoraciones([]);
      setErrorMessage("No fue posible cargar las valoraciones.");
    }
  };

  useEffect(() => { fetchValoraciones(); }, [eventId]);

  const submit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setErrorMessage("Selecciona una calificación entre 1 y 5.");
      return;
    }

    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/events/${eventId}/valoraciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ valoracion: rating, comentario: comment })
      });
      const json = await res.json();
      if (json.ok) {
        setComment("");
        setRating(5);
        setSuccessMessage(json.updated ? "Tu valoración fue actualizada." : "Valoración enviada correctamente.");
        fetchValoraciones();
      } else {
        setErrorMessage(json.message || "Error al enviar la valoración");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error al enviar la valoración");
    } finally { setLoading(false); }
  };

  const totalValoraciones = valoraciones.length;
  const promedioValoraciones = totalValoraciones
    ? valoraciones.reduce((acc, item) => acc + Number(item.valoracion || 0), 0) / totalValoraciones
    : 0;

  return (
    <div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 ">
          <label className="text-sm">Calificación:</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border rounded-md p-1 cursor-pointer">
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>{value} ⭐</option>
            ))}
          </select>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Deja un comentario (opcional)"
          maxLength={1000}
        />
        <div className="flex gap-2">
          <button onClick={submit} className="px-3 py-1 bg-gradient-to-tr from-green-600 to-lime-500 text-white rounded-md cursor-pointer" disabled={loading}>Enviar</button>
          <button onClick={() => { setComment(''); setRating(5); }} className="px-3 py-1 border rounded-md cursor-pointer">Limpiar</button>
        </div>
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}
      </div>

      <div className="mt-4 space-y-3">
        <div className="text-sm text-muted-foreground">
          Promedio: <span className="font-semibold text-foreground">{promedioValoraciones.toFixed(1)} / 5 ⭐</span>
          {" "}({totalValoraciones} valoración{totalValoraciones === 1 ? "" : "es"})
        </div>
        {valoraciones.length === 0 && <div className="text-sm text-gray-500">Sé el primero en valorar este evento.</div>}
        {valoraciones.map((valoracionItem) => (
          <div key={valoracionItem.id_valoracion} className="border p-3 rounded-md">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <strong>
                  {`${valoracionItem.nombres || ""} ${valoracionItem.apellidos || ""}`.trim() || `Usuario #${valoracionItem.id_usuario}`}
                </strong>
              </div>
              <div title={new Date(valoracionItem.fecha_creacion).toLocaleString("es-CO")}>
                {formatRelativeTime(valoracionItem.fecha_creacion)}
              </div>
            </div>
            <div className="mt-2">{valoracionItem.valoracion} ⭐</div>
            {valoracionItem.comentario && <div className="mt-2 text-gray-700">{valoracionItem.comentario}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}