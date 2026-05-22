"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase"
import dynamic from "next/dynamic"
import { UserProfile } from "@/components/user-profile"
import { DownloadReportsButton } from "@/components/download-reports-button"
import { toast } from "sonner"
import {
    History,
    Map as MapIcon,
    TrendingUp,
    Anchor,
    ShieldCheck,
    MessageCircle as MessageIcon,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    LogOut,
    LayoutDashboard,
    Search,
    Trash2,
    Users,
    Download,
    Loader2,
    Plus,
    CheckCircle2,
    UserPlus,
    Fish,
    Calendar,
    Globe
} from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas-pro"
import { createStaffAccount } from "@/app/actions/create-staff"
import { createFishermanAccount } from "@/app/actions/create-fisherman"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Dynamic imports
const ChatAndBroadcasts = dynamic(() => import("@/components/chat-and-broadcasts").then(m => m.ChatAndBroadcasts), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-50/10 animate-pulse flex items-center justify-center rounded-3xl">Loading Communications...</div>
})

const CatchMap = dynamic(() => import("@/components/catch-map"), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-50/10 animate-pulse flex items-center justify-center rounded-3xl text-slate-400">Loading Map...</div>
})

const AnalyticsView = dynamic(() => import("@/components/analytics-view"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-50/10 animate-pulse flex items-center justify-center rounded-3xl text-slate-400">Loading Analytics...</div>
})

const FishermanRegistry = dynamic(() => import("@/components/fisherman-registry").then(m => m.FishermanRegistry), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-50/10 animate-pulse flex items-center justify-center rounded-3xl text-slate-400">Loading Registry...</div>
})

const PublicHubManagement = dynamic(() => import("@/components/public-hub-management").then(m => m.PublicHubManagement), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-50/10 animate-pulse flex items-center justify-center rounded-3xl text-slate-400">Loading Hub Management...</div>
})

const SocioEconomicStats = dynamic(() => import("@/components/socio-economic-stats").then(m => m.SocioEconomicStats), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-50/10 animate-pulse flex items-center justify-center rounded-3xl text-slate-400">Aggregating Socio-Economic Data...</div>
})

const SocioEconomicExcelView = dynamic(() => import("@/components/socio-economic-excel-view").then(m => m.SocioEconomicExcelView), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-50/10 animate-pulse flex items-center justify-center rounded-[2.5rem] text-slate-500 font-black italic tracking-widest uppercase">Initializing Monitoring Grid...</div>
})

export function AdminDashboard() {
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)
    const [activeTab, setActiveTab] = useState("reports")
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [reports, setReports] = useState<any[]>([])
    const [socioEconomicData, setSocioEconomicData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [fishermenMap, setFishermenMap] = useState<Record<string, { first_name: string, last_name: string }>>({})
    const [staffCounts, setStaffCounts] = useState<{ id: string, name: string, fullName: string, email: string, count: number }[]>([])
    const [isGeneratingStaffReport, setIsGeneratingStaffReport] = useState(false)
    
    // Lookup data from database for display
    const [fishSpeciesMap, setFishSpeciesMap] = useState<Record<string, string>>({})
    const [processingMethodsMap, setProcessingMethodsMap] = useState<Record<string, string>>({})
    const [landingCentersMap, setLandingCentersMap] = useState<Record<string, string>>({})
    const [loadingLookups, setLoadingLookups] = useState(true)
    
    // Fisherman Registration state (integrated from staff portal)
    const [fishermanForm, setFishermanForm] = useState({
        firstName: "",
        lastName: "",
        location: "",
        phoneNumber: "",
        vesselName: "",
        totalBoatsOperated: 1,
        totalCrew: 1,
        email: "",
        password: "",
    })
    const [createdFishermanCreds, setCreatedFishermanCreds] = useState<{ email: string; pass: string; id: string } | null>(null)
    const [creatingFisherman, setCreatingFisherman] = useState(false)
    
    // Fisherman Registry search state
    const [fishermenRegistry, setFishermenRegistry] = useState<any[]>([])
    const [registrySearchQuery, setRegistrySearchQuery] = useState("")
    const [loadingRegistry, setLoadingRegistry] = useState(true)

    // Staff Creation state
    const [staffForm, setStaffForm] = useState({
        staffId: "",
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    })
    const [createdStaffCreds, setCreatedStaffCreds] = useState<{ email: string; pass: string; id: string } | null>(null)
    const [creatingStaff, setCreatingStaff] = useState(false)
    const [staffSearchQuery, setStaffSearchQuery] = useState("")

    // Filter and Sort states for Reports
    const [reportSearchQuery, setReportSearchQuery] = useState("")
    const [monthFilter, setMonthFilter] = useState<string>("all")
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' })

    // Delete report state
    const [reportToDelete, setReportToDelete] = useState<string | null>(null)
    const [deletingReport, setDeletingReport] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setUser(session.user)
            }
        }
        fetchUser()
    }, [])

    const fetchReports = async () => {
        setLoading(true)
        
        // Fetch all data in parallel
        const [reportsRes, profilesRes, staffRes, socioRes, speciesRes, methodsRes, locationsRes, registryRes] = await Promise.all([
            supabase.from('reports').select('*').order('created_at', { ascending: false }),
            supabase.from('fisherman_registration').select('user_id, first_name, last_name, created_by'),
            supabase.from('staff_profiles').select('user_id, staff_id, email'),
            supabase.from('fishermen_profiles').select('*'),
            supabase.from('fish_species').select('id, name_en, name_tl'),
            supabase.from('processing_methods').select('id, name_en, name_tl'),
            supabase.from('landing_centers').select('id, name, location'),
            supabase.from('fisherman_registration').select('id, fisherman_id, first_name, last_name, boat_name, user_id, location, phone_number, total_boats_operated, total_crew, created_at').order('first_name')
        ])

        // Process lookup data for display
        const speciesMap: Record<string, string> = {}
        const methodsMap: Record<string, string> = {}
        const locationsMap: Record<string, string> = {}
        
        if (!speciesRes.error && speciesRes.data) {
            speciesRes.data.forEach((s: any) => {
                speciesMap[s.id] = `${s.name_en}${s.name_tl ? ` (${s.name_tl})` : ''}`
            })
            setFishSpeciesMap(speciesMap)
        }
        
        if (!methodsRes.error && methodsRes.data) {
            methodsRes.data.forEach((m: any) => {
                methodsMap[m.id] = `${m.name_en}${m.name_tl ? ` (${m.name_tl})` : ''}`
            })
            setProcessingMethodsMap(methodsMap)
        }
        
        if (!locationsRes.error && locationsRes.data) {
            locationsRes.data.forEach((l: any) => {
                locationsMap[l.id] = `${l.name}${l.location ? ` - ${l.location}` : ''}`
            })
            setLandingCentersMap(locationsMap)
        }
        
        setLoadingLookups(false)

        // Process fishermen registry
        if (!registryRes.error && registryRes.data) {
            setFishermenRegistry(registryRes.data)
        }
        setLoadingRegistry(false)

        if (!reportsRes.error && reportsRes.data) {
            setReports(reportsRes.data)
        }
        if (!profilesRes.error && profilesRes.data) {
            const map: Record<string, { first_name: string, last_name: string }> = {}
            const countsMap: Record<string, number> = {}

            profilesRes.data.forEach((p: any) => {
                if (p.user_id) map[p.user_id] = { first_name: p.first_name || '', last_name: p.last_name || '' }
                if (p.created_by) {
                    countsMap[p.created_by] = (countsMap[p.created_by] || 0) + 1
                }
            })
            setFishermenMap(map)

            if (!staffRes.error && staffRes.data) {
                const sCounts = staffRes.data.map((staff: any) => ({
                    id: staff.user_id,
                    name: staff.staff_id || 'Staff',
                    fullName: staff.email || 'Staff Member',
                    email: staff.email || '',
                    count: countsMap[staff.user_id] || 0
                })).sort((a: any, b: any) => a.name.localeCompare(b.name))
                setStaffCounts(sCounts)
            }

            if (!socioRes.error && socioRes.data) {
                setSocioEconomicData(socioRes.data)
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchReports()

        const channel = supabase
            .channel('admin-reports-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'reports' },
                (payload: any) => {
                    setReports((current) => [payload.new, ...current])
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'reports' },
                (payload: any) => {
                    setReports((current) =>
                        current.map((report) =>
                            report.id === payload.new.id ? payload.new : report
                        )
                    )
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'reports' },
                (payload: any) => {
                    setReports((current) =>
                        current.filter((report) => report.id !== payload.old.id)
                    )
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'fisherman_registration' },
                (payload: any) => {
                    if (payload.new.created_by) {
                        setStaffCounts((current) =>
                            current.map(staff =>
                                staff.id === payload.new.created_by
                                    ? { ...staff, count: staff.count + 1 }
                                    : staff
                            )
                        )
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleDeleteReport = async () => {
        if (!reportToDelete) return
        setDeletingReport(true)
        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('id', reportToDelete)
        if (error) {
            toast.error("Failed to delete report", { description: error.message })
        } else {
            toast.success("Report deleted successfully")
            setReports((current) => current.filter((r) => r.id !== reportToDelete))
        }
        setReportToDelete(null)
        setDeletingReport(false)
    }

    const handleUpdateStatus = async (reportId: string, newStatus: string) => {
        const { error } = await supabase
            .from('reports')
            .update({ status: newStatus })
            .eq('id', reportId)

        if (error) {
            toast.error("Error updating status", {
                description: error.message
            })
        } else {
            toast.success(`Report ${newStatus} successfully`)
            setReports((current) =>
                current.map((report) =>
                    report.id === reportId ? { ...report, status: newStatus } : report
                )
            )
        }
    }

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreatingStaff(true)
        setCreatedStaffCreds(null)

        try {
            if (!staffForm.email || !staffForm.firstName || !staffForm.lastName || !staffForm.staffId) {
                throw new Error("Please fill out all required fields.")
            }

            const res = await createStaffAccount({
                email: staffForm.email,
                password: staffForm.password || undefined,
                firstName: staffForm.firstName,
                lastName: staffForm.lastName,
                staffId: staffForm.staffId
            })

            if (!res.success) {
                throw new Error(res.error)
            }

            toast.success("Staff Account Provisioned Successfully")
            setCreatedStaffCreds({
                email: res.email || staffForm.email,
                pass: res.password || "",
                id: res.staffId || ""
            })
            setStaffForm({ staffId: "", firstName: "", lastName: "", email: "", password: "" })
            fetchReports()
        } catch (error: any) {
            toast.error("Failed to provision staff", { description: error.message })
        } finally {
            setCreatingStaff(false)
        }
    }

    const handleCreateFisherman = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreatingFisherman(true)
        setCreatedFishermanCreds(null)

        try {
            if (!fishermanForm.email || !fishermanForm.firstName || !fishermanForm.lastName) {
                throw new Error("Please fill out all required fields.")
            }

            const res = await createFishermanAccount({
                email: fishermanForm.email,
                password: fishermanForm.password || undefined,
                firstName: fishermanForm.firstName,
                lastName: fishermanForm.lastName,
                boatName: fishermanForm.vesselName,
                location: fishermanForm.location,
                phoneNumber: fishermanForm.phoneNumber,
                totalBoatsOperated: fishermanForm.totalBoatsOperated,
                totalCrew: fishermanForm.totalCrew
            })

            if (!res.success) {
                throw new Error(res.error)
            }

            toast.success("Fisherman Account Created Successfully")
            setCreatedFishermanCreds({
                email: res.email || fishermanForm.email,
                pass: res.password || "",
                id: res.fishermanId || ""
            })
            setFishermanForm({
                firstName: "", lastName: "", location: "", phoneNumber: "", vesselName: "",
                totalBoatsOperated: 1, totalCrew: 1, email: "", password: ""
            })
            // Refresh registry
            fetchReports()
        } catch (error: any) {
            toast.error("Failed to create fisherman account", { description: error.message })
        } finally {
            setCreatingFisherman(false)
        }
    }

    // --- Filter & Sort Logic ---
    const sortedAndFilteredReports = useMemo(() => {
        let filtered = [...reports]

        // 1. Search Query (Species, Boat, or Fisherman Name)
        if (reportSearchQuery) {
            const q = reportSearchQuery.toLowerCase()
            filtered = filtered.filter(report => {
                const fisherman = fishermenMap[report.user_id]
                const fullName = fisherman ? `${fisherman.first_name} ${fisherman.last_name}`.toLowerCase() : ""
                return (
                    report.species?.toLowerCase().includes(q) ||
                    report.boat_name?.toLowerCase().includes(q) ||
                    fullName.includes(q) ||
                    report.fisherman_id?.toLowerCase().includes(q)
                )
            })
        }

        // 2. Month Filter
        if (monthFilter !== "all") {
            filtered = filtered.filter(report => {
                const reportDate = new Date(report.created_at)
                const monthYear = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`
                return monthYear === monthFilter
            })
        }

        // 3. Sorting
        filtered.sort((a, b) => {
            let valA = a[sortConfig.key]
            let valB = b[sortConfig.key]

            // Special handling for fisherman name sorting
            if (sortConfig.key === 'fisherman') {
                const fA = fishermenMap[a.user_id]
                const fB = fishermenMap[b.user_id]
                valA = fA ? `${fA.last_name} ${fA.first_name}`.toLowerCase() : a.fisherman_id || ""
                valB = fB ? `${fB.last_name} ${fB.first_name}`.toLowerCase() : b.fisherman_id || ""
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [reports, reportSearchQuery, monthFilter, sortConfig, fishermenMap])

    const toggleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }))
    }

    const availableMonths = useMemo(() => {
        const months = new Set<string>()
        reports.forEach(r => {
            const date = new Date(r.created_at)
            months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
        })
        return Array.from(months).sort().reverse()
    }, [reports])

    const totalCatch = sortedAndFilteredReports
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + Number(r.weight_kg), 0)

    const pendingCount = sortedAndFilteredReports.filter(r => r.status === 'pending').length
    const uniqueFishermen = new Set(sortedAndFilteredReports.map(r => r.fisherman_id)).size

    const speciesBreakdown = useMemo(() => {
        const approved = reports.filter(r => r.status === 'approved')
        const breakdown: Record<string, number> = {}
        approved.forEach(r => {
            // Use species_id to get name from lookup, fallback to text if available
            const species = r.species_id ? (fishSpeciesMap[r.species_id] || 'Unknown') : (r.species || 'Unknown')
            breakdown[species] = (breakdown[species] || 0) + Number(r.weight_kg)
        })
        return Object.entries(breakdown)
            .map(([species, weight]) => ({ species, weight }))
            .sort((a, b) => b.weight - a.weight)
    }, [reports, fishSpeciesMap])

    const exportStaffPDF = async () => {
        setIsGeneratingStaffReport(true)
        setTimeout(async () => {
            const element = document.getElementById("staff-pdf-container")
            if (element) {
                try {
                    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
                    const imgData = canvas.toDataURL("image/png")
                    const pdf = new jsPDF("p", "mm", "a4")
                    const pdfWidth = pdf.internal.pageSize.getWidth()
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
                    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
                    pdf.save(`Staff_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`)
                } catch (error: any) {
                    toast.error("Failed to generate PDF", { description: error.message })
                } finally {
                    setIsGeneratingStaffReport(false)
                }
            } else {
                setIsGeneratingStaffReport(false)
            }
        }, 500)
    }

    const navItems = [
        { id: 'reports', label: 'Incoming Reports', icon: History, description: 'Review daily catches' },
        { id: 'map', label: 'Map View', icon: MapIcon, description: 'Catch distributions' },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Statistical reports' },
        { id: 'fishermen', label: 'Registry', icon: Anchor, description: 'Municipal registry' },
        { id: 'staff', label: 'Staff Hub', icon: ShieldCheck, description: 'Provision & track staff' },
        { id: 'communications', label: 'Community', icon: MessageIcon, description: 'Chat & Announcements' },
        { id: 'public_hub', label: 'Public Hub', icon: Globe, description: 'Manage Transparency Hub' },
        { id: 'socio_economic', label: 'Socio-Economic', icon: Users, description: 'Fisherfolk demographics' },
    ]

    if (!isMounted) return null

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-100 selection:bg-blue-500/30 relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
            </div>

            {/* --- SIDEBAR (Fixed Position Layer) --- */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-900/40 backdrop-blur-xl transition-all duration-300 transform",
                    isMobileMenuOpen ? "translate-x-0 w-80" : "-translate-x-full lg:translate-x-0 shadow-2xl lg:shadow-none",
                    isSidebarCollapsed ? "lg:w-20" : "lg:w-80"
                )}
            >
                {/* Mobile Drawer Header */}
                <div className="lg:hidden flex items-center justify-between p-6 border-b border-slate-800/50">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Navigation Hub</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl hover:bg-slate-800">
                        <X className="h-6 w-6 text-slate-400" />
                    </Button>
                </div>

                <div className={cn("hidden lg:flex items-center border-b border-slate-800/50 h-24 overflow-hidden", isSidebarCollapsed ? "justify-center p-0" : "p-8 gap-4")}>
                    <div className="bg-gradient-to-tr from-blue-600 to-cyan-400 p-2.5 rounded-2xl text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] ring-1 ring-white/10 shrink-0">
                        <Anchor className="h-6 w-6" />
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                            <span className="font-black text-2xl text-white tracking-tighter leading-none">Fish<span className="text-blue-500">tory</span></span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1">Admin Dashboard</span>
                        </div>
                    )}
                </div>

                <nav className={cn("flex-1 px-5 py-2 space-y-1.5 overflow-y-auto custom-scrollbar", isSidebarCollapsed ? "lg:px-2" : "lg:p-5")}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id)
                                setIsMobileMenuOpen(false)
                            }}
                            className={cn(
                                "w-full flex items-center rounded-2xl transition-all group relative overflow-hidden",
                                isSidebarCollapsed ? "lg:justify-center p-3" : "gap-3 p-3.5",
                                activeTab === item.id
                                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-[1.02] border border-blue-500/50"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 shrink-0 transition-all duration-300",
                                activeTab === item.id ? "text-white" : "group-hover:scale-110",
                                !isSidebarCollapsed && "mr-1"
                            )} />
                            {(!isSidebarCollapsed || isMobileMenuOpen) && (
                                <div className="flex flex-col items-start animate-in fade-in slide-in-from-left-4 duration-500 overflow-hidden text-left leading-tight">
                                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                    <span className={cn(
                                        "text-[10px] font-medium opacity-60 whitespace-nowrap",
                                        activeTab === item.id ? "text-blue-50" : "text-slate-400"
                                    )}>{item.description}</span>
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className={cn("p-4 border-t border-slate-800/50 space-y-4 bg-slate-950/40 shrink-0", isSidebarCollapsed ? "lg:px-2" : "lg:p-6")}>
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className={cn(
                            "hidden lg:flex w-full items-center rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group border border-transparent hover:border-slate-700",
                            isSidebarCollapsed ? "justify-center p-3" : "gap-3 p-3.5"
                        )}
                    >
                        {isSidebarCollapsed ? <ChevronRight className="h-5 w-5 mx-auto transition-transform group-hover:translate-x-1" /> : (
                            <>
                                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                <span className="text-sm font-bold tracking-tight">Collapse View</span>
                            </>
                        )}
                    </button>

                    <div className="flex flex-col gap-4">
                        <div className={cn("flex items-center", isSidebarCollapsed && !isMobileMenuOpen ? "lg:justify-center" : "gap-3 px-1")}>
                            <UserProfile />
                            {(!isSidebarCollapsed || isMobileMenuOpen) && (
                                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 overflow-hidden truncate">
                                    <span className="text-sm font-bold text-white leading-none truncate underline decoration-blue-500/20 underline-offset-4">Admin Profile</span>
                                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black truncate">SETTINGS HUB</span>
                                </div>
                            )}
                        </div>

                        <Button
                            variant={isSidebarCollapsed && !isMobileMenuOpen ? "ghost" : "outline"}
                            className={cn(
                                "w-full rounded-2xl font-bold flex items-center justify-center transition-all group overflow-hidden",
                                isSidebarCollapsed && !isMobileMenuOpen
                                    ? "h-11 w-11 mx-auto text-red-500 hover:bg-red-500/10 p-0"
                                    : "h-12 gap-2 border-red-900/20 bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 px-4"
                            )}
                            onClick={async () => {
                                try {
                                    await supabase.auth.signOut()
                                } catch (error) {
                                    console.error("Logout error:", error)
                                } finally {
                                    router.push('/')
                                }
                            }}
                        >
                            <LogOut className={cn("transition-transform group-hover:-translate-x-1 shrink-0", isSidebarCollapsed && !isMobileMenuOpen ? "h-5 w-5" : "h-4 w-4")} />
                            {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="truncate">Sign Out</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* --- MOBILE NAV --- */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-40 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-blue-600 to-cyan-400 p-2.5 rounded-2xl text-white shadow-lg">
                        <Anchor className="h-5 w-5" />
                    </div>
                    <span className="font-black text-xl text-white tracking-tighter leading-none">Fish<span className="text-blue-500">tory</span></span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="rounded-xl hover:bg-slate-800 text-slate-300">
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* --- MAIN CONTENT --- */}
            <main 
                className={cn(
                    "flex-1 overflow-y-auto pt-24 lg:pt-0 relative z-10 transition-all duration-300",
                    isSidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
                )}
            >
                <div className={cn(
                    "w-full mx-auto p-4 sm:p-6 lg:p-12 space-y-10 animate-in fade-in duration-700 min-h-full max-w-[1600px]"
                )}>
                    {/* Page Header & Actions */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                    {navItems.find(i => i.id === activeTab)?.label}
                                </h1>
                                <p className="text-slate-400 font-medium italic opacity-70 border-l-2 border-blue-500/30 pl-4">
                                    {navItems.find(i => i.id === activeTab)?.description}
                                </p>
                            </div>

                            {(reportSearchQuery || monthFilter !== "all") && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setReportSearchQuery("")
                                        setMonthFilter("all")
                                    }}
                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl font-bold group"
                                >
                                    <X className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" /> Clear Filters
                                </Button>
                            )}
                        </div>

                        {/* Stats Overview */}
                        {activeTab === "reports" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 hover:border-blue-500 transition-all cursor-pointer group shadow-xl">
                                            <CardHeader className="pb-2">
                                                <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Catch</CardDescription>
                                                <CardTitle className="text-3xl font-black text-blue-500 group-hover:scale-105 transition-transform">{totalCatch.toLocaleString()} kg</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">CLICK TO VIEW BREAKDOWN <ChevronRight className="h-3 w-3" /></p>
                                            </CardContent>
                                        </Card>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2 text-2xl font-black"><Fish className="text-blue-500" /> Species Breakdown</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
                                            <Table>
                                                <TableHeader className="bg-slate-900/50">
                                                    <TableRow className="border-slate-800">
                                                        <TableHead className="text-slate-400 uppercase font-bold text-[10px]">Species</TableHead>
                                                        <TableHead className="text-right text-slate-400 uppercase font-bold text-[10px]">Weight</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {speciesBreakdown.map((item) => (
                                                        <TableRow key={item.species} className="border-slate-800 hover:bg-slate-900/30">
                                                            <TableCell className="capitalize font-bold text-slate-300">{item.species}</TableCell>
                                                            <TableCell className="text-right font-black text-blue-400">{item.weight} kg</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-xl">
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Fishermen</CardDescription>
                                        <CardTitle className="text-3xl font-black text-white">{uniqueFishermen}</CardTitle>
                                    </CardHeader>
                                    <CardContent><p className="text-[10px] text-slate-500 font-bold italic">ACTIVE CONTRIBUTORS</p></CardContent>
                                </Card>

                                <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-xl border-amber-900/30">
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-amber-500 font-bold uppercase tracking-widest text-[10px]">Pending</CardDescription>
                                        <CardTitle className="text-3xl font-black text-amber-500">{pendingCount}</CardTitle>
                                    </CardHeader>
                                    <CardContent><p className="text-[10px] text-amber-600 font-bold italic">AWAITING REVIEW</p></CardContent>
                                </Card>

                                <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-xl border-emerald-900/30">
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-emerald-500 font-bold uppercase tracking-widest text-[10px]">Integrity</CardDescription>
                                        <CardTitle className="text-3xl font-black text-emerald-500">100%</CardTitle>
                                    </CardHeader>
                                    <CardContent><p className="text-[10px] text-emerald-600 font-bold italic">DATA VALIDATED</p></CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === "reports" && (
                            <div className="bg-slate-900/40 backdrop-blur-3xl p-2 rounded-[2rem] border border-slate-800/40 flex flex-wrap items-stretch gap-1.5 animate-in slide-in-from-top-8 duration-1000 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] w-full overflow-hidden group/toolbar hover:border-slate-700/50 transition-all">
                                {/* Search Section */}
                                <div className="flex-1 min-w-[280px] grid gap-1 px-5 py-2.5 bg-slate-950/20 rounded-[1.5rem] border border-transparent hover:border-slate-800/50 transition-all">
                                    <Label className="text-[9px] uppercase font-black text-slate-500 flex items-center gap-2 tracking-[0.2em] opacity-80">
                                        <Search className="w-3 h-3 text-blue-500" /> SEARCH ENGINE
                                    </Label>
                                    <Input
                                        placeholder="Species, Boat or Fisherman identity..."
                                        value={reportSearchQuery}
                                        onChange={(e) => setReportSearchQuery(e.target.value)}
                                        className="h-8 bg-transparent border-none p-0 rounded-none w-full text-xs font-bold text-slate-100 placeholder:text-slate-700 focus:ring-0 transition-all outline-none"
                                    />
                                </div>

                                <div className="h-12 w-[1px] bg-slate-800/20 hidden xl:block self-center"></div>

                                {/* Month Section */}
                                <div className="grid gap-1 px-5 py-2.5 bg-slate-950/20 rounded-[1.5rem] border border-transparent hover:border-slate-800/50 transition-all min-w-[180px]">
                                    <Label className="text-[9px] uppercase font-black text-slate-500 flex items-center gap-2 tracking-[0.2em] opacity-80">
                                        <Calendar className="w-3 h-3 text-blue-500" /> TEMPORAL FILTER
                                    </Label>
                                    <select
                                        value={monthFilter}
                                        onChange={(e) => setMonthFilter(e.target.value)}
                                        className="h-8 bg-transparent border-none text-xs font-bold text-slate-100 outline-none cursor-pointer appearance-none w-full"
                                    >
                                        <option value="all">All Historical Records</option>
                                        {availableMonths.map(m => (
                                            <option key={m} value={m} className="bg-slate-900">{new Date(m + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="h-12 w-[1px] bg-slate-800/20 hidden xl:block self-center"></div>

                                {/* Download Component Integration */}
                                <div className="flex-none flex items-center">
                                    <DownloadReportsButton />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tab Content Rendering */}
                    <div className="w-full">
                        {activeTab === "reports" && (
                            <Card className="border-none bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
                                <CardHeader className="p-10 border-b border-slate-800/50 bg-slate-950/20">
                                    <CardTitle className="text-3xl font-black text-white tracking-tight">Incoming Submissions</CardTitle>
                                    <CardDescription className="text-slate-300 font-medium">Live feed of catch reports from the field.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-950/50 border-b border-slate-800">
                                            <TableRow className="hover:bg-transparent border-slate-800">
                                                <TableHead className="px-8 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('created_at')}>
                                                    <div className="flex items-center gap-2">Date {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                                                </TableHead>
                                                <TableHead className="px-8 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('fisherman')}>
                                                    <div className="flex items-center gap-2">Fisherman {sortConfig.key === 'fisherman' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                                                </TableHead>
                                                <TableHead className="px-8 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('species')}>
                                                    <div className="flex items-center gap-2">Species {sortConfig.key === 'species' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                                                </TableHead>
                                                <TableHead className="px-8 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('weight_kg')}>
                                                    <div className="flex items-center gap-2">Weight {sortConfig.key === 'weight_kg' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                                                </TableHead>
                                                <TableHead className="px-8 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                                                <TableHead className="px-8 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow><TableCell colSpan={6} className="text-center py-20 text-slate-500 italic">Synchronizing reports...</TableCell></TableRow>
                                            ) : sortedAndFilteredReports.length === 0 ? (
                                                <TableRow><TableCell colSpan={6} className="text-center py-20 text-slate-500">No records found matching your filters.</TableCell></TableRow>
                                            ) : (
                                                sortedAndFilteredReports.map((report) => (
                                                    <TableRow key={report.id} className="border-slate-800/50 group hover:bg-slate-800/30 transition-all">
                                                        <TableCell className="px-8 py-5 text-sm font-medium text-slate-400">
                                                            {new Date(report.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="px-8 py-5 font-bold text-white">
                                                            {fishermenMap[report.user_id]
                                                                ? `${fishermenMap[report.user_id].last_name}, ${fishermenMap[report.user_id].first_name}`
                                                                : report.fisherman_id || '—'}
                                                        </TableCell>
                                                         <TableCell className="px-8 py-5 capitalize text-slate-300 font-semibold">
                                                             {report.species_id 
                                                                 ? (fishSpeciesMap[report.species_id] || report.species || '—')
                                                                 : (report.species || '—')}
                                                         </TableCell>
                                                        <TableCell className="px-8 py-5">
                                                            <span className="font-black text-blue-400">{report.weight_kg}</span>
                                                            <span className="text-[10px] ml-1 font-bold opacity-40">KG</span>
                                                        </TableCell>
                                                        <TableCell className="px-8 py-5">
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                                report.status === 'approved' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                                    report.status === 'rejected' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                                                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                            )}>
                                                                <div className={cn("h-1.5 w-1.5 rounded-full",
                                                                    report.status === 'approved' ? "bg-emerald-400" :
                                                                        report.status === 'rejected' ? "bg-rose-400" : "bg-amber-400 animate-pulse"
                                                                )} />
                                                                {report.status}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-8 py-5">
                                                            <div className="flex gap-2">
                                                                {report.status === 'pending' && (
                                                                    <>
                                                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8 font-bold px-4 rounded-lg" onClick={() => handleUpdateStatus(report.id, 'approved')}>Approve</Button>
                                                                        <Button size="sm" variant="ghost" className="h-8 text-rose-400 hover:bg-rose-500/10 font-bold px-4 rounded-lg" onClick={() => handleUpdateStatus(report.id, 'rejected')}>Reject</Button>
                                                                    </>
                                                                )}
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-rose-500" onClick={() => setReportToDelete(report.id)}><Trash2 className="h-4 w-4" /></Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === "map" && <CatchMap reports={reports} />}
                        {activeTab === "analytics" && <AnalyticsView reports={reports} socioEconomicData={socioEconomicData} />}
                        {activeTab === "fishermen" && <FishermanRegistry />}
                        {activeTab === "communications" && (
                            user ? <ChatAndBroadcasts currentUser={{ id: user.id, name: user.user_metadata?.first_name || 'Admin', role: 'admin' }} role="admin" /> : <div>Authenticating...</div>
                        )}
                        {activeTab === "public_hub" && <PublicHubManagement />}
                        {activeTab === "socio_economic" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-1 bg-blue-600 w-12 rounded-full" />
                                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Fisherfolk Socio-Economic Monitoring Portal</h3>
                                </div>
                                <SocioEconomicExcelView />
                            </div>
                        )}

                        {activeTab === "staff" && (
                            <div className="space-y-8">
                                <div className="grid lg:grid-cols-12 gap-8">
                                    {/* Provision Form */}
                                    <div className="lg:col-span-5">
                                        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
                                            <CardHeader className="p-8 border-b border-slate-800/50 bg-slate-950/20">
                                                <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                                                    <UserPlus className="text-blue-500" /> Provision Staff
                                                </CardTitle>
                                                <CardDescription className="text-slate-300 font-medium">Grant field access to municipal data collectors.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {createdStaffCreds && (
                                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6 animate-in zoom-in space-y-4">
                                                        <div className="flex items-center gap-2 text-blue-400 font-black text-sm uppercase"><CheckCircle2 className="h-5 w-5" /> Account Ready</div>
                                                        <div className="space-y-2 font-mono text-[11px] bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                                            <div className="flex justify-between border-b border-white/5 pb-2"><span className="opacity-50 uppercase">Email:</span> <span>{createdStaffCreds.email}</span></div>
                                                            <div className="flex justify-between border-b border-white/5 py-2"><span className="opacity-50 uppercase">Password:</span> <span className="font-bold text-white">{createdStaffCreds.pass}</span></div>
                                                            <div className="flex justify-between pt-2"><span className="opacity-50 uppercase">Staff ID:</span> <span>{createdStaffCreds.id}</span></div>
                                                        </div>
                                                        <Button className="w-full bg-blue-600 hover:bg-blue-500 font-bold" onClick={() => {
                                                            navigator.clipboard.writeText(`Email: ${createdStaffCreds.email}\nPass: ${createdStaffCreds.pass}\nID: ${createdStaffCreds.id}`)
                                                            toast.success("Credentials Copied")
                                                        }}>Copy Information</Button>
                                                    </div>
                                                )}
                                                <form onSubmit={handleCreateStaff} className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">First Name</Label>
                                                            <Input className="bg-slate-950/50 border-slate-800 rounded-xl h-12 focus:ring-blue-600 focus:ring-offset-0" placeholder="Maria" value={staffForm.firstName} onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })} required />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Last Name</Label>
                                                            <Input className="bg-slate-950/50 border-slate-800 rounded-xl h-12 focus:ring-blue-600 focus:ring-offset-0" placeholder="Clara" value={staffForm.lastName} onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })} required />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Registration Email</Label>
                                                        <Input className="bg-slate-950/50 border-slate-800 rounded-xl h-12" type="email" placeholder="m.clara@office.gov" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} required />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Staff ID</Label>
                                                            <Input className="bg-slate-950/50 border-slate-800 rounded-xl h-12" placeholder="STAFF01" value={staffForm.staffId} onChange={(e) => setStaffForm({ ...staffForm, staffId: e.target.value })} required />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Temp Pass</Label>
                                                            <Input className="bg-slate-950/50 border-slate-800 rounded-xl h-12" placeholder="Optional" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-500 font-black rounded-xl shadow-lg shadow-blue-900/20 mt-4 transition-all" disabled={creatingStaff}>
                                                        {creatingStaff ? <Loader2 className="animate-spin h-5 w-5" /> : "Authorize New Staff"}
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Staff List */}
                                    <div className="lg:col-span-7">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-black text-white flex items-center gap-3"><ShieldCheck className="text-emerald-500" /> Active Field Staff</h2>
                                            <Button variant="outline" size="sm" onClick={exportStaffPDF} disabled={isGeneratingStaffReport} className="bg-slate-900 border-slate-800 hover:bg-slate-800">
                                                {isGeneratingStaffReport ? <Loader2 className="animate-spin h-4 w-4" /> : <Download className="h-4 w-4 mr-2" />}
                                                Export Performance
                                            </Button>
                                        </div>
                                        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="flex items-center p-6 border-b border-slate-800 gap-3">
                                                    <Search className="h-4 w-4 text-slate-500" />
                                                    <input className="bg-transparent border-none text-sm focus:ring-0 w-full placeholder:text-slate-600 text-slate-200" placeholder="Search staff registry..." value={staffSearchQuery} onChange={(e) => setStaffSearchQuery(e.target.value)} />
                                                </div>
                                                <Table>
                                                    <TableHeader className="bg-slate-950/30">
                                                        <TableRow className="border-slate-800">
                                                            <TableHead className="px-6 text-[10px] font-bold text-slate-500 uppercase">Identity</TableHead>
                                                            <TableHead className="px-6 text-[10px] font-bold text-slate-500 uppercase">Email</TableHead>
                                                            <TableHead className="px-6 text-[10px] font-bold text-slate-500 text-right uppercase">Records</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {staffCounts.filter(s => s.fullName.toLowerCase().includes(staffSearchQuery.toLowerCase()) || s.name.toLowerCase().includes(staffSearchQuery.toLowerCase())).map(staff => (
                                                            <TableRow key={staff.id} className="border-slate-800/40 hover:bg-slate-800/20">
                                                                <TableCell className="px-6 py-4">
                                                                    <div className="font-bold text-slate-200">{staff.fullName}</div>
                                                                    <div className="text-[10px] text-blue-500 font-black">{staff.name}</div>
                                                                </TableCell>
                                                                <TableCell className="px-6 py-4 text-xs font-medium text-slate-400">{staff.email}</TableCell>
                                                                <TableCell className="px-6 py-4 text-right font-black text-white">{staff.count}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Delete Alert */}
            <AlertDialog open={!!reportToDelete} onOpenChange={(open) => { if (!open) setReportToDelete(null) }}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Catch Record?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">This action is permanent and will remove the fisherman's log from the system.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="bg-slate-800 border-none hover:bg-slate-700 rounded-xl" disabled={deletingReport}>Abort</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteReport} className="bg-rose-600 hover:bg-rose-500 rounded-xl font-black" disabled={deletingReport}>Confirm Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Hidden PDF Container */}
            <div className="fixed -z-50 opacity-0 pointer-events-none top-0 left-0">
                <div id="staff-pdf-container" className="bg-white text-black font-sans p-20 w-[1000px]">
                    <div className="border-b-4 border-black pb-8 mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter">Staff Efficiency Report</h1>
                            <p className="text-sm font-bold opacity-60">Regional Fisheries Management Info System</p>
                        </div>
                        <div className="text-right font-mono text-sm">{new Date().toLocaleDateString()}</div>
                    </div>
                    <div className="mb-12">
                        <h3 className="text-lg font-black uppercase mb-4">Metric Summary</h3>
                        <p className="text-sm leading-relaxed text-justify opacity-80">
                            The following data represents the total number of fishermen profiles registered by municipal staff members.
                            These metrics contribute to the overall audit of field engagement and area coverage effectiveness.
                        </p>
                    </div>
                    <div className="border-2 border-black rounded-xl overflow-hidden">
                        <div className="flex bg-black text-white p-4 font-black uppercase text-xs">
                            <div className="flex-1">Staff Member</div>
                            <div className="flex-1">Corporate ID</div>
                            <div className="w-40 text-right">Data Points</div>
                        </div>
                        {staffCounts.map((staff, idx) => (
                            <div key={staff.id} className={cn("flex p-4 text-sm font-bold", idx % 2 === 0 ? "bg-slate-50" : "bg-white", idx !== staffCounts.length - 1 && "border-b border-black/10")}>
                                <div className="flex-1">{staff.fullName}</div>
                                <div className="flex-1 font-mono">{staff.name}</div>
                                <div className="w-40 text-right">{staff.count} Profiles</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-20 pt-10 border-t border-black/10 text-center text-[10px] uppercase font-black opacity-30 italic">
                        Secured Document - Generated via Fishtory Cloud Instance
                    </div>
                </div>
            </div>
        </div>
    )
}