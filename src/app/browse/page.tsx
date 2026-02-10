'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MovieCard } from '@/components/movies/MovieCard'
import { MainLayout } from '@/components/layout/MainLayout'

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

function BrowseContent() {
    const [videos, setVideos] = useState<Video[]>([])
    const [categories, setCategories] = useState<{name: string, count: number}[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('All')
    const searchParams = useSearchParams()

    useEffect(() => {
        fetchContent()
        // Set category from URL params
        const category = searchParams.get('category')
        if (category) {
            setSelectedCategory(category)
        }
    }, [searchParams])

    const fetchContent = async () => {
        try {
            const [videosRes, categoriesRes] = await Promise.all([
                fetch('/api/public/videos?limit=50'),
                fetch('/api/public/categories')
            ])

            if (videosRes.ok) {
                const videosData = await videosRes.json()
                setVideos(videosData.videos)
            }

            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json()
                setCategories(categoriesData.categories)
            }
        } catch (error) {
            console.error('Failed to fetch content:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredVideos = selectedCategory === 'All' 
        ? videos 
        : videos.filter(video => video.genre === selectedCategory)

    const allCategories = ['All', ...categories.map(cat => cat.name)]

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
                <div className="h-8 bg-gray-700 rounded w-48 mb-8 animate-pulse"></div>
                <div className="flex gap-4 mb-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 bg-gray-700 rounded-full w-24 animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {Array.from({length: 10}).map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-gray-700 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
            <h1 className="text-3xl font-bold text-white mb-8">Browse Videos</h1>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {allCategories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                            selectedCategory === category 
                                ? 'bg-primary text-black font-semibold' 
                                : 'bg-zinc-800 text-white hover:bg-zinc-700'
                        }`}
                    >
                        {category}
                        {category !== 'All' && categories.find(cat => cat.name === category) && (
                            <span className="ml-1 text-xs opacity-70">
                                ({categories.find(cat => cat.name === category)?.count})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {filteredVideos.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedCategory === 'All' ? 'No Videos Available' : `No ${selectedCategory} Videos`}
                    </h2>
                    <p className="text-gray-400">
                        {selectedCategory === 'All' 
                            ? 'Videos will appear here once they are uploaded by administrators.'
                            : `No videos found in the ${selectedCategory} category.`
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredVideos.map(video => (
                        <div key={video.id} className="flex justify-center">
                            <MovieCard {...video} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function BrowsePage() {
    return (
        <MainLayout>
            <Suspense fallback={
                <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
                    <div className="h-8 bg-gray-700 rounded w-48 mb-8 animate-pulse"></div>
                    <div className="flex gap-4 mb-8">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-10 bg-gray-700 rounded-full w-24 animate-pulse"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {Array.from({length: 10}).map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-gray-700 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            }>
                <BrowseContent />
            </Suspense>
        </MainLayout>
    )
}