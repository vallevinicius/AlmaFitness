import { SignJWT, jwtVerify } from 'jose'

export const CUSTOMER_SESSION_COOKIE_NAME = 'customer_session'

const encoder = new TextEncoder()

function getSecretKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET não configurado')
  return encoder.encode(secret)
}

export async function createCustomerSessionToken(customerId: string) {
  return new SignJWT({ role: 'customer', customerId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecretKey())
}

export async function verifyCustomerSessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (payload.role !== 'customer' || typeof payload.customerId !== 'string') return null
    return payload.customerId
  } catch {
    return null
  }
}
