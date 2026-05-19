import Link from 'next/link'
import { Anchor, Waves, Building2 } from "lucide-react"

export default function Home() {
    return (
        <main className="min-h-screen w-full flex flex-col bg-slate-100">
            
            {/* Dark Navy Header */}
            <div className="w-full bg-slate-900 h-14 sm:h-16" />

            {/* Main Content */}
            <div className="flex-1 w-full flex flex-col items-center justify-center px-4 py-8 sm:py-16">
                
                {/* White Card Container */}
                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-8 sm:p-10">
                    
                    {/* Logo Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100">
                            <Anchor className="h-10 w-10 text-blue-600" />
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                            Fishtory Portal
                        </h1>
                        <p className="text-base text-slate-600">
                            Select your access level to continue.
                        </p>
                    </div>

                    {/* Portal Selection Options */}
                    <div className="space-y-3">
                        
                        {/* Fisherman Portal Option */}
                        <Link href="/login?role=fisherman">
                            <div className="w-full p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Waves className="h-6 w-6" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Fisherman Portal</h3>
                                        <p className="text-xs sm:text-sm text-slate-600">Submit catches and manage account</p>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Admin Portal Option */}
                        <Link href="/login?role=admin">
                            <div className="w-full p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Staff & Admin</h3>
                                        <p className="text-xs sm:text-sm text-slate-600">Verify reports and manage registry</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full border-t border-slate-200 bg-white">
                <div className="flex items-center justify-center px-4 py-6 text-center">
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        &copy; {new Date().getFullYear()} Republic of the Philippines. Local Government Unit.
                    </p>
                </div>
            </div>
        </main>
    )
}
