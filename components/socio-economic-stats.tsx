"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Users, BookOpen, Home, Fish, Anchor, BarChart3, MapPin, Loader2 } from "lucide-react"

export function SocioEconomicStats() {

    
    // ✅ STATES GO HERE
        const [loading, setLoading] = useState(true)
        const [data, setData] = useState<any>(null)

        // ✅ FORM STATE
        const [form, setForm] = useState({
            user_id: "",
            location: "",
            education_attainment: "",
            dependency_ratio: "",
            boat_type_motorized: false
        })

        // ✅ SAVING STATE
        const [saving, setSaving] = useState(false)

        // ✅ HANDLE INPUT CHANGES
        const handleChange = (
            e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
        ) => {
            const { name, value } = e.target

            setForm(prev => ({
                ...prev,
                [name]: value
            }))
        }

        // ✅ HANDLE CHECKBOX
        const handleCheckbox = (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            setForm(prev => ({
                ...prev,
                boat_type_motorized: e.target.checked
            }))
        }

        // ✅ SAVE FUNCTION
        const handleSave = async () => {
            setSaving(true)

            const {
                data: { user }
            } = await supabase.auth.getUser()

            if (!user) {
                alert("User not logged in")
                setSaving(false)
                return
            }

            const profileData = {
                user_id: user.id,
                location: form.location,
                education_attainment: form.education_attainment,
                dependency_ratio: Number(form.dependency_ratio),
                boat_type_motorized: form.boat_type_motorized,
            };

            const { data: existing } = await supabase
                .from("fishermen_profiles")
                .select("id")
                .eq("user_id", user.id)
                .single();

            let saveError;
            if (existing) {
                const { error } = await supabase
                    .from("fishermen_profiles")
                    .update(profileData)
                    .eq("user_id", user.id);
                saveError = error;
            } else {
                const { error } = await supabase
                    .from("fishermen_profiles")
                    .insert([{ ...profileData, id: crypto.randomUUID() }]);
                saveError = error;
            }

            setSaving(false)

            if (saveError) {
                console.error("Save error:", saveError.message)
                alert(saveError.message)
                return
            }

            alert("Profile saved successfully!")
        }


    

    useEffect(() => {
        async function fetchSocioEconomicData() {
            setLoading(true)
            const [fishermen, profiles, reports] = await Promise.all([
                supabase.from('fisherman_registration').select('id, last_name, first_name, location'),
                supabase.from('fishermen_profiles').select('location, education_attainment, dependency_ratio, boat_type_motorized'),
                supabase.from('reports').select('weight_kg, fisherman_id').eq('status', 'approved')
            ])

            const totalFishermen = fishermen.data?.length || 0
            
            // Barangay breakdown from registrations
            const barangayCounts: Record<string, number> = {}
            fishermen.data?.forEach((f: any) => {
                if (f.location) barangayCounts[f.location] = (barangayCounts[f.location] || 0) + 1
            })

            const topBarangays = Object.entries(barangayCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)            


            
       
           // Compute average dependency ratio from real data
            const profileData = profiles.data || []
            const validRatios = profileData.filter((p: any) => p.dependency_ratio != null).map((p: any) => Number(p.dependency_ratio))
            const avgDependencyRatio = validRatios.length > 0
                ? (validRatios.reduce((s: number, v: number) => s + v, 0) / validRatios.length).toFixed(1)
                : '4.2'

            // Compute motorized/non-motorized boat split from real data
            const motorizedCount = profileData.filter((p: any) => p.boat_type_motorized === true).length
            const nonMotorizedCount = profileData.filter((p: any) => p.boat_type_motorized === false).length
            const totalBoats = motorizedCount + nonMotorizedCount
            const motorizedPct = totalBoats > 0 ? Math.round((motorizedCount / totalBoats) * 100) : 65
            const nonMotorizedPct = 100 - motorizedPct

            // Compute education breakdown from real data
            const educationCounts: Record<string, number> = {}
            profileData.forEach((p: any) => {
                if (p.education_attainment) {
                    educationCounts[p.education_attainment] = (educationCounts[p.education_attainment] || 0) + 1
                }
            })
            const totalWithEdu = Object.values(educationCounts).reduce((s, n) => s + n, 0) || 1
            const education = totalWithEdu > 0
                ? Object.entries(educationCounts).map(([level, count]) => ({
                    level,
                    percent: Math.round((count / totalWithEdu) * 100)
                }))
                : [
                    { level: "Elementary", percent: 30 },
                    { level: "High School", percent: 55 },
                    { level: "College/Vocational", percent: 15 }
                ]

            // Catch data
            const totalCatch = reports.data?.reduce((sum: number, r: any) => sum + Number(r.weight_kg), 0) || 0
            const avgCatchPerFisherman = totalFishermen > 0 ? totalCatch / totalFishermen : 0

            setData({
                totalFishermen,
                topBarangays,
                avgDependencyRatio,
                avgCatchPerFisherman,
                totalCatch,
                boatProfile: {
                    motorized: motorizedPct,
                    nonMotorized: nonMotorizedPct
                },
                education
            })
            setLoading(false)
        }

        fetchSocioEconomicData()
    }, [])

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-slate-400 font-medium">Aggregating Socio-Economic Data...</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-1000">
            {/* Header Section: Performance Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    { label: "Total Registered", value: data.totalFishermen, icon: Users, color: "blue", sub: "Municipal Total" },
                    { label: "Avg. Monthly Catch", value: `${Math.round(data.avgCatchPerFisherman)} kg`, icon: Fish, color: "emerald", sub: "Per Fisherman" },
                    { label: "Est. Monthly Income", value: "₱15,200", icon: BarChart3, color: "amber", sub: "Market Average" },
                ].map((stat, i) => (
                    <div key={i} className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 overflow-hidden transition-all hover:bg-slate-800/40">
                        <div className="flex items-center gap-3 relative z-10">
                            <div className={`p-2.5 bg-${stat.color}-500/10 rounded-xl`}>
                                <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{stat.label}</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-black text-white italic tracking-tighter leading-none">{stat.value}</span>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{stat.sub}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
<button
    onClick={handleSave}
    disabled={saving}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
>
    {saving ? "Saving..." : "Save to Registry"}
</button>
            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Registry Heatmap - 7 Columns */}
                <Card className="lg:col-span-7 bg-slate-900/40 backdrop-blur-3xl border-slate-800/50 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative group">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-0.5">
                            <h3 className="text-lg font-black text-white italic tracking-tight uppercase">Registry Heatmap</h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">RSBSA Distribution</p>
                        </div>
                        <MapPin className="h-4 w-4 text-blue-500 opacity-50" />
                    </div>
                    
                    <div className="grid gap-4 relative z-10">
                        {data.topBarangays.map(([name, count]: [string, number], idx: number) => (
                            <div key={name} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-600">{idx + 1}</span>
                                        <span className="text-xs font-bold text-slate-300">{name}</span>
                                    </div>
                                    <span className="text-md font-black text-white italic">{count} <span className="text-[9px] text-slate-500 uppercase not-italic font-bold">PAX</span></span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-950/50 rounded-full border border-slate-800/30 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                                        style={{ width: `${(count / data.totalFishermen) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Household Pulse - 5 Columns */}
                <div className="lg:col-span-5 grid grid-rows-2 gap-4">
                    <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/30 rounded-3xl p-6 flex flex-col justify-center gap-2 relative overflow-hidden group">
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] relative z-10">Dependents Overview</span>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <h4 className="text-4xl font-black text-white italic tracking-tighter">{data.avgDependencyRatio}</h4>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">AVG. PER HOUSEHOLD</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-tight max-w-[180px] relative z-10">Economic dependency ratio per registered family unit.</p>
                        <Home className="absolute -bottom-4 -right-4 h-20 w-20 text-amber-500 opacity-5 pointer-events-none" />
                    </Card>

                    <Card className="bg-slate-950/60 backdrop-blur-xl border-rose-900/20 rounded-3xl p-6 flex flex-col justify-center gap-2 relative overflow-hidden group border-l-2 border-l-rose-600">
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] relative z-10">Community Risk Profile</span>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <h4 className="text-4xl font-black text-rose-500 italic tracking-tighter">12%</h4>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">IN HAZARD ZONES</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-tight max-w-[180px] relative z-10">Proportion of fisherfolk in high-risk coastal areas.</p>
                        <MapPin className="absolute -top-4 -right-4 h-20 w-20 text-rose-500 opacity-5 pointer-events-none" />
                    </Card>
                </div>

                {/* Education Funnel - 4 Columns */}
                <Card className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl border-slate-800 rounded-3xl p-6 space-y-6">
                    <h3 className="text-md font-black text-white italic tracking-tight uppercase">Educ Funnel</h3>
                    <div className="flex flex-col gap-4">
                        {data.education.map((item: any) => (
                            <div key={item.level} className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-slate-950 flex items-center justify-center font-black text-[10px] text-emerald-500 border border-emerald-500/20">
                                    {item.percent}%
                                </div>
                                <div className="flex-1 space-y-1">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{item.level}</span>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${item.percent}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Vessel & Market Synergy - 8 Columns */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 rounded-3xl p-6 flex flex-col justify-between group">
                        <div className="space-y-1">
                            <h3 className="text-md font-black text-white italic uppercase">Vessel Dynamic</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Motorized Rating</p>
                        </div>
                        
                        <div className="py-4 text-center">
                            <span className="text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">{data.boatProfile.motorized}%</span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                                <div className="h-full bg-blue-500" style={{ width: `${data.boatProfile.motorized}%` }} />
                                <div className="h-full bg-slate-700" style={{ width: `${data.boatProfile.nonMotorized}%` }} />
                            </div>
                            <div className="flex justify-between text-[7px] font-black text-slate-500 uppercase tracking-widest">
                                <span>Motorized</span>
                                <span>Non-Motorized</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-950 border-slate-800/80 rounded-3xl p-6 space-y-4">
                        <h3 className="text-xs font-black text-white italic tracking-tight uppercase border-b border-slate-800 pb-2">Market Channels</h3>
                        <div className="space-y-2">
                            {[
                                { label: "Retail", value: "42%", color: "blue" },
                                { label: "Wholesale", value: "35%", color: "amber" },
                                { label: "Cooperatives", value: "15%", color: "emerald" },
                                { label: "Inst.", value: "8%", color: "rose" }
                            ].map(item => (
                                <div key={item.label} className="px-3 py-2 bg-slate-900/50 rounded-xl border border-slate-800/50 flex items-center justify-between group hover:border-blue-500/10">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full bg-${item.color}-500`} />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-black text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
