"use client"

import { useMemo, useRef, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Printer, Loader2 } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, subMonths, isSameDay, startOfMonth, endOfMonth, eachMonthOfInterval, subYears, isSameMonth } from "date-fns"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas-pro"

interface Report {
  first_name: string
  last_name: string
  species: string
  weight_kg: number
  location: string
  status: string
  created_at: string
}

interface SocioData {
  age?: number;
  gender?: string;
  monthly_income?: number;
  poverty_status?: boolean;
  boat_type_motorized?: boolean;
  education_attainment?: string;
  fishing_gear?: string;
}

export default function AnalyticsView({ reports, socioEconomicData = [] }: { reports: Report[], socioEconomicData?: SocioData[] }) {
  const [isGenerating, setIsGenerating] = useState(false)

  // Approved reports for analytics
  const approvedReports = useMemo(() => reports.filter(r => r.status === 'approved'), [reports])

  // --- EXISTING CATCH ANALYTICS ---
  const weeklyData = useMemo(() => {
    const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
    return last7Days.map(date => {
      const dayName = format(date, 'eee')
      const totalWeight = approvedReports
        .filter(r => isSameDay(new Date(r.created_at), date))
        .reduce((sum, r) => sum + Number(r.weight_kg), 0)
      return { name: dayName, weight: totalWeight }
    })
  }, [approvedReports])

  const monthlyData = useMemo(() => {
    const start = startOfMonth(new Date())
    const end = endOfMonth(new Date())
    const weeks = []
    let current = start
    while (current <= end) {
        const weekStart = current
        const weekEnd = endOfWeek(current) > end ? end : endOfWeek(current)
        const totalWeight = approvedReports
            .filter(r => {
                const rDate = new Date(r.created_at)
                return rDate >= weekStart && rDate <= weekEnd
            })
            .reduce((sum, r) => sum + Number(r.weight_kg), 0)
        weeks.push({ name: `W${weeks.length + 1}`, weight: totalWeight })
        current = subDays(weekEnd, -1)
    }
    return weeks
  }, [approvedReports])

  const annualData = useMemo(() => {
    const last12Months = eachMonthOfInterval({ start: subMonths(new Date(), 11), end: new Date() })
    return last12Months.map(date => {
      const totalWeight = approvedReports
        .filter(r => isSameMonth(new Date(r.created_at), date))
        .reduce((sum, r) => sum + Number(r.weight_kg), 0)
      return { name: format(date, 'MMM'), weight: totalWeight }
    })
  }, [approvedReports])

  // --- NEW SOCIO-ECONOMIC ANALYTICS ---
  
  // 1. Age Distribution
  const ageData = useMemo(() => {
    const buckets = { 'Agri-Youth (<30)': 0, 'Prime (30-50)': 0, 'Senior (50+)': 0 }
    socioEconomicData.forEach(p => {
      if (!p.age) return
      if (p.age < 30) buckets['Agri-Youth (<30)']++
      else if (p.age <= 50) buckets['Prime (30-50)']++
      else buckets['Senior (50+)']++
    })
    return Object.entries(buckets).map(([name, count]) => ({ name, count }))
  }, [socioEconomicData])

  // 2. Gender Distribution
  const genderData = useMemo(() => {
    const counts = { Male: 0, Female: 0, Other: 0 }
    socioEconomicData.forEach(p => {
      if (p.gender === 'male') counts.Male++
      else if (p.gender === 'female') counts.Female++
      else if (p.gender) counts.Other++
    })
    return Object.entries(counts).filter(c => c[1] > 0).map(([name, count]) => ({ name, count }))
  }, [socioEconomicData])

  // 3. Income & Poverty Stats
  const economicSummary = useMemo(() => {
    const totalIncome = socioEconomicData.reduce((sum, p) => sum + (p.monthly_income || 0), 0)
    const avgIncome = socioEconomicData.length ? totalIncome / socioEconomicData.length : 0
    const povertyCount = socioEconomicData.filter(p => p.poverty_status).length
    const povertyRate = socioEconomicData.length ? (povertyCount / socioEconomicData.length) * 100 : 0
    return { avgIncome, povertyRate }
  }, [socioEconomicData])

  // 4. Vessel Dynamics
  const boatData = useMemo(() => {
    const counts = { Motorized: 0, 'Non-Motorized': 0 }
    socioEconomicData.forEach(p => {
      if (p.boat_type_motorized) counts.Motorized++
      else counts['Non-Motorized']++
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [socioEconomicData])

  // PDF Export Logic (unchanged but needs reference to new charts)
  const exportPDF = async () => {
    setIsGenerating(true)
    setTimeout(async () => {
      const element = document.getElementById("analytics-pdf-container")
      if (element) {
        try {
          const canvas = await html2canvas(element, { scale: 2, useCORS: true })
          const imgData = canvas.toDataURL("image/png")
          const pdf = new jsPDF("p", "mm", "a4")
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
          pdf.save(`Comprehensive_Fisheries_Analytics_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
        } catch (error) {
          console.error("PDF Export Error:", error)
        } finally {
          setIsGenerating(false)
        }
      }
    }, 500)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800 shadow-2xl gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Cognitive Analytics Hub</h3>
          <p className="text-sm text-slate-400 font-medium opacity-70">Unified Catch & Socio-Economic Intelligence</p>
        </div>
        <div className="flex gap-3 print:hidden">
          <Button size="lg" onClick={exportPDF} disabled={isGenerating} className="h-12 bg-blue-600 hover:bg-blue-500 text-white shadow-lg rounded-xl font-black px-8">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            EXPORT REPORT
          </Button>
        </div>
      </div>

      {/* SECTION 1: CATCH ANALYTICS */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
            <div className="h-1 bg-emerald-500 w-12 rounded-full" />
            <h3 className="text-md font-black text-white uppercase tracking-tighter">Harvest Productivity</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-6">
                <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Weekly Momentum (kg)</CardTitle>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Bar dataKey="weight" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-6">
                <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Annual Yield Cycle (kg)</CardTitle>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={annualData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Bar dataKey="weight" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
      </div>

      {/* SECTION 2: SOCIO-ECONOMIC ANALYTICS */}
      <div className="space-y-6 pt-10">
        <div className="flex items-center gap-4">
            <div className="h-1 bg-amber-500 w-12 rounded-full" />
            <h3 className="text-md font-black text-white uppercase tracking-tighter">Human Capital & Economic Status</h3>
        </div>
        
        {/* Economic Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Avg Monthly Income</span>
                <span className="text-2xl font-black text-emerald-500 italic">₱{Math.round(economicSummary.avgIncome).toLocaleString()}</span>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Poverty Threshold</span>
                <span className="text-2xl font-black text-rose-500 italic">{Math.round(economicSummary.povertyRate)}% <span className="text-xs not-italic font-bold text-slate-600">BELOW</span></span>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Active Profiles</span>
                <span className="text-2xl font-black text-blue-500 italic">{socioEconomicData.length}</span>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Motorized Ratio</span>
                <span className="text-2xl font-black text-amber-500 italic">
                    {socioEconomicData.length > 0 
                        ? Math.round((socioEconomicData.filter(p => p.boat_type_motorized).length / socioEconomicData.length) * 100) 
                        : 0}%
                </span>
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
            {/* Age Distribution */}
            <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-6 md:col-span-1">
                <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1">Age Demographics</CardTitle>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} fontWeight="black" width={100} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Gender Pie Chart - Actually using Bar for better PDF render consistency */}
            <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-6 md:col-span-1">
                <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1">Gender Identity</CardTitle>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={genderData}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Vessel Profile */}
            <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-6 md:col-span-1">
                <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1">Vessel Motorization</CardTitle>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={boatData}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
      </div>

      {/* PDF Container (Hidden) */}
      <div className="fixed -z-50 opacity-0 pointer-events-none top-0 left-0">
        <div id="analytics-pdf-container" className="bg-white text-black font-sans p-10 w-[800px]">
            <h1 className="text-3xl font-black uppercase text-center mb-10">Fisheries Comprehensive Report</h1>
            <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                    <h2 className="font-black border-b-2 border-black pb-2 text-sm uppercase">Economic Summary</h2>
                    <p className="text-sm">Avg Income: ₱{economicSummary.avgIncome.toLocaleString()}</p>
                    <p className="text-sm">Poverty Rate: {economicSummary.povertyRate.toFixed(1)}%</p>
                    <p className="text-sm">Total Reports: {approvedReports.length}</p>
                </div>
                <div className="space-y-4">
                    <h2 className="font-black border-b-2 border-black pb-2 text-sm uppercase">Demographic Profile</h2>
                    {ageData.map(d => <p key={d.name} className="text-xs">{d.name}: {d.count}</p>)}
                </div>
            </div>
            <div className="mt-20 text-center text-[8px] italic opacity-50">Confidential Municipal Intelligence Document</div>
        </div>
      </div>
    </div>
  )
}
