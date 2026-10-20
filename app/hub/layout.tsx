"use client"

import { Home, LayoutDashboard, Calendar, BarChart3, Info, Menu, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function HubLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.8),_rgba(239,246,255,0.95)_30%,_rgba(255,255,255,1)_100%)] text-blue-900 font-sans selection:bg-blue-500/30 relative">

            {/* Public Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <Link href="/hub" className="flex items-center gap-3 group">
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600 shadow-lg transition-transform">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tighter leading-none text-blue-900">Fish<span className="text-blue-600">tory</span></span>
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-blue-700/70">Public Transparency Portal</span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1">
                        <NavLink href="/hub" icon={Home}>Home</NavLink>
                        <NavLink href="/hub/programs" icon={Info}>Programs</NavLink>
                        <NavLink href="/hub/announcements" icon={Calendar}>Announcements</NavLink>
                    </nav>

                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" className="text-blue-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-20 z-40 bg-white/90 border-b border-blue-100 p-4 pb-8 space-y-1 backdrop-blur-xl">
                    <MobileNavLink href="/hub" icon={Home} onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
                    <MobileNavLink href="/hub/programs" icon={Info} onClick={() => setIsMenuOpen(false)}>Programs</MobileNavLink>
                    <MobileNavLink href="/hub/announcements" icon={Calendar} onClick={() => setIsMenuOpen(false)}>Announcements</MobileNavLink>
                </div>
            )}

            <main className="relative z-10 w-full">
                {children}
            </main>

            <footer className="relative z-10 border-t border-blue-100 bg-white/80 py-12 backdrop-blur-xl">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-blue-700 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                        Municipal Agriculture Office – Fisheries Sector
                    </p>
                    <p className="text-blue-700/75 text-[10px] font-medium max-w-2xl mx-auto leading-relaxed border-t border-blue-100 pt-6">
                        OFFICIAL GOVERNMENT PORTAL. This website provides public access to general fishery sector data for transparency purposes. 
                        No sensitive personal data is disclosed here in accordance with data privacy regulations.
                    </p>
                    <div className="mt-8 text-blue-700/80 text-[10px] font-bold">
                        &copy; {new Date().getFullYear()} Republic of the Philippines. Unauthorized use of logos or government branding is prohibited.
                    </div>
                </div>
            </footer>
        </div>
    )
}

function NavLink({ href, icon: Icon, children }: { href: string, icon: any, children: React.ReactNode }) {
    return (
        <Link href={href}>
            <Button variant="ghost" className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-xl px-4 font-bold flex items-center gap-2 group transition-all">
                <Icon className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                {children}
            </Button>
        </Link>
    )
}

function MobileNavLink({ href, icon: Icon, children, onClick }: { href: string, icon: any, children: React.ReactNode, onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick}>
            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 text-blue-700 hover:text-blue-900 transition-all font-bold">
                <Icon className="h-5 w-5 opacity-70" />
                {children}
            </div>
        </Link>
    )
}
