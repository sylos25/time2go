  "use client";

  import { useCallback, useEffect, useState } from "react";
  import { Pencil, Trash2, X, Check, Loader2 } from "lucide-react";

  // ── Formato relativo de fecha ─────────────────────────────────────────────────
  const relativeFormatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  function formatRelativeTime(dateInput: string | Date) {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "Fecha desconocida";
    const now = new Date();
    const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
    const abs = Math.abs(diffSeconds);
    if (abs < 60)   return relativeFormatter.format(diffSeconds, "second");
    const diffMins = Math.round(diffSeconds / 60);
    if (Math.abs(diffMins) < 60)  return relativeFormatter.format(diffMins, "minute");
    const diffHrs  = Math.round(diffMins / 60);
    if (Math.abs(diffHrs)  < 24)  return relativeFormatter.format(diffHrs,  "hour");
    const diffDays = Math.round(diffHrs  / 24);
    if (Math.abs(diffDays) < 7)   return relativeFormatter.format(diffDays, "day");
    const diffWeeks = Math.round(diffDays / 7);
    if (Math.abs(diffWeeks) < 5)  return relativeFormatter.format(diffWeeks, "week");
    const diffMonths = Math.round(diffDays / 30);
    if (Math.abs(diffMonths) < 12) return relativeFormatter.format(diffMonths, "month");
    return relativeFormatter.format(Math.round(diffDays / 365), "year");
  }

  // ── Estrella SVG ──────────────────────────────────────────────────────────────
  function StarIcon({ filled, half = false, className = "" }: { filled: boolean; half?: boolean; className?: string }) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`inline-block ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {half && (
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          )}
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // ── Estrellas solo lectura ────────────────────────────────────────────────────
  function Stars({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
    const sizeClass = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className={s <= value ? "text-amber-400" : "text-gray-200 dark:text-gray-600"}>
            <StarIcon filled={s <= value} className={sizeClass} />
          </span>
        ))}
      </div>
    );
  }

  // ── Selector de estrellas interactivo ─────────────────────────────────────────
  function StarPicker({ value, onChange, size = "md" }: {
    value: number;
    onChange: (v: number) => void;
    size?: "sm" | "md" | "lg";
  }) {
    const [hover, setHover] = useState(0);
    const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-6 h-6";
    const active = hover || value;
    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className={`transition-transform hover:scale-110 focus:outline-none cursor-pointer
                        ${s <= active ? "text-amber-400" : "text-gray-200 dark:text-gray-600"}`}
            aria-label={`${s} estrella${s !== 1 ? "s" : ""}`}
          >
            <StarIcon filled={s <= active} className={sizeClass} />
          </button>
        ))}
        <span className="ml-1 text-xs text-muted-foreground">{active}/5</span>
      </div>
    );
  }

  // ── Componente principal ──────────────────────────────────────────────────────
  type ValoracionItem = {
    id_valoracion: number;
    id_usuario: number;
    valoracion: number;
    comentario: string | null;
    fecha_creacion: string;
    nombres?: string | null;
    apellidos?: string | null;
  };

  export default function Valoraciones({ eventId }: { eventId: number }) {
    const TEXT_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .,;:()"'¿?¡!\-_/\n\r]+$/;
    const sanitize = (v: string) =>
      v.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .,;:()"'¿?¡!\-_/\n\r]/g, "");

    const [valoraciones,    setValoraciones]    = useState<ValoracionItem[]>([]);
    const [rating,          setRating]          = useState(5);
    const [comment,         setComment]         = useState("");
    const [loading,         setLoading]         = useState(false);
    const [errorMessage,    setErrorMessage]    = useState("");
    const [successMessage,  setSuccessMessage]  = useState("");
    const [currentUserId,   setCurrentUserId]   = useState<number | null>(null);

    // Edición
    const [editingId,    setEditingId]    = useState<number | null>(null);
    const [editRating,   setEditRating]   = useState(5);
    const [editComment,  setEditComment]  = useState("");
    const [savingEdit,   setSavingEdit]   = useState(false);
    const [editError,    setEditError]    = useState("");

    // Eliminación
    const [deletingId,      setDeletingId]      = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    // ── Fetch usuario ─────────────────────────────────────────────────────────
    useEffect(() => {
      (async () => {
        try {
          const res  = await fetch("/api/me", {
            credentials: "include",
          });
          if (!res.ok) return;
          const json = await res.json().catch(() => ({}));
          const raw  =
            json?.user?.id_usuario ??
            json?.user?.id         ??
            json?.id_usuario       ??
            json?.id               ??
            0;
          const id = Number(raw);
          setCurrentUserId(Number.isFinite(id) && id > 0 ? id : null);
        } catch { /* no autenticado */ }
      })();
    }, []);

    // ── Fetch valoraciones ────────────────────────────────────────────────────
    const fetchValoraciones = useCallback(async () => {
      try {
        const res  = await fetch(`/api/events/${eventId}/valoraciones`);
        const json = await res.json();
        setValoraciones(json.ok ? json.valoraciones : []);
      } catch {
        setValoraciones([]);
      }
    }, [eventId]);

    useEffect(() => { fetchValoraciones(); }, [fetchValoraciones]);

    // ── Enviar valoración ─────────────────────────────────────────────────────
    const submit = async () => {
      setErrorMessage(""); setSuccessMessage("");
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        setErrorMessage("Selecciona una calificación entre 1 y 5."); return;
      }
      if (comment && !TEXT_REGEX.test(comment)) {
        setErrorMessage("El comentario contiene caracteres no permitidos."); return;
      }
      setLoading(true);
      try {
        const res  = await fetch(`/api/events/${eventId}/valoraciones`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ valoracion: rating, comentario: comment }),
        });
        const json = await res.json();
        if (json.ok) {
          setComment(""); setRating(5);
          setSuccessMessage(json.updated ? "Tu valoración fue actualizada." : "¡Valoración enviada!");
          fetchValoraciones();
        } else {
          setErrorMessage(json.message || "Error al enviar la valoración");
        }
      } catch { setErrorMessage("Error al enviar la valoración"); }
      finally  { setLoading(false); }
    };

    // ── Edición ───────────────────────────────────────────────────────────────
    const startEdit = (v: ValoracionItem) => {
      setEditingId(v.id_valoracion);
      setEditRating(Number(v.valoracion));
      setEditComment(v.comentario ?? "");
      setEditError("");
      setConfirmDeleteId(null);
    };

    const saveEdit = async (id: number) => {
      if (editRating < 1 || editRating > 5) { setEditError("Calificación inválida."); return; }
      setSavingEdit(true); setEditError("");
      try {
        const res  = await fetch(`/api/mis-valoraciones/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ valoracion: editRating, comentario: editComment.trim() || null }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.message);
        setEditingId(null);
        fetchValoraciones();
      } catch (e: unknown) { setEditError(e instanceof Error ? e.message : "Error al guardar"); }
      finally { setSavingEdit(false); }
    };

    // ── Eliminación ───────────────────────────────────────────────────────────
    const deleteValoracion = async (id: number) => {
      setDeletingId(id);
      try {
        const res  = await fetch(`/api/mis-valoraciones/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.message);
        setConfirmDeleteId(null);
        fetchValoraciones();
      } catch (e: unknown) { setErrorMessage(e instanceof Error ? e.message : "Error al eliminar"); }
      finally { setDeletingId(null); }
    };

    const total    = valoraciones.length;
    const promedio = total
      ? valoraciones.reduce((acc, v) => acc + Number(v.valoracion || 0), 0) / total
      : 0;

    return (
      <div className="space-y-5">

        {/* ── Formulario ── */}
        <div className="space-y-3 p-4 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">Tu calificación:</span>
            <StarPicker value={rating} onChange={setRating} size="lg" />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(sanitize(e.target.value))}
            className="w-full p-2.5 border rounded-lg text-sm resize-none bg-background
                      focus:outline-none focus:ring-2 focus:ring-green-500/40"
            placeholder="Deja un comentario (opcional)"
            maxLength={1000}
            rows={3}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={loading}
                className="px-4 py-1.5 bg-gradient-to-tr from-green-600 to-lime-500 text-white
                          rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50
                          hover:opacity-90 transition-opacity"
              >
                {loading ? "Enviando..." : "Enviar"}
              </button>
              <button
                onClick={() => { setComment(""); setRating(5); }}
                className="px-4 py-1.5 border rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors"
              >
                Limpiar
              </button>
            </div>
            <span className="text-xs text-muted-foreground">{comment.length}/1000</span>
          </div>
          {errorMessage   && <p className="text-sm text-red-500">{errorMessage}</p>}
          {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
        </div>

        {/* ── Resumen ── */}
        {total > 0 && (
          <div className="flex items-center gap-3 py-2">
            <Stars value={Math.round(promedio)} size="md" />
            <span className="font-bold text-foreground">{promedio.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({total} valoración{total !== 1 ? "es" : ""})
            </span>
          </div>
        )}

        {/* ── Lista ── */}
        <div className="space-y-3">
          {total === 0 && (
            <p className="text-sm text-muted-foreground">Sé el primero en valorar este evento.</p>
          )}

          {valoraciones.map((v) => {
            const isOwner   = currentUserId !== null && Number(v.id_usuario) === currentUserId;
            const isEditing = editingId === v.id_valoracion;
            const isConfirm = confirmDeleteId === v.id_valoracion;

            return (
              <div key={v.id_valoracion} className="border border-border rounded-xl p-4 space-y-2">

                {/* Cabecera */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold leading-tight">
                      {`${v.nombres || ""} ${v.apellidos || ""}`.trim() || `Usuario #${v.id_usuario}`}
                    </p>
                    <p
                      className="text-xs text-muted-foreground"
                      title={new Date(v.fecha_creacion).toLocaleString("es-CO")}
                    >
                      {formatRelativeTime(v.fecha_creacion)}
                    </p>
                  </div>

                  {isOwner && !isEditing && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(v)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground
                                  hover:text-foreground transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { setConfirmDeleteId(v.id_valoracion); setEditingId(null); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30
                                  text-muted-foreground hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Vista normal */}
                {!isEditing && (
                  <>
                    <Stars value={Number(v.valoracion)} size="sm" />
                    {v.comentario && (
                      <p className="text-sm text-foreground leading-relaxed">{v.comentario}</p>
                    )}
                  </>
                )}

                {/* Modo edición */}
                {isEditing && (
                  <div className="border-t pt-3 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Calificación:</span>
                      <StarPicker value={editRating} onChange={setEditRating} />
                    </div>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm resize-none bg-background
                                focus:outline-none focus:ring-2 focus:ring-green-500/40"
                      placeholder="Comentario (opcional)"
                      maxLength={1000}
                      rows={3}
                    />
                    {editError && <p className="text-xs text-red-500">{editError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(v.id_valoracion)}
                        disabled={savingEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                  bg-green-600 hover:bg-green-700 text-white
                                  disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        {savingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Guardar
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditError(""); }}
                        disabled={savingEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                  border text-muted-foreground hover:text-foreground
                                  transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirmación de eliminación */}
                {isConfirm && !isEditing && (
                  <div className="border-t pt-3 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-sm font-medium text-red-500">¿Eliminar esta valoración?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteValoracion(v.id_valoracion)}
                        disabled={deletingId === v.id_valoracion}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                  bg-red-500 hover:bg-red-600 text-white
                                  disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        {deletingId === v.id_valoracion
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Trash2 className="h-3 w-3" />}
                        Sí, eliminar
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                  border text-muted-foreground hover:text-foreground
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