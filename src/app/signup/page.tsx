'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop")' }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="z-10 bg-black/80 p-8 md:p-16 rounded-lg w-full max-w-md shadow-2xl border border-white/10">
                <h1 className="text-3xl font-bold text-white mb-8">Sign Up</h1>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-zinc-700/50 border border-transparent focus:border-primary rounded px-4 py-4 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full bg-zinc-700/50 border border-transparent focus:border-primary rounded px-4 py-4 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-zinc-700/50 border border-transparent focus:border-primary rounded px-4 py-4 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <Button size="lg" className="w-full py-6 text-lg font-semibold mt-8 bg-primary text-black hover:bg-primary/90">
                        Create Account
                    </Button>
                </form>

                <div className="mt-8 text-zinc-400">
                    Already have an account? <Link href="/login" className="text-white hover:underline">Sign in.</Link>
                </div>
            </div>
        </div>
    )
}
