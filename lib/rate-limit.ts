import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number }

export async function checkRateLimit(key: string, maxAttempts: number, windowMs: number): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMs)

  await prisma.rateLimitAttempt.deleteMany({ where: { key, createdAt: { lt: windowStart } } })

  const count = await prisma.rateLimitAttempt.count({ where: { key, createdAt: { gte: windowStart } } })

  if (count >= maxAttempts) {
    const oldest = await prisma.rateLimitAttempt.findFirst({ where: { key }, orderBy: { createdAt: 'asc' } })
    const retryAfterSeconds = oldest
      ? Math.max(1, Math.ceil((oldest.createdAt.getTime() + windowMs - Date.now()) / 1000))
      : Math.ceil(windowMs / 1000)
    return { allowed: false, retryAfterSeconds }
  }

  await prisma.rateLimitAttempt.create({ data: { key } })
  return { allowed: true }
}
