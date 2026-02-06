'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronsLeftRight } from 'lucide-react'

interface RestorationSliderProps {
    bwImage: string
    colorImage: string
    alt: string
}

export function RestorationSlider({ bwImage, colorImage, alt }: RestorationSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMove = useCallback((clientX: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
            const percentage = (x / rect.width) * 100
            setSliderPosition(percentage)
        }
    }, [])

    const handleMouseDown = () => setIsDragging(true)
    const handleMouseUp = () => setIsDragging(false)

    const handleTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX)
    }

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false)
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging) handleMove(e.clientX)
        }

        window.addEventListener('mouseup', handleGlobalMouseUp)
        window.addEventListener('mousemove', handleGlobalMouseMove)
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp)
            window.removeEventListener('mousemove', handleGlobalMouseMove)
        }
    }, [isDragging, handleMove])

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video rounded-lg overflow-hidden cursor-ew-resize select-none shadow-2xl group"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
        >
            {/* Color Image (Background - Full) */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${colorImage})` }}
            >
                <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none">
                    COLORIZED
                </div>
            </div>

            {/* B&W Image (Foreground - Clipped) */}
            <div
                className="absolute inset-0 bg-cover bg-center border-r-[3px] border-white"
                style={{
                    backgroundImage: `url(${bwImage})`,
                    clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                }}
            >
                <div className="absolute top-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none">
                    ORIGINAL
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-transparent cursor-ew-resize" // visualizer handled by border above, this is for hit area if needed
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-black">
                    <ChevronsLeftRight className="w-5 h-5" />
                </div>
            </div>

            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">Drag to Compare</span>
            </div>
        </div>
    )
}
