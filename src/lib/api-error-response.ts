import { NextResponse } from "next/server";
import { ERROR_CODES, statusFromErrorCode } from "@/lib/error-codes";

type DbPayloadError = {
  ok?: boolean;
  error_code?: string;
  sqlstate?: string | null;
  error?: string;
  message?: string;
};

export function buildApiErrorBody(payload: DbPayloadError | null | undefined, fallbackMessage: string) {
  const errorCode = payload?.error_code || ERROR_CODES.DB_ERROR;
  const message = payload?.error || payload?.message || fallbackMessage;

  return {
    ok: false,
    error_code: errorCode,
    sqlstate: payload?.sqlstate ?? null,
    message,
  };
}

export function dbErrorResponse(payload: DbPayloadError | null | undefined, fallbackMessage: string) {
  const body = buildApiErrorBody(payload, fallbackMessage);
  return NextResponse.json(body, { status: statusFromErrorCode(body.error_code) });
}

export function internalErrorResponse(fallbackMessage: string) {
  return NextResponse.json(
    {
      ok: false,
      error_code: ERROR_CODES.DB_ERROR,
      sqlstate: null,
      message: fallbackMessage,
    },
    { status: 500 }
  );
}
