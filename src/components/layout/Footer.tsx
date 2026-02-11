import Link from 'next/link'

export function Footer() {
    return (
        <footer className="w-full bg-background border-t border-white/10 py-12 mt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <img 
                                src="/enya_logo.png" 
                                alt="EnyaMedia Logo" 
                                className="w-6 h-6"
                            />
                            <h3 className="text-lg font-semibold text-primary">ENYAMEDIA</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Bringing classic cinema back to life with modern restoration technology.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">Browse All</Link></li>
                            <li><Link href="#" className="hover:text-primary">Restored Classics</Link></li>
                            <li><Link href="#" className="hover:text-primary">New Releases</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Social</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">Twitter</Link></li>
                            <li><Link href="#" className="hover:text-primary">Instagram</Link></li>
                            <li><Link href="#" className="hover:text-primary">YouTube</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} EnyaMedia. All rights reserved.</p>
                    <p>Designed for Excellence.</p>
                </div>
            </div>
        </footer>
    )
}
