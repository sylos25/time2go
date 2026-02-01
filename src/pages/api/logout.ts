import type { NextApiRequest, NextApiResponse } from 'next'
import { clearCookieHeader } from '@/lib/cookies'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const cookie = clearCookieHeader('token', { path: '/', httpOnly: true })
  res.setHeader('Set-Cookie', cookie)
  return res.status(200).json({ success: true })
}
