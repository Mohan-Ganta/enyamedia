'use client'

import { Play, Plus, ChevronDown, ThumbsUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

import Link from 'next/link'

interface MovieCardProps {
    id: string
    title: string
    imageUrl: string
    year: string
    genre: string
    duration: string
}

export function MovieCard({ id, title, imageUrl, year, genre, duration }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <Link href={`/watch/${id}`} className="w-full">
            <motion.div
                className="relative w-full aspect-[2/3] rounded-md bg-zinc-900 flex-shrink-0 cursor-pointer transition-all duration-300 ease-in-out group"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                whileHover={{ scale: 1.1, zIndex: 10 }}
            >
                {/* Poster Image */}
                <div className="w-full h-full rounded-md overflow-hidden relative">
                    {/* Use a real image tag in production, placeholder div for now if url is generic */}
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                    {/* Dark Overlay on non-hover */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Hover Content */}
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -inset-4 bg-zinc-900 rounded-md shadow-xl z-20 flex flex-col p-3 overflow-hidden"
                        style={{ width: '150%', height: 'auto', minHeight: '120%', top: '-10%', left: '-25%' }}
                    >
                        {/* Thumbnail in expanded view */}
                        <div
                            className="w-full h-32 bg-cover bg-center rounded-t-md mb-2"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                        />

                        {/* Actions */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90">
                                    <Play className="w-4 h-4 text-black fill-black" />
                                </button>
                                <button className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center hover:border-white text-white">
                                    <Plus className="w-4 h-4" />
                                </button>
                                <button className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center hover:border-white text-white">
                                    <ThumbsUp className="w-4 h-4" />
                                </button>
                            </div>
                            <button className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center hover:border-white text-white ml-auto">
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Meta Info */}
                        <div className="space-y-1">
                            <h4 className="text-white font-semibold text-sm">{title}</h4>
                            <div className="flex items-center text-xs text-green-500 font-semibold gap-2">
                                <span>98% Match</span>
                                <span className="text-zinc-400 border border-zinc-600 px-1 rounded text-[10px]">HD</span>
                            </div>
                            <div className="flex items-center text-[10px] text-zinc-400 gap-2">
                                <span>{genre}</span>
                                <span>•</span>
                                <span>{year}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </Link>
    )
}
