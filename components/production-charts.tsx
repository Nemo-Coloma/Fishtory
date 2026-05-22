"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line
} from 'recharts'
import { useMemo } from "react"

export default function ProductionCharts({ reports }: { reports: any[] }) {
    // 1. Species Breakdown
    const speciesData = useMemo(() => {
        const breakdown: Record<string, number> = {}
        reports.forEach(r => {
            const species = r.species || 'Other'
            breakdown[species] = (breakdown[species] || 0) + Number(r.weight_kg)
        })
        return Object.entries(breakdown)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5) // Top 5
    }, [reports])

    // 2. Monthly Trends (assuming 2026 data based on prompt)
    const monthlyData = useMemo(() => {
        const months: Record<string, number> = {}
        reports.forEach(r => {
            const date = new Date(r.created_at)
            const monthName = date.toLocaleString('default', { month: 'short' })
            months[monthName] = (months[monthName] || 0) + Number(r.weight_kg)
        })
        
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return monthOrder.map(name => ({
            name,
            total: months[name] || 0
        }))
    }, [reports])

    // 3. Top Locations
    const locationData = useMemo(() => {
        const locations: Record<string, number> = {}
        reports.forEach(r => {
            if (r.location) {
                locations[r.location] = (locations[r.location] || 0) + Number(r.weight_kg)
            }
        })
        return Object.entries(locations)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
    }, [reports])

    const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6']

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Production Line Chart */}
                <Card className="bg-slate-950/50 border-slate-800 p-6 rounded-2xl">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                            Monthly Production Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}kg`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                />
                                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Species Distribution Pie Chart */}
                <Card className="bg-slate-950/50 border-slate-800 p-6 rounded-2xl">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                            Top 5 Species Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 h-[300px] flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={speciesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {speciesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-2 pr-4">
                            {speciesData.map((s, i) => (
                                <div key={s.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Locations Bar Chart */}
            <Card className="bg-slate-950/50 border-slate-800 p-6 rounded-2xl">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                        Production by Location (Top 5)
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} tickLine={false} axisLine={false} />
                            <Tooltip 
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                            />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                {locationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
