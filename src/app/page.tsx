import { Hero } from "@/components/hero/Hero";
import { MovieRow } from "@/components/movies/MovieRow";
import { restoredClassics, goldenAge, socialClassics } from "@/lib/data";

export default function Home() {
  return (
    <div className="min-h-screen pb-20 bg-background text-foreground overflow-x-hidden">
      <Hero />
      <div className="container mx-auto px-4 mt-4 md:-mt-32 relative z-20 space-y-2 pb-20">
        <MovieRow title="Newly Restored Telugu Classics" movies={restoredClassics} />
        <MovieRow title="Mythological Masterpieces (Pouranikam)" movies={goldenAge} />
        <MovieRow title="Golden Era Social Dramas" movies={socialClassics} />
      </div>
    </div>
  );
}
