export type CookieSerializeOptions = {
  maxAge?: number
  path?: string
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  domain?: string
}

export function serializeCookie(name: string, value: string, options: CookieSerializeOptions = {}) {
  const parts: string[] = []
  parts.push(`${name}=${encodeURIComponent(value)}`)

  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`)
  parts.push(`Path=${options.path ?? '/'}`)

  if (options.domain) parts.push(`Domain=${options.domain}`)
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)

  return parts.join('; ')
}

export function parseCookies(cookieHeader: string | null | undefined) {
  const obj: Record<string, string> = {}
  if (!cookieHeader) return obj
  const pairs = cookieHeader.split(';')
  for (const p of pairs) {
    const idx = p.indexOf('=')
    if (idx < 0) continue
    const key = p.slice(0, idx).trim()
    const val = p.slice(idx + 1).trim()
    obj[key] = decodeURIComponent(val)
  }
  return obj
}

export function clearCookieHeader(name: string, options: CookieSerializeOptions = {}) {
  return serializeCookie(name, '', { ...options, maxAge: 0 })
}
