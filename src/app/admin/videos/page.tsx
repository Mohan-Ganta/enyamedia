'use client'

import { useEffect, useState } from 'react'
import { 
  Video as VideoIcon, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Star,
  StarOff
} from 'lucide-react'
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
  createdAt: string
  uploader?: {
    name: string
    email: string
  } | null
}

export default function VideoManagement() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        console.error('No auth token found')
        return
      }

      const response = await fetch('/api/admin/videos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Videos data received:', data) // Debug log
        setVideos(Array.isArray(data.videos) ? data.videos : [])
      } else {
        console.error('Failed to fetch videos:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (videoId: string) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Remove video from local state
        setVideos(videos.filter(video => video.id !== videoId))
        setShowDeleteModal(false)
        setVideoToDelete(null)
        
        // Show success message
        alert('Video deleted successfully!')
        
        // Refresh the video list to ensure consistency
        fetchVideos()
      } else {
        const errorData = await response.json()
        console.error('Delete failed:', errorData)
        alert(`Failed to delete video: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to delete video:', error)
      alert('Failed to delete video: Network error')
    }
  }

  const toggleFeatured = async (videoId: string, isFeatured: boolean) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFeatured: !isFeatured })
      })

      if (response.ok) {
        setVideos(videos.map(video => 
          video.id === videoId 
            ? { ...video, isFeatured: !isFeatured }
            : video
        ))
      }
    } catch (error) {
      console.error('Failed to update featured status:', error)
    }
  }

  const togglePublic = async (videoId: string, isPublic: boolean) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublic: !isPublic })
      })

      if (response.ok) {
        setVideos(videos.map(video => 
          video.id === videoId 
            ? { ...video, isPublic: !isPublic }
            : video
        ))
      }
    } catch (error) {
      console.error('Failed to update public status:', error)
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

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (video.uploader?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || video.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Video Management</h1>
          <p className="mt-2 text-gray-400">
            Manage all uploaded videos
          </p>
        </div>
        <Link
          href="/admin/upload"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
        >
          <VideoIcon className="w-4 h-4 mr-2" />
          Upload New Video
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Status</option>
              <option value="READY">Ready</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <VideoIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No videos found</h3>
            <p className="text-gray-400">
              {videos.length === 0 
                ? "Upload your first video to get started" 
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-16 h-12 bg-gray-700 rounded-lg overflow-hidden">
                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <VideoIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white truncate max-w-xs">
                            {video.title}
                          </div>
                          <div className="text-sm text-gray-400">
                            by {video.uploader?.name || 'Unknown User'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        <div>{video.category || 'Uncategorized'}</div>
                        <div className="text-gray-400">
                          {formatDuration(video.duration)} • {formatFileSize(video.size)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          video.status === 'READY' 
                            ? 'bg-green-100 text-green-800' 
                            : video.status === 'PROCESSING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {video.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePublic(video.id, video.isPublic)}
                            className={`text-xs px-2 py-1 rounded ${
                              video.isPublic 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            {video.isPublic ? 'Public' : 'Private'}
                          </button>
                          <button
                            onClick={() => toggleFeatured(video.id, video.isFeatured)}
                            className={`p-1 rounded ${
                              video.isFeatured 
                                ? 'text-yellow-400' 
                                : 'text-gray-400 hover:text-yellow-400'
                            }`}
                          >
                            {video.isFeatured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        <div>{video.views.toLocaleString()} views</div>
                        <div className="text-gray-400">{video.likes.toLocaleString()} likes</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/watch/${video.id}`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Video"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/videos/${video.id}/edit`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit Video"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setVideoToDelete(video.id)
                            setShowDeleteModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && videoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Video</h3>
            <p className="text-gray-400 mb-2">
              Are you sure you want to delete this video?
            </p>
            <p className="text-white font-medium mb-4">
              &quot;{videos.find(v => v.id === videoToDelete)?.title || 'Unknown Video'}&quot;
            </p>
            <p className="text-red-400 text-sm mb-6">
              This action cannot be undone. The video file and all associated data will be permanently deleted from the database.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setVideoToDelete(null)
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => videoToDelete && handleDelete(videoToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}