'use client'

import Link from 'next/link'
import { Search, User, Menu, X, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface UserData {
    id: string
    email: string
    name: string
    role: string
}

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

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

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('auth-token')
            if (!token) {
                setLoading(false)
                return
            }

            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            localStorage.removeItem('auth-token')
            setUser(null)
            window.location.href = '/'
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <header
            className={cn(
                "fixed top-0 w-full z-50 transition-colors duration-300",
                isScrolled ? "bg-background/90 backdrop-blur-md border-b border-white/5" : "bg-black/80 md:bg-gradient-to-b md:from-black/80 md:to-transparent"
            )}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <img 
                            src="/enya_logo.png" 
                            alt="EnyaMedia Logo" 
                            className="w-8 h-8"
                        />
                        <span className="text-2xl font-bold text-primary tracking-tighter">
                            ENYAMEDIA
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                            Home
                        </Link>
                        <Link href="/browse" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                            Videos
                        </Link>
                        <Link href="/browse?category=restored" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                            Restored Classics
                        </Link>
                        {user && (
                            <Link href="/mylist" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                                My List
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center space-x-6">
                    <Link href="/search" className="text-white/70 hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                    </Link>
                    
                    {!loading && (
                        <>
                            {user ? (
                                <>
                                    <div className="relative group">
                                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 cursor-pointer">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 border border-white/10 rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                            <div className="px-4 py-2 border-b border-white/10">
                                                <p className="text-white text-sm font-medium">{user.name}</p>
                                                <p className="text-gray-400 text-xs">{user.email}</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2 text-left text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-white/70 hover:text-white transition-colors">
                                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                    </Link>
                                </>
                            )}
                        </>
                    )}

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
                        Videos
                    </Link>
                    <Link
                        href="/browse?category=restored"
                        className="text-white/90 font-medium py-2 hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Restored Classics
                    </Link>
                    {user && (
                        <Link
                            href="/mylist"
                            className="text-white/90 font-medium py-2 hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            My List
                        </Link>
                    )}
                    
                    {!loading && (
                        <>
                            {user ? (
                                <>
                                    <div className="border-t border-white/10 pt-4 mt-4">
                                        <p className="text-white text-sm font-medium mb-1">{user.name}</p>
                                        <p className="text-gray-400 text-xs mb-3">{user.email}</p>
                                        <button
                                            onClick={() => {
                                                handleLogout()
                                                setMobileMenuOpen(false)
                                            }}
                                            className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-white/90 font-medium py-2 hover:text-primary transition-colors border-t border-white/10 pt-4 mt-4"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </header>
    )
}
