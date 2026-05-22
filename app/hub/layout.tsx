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
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 relative">

            {/* Public Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <Link href="/hub" className="flex items-center gap-3 group">
                        <div className="bg-slate-800 p-2 rounded-xl text-blue-500 shadow-lg transition-transform">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tighter leading-none text-white">Fish<span className="text-blue-500">tory</span></span>
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500">Public Transparency Portal</span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1">
                        <NavLink href="/hub" icon={Home}>Home</NavLink>
                        <NavLink href="/hub/programs" icon={Info}>Programs</NavLink>
                        <NavLink href="/hub/announcements" icon={Calendar}>Announcements</NavLink>
                    </nav>

                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" className="text-slate-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-20 z-40 bg-slate-950 border-b border-slate-900 p-4 pb-8 space-y-1">
                    <MobileNavLink href="/hub" icon={Home} onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
                    <MobileNavLink href="/hub/programs" icon={Info} onClick={() => setIsMenuOpen(false)}>Programs</MobileNavLink>
                    <MobileNavLink href="/hub/announcements" icon={Calendar} onClick={() => setIsMenuOpen(false)}>Announcements</MobileNavLink>
                </div>
            )}

            <main className="relative z-10 w-full">
                {children}
            </main>

            <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                        Municipal Agriculture Office – Fisheries Sector
                    </p>
                    <p className="text-slate-600 text-[10px] font-medium max-w-2xl mx-auto leading-relaxed border-t border-slate-900 pt-6">
                        OFFICIAL GOVERNMENT PORTAL. This website provides public access to general fishery sector data for transparency purposes. 
                        No sensitive personal data is disclosed here in accordance with data privacy regulations.
                    </p>
                    <div className="mt-8 text-slate-700 text-[10px] font-bold">
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
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl px-4 font-bold flex items-center gap-2 group transition-all">
                <Icon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                {children}
            </Button>
        </Link>
    )
}

function MobileNavLink({ href, icon: Icon, children, onClick }: { href: string, icon: any, children: React.ReactNode, onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick}>
            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-800/50 text-slate-300 hover:text-white transition-all font-bold">
                <Icon className="h-5 w-5 opacity-70" />
                {children}
            </div>
        </Link>
    )
}
