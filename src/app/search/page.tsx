'use client'

import { useState, useEffect } from 'react'
import { MovieCard } from '@/components/movies/MovieCard'
import { MainLayout } from '@/components/layout/MainLayout'
import { Search } from 'lucide-react'

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

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const [videos, setVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        try {
            const response = await fetch('/api/public/videos?limit=100')
            if (response.ok) {
                const data = await response.json()
                setVideos(data.videos)
            }
        } catch (error) {
            console.error('Failed to fetch videos:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.genre.toLowerCase().includes(query.toLowerCase()) ||
        (video.description && video.description.toLowerCase().includes(query.toLowerCase())) ||
        video.uploader.toLowerCase().includes(query.toLowerCase())
    )

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
                    <div className="max-w-2xl mx-auto mb-12">
                        <div className="h-14 bg-gray-700 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-8 bg-gray-700 rounded w-48 mb-6 animate-pulse"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {Array.from({length: 10}).map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-gray-700 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
                {/* Search Input */}
                <div className="max-w-2xl mx-auto mb-12 relative">
                    <input
                        type="text"
                        placeholder="Search titles, genres, descriptions..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 text-white px-6 py-4 rounded-full pl-14 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-lg"
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-6 h-6" />
                </div>

                {/* Results */}
                <h2 className="text-2xl font-semibold text-white mb-6">
                    {query ? `Results for &ldquo;${query}&rdquo; (${filteredVideos.length})` : `All Videos (${videos.length})`}
                </h2>

                {videos.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                            <Search className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No Videos Available</h3>
                        <p className="text-gray-400">Videos will appear here once they are uploaded by administrators.</p>
                    </div>
                ) : filteredVideos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredVideos.map(video => (
                            <div key={video.id} className="flex justify-center">
                                <MovieCard {...video} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-zinc-500 mt-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-xl">No videos found matching &ldquo;{query}&rdquo;</p>
                        <p className="text-sm mt-2">Try searching with different keywords</p>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
