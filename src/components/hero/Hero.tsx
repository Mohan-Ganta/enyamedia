'use client'

import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Video {
  id: string
  title: string
  description?: string
  imageUrl: string
  year: string
  genre: string
  views: number
  likes: number
  isFeatured?: boolean
}

interface HeroProps {
  videos?: Video[]
}

export function Hero({ videos = [] }: HeroProps) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    // Use featured videos if available, otherwise show default content
    const hasVideos = videos.length > 0
    const currentVideo = hasVideos ? videos[currentSlide] : null

    // Auto-advance slides every 5 seconds
    useEffect(() => {
        if (!hasVideos || videos.length <= 1 || !isAutoPlaying) return

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % videos.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [hasVideos, videos.length, isAutoPlaying])

    const nextSlide = () => {
        if (hasVideos && videos.length > 1) {
            setCurrentSlide((prev) => (prev + 1) % videos.length)
        }
    }

    const prevSlide = () => {
        if (hasVideos && videos.length > 1) {
            setCurrentSlide((prev) => (prev - 1 + videos.length) % videos.length)
        }
    }

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    // Fallback to default content if no video is provided
    const heroContent = currentVideo ? {
        title: currentVideo.title,
        subtitle: `${currentVideo.genre} • ${currentVideo.year}`,
        description: currentVideo.description || `Experience this classic film in stunning restored quality. With ${currentVideo.views.toLocaleString()} views and ${currentVideo.likes.toLocaleString()} likes, this is one of our most popular restorations.`,
        backgroundImage: currentVideo.imageUrl,
        playLink: `/watch/${currentVideo.id}`,
        badge: currentVideo.isFeatured ? "Featured Selection" : (currentVideo.views > 10000 ? "Popular Choice" : "Newly Restored Masterpiece")
    } : {
        title: "Mayabazar",
        subtitle: "Colorized Edition",
        description: "Witness the epic tale of Sasirekha Parinayam in stunning color. Experience SV Ranga Rao's legendary performance and the magic of Ghatotkacha brought to life with modern restoration technology.",
        backgroundImage: "/movies/hero_mayabazar.jpg",
        playLink: "/browse",
        badge: "Newly Restored Masterpiece"
    }

    return (
        <div 
            className="relative h-[80vh] w-full flex items-center justify-start overflow-hidden"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Background Images with Animation */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url("${heroContent.backgroundImage}")` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {hasVideos && videos.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            <div className="container mx-auto px-4 z-10 relative pt-32 pb-10 md:pt-20 md:pb-0 h-full flex items-center md:block">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="max-w-2xl px-4 md:px-0 mt-auto md:mt-0"
                    >
                        <span className="text-primary font-semibold tracking-wider uppercase text-xs md:text-sm mb-2 md:mb-4 block">
                            {heroContent.badge}
                        </span>
                        <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
                            {heroContent.title.split(' ').slice(0, 2).join(' ')} <br />
                            <span className="text-white/50 font-normal italic text-2xl md:text-5xl block md:inline mt-2 md:mt-0">
                                {heroContent.subtitle}
                            </span>
                        </h1>
                        <p className="text-base md:text-lg text-white/80 mb-6 md:mb-8 leading-relaxed max-w-lg">
                            {heroContent.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            <Link href={heroContent.playLink}>
                                <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 gap-2 bg-primary text-black hover:bg-primary/90 w-full sm:w-auto">
                                    <Play className="fill-black w-5 h-5" /> Play Now
                                </Button>
                            </Link>
                            {currentVideo && (
                                <Link href={`/watch/${currentVideo.id}`}>
                                    <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 gap-2 bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20 w-full sm:w-auto">
                                        <Info className="w-5 h-5" /> More Info
                                    </Button>
                                </Link>
                            )}
                            {!currentVideo && (
                                <Link href="/browse">
                                    <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 gap-2 bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20 w-full sm:w-auto">
                                        <Info className="w-5 h-5" /> Browse All
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Video Stats */}
                        {currentVideo && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="flex items-center gap-6 mt-6 text-sm text-white/60"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>{currentVideo.views.toLocaleString()} views</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span>{currentVideo.likes.toLocaleString()} likes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>HD Quality</span>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Slide Indicators */}
            {hasVideos && videos.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                    {videos.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentSlide 
                                    ? 'bg-primary w-8' 
                                    : 'bg-white/30 hover:bg-white/50'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Progress Bar */}
            {hasVideos && videos.length > 1 && isAutoPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        key={currentSlide}
                    />
                </div>
            )}
        </div>
    )
}
