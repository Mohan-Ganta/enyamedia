import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface Video {
  _id?: ObjectId
  title: string
  description?: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  duration?: number
  thumbnail?: string
  status: 'PROCESSING' | 'READY' | 'FAILED' | 'DELETED'
  views: number
  likes: number
  tags?: string
  category?: string
  isPublic: boolean
  isFeatured: boolean
  uploadedBy: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface Activity {
  _id?: ObjectId
  type: string
  message: string
  userId?: ObjectId
  videoId?: ObjectId
  metadata?: string
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}