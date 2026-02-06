'use client'

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, Plus, Share2, ThumbsUp } from 'lucide-react'
import { RestorationSlider } from '@/components/movies/RestorationSlider'
import { MovieRow } from '@/components/movies/MovieRow'
import { goldenAge } from '@/lib/data'

export default function WatchPage() {
    const params = useParams()
    const id = params.id as string

    // In a real app, fetch movie data by ID. Mocking for now.
    const movie = {
        title: "Casablanca",
        year: "1942",
        description: "Rick Blaine, who owns a nightclub in Casablanca, discovers his old flame Ilsa is in town with her husband, Victor Laszlo. Laszlo is a famed rebel, and with Germans on his tail, Ilsa knows Rick can help them get out of the country.",
        bwImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop', // B&W vibes
        colorImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop', // Color vibes
    }

    return (
        <div className="min-h-screen pt-20 pb-20 container mx-auto px-4 z-10 relative">
            {/* Player Area */}
            <div className="w-full aspect-video bg-black rounded-lg mb-8 relative overflow-hidden group shadow-2xl border border-white/10">
                {/* This would be the video player */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-40"
                        style={{ backgroundImage: `url(${movie.colorImage})` }}
                    />
                    <Button size="icon" className="w-20 h-20 rounded-full bg-primary text-black hover:bg-primary/90 z-20 scale-100 group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 ml-1" />
                    </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                <div className="lg:col-span-2 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{movie.title}</h1>
                    <div className="flex items-center gap-4 text-zinc-400">
                        <span>{movie.year}</span>
                        <span>|</span>
                        <span className="border border-zinc-600 px-1 rounded text-xs">4K RESTORED</span>
                        <span>|</span>
                        <span>1h 42m</span>
                    </div>

                    <div className="flex gap-4">
                        <Button className="bg-white text-black hover:bg-white/90 gap-2">
                            <Play className="w-4 h-4 fill-black" /> Resume
                        </Button>
                        <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 gap-2">
                            <Plus className="w-4 h-4" /> My List
                        </Button>
                        <Button variant="outline" size="icon" className="text-white border-white/20 hover:bg-white/10">
                            <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-white border-white/20 hover:bg-white/10">
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>

                    <p className="text-lg text-zinc-300 leading-relaxed">
                        {movie.description}
                    </p>
                </div>

                {/* Restoration Showcase */}
                <div className="lg:col-span-1 bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                    <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                        <span>✨</span> Restoration Showcase
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4">
                        Drag the slider to see how we brought this classic to life with
                        our proprietary colorization engine.
                    </p>
                    <RestorationSlider
                        bwImage={movie.bwImage}
                        colorImage={movie.colorImage}
                        alt="Restoration comparison"
                    />
                </div>
            </div>

            {/* More Like This */}
            <MovieRow title="More Like This" movies={goldenAge} />
        </div>
    )
}
