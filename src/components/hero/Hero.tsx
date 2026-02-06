'use client'

import { Play, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export function Hero() {
    return (
        <div className="relative h-[80vh] w-full flex items-center justify-start">
            {/* Background Image Placeholder - In real app, this would be an image or video */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: 'url("/movies/hero_mayabazar.jpg")' }} // Mayabazar Colorized Wide
            >
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            <div className="container mx-auto px-4 z-10 relative pt-32 pb-10 md:pt-20 md:pb-0 h-full flex items-center md:block">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl px-4 md:px-0 mt-auto md:mt-0"
                >
                    <span className="text-primary font-semibold tracking-wider uppercase text-xs md:text-sm mb-2 md:mb-4 block">
                        Newly Restored Masterpiece
                    </span>
                    <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
                        Mayabazar <br />
                        <span className="text-white/50 font-normal italic text-2xl md:text-5xl block md:inline mt-2 md:mt-0">Colorized Edition</span>
                    </h1>
                    <p className="text-base md:text-lg text-white/80 mb-6 md:mb-8 leading-relaxed max-w-lg">
                        Witness the epic tale of Sasirekha Parinayam in stunning color.
                        Experience SV Ranga Rao's legendary performance and the magic of
                        Ghatotkacha brought to life with modern restoration technology.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 gap-2 bg-primary text-black hover:bg-primary/90 w-full sm:w-auto">
                            <Play className="fill-black w-5 h-5" /> Play Now
                        </Button>
                        <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 gap-2 bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20 w-full sm:w-auto">
                            <Info className="w-5 h-5" /> More Info
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
