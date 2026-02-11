'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  videoUrl: string
  fallbackUrl?: string
  mimeType: string
  thumbnail?: string
  title: string
}

export default function VideoPlayer({ 
  videoUrl, 
  fallbackUrl, 
  mimeType, 
  thumbnail, 
  title 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(videoUrl)

  useEffect(() => {
    // Component mounted
  }, [videoUrl, fallbackUrl, mimeType, thumbnail])

  const handleLoadStart = () => {
    setIsLoading(true)
    setError(null)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
  }

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget
    const error = videoElement.error

    if (fallbackUrl && currentSrc !== fallbackUrl) {
      setCurrentSrc(fallbackUrl)
      setError(null)
    } else {
      setError(`Video failed to load: ${error?.message || 'Unknown error'}`)
      setIsLoading(false)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const video = videoRef.current
      // Check if video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        // Video has invalid dimensions - likely codec issue
      }
    }
  }

  const handlePlay = () => {
    setIsLoading(false)
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        preload="metadata"
        onLoadStart={handleLoadStart}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onPlay={handlePlay}
        crossOrigin="anonymous"
        style={{
          backgroundColor: '#000',
          objectFit: 'contain',
          display: 'block'
        }}
        key={currentSrc} // Force re-render when src changes
      >
        <source src={currentSrc} type={mimeType} />
        Your browser does not support the video tag.
      </video>

      {/* Video codec warning */}
      {!isLoading && !error && videoRef.current?.videoWidth === 0 && videoRef.current?.duration > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90">
          <div className="text-center text-white p-6 max-w-md">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold mb-2">Audio Only</h3>
            <p className="text-gray-300 mb-4">
              This video file contains audio but the video track cannot be displayed in web browsers.
            </p>
            <div className="text-sm text-gray-400 mb-4">
              <strong>Technical Details:</strong><br/>
              The video uses an unsupported codec (likely H.265/HEVC).<br/>
              Duration: {Math.round(videoRef.current?.duration || 0)} seconds
            </div>
            <div className="text-xs text-yellow-300">
              <strong>For Admin:</strong> Re-encode this video with H.264 codec for web compatibility.
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading video...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            {thumbnail && (
              <img 
                src={thumbnail} 
                alt={title}
                className="max-w-full max-h-64 object-contain mx-auto mb-4 opacity-50"
              />
            )}
            <p className="text-white text-lg mb-2">Video failed to load</p>
            <p className="text-gray-400 text-sm">{error}</p>
            <button 
              onClick={() => {
                setError(null)
                setCurrentSrc(videoUrl)
                if (videoRef.current) {
                  videoRef.current.load()
                }
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}