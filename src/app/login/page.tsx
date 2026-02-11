'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('auth-token', data.token)
                
                // Check if user is admin and redirect accordingly
                if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
                    window.location.href = '/admin'
                } else {
                    window.location.href = '/'
                }
            } else {
                setError(data.error || 'Login failed')
            }
        } catch (error) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <MainLayout>
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 relative">
                <div className="absolute inset-0 bg-black/20" />

                <div className="z-10 bg-black/90 p-8 md:p-16 rounded-lg w-full max-w-md shadow-2xl border border-gray-700/50 backdrop-blur-sm">
                <h1 className="text-3xl font-bold text-white mb-8">Sign In</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <input
                            type="email"
                            placeholder="Email or phone number"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-zinc-700/50 border border-transparent focus:border-primary rounded px-4 py-4 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2 relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
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
                                Signing In...
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </Button>

                    <div className="flex justify-between items-center text-sm text-zinc-400">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded bg-zinc-700 border-zinc-600 text-primary focus:ring-0" />
                            Remember me
                        </label>
                        <Link href="#" className="hover:underline">Need help?</Link>
                    </div>
                </form>

                {/* <div className="mt-8 text-center">
                    <div className="text-zinc-400 text-sm">
                        Admin? <Link href="/admin/login" className="text-primary hover:underline">Admin Login</Link>
                    </div>
                </div> */}

                <div className="mt-8 text-zinc-400">
                    New to EnyaMedia? <Link href="/signup" className="text-white hover:underline">Sign up now.</Link>
                </div>

                {/* Test Credentials */}
                {/* <div className="mt-8 p-3 bg-blue-900/20 rounded border border-blue-500/30">
                    <p className="text-xs text-blue-300 mb-2 font-medium">Admin Login Credentials:</p>
                    <p className="text-xs text-blue-200">Email: admin@enyamedia.com</p>
                    <p className="text-xs text-blue-200">Password: admin123</p>
                </div> */}
            </div>
        </div>
        </MainLayout>
    )
}
