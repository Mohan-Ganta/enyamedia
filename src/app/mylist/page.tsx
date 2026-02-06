import { MovieCard } from '@/components/movies/MovieCard'
import { restoredClassics } from '@/lib/data'

export default function MyListPage() {
    // Mock user list - just taking a subset
    const myList = restoredClassics.slice(0, 3)

    return (
        <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
            <h1 className="text-3xl font-bold text-white mb-8">My List</h1>

            {myList.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {myList.map(movie => (
                        <div key={movie.id} className="flex justify-center">
                            <MovieCard {...movie} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
                    <p className="text-xl">Your list is empty.</p>
                </div>
            )}
        </div>
    )
}
