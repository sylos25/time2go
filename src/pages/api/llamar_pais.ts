import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT id_pais, nombre_pais FROM tabla_paises ORDER BY nombre_pais ASC");
      const paises = result.rows.map((p) => ({
        value: p.id_pais,
        label: p.nombre_pais,
      }));
      res.status(200).json(paises);
    } catch (error) {
      console.error("Error al consultar países:", error);
      res.status(500).json({ error: "Error al consultar países" });
    }
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
