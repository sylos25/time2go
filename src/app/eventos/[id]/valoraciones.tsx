"use client";

import { useEffect, useState } from "react";

export default function Valoraciones({ eventId }: { eventId: number }) {
  const [valoraciones, setValoraciones] = useState<any[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchValoraciones = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/valoraciones`);
      const json = await res.json();
      if (json.ok) setValoraciones(json.valoraciones);
      else setValoraciones([]);
    } catch (err) {
      console.error(err);
      setValoraciones([]);
    }
  };

  useEffect(() => { fetchValoraciones(); }, [eventId]);

  const submit = async () => {
    setLoading(true);
    try {
      // En este ejemplo requerimos token Bearer para identificar usuario
      const res = await fetch(`/api/events/${eventId}/valoraciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valoracion: rating, comentario: comment })
      });
      const json = await res.json();
      if (json.ok) {
        setComment(""); setRating(5); fetchValoraciones();
      } else {
        alert(json.message || 'Error al enviar la valoración');
      }
    } catch (err) {
      console.error(err);
      alert('Error al enviar la valoración');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm">Calificación:</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border rounded-md p-1">
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
          </select>
        </div>
        <textarea value={comment} onChange={(e)=>setComment(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Deja un comentario (opcional)" />
        <div className="flex gap-2">
          <button onClick={submit} className="px-3 py-1 bg-blue-600 text-white rounded-md" disabled={loading}>Enviar</button>
          <button onClick={() => { setComment(''); setRating(5); }} className="px-3 py-1 border rounded-md">Limpiar</button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {valoraciones.length === 0 && <div className="text-sm text-gray-500">Sé el primero en valorar este evento.</div>}
        {valoraciones.map(v => (
          <div key={v.id_valoracion} className="border p-3 rounded-md">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div><strong>{v.id_usuario}</strong></div>
              <div>{new Date(v.fecha_creacion).toLocaleString()}</div>
            </div>
            <div className="mt-2">{v.valoracion} ⭐</div>
            {v.comentario && <div className="mt-2 text-gray-700">{v.comentario}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}