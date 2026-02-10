'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Upload, 
  Video, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  BarChart3,
  Activity
} from 'lucide-react'
import ErrorBoundary from '@/components/ErrorBoundary'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuthAndSet = async () => {
      try {
        const token = localStorage.getItem('auth-token')
        if (!token) {
          router.push('/admin/login')
          return
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
            setUser(data.user)
          } else {
            localStorage.removeItem('auth-token')
            router.push('/admin/login')
          }
        } else {
          localStorage.removeItem('auth-token')
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndSet()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth-token')
    router.push('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Upload Videos', href: '/admin/upload', icon: Upload },
    { name: 'Manage Videos', href: '/admin/videos', icon: Video },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Activity', href: '/admin/activity', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-60 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-bold text-white">ENYAMEDIA</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-yellow-500 text-black'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-white'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-black font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-gray-900 border-b border-gray-800 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">
                {user.name}
              </span>
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-black font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 bg-black">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}