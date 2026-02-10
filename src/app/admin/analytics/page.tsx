'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Users, Video, Eye, Clock } from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  totalVideos: number
  totalUsers: number
  avgWatchTime: number
  topVideos: Array<{
    id: string
    title: string
    views: number
    duration: number
  }>
  viewsOverTime: Array<{
    date: string
    views: number
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setData({
        totalViews: 125430,
        totalVideos: 45,
        totalUsers: 2340,
        avgWatchTime: 18.5,
        topVideos: [
          { id: '1', title: 'Mayabazar Classic', views: 15420, duration: 180 },
          { id: '2', title: 'Pathala Bhairavi', views: 12350, duration: 165 },
          { id: '3', title: 'Missamma', views: 9870, duration: 155 },
        ],
        viewsOverTime: [
          { date: '2024-01-01', views: 1200 },
          { date: '2024-01-02', views: 1450 },
          { date: '2024-01-03', views: 1680 },
          { date: '2024-01-04', views: 1320 },
          { date: '2024-01-05', views: 1890 },
        ]
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-900 p-6 rounded-xl animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <p className="text-2xl font-bold text-white">{data?.totalViews.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-sm">+12.5%</span>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Videos</p>
              <p className="text-2xl font-bold text-white">{data?.totalVideos}</p>
            </div>
            <Video className="w-8 h-8 text-purple-500" />
          </div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-sm">+3 this week</span>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{data?.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-sm">+8.2%</span>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Watch Time</p>
              <p className="text-2xl font-bold text-white">{data?.avgWatchTime}m</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-sm">+2.1m</span>
          </div>
        </div>
      </div>

      {/* Top Videos */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Top Performing Videos</h2>
        <div className="space-y-4">
          {data?.topVideos.map((video, index) => (
            <div key={video.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-white font-medium">{video.title}</h3>
                  <p className="text-gray-400 text-sm">{Math.floor(video.duration / 60)}m {video.duration % 60}s</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{video.views.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">views</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Views Chart Placeholder */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Views Over Time</h2>
        <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">Chart visualization would go here</p>
            <p className="text-gray-500 text-sm">Integration with charting library needed</p>
          </div>
        </div>
      </div>
    </div>
  )
}