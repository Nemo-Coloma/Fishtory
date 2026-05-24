import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Fish, Bell, Info, ArrowUpRight, ArrowDownRight } from "lucide-react"

export const revalidate = 60

async function getHubData() {
    const [programs, announcements, marketPrices] = await Promise.all([
        supabase.from('hub_programs').select('*').order('created_at', { ascending: false }),
        supabase.from('hub_announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('hub_market_prices').select('*').order('species', { ascending: true })
    ])

    return {
        programs: programs.data || [],
        announcements: announcements.data || [],
        fishPrices: marketPrices.data || []
    }
}

export default async function HubDashboard() {
    const data = await getHubData()

    const adminOrders = data.announcements.filter((a: any) => a.category === 'order')
    const weatherAlerts = data.announcements.filter((a: any) => a.category === 'weather')
    const regularAnnouncements = data.announcements.filter((a: any) => a.category === 'general' || !['order', 'weather'].includes(a.category))

    return (
        <div className="container mx-auto px-4 py-12 space-y-16">
            {/* Market Watch Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-900 pb-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <Fish className="text-blue-500 h-6 w-6" /> Market Watch
                        </h2>
                        <p className="text-slate-500 text-sm">Daily fish price monitor.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.fishPrices.map((item: any) => (
                        <Card key={item.species} className="bg-slate-900/50 border-slate-800 p-6 rounded-2xl">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                                        <Fish className="h-5 w-5 text-slate-400" />
                                    </div>
                                    {item.trend === "up" ? (
                                        <div className="flex items-center gap-1 text-rose-500 font-bold text-xs">
                                            <ArrowUpRight className="h-3 w-3" /> {item.change}
                                        </div>
                                    ) : item.trend === "down" ? (
                                        <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                                            <ArrowDownRight className="h-3 w-3" /> {item.change}
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 font-bold text-xs">Stable</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-white">{item.species}</h3>
                                    <p className="text-2xl font-black text-white">₱{item.price}<span className="text-xs text-slate-500 ml-1">/kg</span></p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Announcements Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-900 pb-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <Bell className="text-amber-500 h-6 w-6" /> Announcements
                        </h2>
                        <p className="text-slate-500 text-sm">Public updates and advisories.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Admin Orders */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg w-fit border border-blue-500/20">
                            <span className="text-xs font-bold text-blue-500 uppercase">Admin Orders</span>
                        </div>
                        <div className="space-y-3">
                            {adminOrders.length > 0 ? adminOrders.map((a: any) => (
                                <AnnouncementCard key={a.id} title={a.title} date={a.event_date} description={a.description} variant="blue" />
                            )) : <p className="text-slate-600 text-xs p-6 text-center bg-slate-900/30 rounded-xl">No orders.</p>}
                        </div>
                    </div>

                    {/* Weather Alerts */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 rounded-lg w-fit border border-rose-500/20">
                            <span className="text-xs font-bold text-rose-500 uppercase">Weather</span>
                        </div>
                        <div className="space-y-3">
                            {weatherAlerts.length > 0 ? weatherAlerts.map((a: any) => (
                                <AnnouncementCard key={a.id} title={a.title} date={a.event_date} description={a.description} variant="rose" />
                            )) : <p className="text-slate-600 text-xs p-6 text-center bg-slate-900/30 rounded-xl">No alerts.</p>}
                        </div>
                    </div>

                    {/* General Announcements */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg w-fit border border-amber-500/20">
                            <span className="text-xs font-bold text-amber-500 uppercase">General</span>
                        </div>
                        <div className="space-y-3">
                            {regularAnnouncements.length > 0 ? regularAnnouncements.map((a: any) => (
                                <AnnouncementCard key={a.id} title={a.title} date={a.event_date} description={a.description} variant="amber" />
                            )) : <p className="text-slate-600 text-xs p-6 text-center bg-slate-900/30 rounded-xl">No updates.</p>}
                        </div>
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-900 pb-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <Info className="text-emerald-500 h-6 w-6" /> Programs
                        </h2>
                        <p className="text-slate-500 text-sm">Active support initiatives.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.programs.slice(0, 3).map((p: any) => (
                        <Card key={p.id} className="bg-slate-950 border-slate-800 rounded-2xl overflow-hidden">
                            <div className="aspect-video bg-slate-900 relative flex items-center justify-center p-6">
                                {p.image_url ? (
                                    <img src={p.image_url} alt={p.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                                ) : null}
                                <div className="relative z-10">
                                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded">{p.status}</span>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-3">
                                <h3 className="text-lg font-bold text-white">{p.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2">{p.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}

function AnnouncementCard({ title, date, description, variant }: { title: string, date: string, description: string, variant: 'blue' | 'rose' | 'amber' }) {
    const colors = {
        blue: "border-blue-500/20",
        rose: "border-rose-500/20",
        amber: "border-amber-500/20"
    }

    return (
        <Card className={`bg-slate-900/50 ${colors[variant]} border rounded-xl p-4 space-y-2`}>
            <div className="flex justify-between items-start gap-2">
                <h4 className="text-sm font-bold text-white">{title}</h4>
                <span className="text-[10px] text-slate-500">{date}</span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
        </Card>
    )
}