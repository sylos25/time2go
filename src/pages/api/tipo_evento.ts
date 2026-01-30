import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { categoriaId } = req.query;

  if (!categoriaId) return res.status(400).json({ message: "Falta el ID de categoría" });

  try {
    const id = Number(categoriaId);
    if (isNaN(id)) return res.status(400).json({ message: "ID de categoría inválido" });

    const result = await pool.query(
      "SELECT id_tipo_evento, nombre FROM tabla_tipo_eventos WHERE id_categoria_evento = $1",
      [id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tipos de evento" });
  }
}

