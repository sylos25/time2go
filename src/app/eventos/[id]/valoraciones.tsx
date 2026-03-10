"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X, Check, Loader2 } from "lucide-react";

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

// ── Selector de estrellas interactivo ─────────────────────────────────────────
function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="text-lg leading-none focus:outline-none"
        >
          <span className={(s <= (hover || value)) ? "text-yellow-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function Valoraciones({ eventId }: { eventId: number }) {
  const [valoraciones,  setValoraciones]  = useState<any[]>([]);
  const [rating,        setRating]        = useState<number>(5);
  const [comment,       setComment]       = useState("");
  const [loading,       setLoading]       = useState(false);
  const [errorMessage,  setErrorMessage]  = useState("");
  const [successMessage,setSuccessMessage]= useState("");

  // ID del usuario autenticado actual
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Estado de edición inline
  const [editingId,      setEditingId]      = useState<number | null>(null);
  const [editRating,     setEditRating]     = useState(5);
  const [editComment,    setEditComment]    = useState("");
  const [savingEdit,     setSavingEdit]     = useState(false);
  const [editError,      setEditError]      = useState("");

  // Estado de eliminación
  const [deletingId,     setDeletingId]     = useState<number | null>(null);
  const [confirmDeleteId,setConfirmDeleteId]= useState<number | null>(null);

  // ── Obtener usuario actual ────────────────────────────────────────────────
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch("/api/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        if (!res.ok) return;
        const json = await res.json().catch(() => ({}));
        const id = Number(json?.user?.id_usuario || 0);
        setCurrentUserId(id > 0 ? id : null);
      } catch {
        setCurrentUserId(null);
      }
    };
    fetchMe();
  }, []);

  // ── Fetch valoraciones ────────────────────────────────────────────────────
  const fetchValoraciones = async () => {
    try {
      setErrorMessage("");
      const res  = await fetch(`/api/events/${eventId}/valoraciones`);
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

  // ── Enviar nueva valoración ───────────────────────────────────────────────
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ valoracion: rating, comentario: comment }),
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
    } finally {
      setLoading(false);
    }
  };

  // ── Iniciar edición ───────────────────────────────────────────────────────
  const startEdit = (v: any) => {
    setEditingId(v.id_valoracion);
    setEditRating(Number(v.valoracion));
    setEditComment(v.comentario ?? "");
    setEditError("");
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  // ── Guardar edición ───────────────────────────────────────────────────────
  const saveEdit = async (idValoracion: number) => {
    if (editRating < 1 || editRating > 5) {
      setEditError("Selecciona una calificación válida.");
      return;
    }
    setSavingEdit(true);
    setEditError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/mis-valoraciones/${idValoracion}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          valoracion: editRating,
          comentario: editComment.trim() || null,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Error al guardar");
      setEditingId(null);
      fetchValoraciones();
    } catch (err: any) {
      setEditError(err.message ?? "Error al guardar los cambios");
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Eliminar valoración ───────────────────────────────────────────────────
  const deleteValoracion = async (idValoracion: number) => {
    setDeletingId(idValoracion);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/mis-valoraciones/${idValoracion}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Error al eliminar");
      setConfirmDeleteId(null);
      fetchValoraciones();
    } catch (err: any) {
      setErrorMessage(err.message ?? "Error al eliminar la valoración");
    } finally {
      setDeletingId(null);
    }
  };

  const totalValoraciones   = valoraciones.length;
  const promedioValoraciones = totalValoraciones
    ? valoraciones.reduce((acc, item) => acc + Number(item.valoracion || 0), 0) / totalValoraciones
    : 0;

  return (
    <div>
      {/* ── Formulario de nueva valoración ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm">Calificación:</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border rounded-md p-1 cursor-pointer"
          >
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
          <button
            onClick={submit}
            disabled={loading}
            className="px-3 py-1 bg-gradient-to-tr from-green-600 to-lime-500 text-white rounded-md cursor-pointer disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
          <button
            onClick={() => { setComment(""); setRating(5); }}
            className="px-3 py-1 border rounded-md cursor-pointer"
          >
            Limpiar
          </button>
        </div>
        {errorMessage  && <p className="text-sm text-red-600">{errorMessage}</p>}
        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
      </div>

      {/* ── Lista de valoraciones ── */}
      <div className="mt-4 space-y-3">
        <div className="text-sm text-muted-foreground">
          Promedio:{" "}
          <span className="font-semibold text-foreground">
            {promedioValoraciones.toFixed(1)} / 5 ⭐
          </span>{" "}
          ({totalValoraciones} valoración{totalValoraciones === 1 ? "" : "es"})
        </div>

        {valoraciones.length === 0 && (
          <div className="text-sm text-muted-foreground">Sé el primero en valorar este evento.</div>
        )}

        {valoraciones.map((v) => {
          const isOwner  = currentUserId !== null && Number(v.id_usuario) === currentUserId;
          const isEditing = editingId === v.id_valoracion;
          const isConfirmingDelete = confirmDeleteId === v.id_valoracion;

          return (
            <div key={v.id_valoracion} className="border p-3 rounded-md">

              {/* ── Cabecera ── */}
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                  <strong>
                    {`${v.nombres || ""} ${v.apellidos || ""}`.trim() || `Usuario #${v.id_usuario}`}
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs text-muted-foreground"
                    title={new Date(v.fecha_creacion).toLocaleString("es-CO")}
                  >
                    {formatRelativeTime(v.fecha_creacion)}
                  </span>

                  {/* Botones solo para el dueño */}
                  {isOwner && !isEditing && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(v)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Editar valoración"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDeleteId(v.id_valoracion);
                          setEditingId(null);
                        }}
                        className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Eliminar valoración"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Modo edición inline ── */}
              {isEditing ? (
                <div className="mt-3 space-y-2 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Calificación:</span>
                    <StarSelector value={editRating} onChange={setEditRating} />
                    <span className="text-sm text-muted-foreground">{editRating}/5</span>
                  </div>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    placeholder="Comentario (opcional)"
                    maxLength={1000}
                    rows={3}
                  />
                  {editError && <p className="text-xs text-red-600">{editError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(v.id_valoracion)}
                      disabled={savingEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                                 bg-gradient-to-tr from-green-600 to-lime-500 text-white
                                 disabled:opacity-50 cursor-pointer"
                    >
                      {savingEdit
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Check className="h-3 w-3" />
                      }
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={savingEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs
                                 font-medium border text-muted-foreground hover:text-foreground
                                 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Vista normal ── */
                <>
                  <div className="mt-2">{v.valoracion} ⭐</div>
                  {v.comentario && (
                    <div className="mt-2 text-sm text-foreground">{v.comentario}</div>
                  )}
                </>
              )}

              {/* ── Confirmación de eliminación ── */}
              {isConfirmingDelete && (
                <div className="mt-3 pt-3 border-t flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm text-red-600 font-medium">
                    ¿Eliminar esta valoración?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteValoracion(v.id_valoracion)}
                      disabled={deletingId === v.id_valoracion}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs
                                 font-medium bg-red-500 hover:bg-red-600 text-white
                                 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      {deletingId === v.id_valoracion
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Trash2 className="h-3 w-3" />
                      }
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs
                                 font-medium border text-muted-foreground hover:text-foreground
                                 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}