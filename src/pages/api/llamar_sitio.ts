import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { nombre_sitio } = req.query;
  if (!nombre_sitio || typeof nombre_sitio !== "string") {
    return res.status(400).json({ message: "Falta el parámetro 'nombre'" });
  }
  try {
    const result = await pool.query(
        "SELECT id_sitio, nombre_sitio FROM tabla_sitios WHERE LOWER(nombre_sitio) LIKE LOWER($1) LIMIT 10",
        [`%${nombre_sitio}%`]
      );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al buscar sitios:", error);
    res.status(500).json({ message: "Error al buscar sitios" });
  }
}
