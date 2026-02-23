import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

type UploadDocumentInput = {
  buffer: Buffer;
  contentType: string;
  originalFileName: string;
  eventId?: number | string;
};

type UploadDocumentResult = {
  provider: "r2" | "s3";
  storageKey: string;
  publicUrl: string | null;
  mimeType: string;
  sizeBytes: number;
  originalFileName: string;
};

type StorageProvider = "r2" | "s3";

const provider = (process.env.DOCUMENT_STORAGE_PROVIDER || "r2").toLowerCase() as StorageProvider;

const bucket = process.env.DOCUMENTS_BUCKET_NAME || "";
const region = process.env.DOCUMENTS_REGION || "us-east-1";
const accessKeyId = process.env.DOCUMENTS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.DOCUMENTS_SECRET_ACCESS_KEY || "";
const endpoint = process.env.DOCUMENTS_ENDPOINT || "";
const publicBaseUrl = process.env.DOCUMENTS_PUBLIC_BASE_URL || "";
const forcePathStyle = String(process.env.DOCUMENTS_FORCE_PATH_STYLE || "false") === "true";

function ensureS3Config() {
  if (provider !== "s3" && provider !== "r2") {
    throw new Error(`Unsupported document storage provider: ${provider}`);
  }
  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Document storage env vars are missing. Set DOCUMENTS_BUCKET_NAME, DOCUMENTS_ACCESS_KEY_ID, DOCUMENTS_SECRET_ACCESS_KEY and optionally DOCUMENTS_REGION / DOCUMENTS_ENDPOINT."
    );
  }
}

function createS3Client() {
  ensureS3Config();
  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint: endpoint || undefined,
    forcePathStyle,
  });
}

function sanitizeFileName(name: string) {
  const base = String(name || "documento.pdf")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "documento.pdf";
}

function createStorageKey(originalFileName: string, eventId?: number | string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName = sanitizeFileName(originalFileName);
  const random = Math.random().toString(36).slice(2, 10);
  const eventSegment = eventId ? `event-${eventId}` : "event-unknown";
  return `Documents/${year}/${month}/${eventSegment}/${Date.now()}-${random}-${safeName}`;
}

function createImageStorageKey(originalFileName: string, eventId?: number | string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName = sanitizeFileName(originalFileName || "imagen.jpg");
  const random = Math.random().toString(36).slice(2, 10);
  const eventSegment = eventId ? `event-${eventId}` : "event-unknown";
  return `Images/${year}/${month}/${eventSegment}/${Date.now()}-${random}-${safeName}`;
}

type UploadObjectInput = {
  buffer: Buffer;
  contentType: string;
  originalFileName: string;
  storageKey: string;
};

async function uploadObjectBuffer(input: UploadObjectInput): Promise<UploadDocumentResult> {
  const s3 = createS3Client();

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.storageKey,
      Body: input.buffer,
      ContentType: input.contentType || "application/octet-stream",
      ContentDisposition: `inline; filename="${sanitizeFileName(input.originalFileName)}"`,
    })
  );

  const publicUrl = publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, "")}/${input.storageKey}` : null;

  return {
    provider,
    storageKey: input.storageKey,
    publicUrl,
    mimeType: input.contentType || "application/octet-stream",
    sizeBytes: input.buffer.length,
    originalFileName: sanitizeFileName(input.originalFileName),
  };
}

export async function uploadDocumentBuffer(input: UploadDocumentInput): Promise<UploadDocumentResult> {
  return uploadObjectBuffer({
    buffer: input.buffer,
    contentType: input.contentType || "application/pdf",
    originalFileName: input.originalFileName,
    storageKey: createStorageKey(input.originalFileName, input.eventId),
  });
}

type UploadImageInput = {
  buffer: Buffer;
  contentType: string;
  originalFileName: string;
  eventId?: number | string;
};

export async function uploadImageBuffer(input: UploadImageInput): Promise<UploadDocumentResult> {
  return uploadObjectBuffer({
    buffer: input.buffer,
    contentType: input.contentType || "image/jpeg",
    originalFileName: input.originalFileName,
    storageKey: createImageStorageKey(input.originalFileName, input.eventId),
  });
}

export async function getDocumentFromStorage(storageKey: string) {
  const s3 = createS3Client();
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: storageKey,
    })
  );

  if (!response.Body) {
    throw new Error("Document body not found in storage");
  }

  const bytes = await response.Body.transformToByteArray();

  return {
    bytes,
    contentType: response.ContentType || "application/pdf",
    contentLength: response.ContentLength || bytes.length,
  };
}
