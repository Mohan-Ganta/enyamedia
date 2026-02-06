import { MovieCard } from '@/components/movies/MovieCard'
import { restoredClassics, goldenAge, socialClassics } from '@/lib/data'

export default function BrowsePage() {
    const allMovies = [...restoredClassics, ...goldenAge, ...socialClassics]

    return (
        <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
            <h1 className="text-3xl font-bold text-white mb-8">Browse Movies</h1>

            {/* Filter Tabs (Visual only) */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {['All', 'Restored Classics', 'Action', 'Romance', 'Comedy', 'Horror'].map((genre, i) => (
                    <button
                        key={genre}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${i === 0 ? 'bg-primary text-black font-semibold' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                    >
                        {genre}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {allMovies.map(movie => (
                    <div key={movie.id} className="flex justify-center">
                        <MovieCard {...movie} />
                    </div>
                ))}
            </div>
        </div>
    )
}
