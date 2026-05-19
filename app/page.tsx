import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Anchor, Waves, Building2, ArrowRight } from "lucide-react"

export default function Home() {
    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
            
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-accent/5 pointer-events-none" />
            
            {/* Centered content wrapper */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-0">
                
                {/* Hero Section - Centered and Fixed Width */}
                <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-8 sm:space-y-12">
                    
                    {/* Logo and Branding */}
                    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                        <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4">
                            <Anchor className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight">
                                Fishtory
                            </h1>
                            <p className="text-base sm:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
                                The unified registry and reporting platform for fisheries and agricultural management.
                            </p>
                        </div>
                    </div>

                    {/* Entry Cards - Better spacing and layout */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 pt-4 sm:pt-8">
                        
                        {/* Fisherman Portal Card */}
                        <Link href="/login?role=fisherman" className="group">
                            <div className="relative h-full bg-card rounded-2xl border border-border p-6 sm:p-8 transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1">
                                <div className="flex flex-col h-full">
                                    {/* Icon */}
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                                        <Waves className="h-6 w-6" />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 text-left">
                                        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                                            Fisherman Portal
                                        </h2>
                                        <p className="text-sm sm:text-base text-muted-foreground">
                                            Register your account, apply for your Digital ID, and submit daily catch reports.
                                        </p>
                                    </div>
                                    
                                    {/* CTA Button */}
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base group-hover:gap-3 transition-all">
                                            Enter Portal
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Admin Portal Card */}
                        <Link href="/login?role=admin" className="group">
                            <div className="relative h-full bg-card rounded-2xl border border-border p-6 sm:p-8 transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1">
                                <div className="flex flex-col h-full">
                                    {/* Icon */}
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/50 text-secondary-foreground mb-4 group-hover:bg-secondary transition-colors">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 text-left">
                                        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                                            Staff & Admin
                                        </h2>
                                        <p className="text-sm sm:text-base text-muted-foreground">
                                            Access the dashboard to verify reports, manage registry, and view analytics.
                                        </p>
                                    </div>
                                    
                                    {/* CTA Button */}
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <div className="inline-flex items-center gap-2 text-secondary-foreground font-semibold text-sm sm:text-base group-hover:gap-3 transition-all">
                                            Staff Login
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="relative z-10 mt-auto w-full border-t border-border bg-background/80 backdrop-blur-sm">
                <div className="flex items-center justify-center px-4 py-6 text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                        &copy; {new Date().getFullYear()} Republic of the Philippines. Local Government Unit.
                    </p>
                </div>
            </div>
        </main>
    )
}
