'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Video as VideoIcon } from 'lucide-react'
import Link from 'next/link'

interface Video {
  id: string
  title: string
  description?: string
  category?: string
  duration?: number
  size: number
  status: string
  isPublic: boolean
  isFeatured: boolean
  views: number
  likes: number
  thumbnail?: string
  filePath?: string
  createdAt: string
  uploader: {
    name: string
    email: string
  }
}

export default function EditVideo({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: true,
    isFeatured: false
  })

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const token = localStorage.getItem('auth-token')
        const response = await fetch(`/api/admin/videos/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setVideo(data.video)
          setFormData({
            title: data.video.title || '',
            description: data.video.description || '',
            category: data.video.category || '',
            isPublic: data.video.isPublic,
            isFeatured: data.video.isFeatured
          })
        } else if (response.status === 404) {
          router.push('/admin/videos')
        }
      } catch (error) {
        console.error('Failed to fetch video:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/admin/videos/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/videos')
      } else {
        alert('Failed to update video')
      }
    } catch (error) {
      console.error('Failed to update video:', error)
      alert('Failed to update video')
    } finally {
      setSaving(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <VideoIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Video not found</h3>
        <Link
          href="/admin/videos"
          className="text-yellow-500 hover:text-yellow-400"
        >
          Back to Videos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/videos"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Video</h1>
          <p className="mt-2 text-gray-400">
            Update video information and settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Info */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Video Preview</h3>
            
            {/* Thumbnail */}
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Video Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{formatDuration(video.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">File Size:</span>
                <span className="text-white">{formatFileSize(video.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Views:</span>
                <span className="text-white">{video.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Likes:</span>
                <span className="text-white">{video.likes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uploaded by:</span>
                <span className="text-white">{video.uploader.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Upload Date:</span>
                <span className="text-white">
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  video.status === 'READY' 
                    ? 'bg-green-100 text-green-800' 
                    : video.status === 'PROCESSING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {video.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Video Information</h3>
            
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter video description..."
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="Drama">Drama</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Action">Action</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Horror">Horror</option>
                  <option value="Documentary">Documentary</option>
                  <option value="Musical">Musical</option>
                  <option value="Family">Family</option>
                  <option value="Historical">Historical</option>
                </select>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-white">Settings</h4>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-300">
                    Make video public (visible to all users)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                  />
                  <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-300">
                    Featured in Hero Section
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <Link
                  href="/admin/videos"
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}