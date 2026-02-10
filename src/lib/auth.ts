import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Also check cookies
  const token = request.cookies.get('auth-token')?.value
  return token || null
}

export async function requireAuth(request: NextRequest, requiredRole?: string) {
  const token = getTokenFromRequest(request)
  
  if (!token) {
    throw new Error('Authentication required')
  }
  
  const payload = verifyToken(token)
  if (!payload) {
    throw new Error('Invalid token')
  }
  
  if (requiredRole && payload.role !== requiredRole && payload.role !== 'SUPER_ADMIN') {
    throw new Error('Insufficient permissions')
  }
  
  return payload
}