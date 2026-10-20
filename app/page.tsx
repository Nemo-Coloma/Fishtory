import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Anchor, Waves, ArrowRight, Users, ShieldCheck } from "lucide-react"

export default function Home() {
    return (
        <main className="min-h-[100dvh] flex flex-col items-center justify-center py-24 px-6 bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.9),_rgba(239,246,255,0.95)_32%,_rgba(255,255,255,1)_100%)] relative overflow-x-hidden font-sans selection:bg-blue-500/30">
            
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                {/* Top glow */}
                <div className="absolute -top-[20%] left-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
                {/* Bottom glow */}
                <div className="absolute -bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-400/20 blur-[120px] mix-blend-screen"></div>
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#bfdbfe_1px,transparent_1px),linear-gradient(to_bottom,#bfdbfe_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
            </div>

            <div className="z-10 w-full max-w-6xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                
                {/* Hero Section */}
                <div className="text-center mb-20 relative">
                    <div className="mx-auto bg-white/80 backdrop-blur-xl p-5 rounded-3xl w-24 h-24 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(59,130,246,0.2)] border border-blue-200 ring-1 ring-blue-100 group hover:scale-105 transition-all duration-500">
                        <Anchor className="h-12 w-12 text-blue-600 group-hover:text-blue-500 transition-colors duration-500" />
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 drop-shadow-[0_0_30px_rgba(37,99,235,0.18)]">
                        Fishtory
                    </h1>
                    
                    <p className="text-lg md:text-2xl text-blue-900/70 max-w-3xl mx-auto font-medium leading-relaxed">
                        The unified registry and reporting platform for the city's fisheries and agricultural management.
                    </p>
                </div>

                {/* Entry Pathways */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4">
                    
                    {/* Fisherman Card */}
                    <div className="group relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-blue-100 hover:border-blue-300 transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center overflow-hidden shadow-[0_18px_40px_rgba(59,130,246,0.08)]">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 group-hover:bg-blue-200 group-hover:text-blue-700 transition-all duration-500 shadow-[0_0_20px_rgba(59,130,246,0.08)] border border-blue-200">
                            <Waves className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-blue-900 mb-4 tracking-tight">Fisherman Portal</h2>
                        <p className="text-blue-800/70 mb-8 flex-1 leading-relaxed text-sm md:text-base">
                            Register your account, apply for your Digital ID, and submit daily catch reports directly from your vessel.
                        </p>
                        <Link href="/login?role=fisherman" className="w-full relative z-10">
                            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-md h-14 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.25)]">
                                Enter Portal
                                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Button>
                        </Link>
                    </div>

                    {/* Staff Card */}
                    <div className="group relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-cyan-100 hover:border-cyan-300 transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center overflow-hidden shadow-[0_18px_40px_rgba(14,116,144,0.08)]">
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="h-16 w-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 text-cyan-600 group-hover:scale-110 group-hover:bg-cyan-200 group-hover:text-cyan-700 transition-all duration-500 shadow-[0_0_20px_rgba(34,211,238,0.08)] border border-cyan-200">
                            <Users className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-blue-900 mb-4 tracking-tight">Staff Portal</h2>
                        <p className="text-blue-800/70 mb-8 flex-1 leading-relaxed text-sm md:text-base">
                            Access the staff dashboard to register fishermen profiles and submit data directly to the central registry.
                        </p>
                        <Link href="/staff/login" className="w-full relative z-10">
                            <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-md h-14 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.25)]">
                                Staff Login
                                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Button>
                        </Link>
                    </div>

                    {/* Admin Card */}
                    <div className="group relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-indigo-100 hover:border-indigo-300 transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center overflow-hidden shadow-[0_18px_40px_rgba(99,102,241,0.08)]">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-200 group-hover:text-indigo-700 transition-all duration-500 shadow-[0_0_20px_rgba(129,140,248,0.08)] border border-indigo-200">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-blue-900 mb-4 tracking-tight">Admin Portal</h2>
                        <p className="text-blue-800/70 mb-8 flex-1 leading-relaxed text-sm md:text-base">
                            Access the global dashboard to manage the registry, view analytics, and monitor staff performance.
                        </p>
                        <Link href="/login?role=admin" className="w-full relative z-10">
                            <Button variant="outline" className="w-full border-blue-200 bg-white/80 text-blue-700 hover:bg-blue-50 hover:text-blue-800 text-md h-14 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-indigo-300">
                                Admin Login
                                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Button>
                        </Link>
                    </div>

                    {/* Public Hub Card */}
                    <div className="md:col-span-3 group relative bg-gradient-to-br from-blue-600/15 to-cyan-500/15 backdrop-blur-2xl p-10 rounded-[3rem] border border-blue-200 hover:border-blue-300 transition-all duration-500 hover:-translate-y-2 flex flex-col md:flex-row items-center gap-10 overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.08)] mt-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.18),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="h-24 w-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl relative z-10">
                            <Anchor className="h-12 w-12" />
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4 relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Open To Public
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-blue-900 tracking-tighter uppercase">Public Transparency Hub</h2>
                            <p className="text-blue-800/80 max-w-xl leading-relaxed font-medium">
                                View fishery production statistics, government programs, and accomplishments without an account. Transparency in action for our city.
                            </p>
                        </div>

                        <Link href="/hub" className="w-full md:w-auto relative z-10">
                            <Button className="w-full md:px-12 bg-white text-blue-700 hover:bg-blue-50 text-lg h-16 rounded-[1.5rem] font-bold transition-all duration-300 flex items-center justify-center gap-3 border border-blue-200">
                                Explore Hub
                                <ArrowRight className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>

                </div>
            </div>
            
            <div className="relative mt-24 text-center w-full z-10 flex justify-center items-center gap-2 pb-8">
                <span className="text-blue-700/70 text-xs font-medium tracking-wide uppercase">
                    &copy; {new Date().getFullYear()} Republic of the Philippines. Local Government Unit.
                </span>
            </div>
        </main>
    )
}
