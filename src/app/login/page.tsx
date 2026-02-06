'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop")' }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="z-10 bg-black/80 p-8 md:p-16 rounded-lg w-full max-w-md shadow-2xl border border-white/10">
                <h1 className="text-3xl font-bold text-white mb-8">Sign In</h1>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <input
                            type="email"
                            placeholder="Email or phone number"
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
                        Sign In
                    </Button>

                    <div className="flex justify-between items-center text-sm text-zinc-400">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded bg-zinc-700 border-zinc-600 text-primary focus:ring-0" />
                            Remember me
                        </label>
                        <Link href="#" className="hover:underline">Need help?</Link>
                    </div>
                </form>

                <div className="mt-16 text-zinc-400">
                    New to EnyaMedia? <Link href="/signup" className="text-white hover:underline">Sign up now.</Link>
                </div>
            </div>
        </div>
    )
}
