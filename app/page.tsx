import Link from 'next/link'
import { Anchor, Waves, Building2, ArrowRight } from "lucide-react"

export default function Home() {
    return (
        <main className="min-h-screen w-full flex flex-col bg-gradient-to-b from-white to-slate-50">
            
            {/* Elegant Header */}
            <header className="w-full border-b border-slate-200/50 bg-white sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-teal-600">
                            <Anchor className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">Fishtory</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 w-full flex flex-col items-center justify-center px-4 py-12 sm:py-20">
                
                {/* Premium Card Container */}
                <div className="w-full max-w-md">
                    
                    {/* Centered Icon Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 shadow-lg">
                            <Anchor className="h-11 w-11 text-blue-600" />
                        </div>
                    </div>

                    {/* Premium Heading */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-3 leading-tight">
                            Welcome Back
                        </h1>
                        <p className="text-base text-slate-600 leading-relaxed">
                            Choose your role to access the Fishtory registry and reporting system.
                        </p>
                    </div>

                    {/* Portal Selection Cards */}
                    <div className="space-y-4">
                        
                        {/* Fisherman Portal Card */}
                        <Link href="/login?role=fisherman" className="group">
                            <div className="relative w-full overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-5 transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-200/30">
                                <div className="flex items-center gap-5">
                                    {/* Icon Container */}
                                    <div className="flex flex-shrink-0 items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 group-hover:shadow-lg group-hover:shadow-blue-200/50 transition-all">
                                        <Waves className="h-7 w-7" />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            Fisherman Portal
                                        </h2>
                                        <p className="text-sm text-slate-600 mt-0.5">
                                            Submit catches and reports
                                        </p>
                                    </div>
                                    
                                    {/* Arrow */}
                                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                </div>
                            </div>
                        </Link>

                        {/* Admin Portal Card */}
                        <Link href="/login?role=admin" className="group">
                            <div className="relative w-full overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-5 transition-all duration-300 hover:border-teal-500 hover:shadow-xl hover:shadow-teal-200/30">
                                <div className="flex items-center gap-5">
                                    {/* Icon Container */}
                                    <div className="flex flex-shrink-0 items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-teal-100 to-teal-50 text-teal-600 group-hover:shadow-lg group-hover:shadow-teal-200/50 transition-all">
                                        <Building2 className="h-7 w-7" />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                                            Staff & Admin
                                        </h2>
                                        <p className="text-sm text-slate-600 mt-0.5">
                                            Verify and manage registry
                                        </p>
                                    </div>
                                    
                                    {/* Arrow */}
                                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Divider */}
                    <div className="mt-8 mb-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Help Text */}
                    <p className="text-center text-xs text-slate-500">
                        Need help? Contact your administrator or visit the support center.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full border-t border-slate-200/50 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-center px-4 py-6 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                        &copy; {new Date().getFullYear()} Republic of the Philippines. Local Government Unit.
                    </p>
                </div>
            </footer>
        </main>
    )
}
