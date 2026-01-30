import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sitioId = Number(req.query.sitioId);

    if (!sitioId) {
      return res.status(400).json({ error: "Falta el parámetro sitioId" });
    }

const result = await pool.query(
  `SELECT m.id_municipio, m.nombre_municipio FROM tabla_municipios m
    INNER JOIN tabla_sitios s ON m.id_municipio = s.id_municipio
      WHERE s.id_sitio = $1`,
  [sitioId]
);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener municipios" });
  }
}
