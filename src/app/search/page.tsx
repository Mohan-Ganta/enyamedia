'use client'

import { useState } from 'react'
import { MovieCard } from '@/components/movies/MovieCard'
import { restoredClassics, goldenAge, socialClassics } from '@/lib/data'
import { Search } from 'lucide-react'

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const allMovies = [...restoredClassics, ...goldenAge, ...socialClassics]

    const filteredMovies = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.genre.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
            {/* Search Input */}
            <div className="max-w-2xl mx-auto mb-12 relative">
                <input
                    type="text"
                    placeholder="Search titles, genres..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-6 py-4 rounded-full pl-14 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-lg"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-6 h-6" />
            </div>

            {/* Results */}
            <h2 className="text-2xl font-semibold text-white mb-6">
                {query ? `Results for "${query}"` : 'Browse All'}
            </h2>

            {filteredMovies.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredMovies.map(movie => (
                        <div key={movie.id} className="flex justify-center">
                            <MovieCard {...movie} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-zinc-500 mt-12">
                    <p className="text-xl">No movies found matching your search.</p>
                </div>
            )}
        </div>
    )
}
