import Link from 'next/link'
import { Anchor, Waves, Building2, ArrowRight, Zap } from "lucide-react"

export default function Home() {
    return (
        <main className="min-h-screen w-full flex flex-col bg-background relative overflow-hidden">
            
            {/* Animated gradient background */}
            <div className="absolute inset-0 -z-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl opacity-50" />
            </div>
            
            {/* Navigation Bar */}
            <nav className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-lg bg-primary/15 p-2.5">
                        <Anchor className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">Fishtory</span>
                </div>
            </nav>

            {/* Main content */}
            <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
                
                {/* Hero Section */}
                <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-8 sm:space-y-12">
                    
                    {/* Main Heading */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm font-semibold">Simplified Fisheries Management</span>
                        </div>
                        
                        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-foreground leading-tight">
                            Manage Your Catch <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">Better</span>
                        </h1>
                        
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                            The unified registry and reporting platform designed for fishermen and government officials.
                        </p>
                    </div>

                    {/* Portal Cards Grid */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 sm:pt-12">
                        
                        {/* Fisherman Portal Card */}
                        <Link href="/login?role=fisherman" className="group">
                            <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-card to-card/80 border border-border/50 p-8 sm:p-10 transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                                {/* Decorative background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="relative flex flex-col h-full gap-6">
                                    {/* Icon with gradient background */}
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                                        <Waves className="h-8 w-8" />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 text-left space-y-3">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                                            Fisherman Portal
                                        </h2>
                                        <p className="text-base text-muted-foreground leading-relaxed">
                                            Register your account, apply for your Digital ID, manage your vessel, and submit daily catch reports with ease.
                                        </p>
                                    </div>
                                    
                                    {/* CTA */}
                                    <div className="inline-flex items-center gap-3 text-primary font-semibold text-base group-hover:gap-4 transition-all duration-300">
                                        <span>Enter Portal</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Admin Portal Card */}
                        <Link href="/login?role=admin" className="group">
                            <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-card to-card/80 border border-border/50 p-8 sm:p-10 transition-all duration-500 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2">
                                {/* Decorative background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="relative flex flex-col h-full gap-6">
                                    {/* Icon with gradient background */}
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 text-accent group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-300">
                                        <Building2 className="h-8 w-8" />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 text-left space-y-3">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                                            Staff & Admin
                                        </h2>
                                        <p className="text-base text-muted-foreground leading-relaxed">
                                            Access the comprehensive dashboard to verify reports, manage the registry, monitor compliance, and view analytics.
                                        </p>
                                    </div>
                                    
                                    {/* CTA */}
                                    <div className="inline-flex items-center gap-3 text-accent font-semibold text-base group-hover:gap-4 transition-all duration-300">
                                        <span>Staff Login</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Feature Pills */}
                    <div className="w-full pt-8 sm:pt-12 grid grid-cols-3 gap-4 sm:gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">✓</div>
                            <p className="text-xs sm:text-sm font-semibold text-foreground">Secure & Verified</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">✓</div>
                            <p className="text-xs sm:text-sm font-semibold text-foreground">Real-Time Data</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">✓</div>
                            <p className="text-xs sm:text-sm font-semibold text-foreground">24/7 Access</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 w-full border-t border-border/50 bg-background/40 backdrop-blur-md">
                <div className="flex items-center justify-center px-4 py-8 text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                        &copy; {new Date().getFullYear()} Republic of the Philippines. Local Government Unit.
                    </p>
                </div>
            </div>
        </main>
    )
}
