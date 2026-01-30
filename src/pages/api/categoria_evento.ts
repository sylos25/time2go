import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }
  
  try {
    const result = await pool.query("SELECT id_categoria_evento, nombre FROM tabla_categorias_eventos");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener categorías" });
  }
}
