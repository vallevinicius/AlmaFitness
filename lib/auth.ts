import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE_NAME = 'admin_session'

const encoder = new TextEncoder()

function getSecretKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET não configurado')
  return encoder.encode(secret)
}

export async function createSessionToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecretKey())
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return payload.role === 'admin'
  } catch {
    return false
  }
}
