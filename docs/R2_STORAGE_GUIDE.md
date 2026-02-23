# ☁️ Cloudflare R2 - Guía de Implementación (Imágenes + PDF)

Esta guía deja Time2Go operando con **Cloudflare R2** como almacenamiento de objetos para:
- Imágenes de eventos
- PDFs de eventos
- PDFs de documentos de promotor

## 1) Variables de entorno

Usa el template [.env.local.example](../.env.local.example) y completa estas variables:

- `DOCUMENT_STORAGE_PROVIDER=r2`
- `DOCUMENTS_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
- `DOCUMENTS_REGION=auto`
- `DOCUMENTS_BUCKET_NAME=<bucket>`
- `DOCUMENTS_ACCESS_KEY_ID=<access_key_id>`
- `DOCUMENTS_SECRET_ACCESS_KEY=<secret_access_key>`
- `DOCUMENTS_PUBLIC_BASE_URL=<opcional>`
- `DOCUMENTS_FORCE_PATH_STYLE=false`

## 2) Base de datos (migración)

Ejecuta el DDL actualizado de [scripts/DDL Time2Go.SQL](../scripts/DDL%20Time2Go.SQL).

Puntos clave:
- `tabla_documentos_eventos` ya incluye metadatos de storage.
- `tabla_imagenes_eventos` ahora incluye metadatos de storage:
  - `storage_provider`
  - `storage_key`
  - `mime_type`
  - `bytes`
  - `original_filename`

## 3) Flujo de almacenamiento

### Imágenes
- Upload: `POST /api/events` y `PUT /api/events/[id]` suben archivos a R2.
- Persistencia: se guarda URL + metadatos de objeto en `tabla_imagenes_eventos`.
- Lectura: la API de eventos retorna imágenes R2 como `url_imagen_evento=/api/events/image?id=<id_imagen_evento>`.
- Entrega: `GET /api/events/image` soporta `id` (preferido) y `key` (compat legacy).

### PDF de eventos
- Upload: `POST /api/events` sube PDF a R2.
- Persistencia: se guarda metadata en `tabla_documentos_eventos`.
- Entrega: `GET /api/events/document?id=<id_documento_evento>` stream desde R2, con fallback legacy URL.

### PDF de promotor
- Upload: `POST /api/promotor-document` sube a R2 y guarda referencia en DB.

## 4) Smoke test sugerido

1. Crear evento con 2 imágenes + 1 PDF.
2. Abrir listado y detalle de evento (imágenes deben cargar por `/api/events/image?id=...`).
3. Abrir PDF desde dashboard (debe cargar por `/api/events/document?id=...`).
4. Editar evento y agregar imagen nueva.
5. Verificar en DB:
   - `tabla_imagenes_eventos.storage_provider='r2'`
   - `tabla_documentos_eventos.storage_provider='r2'`

## 5) Compatibilidad con datos antiguos

El sistema mantiene fallback para registros legacy:
- Imágenes/PDF con URL previa siguen funcionando mientras la URL sea accesible.
- Nuevos registros se escriben con metadata R2.

## 6) Recomendaciones operativas

- Usa bucket privado y entrega por API para mayor control.
- Habilita `DOCUMENTS_PUBLIC_BASE_URL` solo si quieres URLs públicas directas.
- Rota credenciales R2 periódicamente.
- Configura backups/versionado del bucket según criticidad.
