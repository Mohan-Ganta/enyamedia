'use client'

import { useEffect, useState } from 'react'
import { MovieCard } from '@/components/movies/MovieCard'
import { MainLayout } from '@/components/layout/MainLayout'
import { Heart } from 'lucide-react'

interface Video {
  id: string
  title: string
  imageUrl: string
  year: string
  genre: string
  duration: string
  description?: string
  views: number
  likes: number
  uploader: string
}

export default function MyListPage() {
    const [myList, setMyList] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        checkAuthAndFetchList()
    }, [])

    const checkAuthAndFetchList = async () => {
        try {
            const token = localStorage.getItem('auth-token')
            if (!token) {
                setLoading(false)
                return
            }

            // Check if user is authenticated
            const authResponse = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (authResponse.ok) {
                setIsLoggedIn(true)
                // For now, we'll show an empty list since we haven't implemented favorites yet
                // In a full implementation, you'd fetch user's favorite videos here
                setMyList([])
            }
        } catch (error) {
            console.error('Failed to check auth:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
                    <div className="h-8 bg-gray-700 rounded w-32 mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {Array.from({length: 6}).map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-gray-700 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </MainLayout>
        )
    }

    if (!isLoggedIn) {
        return (
            <MainLayout>
                <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
                    <h1 className="text-3xl font-bold text-white mb-8">My List</h1>
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                            <Heart className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Sign in to see your list</h2>
                        <p className="text-gray-400 mb-6">Create an account to save your favorite videos</p>
                        <div className="space-x-4">
                            <a 
                                href="/login" 
                                className="inline-flex items-center px-6 py-3 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Sign In
                            </a>
                            <a 
                                href="/signup" 
                                className="inline-flex items-center px-6 py-3 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                            >
                                Create Account
                            </a>
                        </div>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
                <h1 className="text-3xl font-bold text-white mb-8">My List</h1>

                {myList.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {myList.map(video => (
                            <div key={video.id} className="flex justify-center">
                                <MovieCard {...video} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                            <Heart className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Your list is empty</h2>
                        <p className="text-gray-400 mb-6">Start adding videos to your favorites to see them here</p>
                        <a 
                            href="/browse" 
                            className="inline-flex items-center px-6 py-3 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Browse Videos
                        </a>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
