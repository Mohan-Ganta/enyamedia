'use client'

import { useEffect, useState } from 'react'
import { Video as VideoIcon, Users, HardDrive, Upload, TrendingUp, Activity, Eye } from 'lucide-react'

interface DashboardStats {
  totalVideos: number
  totalUsers: number
  totalStorage: number
  activeUploads: number
  totalViews: number
  totalLikes: number
}

interface VideoStatus {
  status: string
  count: number
}

interface VideoCategory {
  category: string
  count: number
}

interface RecentActivity {
  id: string
  type: string
  message: string
  createdAt: string
  user?: { name: string; email: string }
  video?: { title: string }
}

interface RecentUpload {
  id: string
  title: string
  createdAt: string
  uploader: { name: string; email: string }
  size: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [videosByStatus, setVideosByStatus] = useState<VideoStatus[]>([])
  const [videosByCategory, setVideosByCategory] = useState<VideoCategory[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setVideosByStatus(data.videosByStatus || [])
        setVideosByCategory(data.videosByCategory || [])
        setRecentActivities(data.recentActivities || [])
        setRecentUploads(data.recentUploads || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const statCards = [
    {
      name: 'Total Videos',
      value: stats?.totalVideos || 0,
      icon: VideoIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '+12%'
    },
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+8%'
    },
    {
      name: 'Storage Used',
      value: formatFileSize(stats?.totalStorage || 0),
      icon: HardDrive,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: '+23%'
    },
    {
      name: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '+15%'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Welcome to your admin dashboard. Here&apos;s what&apos;s happening with your platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
                <p className="text-sm text-green-400 mt-1">
                  {stat.change} from last month
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/upload"
            className="flex items-center p-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
          >
            <Upload className="w-5 h-5 mr-3" />
            Upload New Video
          </a>
          <a
            href="/admin/videos"
            className="flex items-center p-4 bg-gray-800 text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <VideoIcon className="w-5 h-5 mr-3" />
            Manage Videos
          </a>
          <a
            href="/admin/users"
            className="flex items-center p-4 bg-gray-800 text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Users className="w-5 h-5 mr-3" />
            Manage Users
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Videos by Status */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Videos by Status
          </h3>
          <div className="space-y-3">
            {videosByStatus.length > 0 ? (
              videosByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-300 capitalize">
                    {item.status.toLowerCase()}
                  </span>
                  <span className="text-sm font-medium text-white bg-gray-700 px-2 py-1 rounded">
                    {item.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <VideoIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No videos uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Videos by Category */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Videos by Category
          </h3>
          <div className="space-y-3">
            {videosByCategory.length > 0 ? (
              videosByCategory.slice(0, 5).map((item) => (
                <div key={item.category} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-300">
                    {item.category || 'Uncategorized'}
                  </span>
                  <span className="text-sm font-medium text-white bg-gray-700 px-2 py-1 rounded">
                    {item.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No categories yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Activities
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0">
                    <Activity className="w-5 h-5 text-yellow-500 mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Uploads
          </h3>
          <div className="space-y-4">
            {recentUploads.length > 0 ? (
              recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0">
                    <VideoIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {upload.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      by {upload.uploader.name} • {formatFileSize(upload.size)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(upload.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Upload className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <p className="text-gray-400 mb-2">No videos uploaded yet</p>
                <p className="text-xs text-gray-500">
                  Upload your first video to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}