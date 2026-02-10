'use client'

import { useEffect, useState } from 'react'
import { Hero } from "@/components/hero/Hero";
import { MovieRow } from "@/components/movies/MovieRow";
import { MainLayout } from "@/components/layout/MainLayout";

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
  createdAt?: string
  isFeatured?: boolean
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<{name: string, count: number}[]>([])
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      // Fetch videos and categories
      const [videosRes, categoriesRes] = await Promise.all([
        fetch('/api/public/videos?limit=20'),
        fetch('/api/public/categories')
      ])

      if (videosRes.ok) {
        const videosData = await videosRes.json()
        setVideos(videosData.videos)
        
        // Set featured videos for hero slideshow
        if (videosData.videos.length > 0) {
          // Get all featured videos
          const featuredVideos = videosData.videos.filter((video: Video) => video.isFeatured)
          
          if (featuredVideos.length > 0) {
            // Sort featured videos by views descending, then by creation date
            const sortedFeatured = featuredVideos.sort((a: Video, b: Video) => {
              if (b.views !== a.views) {
                return b.views - a.views
              }
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            })
            setFeaturedVideos(sortedFeatured)
          } else {
            // Fallback to most viewed videos if no featured videos (limit to 3)
            const sortedVideos = [...videosData.videos].sort((a: Video, b: Video) => {
              if (b.views !== a.views) {
                return b.views - a.views
              }
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            })
            setFeaturedVideos(sortedVideos.slice(0, 3))
          }
        }
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

  // Group videos by category
  const videosByCategory = categories.reduce((acc, category) => {
    acc[category.name] = videos.filter(video => video.genre === category.name)
    return acc
  }, {} as Record<string, Video[]>)

  // Get recent videos if no categories
  const recentVideos = videos.slice(0, 10)

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background text-foreground">
          <div className="relative h-[80vh] w-full flex items-center justify-start">
            <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
            <div className="container mx-auto px-4 z-10 relative">
              <div className="max-w-2xl space-y-4">
                <div className="h-4 bg-gray-700 rounded w-48 animate-pulse"></div>
                <div className="h-16 bg-gray-700 rounded w-96 animate-pulse"></div>
                <div className="h-20 bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="flex gap-4">
                  <div className="h-12 bg-gray-700 rounded w-32 animate-pulse"></div>
                  <div className="h-12 bg-gray-700 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Visual separator */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          
          <div className="container mx-auto px-4 mt-8 md:mt-12 relative z-20 space-y-8 pb-20">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-gray-700 rounded w-64 animate-pulse"></div>
                <div className="flex space-x-4 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex-shrink-0 w-48 h-72 bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen pb-20 bg-background text-foreground overflow-x-hidden">
        <Hero videos={featuredVideos} />
        
        {/* Visual separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
        
        <div className="container mx-auto px-4 mt-8 md:mt-12 relative z-20 space-y-8 pb-20">
          {videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Videos Available</h2>
              <p className="text-gray-400 mb-6">Videos will appear here once they are uploaded by administrators.</p>
            </div>
          ) : (
            <>
              {/* Show recent videos first */}
              {recentVideos.length > 0 && (
                <MovieRow title="Recently Added" movies={recentVideos} />
              )}
              
              {/* Show videos by category */}
              {Object.entries(videosByCategory).map(([categoryName, categoryVideos]) => (
                categoryVideos.length > 0 && (
                  <MovieRow 
                    key={categoryName} 
                    title={`${categoryName} (${categoryVideos.length})`} 
                    movies={categoryVideos} 
                  />
                )
              ))}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}