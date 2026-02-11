'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Image from 'next/image'
import { Settings, Loader2, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react'
import { NetworkSpeedDetector, QualitySelector, VideoAnalytics } from '@/lib/video-service'

interface VideoQuality {
  label: string
  height: number
  url: string
  bitrate?: string | number
}

interface VideoPlayerProps {
  videoUrl: string
  fallbackUrl?: string
  mimeType: string
  thumbnail?: string
  title: string
  videoId: string
}

export default function VideoPlayer({ 
  videoUrl, 
  fallbackUrl, 
  mimeType, 
  thumbnail, 
  title,
  videoId
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(videoUrl)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [currentQuality, setCurrentQuality] = useState<VideoQuality | null>(null)
  const [availableQualities, setAvailableQualities] = useState<VideoQuality[]>([])
  const [isBuffering, setIsBuffering] = useState(false)
  const [networkSpeed, setNetworkSpeed] = useState<'slow' | 'medium' | 'fast'>('medium')
  const [autoQuality, setAutoQuality] = useState(true)
  
  // Custom controls state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasVideoTrack, setHasVideoTrack] = useState(true)
  const [videoDuration, setVideoDuration] = useState(0)
  const [isSafari, setIsSafari] = useState(false)

  // Detect Safari browser - moved to useMemo to avoid effect
  const isSafariBrowser = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    const userAgent = navigator.userAgent.toLowerCase()
    return /safari/.test(userAgent) && !/chrome/.test(userAgent) && !/firefox/.test(userAgent)
  }, [])

  // Set Safari state on mount
  useEffect(() => {
    setIsSafari(isSafariBrowser)
  }, [isSafariBrowser])

  // Event handlers - defined before useEffect
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const video = videoRef.current
      setDuration(video.duration)
      setVideoDuration(video.duration)
      // Check if video has a valid video track
      setHasVideoTrack(video.videoWidth > 0 && video.videoHeight > 0)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleVolumeChange = () => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume)
      setIsMuted(videoRef.current.muted)
    }
  }

  const detectNetworkSpeed = async () => {
    try {
      const detector = NetworkSpeedDetector.getInstance()
      const speed = await detector.detectSpeed()
      setNetworkSpeed(speed)
      detector.setCurrentSpeed(speed)
    } catch {
      console.log('Network speed detection failed, using default')
      setNetworkSpeed('medium')
    }
  }

  const selectOptimalQuality = (qualities: VideoQuality[]) => {
    if (qualities.length <= 1) return

    const optimal = QualitySelector.selectOptimalQuality(qualities, networkSpeed)
    if (optimal) {
      setCurrentQuality(optimal)
      setCurrentSrc(optimal.url)
      
      // Track quality selection
      VideoAnalytics.trackQualitySwitch(
        videoId, 
        currentQuality?.label || 'none', 
        optimal.label, 
        `auto_select_${networkSpeed}`
      )
    }
  }

  // Initialize available qualities with specific resolutions - moved to useMemo
  const predefinedQualities = useMemo(() => [
    { label: 'Auto', height: 0, url: videoUrl, bitrate: 'adaptive' },
    { label: '240p', height: 240, url: videoUrl, bitrate: '400k' },
    { label: '360p', height: 360, url: videoUrl, bitrate: '800k' },
    { label: '480p', height: 480, url: videoUrl, bitrate: '1.2M' },
    { label: '720p', height: 720, url: videoUrl, bitrate: '2.5M' },
    { label: '1080p', height: 1080, url: videoUrl, bitrate: '5M' }
  ], [videoUrl])

  useEffect(() => {
    setAvailableQualities(predefinedQualities)
    
    // Set initial quality - default to 480p
    const defaultQuality = predefinedQualities.find(q => q.label === '480p') || predefinedQualities[0]
    setCurrentQuality(defaultQuality)
    setCurrentSrc(defaultQuality.url)
    
    // Detect network speed
    detectNetworkSpeed()
    
    // Add event listeners for custom controls
    const video = videoRef.current
    if (video) {
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('timeupdate', handleTimeUpdate)
      video.addEventListener('volumechange', handleVolumeChange)
      video.addEventListener('play', () => setIsPlaying(true))
      video.addEventListener('pause', () => setIsPlaying(false))
    }
    
    // Fullscreen event listeners
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    
    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('timeupdate', handleTimeUpdate)
        video.removeEventListener('volumechange', handleVolumeChange)
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [videoUrl, fallbackUrl, videoId, predefinedQualities])

  const handleQualityChange = (quality: VideoQuality) => {
    if (!videoRef.current) return

    const currentTime = videoRef.current.currentTime
    const wasPlaying = !videoRef.current.paused
    const previousQuality = currentQuality?.label || 'none'

    if (quality.label === 'Auto') {
      setAutoQuality(true)
      selectOptimalQuality(availableQualities)
    } else {
      setAutoQuality(false)
      setCurrentQuality(quality)
      // For now, all qualities use the same URL (streaming endpoint)
      // In production, you'd have different URLs for different qualities
      setCurrentSrc(quality.url)
      
      // Track manual quality change
      VideoAnalytics.trackQualitySwitch(videoId, previousQuality, quality.label, 'manual_selection')
    }

    setShowQualityMenu(false)

    // Restore playback position
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime
        if (wasPlaying) {
          videoRef.current.play()
        }
      }
    }, 100)
  }

  // Custom control functions
  const togglePlay = async () => {
    if (!videoRef.current) return

    try {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        // Safari requires user interaction for play
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          await playPromise
        }
      }
    } catch (error) {
      console.error('Play/pause error:', error)
      if (isSafari) {
        // Safari sometimes needs a retry
        setTimeout(() => {
          if (videoRef.current && !isPlaying) {
            videoRef.current.play().catch(console.error)
          }
        }, 100)
      }
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    let clickX: number
    
    if ('touches' in e) {
      // Touch event
      clickX = e.touches[0].clientX - rect.left
    } else {
      // Mouse event
      clickX = e.clientX - rect.left
    }
    
    const newTime = (clickX / rect.width) * duration
    
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    let clickX: number
    
    if ('touches' in e) {
      // Touch event
      clickX = e.touches[0].clientX - rect.left
    } else {
      // Mouse event
      clickX = e.clientX - rect.left
    }
    
    const newVolume = clickX / rect.width
    
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const handleLoadStart = () => {
    setIsLoading(true)
    setError(null)
    setIsBuffering(true)
  }

  const handleCanPlay = () => {
    // Safari sometimes needs a delay
    if (isSafari) {
      setTimeout(() => {
        setIsLoading(false)
        setIsBuffering(false)
      }, 100)
    } else {
      setIsLoading(false)
      setIsBuffering(false)
    }
  }

  const handleCanPlayThrough = () => {
    // Safari-specific: Video is ready to play through
    setIsLoading(false)
    setIsBuffering(false)
  }

  const handleWaiting = () => {
    setIsBuffering(true)
    const bufferStart = Date.now()
    
    // Track buffering start
    const trackBuffering = () => {
      if (!isBuffering) {
        const duration = Date.now() - bufferStart
        VideoAnalytics.trackBuffering(videoId, duration, currentQuality?.label || 'unknown')
      }
    }
    
    // Set up tracking for when buffering ends
    setTimeout(trackBuffering, 100)
  }

  const handlePlaying = () => {
    setIsBuffering(false)
  }

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget
    const error = videoElement.error

    console.error('Video error:', {
      code: error?.code,
      message: error?.message,
      networkState: videoElement.networkState,
      readyState: videoElement.readyState,
      currentSrc: videoElement.currentSrc,
      userAgent: navigator.userAgent,
      isSafari
    })

    // Safari-specific error handling
    if (isSafari && error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
      console.log('Safari codec issue detected, attempting reload...')
      // Try reloading the video source for Safari
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load()
        }
      }, 1000)
      return
    }

    // Safari sometimes has network issues, retry once
    if (isSafari && error?.code === MediaError.MEDIA_ERR_NETWORK) {
      console.log('Safari network error, retrying...')
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load()
        }
      }, 2000)
      return
    }

    if (fallbackUrl && currentSrc !== fallbackUrl) {
      console.log('Trying fallback URL:', fallbackUrl)
      setCurrentSrc(fallbackUrl)
      setError(null)
    } else {
      let errorMessage = 'Video failed to load'
      
      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Video loading was aborted'
            break
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = isSafari 
              ? 'Network error on Safari. Please check your connection and try again.'
              : 'Network error occurred while loading video'
            break
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = isSafari 
              ? 'Video format not supported on Safari. Please try on Chrome or Firefox.'
              : 'Video format not supported by your browser'
            break
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = isSafari
              ? 'Video format not supported on Safari. Please try on Chrome or Firefox.'
              : 'Video format or codec not supported'
            break
          default:
            errorMessage = error.message || 'Unknown video error'
        }
      }
      
      setError(errorMessage)
      setIsLoading(false)
      setIsBuffering(false)
    }
  }

  const handlePlay = () => {
    setIsLoading(false)
    setIsBuffering(false)
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        preload="metadata"
        playsInline
        webkit-playsinline="true"
        muted={false}
        controls={false}
        onLoadStart={handleLoadStart}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onCanPlayThrough={handleCanPlayThrough}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onError={handleError}
        onPlay={handlePlay}
        onLoadedData={() => {
          // Safari-specific: Ensure video is ready
          if (isSafari) {
            setTimeout(() => {
              setIsLoading(false)
              setIsBuffering(false)
            }, 200)
          } else {
            setIsLoading(false)
            setIsBuffering(false)
          }
        }}
        crossOrigin="anonymous"
        style={{
          backgroundColor: '#000',
          objectFit: 'contain',
          display: 'block'
        }}
        key={currentSrc}
        onClick={togglePlay}
        onTouchStart={(e) => {
          // Prevent default touch behavior on iOS
          e.preventDefault()
          togglePlay()
        }}
      >
        <source src={currentSrc} type={mimeType} />
        {/* Safari fallback sources */}
        {isSafari && fallbackUrl && (
          <source src={fallbackUrl} type="video/mp4" />
        )}
        Your browser does not support the video tag.
      </video>

      {/* Custom Video Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div 
            className="w-full h-1 bg-white/30 rounded-full cursor-pointer hover:h-2 transition-all"
            onClick={handleSeek}
            onTouchStart={(e) => {
              e.preventDefault()
              handleSeek(e)
            }}
          >
            <div 
              className="h-full bg-red-600 rounded-full relative"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-500 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Time Display */}
            <div className="text-white text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Volume Control */}
            <div className="flex items-center space-x-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300">
                <div 
                  className="w-20 h-1 bg-white/30 rounded-full cursor-pointer"
                  onClick={handleVolumeClick}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    handleVolumeClick(e)
                  }}
                >
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${volume * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quality Selector */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="flex items-center space-x-1 text-white hover:text-red-500 transition-colors px-2 py-1 rounded"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">{currentQuality?.label || 'Quality'}</span>
              </button>

              {/* Quality Menu */}
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/20 rounded-lg py-2 min-w-[120px] z-50">
                  <div className="px-3 py-1 text-xs text-gray-400 border-b border-white/10 mb-1">
                    Quality
                  </div>
                  {availableQualities.map((quality) => (
                    <button
                      key={quality.label}
                      onClick={() => handleQualityChange(quality)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${
                        currentQuality?.label === quality.label ? 'text-red-500 bg-white/5' : 'text-white'
                      }`}
                    >
                      <span>{quality.label}</span>
                      {quality.bitrate && quality.label !== 'Auto' && (
                        <span className="text-xs text-gray-400">{quality.bitrate}</span>
                      )}
                      {quality.label === 'Auto' && autoQuality && (
                        <span className="text-xs text-gray-400">({currentQuality?.label})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-red-500 transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="flex items-center space-x-2 text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-lg">Buffering...</span>
          </div>
        </div>
      )}

      {/* Network Speed Indicator */}
      <div className={`absolute top-4 left-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
          Network: {networkSpeed.charAt(0).toUpperCase() + networkSpeed.slice(1)}
          {autoQuality && <span className="ml-1">(Auto)</span>}
        </div>
      </div>

      {/* Video codec warning - improved detection */}
      {!isLoading && !error && !hasVideoTrack && videoDuration > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90">
          <div className="text-center text-white p-6 max-w-md">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold mb-2">Audio Only</h3>
            <p className="text-gray-300 mb-4">
              This video contains audio but the video track cannot be displayed in your browser.
            </p>
            <div className="text-sm text-gray-400 mb-4">
              <strong>Technical Details:</strong><br/>
              The video uses an unsupported codec (likely H.265/HEVC or other format).<br/>
              Duration: {Math.round(videoDuration)} seconds<br/>
              MIME Type: {mimeType}
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
              <Image 
                src={thumbnail} 
                alt={title}
                width={400}
                height={300}
                className="max-w-full max-h-64 object-contain mx-auto mb-4 opacity-50"
              />
            )}
            <p className="text-white text-lg mb-2">Video failed to load</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null)
                setCurrentSrc(videoUrl)
                if (videoRef.current) {
                  videoRef.current.load()
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}