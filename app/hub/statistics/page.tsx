import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { BarChart3, TrendingUp, Users, MapPin, Fish, Anchor } from "lucide-react"

export const revalidate = 3600

async function getDetailedStats() {
    const [fishermen, locations, reports, extraStats] = await Promise.all([
        supabase.from('fisherman_registration').select('id', { count: 'exact', head: true }),
        supabase.from('fishermen_profiles').select('location'),
        supabase.from('reports').select('weight_kg, species').eq('status', 'approved'),
        supabase.from('hub_extra_stats').select('*').single()
    ])

    const totalFishermen = fishermen.count || 0
    const locationCounts: Record<string, number> = {}
    locations.data?.forEach((l: any) => {
        if (l.location) locationCounts[l.location] = (locationCounts[l.location] || 0) + 1
    })

    const speciesCounts: Record<string, number> = {}
    reports.data?.forEach((r: any) => {
        if (r.species) speciesCounts[r.species] = (speciesCounts[r.species] || 0) + Number(r.weight_kg)
    })

    const topBarangays = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    const topSpecies = Object.entries(speciesCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    return {
        totalFishermen,
        totalCatch: reports.data?.reduce((sum, r) => sum + Number(r.weight_kg), 0) || 0,
        totalAssistance: extraStats.data?.total_assistance || 0,
        totalTrainings: extraStats.data?.total_trainings || 0,
        topBarangays,
        topSpecies
    }
}

export default async function StatisticsPage() {
    const stats = await getDetailedStats()

    return (
        <div className="container mx-auto px-4 py-24 max-w-6xl space-y-16">
            <div className="space-y-4 text-center border-b border-slate-900 pb-12">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
                    Sector Statistics <span className="text-blue-500">2026</span>
                </h1>
                <p className="text-slate-500 max-w-2xl mx-auto font-bold uppercase tracking-widest text-[10px]">
                    Official Annual Report Data • Municipal Agriculture Office
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryItem label="Reg. Fishermen" value={stats.totalFishermen} icon={Users} />
                <SummaryItem label="Total Catch (kg)" value={Math.round(stats.totalCatch)} icon={Fish} />
                <SummaryItem label="Assistance Recipients" value={stats.totalAssistance} icon={TrendingUp} />
                <SummaryItem label="Workshops Held" value={stats.totalTrainings} icon={Anchor} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
                {/* Top Barangays */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" /> Top Participating Barangays
                    </h3>
                    <div className="space-y-4 bg-slate-900/20 p-8 rounded-3xl border border-slate-900">
                        {stats.topBarangays.map(([name, count]) => (
                            <div key={name} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                    <span className="text-slate-300">{name}</span>
                                    <span className="text-blue-500">{count} Fishermen</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-600 rounded-full" 
                                        style={{ width: `${(count / stats.totalFishermen) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Species */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-emerald-500" /> Production by Species (kg)
                    </h3>
                    <div className="space-y-4 bg-slate-900/20 p-8 rounded-3xl border border-slate-900">
                        {stats.topSpecies.map(([name, weight]) => (
                            <div key={name} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                    <span className="text-slate-300">{name}</span>
                                    <span className="text-emerald-500">{Math.round(weight).toLocaleString()} kg</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-600 rounded-full" 
                                        style={{ width: `${(weight / stats.totalCatch) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="p-10 bg-slate-950 border border-slate-900 rounded-[2.5rem] text-center">
                <p className="text-slate-600 text-[10px] font-medium leading-relaxed max-w-3xl mx-auto">
                    DATA DISCLAIMER: These statistics are compiled from municipal monitoring reports and are subject to verification. 
                    Calculations are based on the current 2026 reporting period. For official certified copies of agricultural data, 
                    please visit the Municipal Agriculture Office.
                </p>
            </div>
        </div>
    )
}

function SummaryItem({ label, value, icon: Icon }: { label: string, value: number, icon: any }) {
    return (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-900 space-y-4 flex flex-col items-center text-center shadow-sm">
            <Icon className="h-5 w-5 text-slate-500" />
            <div className="space-y-1">
                <p className="text-2xl font-black text-white italic tracking-tighter">{value.toLocaleString()}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">{label}</p>
            </div>
        </div>
    )
}
