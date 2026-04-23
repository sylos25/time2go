/**
 * Peticiones autenticadas con cookies HttpOnly (sin leer JWT en localStorage).
 * Incluir siempre `credentials: "include"`.
 */
export const fetchWithSession: typeof fetch = (input, init) =>
  fetch(input, { ...init, credentials: init?.credentials ?? "include" })
