import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { TrendingUp, BarChart3, Users, Fish, Anchor, Activity, MapPin, Calendar, ShieldAlert, DollarSign, ShoppingBag, FileText, PieChart, Info, CloudRain, AlertTriangle, ArrowUpRight, ArrowDownRight, ChevronLeft } from "lucide-react"
import Link from "next/link"

export const revalidate = 60 // Revalidate every minute for live-ish feel

async function getHubData() {
    const [fishermen, reports, extraStats, programs, announcements, marketPrices] = await Promise.all([
        supabase.from('fisherman_registration').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('weight_kg').eq('status', 'approved'),
        supabase.from('hub_extra_stats').select('*').single(),
        supabase.from('hub_programs').select('*').order('created_at', { ascending: false }),
        supabase.from('hub_announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('hub_market_prices').select('*').order('species', { ascending: true })
    ])

    const totalCatch = reports.data?.reduce((sum: number, r: { weight_kg: number }) => sum + Number(r.weight_kg), 0) || 0
    
    return {
        totalFishermen: fishermen.count || 0,
        totalCatch,
        totalAssistance: extraStats.data?.total_assistance || 0,
        totalTrainings: extraStats.data?.total_trainings || 0,
        programs: programs.data || [],
        announcements: announcements.data || [],
        fishPrices: marketPrices.data || []
    }
}

export default async function HubDashboard() {
    const data = await getHubData()

    // Categorize announcements using the new column
    const adminOrders = data.announcements.filter((a: any) => a.category === 'order')
    const weatherAlerts = data.announcements.filter((a: any) => a.category === 'weather')
    const regularAnnouncements = data.announcements.filter((a: any) => a.category === 'general' || !['order', 'weather'].includes(a.category))

    return (
        <div className="container mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-24 space-y-20">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Link 
                    href="/" 
                    className="group flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all"
                >
                    <ChevronLeft className="h-4 w-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">Back to Landing Page</span>
                </Link>
                <div className="flex gap-6">
                    <Link href="/hub" className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Home</Link>
                    <Link href="/hub/programs" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Programs</Link>
                    <Link href="/hub/announcements" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Announcements</Link>
                </div>
            </div>

            {/* Hero Section with Total Catch */}
            <div className="relative group overflow-hidden rounded-[2rem] bg-slate-900 border border-slate-800 p-6 md:p-8 text-center space-y-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-emerald-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="relative space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[8px] font-black uppercase tracking-[0.3em]">
                        <Activity className="h-3 w-3 animate-pulse" /> Live Production Counter
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white italic">
                        {data.totalCatch.toLocaleString()}<span className="text-blue-500"> KG</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-bold tracking-tight uppercase opacity-60">Total Overall Catch Production - 2026</p>
                </div>
                <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800/50">
                    <div>
                        <p className="text-xl font-black text-white italic">{data.totalFishermen.toLocaleString()}</p>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Fisherfolk Hub</p>
                    </div>
                    <div>
                        <p className="text-xl font-black text-emerald-500 italic">₱2.4M</p>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Market Value</p>
                    </div>
                    <div>
                        <p className="text-xl font-black text-blue-500 italic">24</p>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Active Cooperatives</p>
                    </div>
                    <div>
                        <p className="text-xl font-black text-amber-500 italic">{data.totalAssistance.toLocaleString()}</p>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Grants Issued</p>
                    </div>
                </div>
            </div>

            {/* Fish Market Watch (Prices) */}
            <section className="space-y-12">
                <div className="flex items-center justify-between border-b border-slate-900 pb-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white flex items-center gap-4 italic italic">
                            <ShoppingBag className="text-blue-500 h-8 w-8" /> Market Watch
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">Daily fish price monitor for Olongapo City local markets.</p>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Source: MAO-Price Monitoring Unit</p>
                        <p className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest">Updated {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.fishPrices.map((item: any) => (
                        <Card key={item.species} className="bg-slate-900/50 border-slate-800 p-8 rounded-[2rem] hover:bg-slate-900 transition-all group">
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                                        <Fish className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    {item.trend === "up" ? (
                                        <div className="flex items-center gap-1 text-rose-500 font-black text-xs">
                                            <ArrowUpRight className="h-4 w-4" /> {item.change}
                                        </div>
                                    ) : item.trend === "down" ? (
                                        <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
                                            <ArrowDownRight className="h-4 w-4" /> {item.change}
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 font-black text-xs uppercase tracking-widest">Stable</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-white italic truncate">{item.species}</h3>
                                    <p className="text-4xl font-black text-white italic tracking-tighter">₱{item.price}<span className="text-xs text-slate-500 not-italic ml-2">/kg</span></p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Announcement Hub - Triple Categorized */}
            <section className="space-y-12">
                <div className="flex items-center justify-between border-b border-slate-900 pb-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white flex items-center gap-4 italic italic">
                            <Bell className="text-amber-500 h-8 w-8" /> Advisory Center
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">Categorized updates on policy, safety, and community events.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Administrative Orders */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-xl w-fit border border-blue-500/20">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Fisheries Admin Orders</span>
                        </div>
                        <div className="space-y-4">
                            {adminOrders.length > 0 ? adminOrders.map((a: any) => (
                                <AnnouncementCard key={a.id} title={a.title} date={a.event_date || a.date_posted} description={a.description} variant="blue" />
                            )) : <p className="text-slate-600 text-xs italic p-8 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">No active orders found.</p>}
                        </div>
                    </div>

                    {/* Weather & Safety */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 px-4 py-2 bg-rose-500/10 rounded-xl w-fit border border-rose-500/20">
                            <CloudRain className="h-4 w-4 text-rose-500" />
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Weather & Safety</span>
                        </div>
                        <div className="space-y-4">
                            {weatherAlerts.length > 0 ? weatherAlerts.map((a: any) => (
                                <AnnouncementCard key={a.id} title={a.title} date={a.event_date || a.date_posted} description={a.description} variant="rose" />
                            )) : (
                                <div className="p-8 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 text-center">
                                    <AlertTriangle className="h-8 w-8 text-emerald-500/30 mx-auto mb-4" />
                                    <p className="text-emerald-500/80 font-bold text-xs">Clear Weather Conditions</p>
                                    <p className="text-slate-600 text-[10px] mt-1">No active boat safety bulletins.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Community & Trainings */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 rounded-xl w-fit border border-amber-500/20">
                            <Activity className="h-4 w-4 text-amber-500" />
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">General Advisory</span>
                        </div>
                        <div className="space-y-4">
                            {regularAnnouncements.length > 0 ? regularAnnouncements.map((a: any) => (
                                <AnnouncementCard key={a.id} title={a.title} date={a.event_date || a.date_posted} description={a.description} variant="amber" />
                            )) : <p className="text-slate-600 text-xs italic p-8 text-center bg-slate-900/30 rounded-3xl border border-slate-800">No general updates.</p>}
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Programs */}
            <section className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-900 pb-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white flex items-center gap-4 italic italic">
                            <Info className="text-emerald-500 h-8 w-8" /> Ongoing Support & Initiatives
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">Tracking how municipal resources are invested in agriculture.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {data.programs.slice(0, 3).map((p: any) => (
                        <Card key={p.id} className="bg-slate-950 border-slate-800 rounded-[2.5rem] overflow-hidden group">
                            <div className="aspect-video bg-slate-900 relative flex items-center justify-center p-8">
                                {p.image_url ? (
                                    <img src={p.image_url} alt={p.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                                ) : (
                                    <PieChart className="h-12 w-12 text-slate-800" />
                                )}
                                <div className="relative z-10 text-center">
                                    <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg shadow-xl">{p.status}</span>
                                </div>
                            </div>
                            <CardContent className="p-8 space-y-4">
                                <h3 className="text-xl font-black text-white tracking-tight leading-tight">{p.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed font-medium">{p.description}</p>
                                <div className="pt-4 flex items-center justify-between border-t border-slate-900">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Since {p.start_date}</span>
                                    <Link href="/hub/programs" className="text-blue-500 text-xs font-black uppercase hover:underline">View Details</Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
            
            <div className="pt-20 border-t border-slate-900 text-center space-y-4">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">
                    Final Audit Match: COA-Verified Municipal Agriculture Records
                </p>
                <div className="flex justify-center gap-8">
                    <ShieldAlert className="h-6 w-6 text-slate-800" />
                    <DollarSign className="h-6 w-6 text-slate-800" />
                    <MapPin className="h-6 w-6 text-slate-800" />
                </div>
            </div>
        </div>
    )
}

function AnnouncementCard({ title, date, description, variant }: { title: string, date: string, description: string, variant: 'blue' | 'rose' | 'amber' }) {
    const colors = {
        blue: "border-blue-500/20 hover:border-blue-500/50",
        rose: "border-rose-500/20 hover:border-rose-500/50",
        amber: "border-amber-500/20 hover:border-amber-500/50"
    }

    return (
        <Card className={`bg-slate-900/50 ${colors[variant]} border rounded-2xl p-6 space-y-3 transition-all cursor-default`}>
            <div className="flex justify-between items-start gap-4">
                <h4 className="text-sm font-black text-white leading-tight">{title}</h4>
                <span className="shrink-0 text-[9px] font-black text-slate-500 uppercase">{date}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium line-clamp-2">{description}</p>
        </Card>
    )
}

const Bell = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
