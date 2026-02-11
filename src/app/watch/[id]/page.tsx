'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Share2, ThumbsUp } from 'lucide-react'
import { MovieCard } from '@/components/movies/MovieCard'
import { MainLayout } from '@/components/layout/MainLayout'
import VideoPlayer from '@/components/VideoPlayer'

interface Video {
  id: string
  title: string
  description?: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  duration?: number
  videoUrl?: string
  thumbnail?: string
  status: string
  views: number
  likes: number
  category?: string
  isPublic: boolean
  createdAt: string
  uploader: {
    id: string
    name: string
    email: string
  }
}

interface RelatedVideo {
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

export default function WatchPage() {
    const params = useParams()
    const id = params.id as string
    const [video, setVideo] = useState<Video | null>(null)
    const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!id) return

        const fetchVideo = async () => {
            try {
                const response = await fetch(`/api/videos/${id}`)
                if (response.ok) {
                    const data = await response.json()
                    setVideo(data.video)
                } else {
                    setError('Video not found')
                }
            } catch (error) {
                console.error('Failed to fetch video:', error)
                setError('Failed to load video')
            } finally {
                setLoading(false)
            }
        }

        const fetchRelatedVideos = async () => {
            try {
                const response = await fetch('/api/public/videos?limit=6')
                if (response.ok) {
                    const data = await response.json()
                    setRelatedVideos(data.videos.filter((v: RelatedVideo) => v.id !== id))
                }
            } catch (error) {
                console.error('Failed to fetch related videos:', error)
            }
        }

        fetchVideo()
        fetchRelatedVideos()
    }, [id])

    const formatDuration = (seconds?: number): string => {
        if (!seconds) return 'N/A'
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black pt-16">
                <div className="w-full h-[56.25vw] max-h-[80vh] bg-gray-800 animate-pulse"></div>
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="h-8 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                            <div className="h-16 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !video) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center pt-16">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Video Not Found</h2>
                    <p className="text-gray-400">{error || 'The video you are looking for does not exist.'}</p>
                </div>
            </div>
        )
    }

    const videoUrl = `/api/videos/${id}/stream`  // Always use streaming API to avoid CORS
    const directVideoUrl = video.videoUrl || `/uploads/${video?.filename}`  // S3 URL as fallback

    return (
        <MainLayout>
            <div className="min-h-screen bg-black">
                {/* Video Player Section - YouTube style */}
                <div className="pt-16">
                    <div className="relative w-full h-[56.25vw] max-h-[80vh] bg-black">
                        <VideoPlayer
                            videoUrl={videoUrl}
                            fallbackUrl={directVideoUrl}
                            mimeType={video.mimeType}
                            thumbnail={video.thumbnail}
                            title={video.title}
                        />
                    </div>
                </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Video Info */}
                    <div className="lg:col-span-2">
                        <h1 className="text-2xl font-bold text-white mb-3">{video.title}</h1>
                        
                        <div className="flex items-center gap-3 text-gray-400 text-sm mb-4">
                            <span>{video.views.toLocaleString()} views</span>
                            <span>•</span>
                            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-3">
                                <Button className="bg-white text-black hover:bg-gray-200 gap-2 rounded-full px-6">
                                    <ThumbsUp className="w-4 h-4" />
                                    {video.likes.toLocaleString()}
                                </Button>
                                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 gap-2 rounded-full px-6">
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </Button>
                                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 gap-2 rounded-full px-6">
                                    <Plus className="w-4 h-4" />
                                    Save
                                </Button>
                            </div>
                        </div>

                        {/* Video Details */}
                        <div className="bg-gray-900 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                <span>{new Date(video.createdAt).getFullYear()}</span>
                                <span className="border border-gray-600 px-2 py-1 rounded text-xs">
                                    {video.category?.toUpperCase() || 'HD'}
                                </span>
                                <span>{formatDuration(video.duration)}</span>
                            </div>
                            
                            {video.description && (
                                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                                    {video.description}
                                </p>
                            )}
                            
                            <div className="text-sm text-gray-400">
                                <p>Uploaded by: <span className="text-white">{video.uploader.name}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Registration Showcase */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="text-yellow-500 text-xl">✨</div>
                                <h3 className="text-yellow-500 font-semibold text-lg">Restoration Showcase</h3>
                            </div>
                            <p className="text-gray-300 text-sm mb-6">
                                Drag the slider to see how we brought this classic to life 
                                with our proprietary colorization engine.
                            </p>
                            
                            {/* Before/After Slider */}
                            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-800">
                                {/* Original Image (Left side) */}
                                <div className="absolute inset-0">
                                    <img 
                                        src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop&ixlib=rb-4.0.3"
                                        alt="Original black and white"
                                        className="w-full h-full object-cover grayscale"
                                    />
                                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        ORIGINAL
                                    </div>
                                </div>
                                
                                {/* Colorized Image (Right side) */}
                                <div 
                                    className="absolute inset-0 transition-all duration-300 ease-out"
                                    style={{ clipPath: 'inset(0 0 0 50%)' }}
                                    id="colorized-section"
                                >
                                    <img 
                                        src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop&ixlib=rb-4.0.3"
                                        alt="Colorized version"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 right-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        COLORIZED
                                    </div>
                                </div>
                                
                                {/* Slider Handle */}
                                <div 
                                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 transition-all duration-150"
                                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                                    id="slider-handle"
                                >
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                        </svg>
                                    </div>
                                </div>
                                
                                {/* Interactive overlay */}
                                <div 
                                    className="absolute inset-0 cursor-ew-resize z-20"
                                    onMouseMove={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const percentage = (x / rect.width) * 100;
                                        const clampedPercentage = Math.max(0, Math.min(100, percentage));
                                        
                                        const handle = document.getElementById('slider-handle');
                                        const colorizedSection = document.getElementById('colorized-section');
                                        
                                        if (handle && colorizedSection) {
                                            handle.style.left = `${clampedPercentage}%`;
                                            colorizedSection.style.clipPath = `inset(0 0 0 ${clampedPercentage}%)`;
                                        }
                                    }}
                                    onTouchMove={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = e.touches[0].clientX - rect.left;
                                        const percentage = (x / rect.width) * 100;
                                        const clampedPercentage = Math.max(0, Math.min(100, percentage));
                                        
                                        const handle = document.getElementById('slider-handle');
                                        const colorizedSection = document.getElementById('colorized-section');
                                        
                                        if (handle && colorizedSection) {
                                            handle.style.left = `${clampedPercentage}%`;
                                            colorizedSection.style.clipPath = `inset(0 0 0 ${clampedPercentage}%)`;
                                        }
                                    }}
                                />
                            </div>
                            
                            {/* Additional Info */}
                            <div className="mt-4 text-xs text-gray-400">
                                <p>• Advanced AI colorization technology</p>
                                <p>• Frame-by-frame restoration process</p>
                                <p>• Historical accuracy maintained</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* More Like This Section */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-white mb-6">More Like This</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {relatedVideos.slice(0, 6).map((relatedVideo) => (
                            <div key={relatedVideo.id} className="relative group">
                                <MovieCard
                                    id={relatedVideo.id}
                                    title={relatedVideo.title}
                                    imageUrl={relatedVideo.imageUrl}
                                    year={relatedVideo.year}
                                    genre={relatedVideo.genre}
                                    duration={relatedVideo.duration}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        </MainLayout>
    )
}
