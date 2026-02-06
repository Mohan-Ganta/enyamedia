'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MovieCard } from './MovieCard'

interface Movie {
    id: string
    title: string
    imageUrl: string
    year: string
    genre: string
    duration: string
}

interface MovieRowProps {
    title: string
    movies: Movie[]
}

export function MovieRow({ title, movies }: MovieRowProps) {
    const rowRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const { current } = rowRef
            const scrollAmount = direction === 'left'
                ? current.scrollLeft - current.clientWidth / 2
                : current.scrollLeft + current.clientWidth / 2

            current.scrollTo({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    return (
        <div className="space-y-4 my-8 group">
            <h2 className="text-xl md:text-2xl font-semibold text-white px-4 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-2">
                {title}
                <span className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">Explore All &gt;</span>
            </h2>

            <div className="relative group">
                {/* Left Scroll Button */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                {/* Movie List */}
                <div
                    ref={rowRef}
                    className="flex items-center gap-4 overflow-x-scroll scrollbar-hide px-4 md:px-12 py-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {movies.map((movie) => (
                        <div key={movie.id} className="w-36 md:w-48 flex-shrink-0">
                            <MovieCard {...movie} />
                        </div>
                    ))}
                </div>

                {/* Right Scroll Button */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <ChevronRight className="w-8 h-8 text-white" />
                </button>
            </div>
        </div>
    )
}
