'use client'

import { useEffect, useState } from 'react'
import { Activity, User, Video, Upload, Eye, Calendar } from 'lucide-react'

interface ActivityLog {
  id: string
  type: 'VIDEO_UPLOAD' | 'USER_REGISTRATION' | 'VIDEO_VIEW' | 'LOGIN' | 'ADMIN_ACTION'
  description: string
  userId: string
  userName: string
  userEmail: string
  timestamp: string
  metadata?: {
    videoId?: string
    videoTitle?: string
    ipAddress?: string
    userAgent?: string
  }
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  const fetchActivities = async () => {
    try {
      // Simulate API call - replace with actual endpoint
      setTimeout(() => {
        setActivities([
          {
            id: '1',
            type: 'VIDEO_UPLOAD',
            description: 'Uploaded new video',
            userId: 'admin1',
            userName: 'Admin User',
            userEmail: 'admin@enyamedia.com',
            timestamp: '2024-02-10T16:30:00Z',
            metadata: {
              videoId: 'v1',
              videoTitle: 'Mayabazar Classic Restoration'
            }
          },
          {
            id: '2',
            type: 'USER_REGISTRATION',
            description: 'New user registered',
            userId: 'user1',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            timestamp: '2024-02-10T15:45:00Z',
            metadata: {
              ipAddress: '192.168.1.100'
            }
          },
          {
            id: '3',
            type: 'VIDEO_VIEW',
            description: 'Watched video',
            userId: 'user2',
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            timestamp: '2024-02-10T14:20:00Z',
            metadata: {
              videoId: 'v2',
              videoTitle: 'Pathala Bhairavi'
            }
          },
          {
            id: '4',
            type: 'LOGIN',
            description: 'User logged in',
            userId: 'user1',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            timestamp: '2024-02-10T13:15:00Z',
            metadata: {
              ipAddress: '192.168.1.100'
            }
          },
          {
            id: '5',
            type: 'ADMIN_ACTION',
            description: 'Modified user permissions',
            userId: 'admin1',
            userName: 'Admin User',
            userEmail: 'admin@enyamedia.com',
            timestamp: '2024-02-10T12:00:00Z'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'VIDEO_UPLOAD':
        return <Upload className="w-5 h-5 text-blue-500" />
      case 'USER_REGISTRATION':
        return <User className="w-5 h-5 text-green-500" />
      case 'VIDEO_VIEW':
        return <Eye className="w-5 h-5 text-purple-500" />
      case 'LOGIN':
        return <User className="w-5 h-5 text-yellow-500" />
      case 'ADMIN_ACTION':
        return <Activity className="w-5 h-5 text-red-500" />
      default:
        return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'VIDEO_UPLOAD':
        return 'bg-blue-500/20 border-blue-500/30'
      case 'USER_REGISTRATION':
        return 'bg-green-500/20 border-green-500/30'
      case 'VIDEO_VIEW':
        return 'bg-purple-500/20 border-purple-500/30'
      case 'LOGIN':
        return 'bg-yellow-500/20 border-yellow-500/30'
      case 'ADMIN_ACTION':
        return 'bg-red-500/20 border-red-500/30'
      default:
        return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  const filteredActivities = activities.filter(activity => 
    filter === 'ALL' || activity.type === filter
  )

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-white">Activity Log</h1>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 p-4 rounded-xl animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-white">Activity Log</h1>
        </div>
        <div className="text-gray-400">
          {filteredActivities.length} activities
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'VIDEO_UPLOAD', 'USER_REGISTRATION', 'VIDEO_VIEW', 'LOGIN', 'ADMIN_ACTION'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterType
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {filterType.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg border ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{activity.userName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400 text-sm">{activity.description}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-2">{activity.userEmail}</p>
                
                {activity.metadata && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    {activity.metadata.videoTitle && (
                      <div className="flex items-center gap-2 mb-1">
                        <Video className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">{activity.metadata.videoTitle}</span>
                      </div>
                    )}
                    {activity.metadata.ipAddress && (
                      <div className="text-gray-400 text-xs">
                        IP: {activity.metadata.ipAddress}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No activities found for the selected filter</p>
        </div>
      )}
    </div>
  )
}