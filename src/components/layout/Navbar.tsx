'use client'

import Link from 'next/link'
import { Search, Bell, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "fixed top-0 w-full z-50 transition-colors duration-300",
                isScrolled ? "bg-background/90 backdrop-blur-md border-b border-white/5" : "bg-black/80 md:bg-gradient-to-b md:from-black/80 md:to-transparent"
            )}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="text-2xl font-bold text-primary tracking-tighter">
                        ENYAMEDIA
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                            Home
                        </Link>
                        <Link href="/browse" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                            Movies
                        </Link>
                        <Link href="/browse?category=restored" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                            Restored Classics
                        </Link>
                        <Link href="/mylist" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                            My List
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center space-x-6">
                    <Link href="/search" className="text-white/70 hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                    </Link>
                    <button className="text-white/70 hover:text-white transition-colors hidden md:block">
                        <Bell className="w-5 h-5" />
                    </button>
                    <Link href="/login" className="text-white/70 hover:text-white transition-colors">
                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-black/95 absolute top-16 left-0 w-full border-b border-white/10 p-4 flex flex-col space-y-4">
                    <Link
                        href="/"
                        className="text-white/90 font-medium py-2 hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/browse"
                        className="text-white/90 font-medium py-2 hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Movies
                    </Link>
                    <Link
                        href="/browse?category=restored"
                        className="text-white/90 font-medium py-2 hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Restored Classics
                    </Link>
                    <Link
                        href="/mylist"
                        className="text-white/90 font-medium py-2 hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        My List
                    </Link>
                </div>
            )}
        </header>
    )
}
