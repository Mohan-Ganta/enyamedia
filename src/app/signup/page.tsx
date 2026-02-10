'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                localStorage.setItem('auth-token', data.token)
                
                // Redirect to home page after successful registration
                setTimeout(() => {
                    window.location.href = '/'
                }, 2000)
            } else {
                setError(data.error || 'Registration failed')
            }
        } catch (error) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <MainLayout>
                <div
                    className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop")' }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="z-10 bg-black/80 p-8 md:p-16 rounded-lg w-full max-w-md shadow-2xl border border-white/10 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">Account Created!</h1>
                    <p className="text-zinc-300 mb-6">Welcome to EnyaMedia! You're being redirected...</p>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
            </div>
        </MainLayout>
    )
    }

    return (
        <MainLayout>
            <div
                className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop")' }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="z-10 bg-black/80 p-8 md:p-16 rounded-lg w-full max-w-md shadow-2xl border border-white/10">
                <h1 className="text-3xl font-bold text-white mb-8">Sign Up</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-zinc-700/50 border border-transparent focus:border-primary rounded px-4 py-4 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-zinc-700/50 border border-transparent focus:border-primary rounded px-4 py-4 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2 relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full bg-zinc-700/50 border border-transparent focus:border-primary rounded px-4 py-4 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    <Button 
                        type="submit"
                        disabled={loading}
                        size="lg" 
                        className="w-full py-6 text-lg font-semibold mt-8 bg-primary text-black hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                Creating Account...
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-zinc-400">
                    Already have an account? <Link href="/login" className="text-white hover:underline">Sign in.</Link>
                </div>
            </div>
        </div>
        </MainLayout>
    )
}
