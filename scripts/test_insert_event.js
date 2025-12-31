const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const nextRes = await client.query('SELECT COALESCE(MAX(id_evento),0)+1 AS next FROM tabla_eventos');
    const nextId = nextRes.rows[0].next;
    console.log('Next id_evento computed:', nextId);

    // Insert minimal event
    await client.query(`INSERT INTO tabla_eventos (
      id_evento, nombre_evento, id_usuario, id_categoria_evento, id_tipo_evento, id_sitio, id_municipio,
      descripcion, telefono_1, telefono_2, fecha_inicio, fecha_fin, hora_inicio, hora_final,
      dias_semana, gratis_pago, cupo, estado
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,[
      nextId,
      'TEST EVENT',
      '0000000000',
      1,
      1,
      1,
      1,
      'Test descripcion',
      '3000000000',
      null,
      '2025-01-01',
      '2025-01-02',
      '10:00:00',
      '12:00:00',
      JSON.stringify(['2025-01-01']),
      false,
      100,
      true
    ]);

    const res = await client.query('SELECT * FROM tabla_eventos WHERE id_evento = $1', [nextId]);
    console.log('Inserted event row:', res.rows[0]);

    // Rollback so DB unchanged
    await client.query('ROLLBACK');
    console.log('Rolled back transaction. Test complete.');
  } catch (err) {
    console.error('Error during test:', err);
    await client.query('ROLLBACK');
  } finally {
    client.release();
    process.exit(0);
  }
})();