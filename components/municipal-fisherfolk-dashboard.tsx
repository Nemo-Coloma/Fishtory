"use client"

import React, { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Anchor,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Megaphone,
  MessageSquare,
  Users,
  Fish,
  Settings,
  Ship,
  MapPin,
  TrendingUp,
  FileText,
  X,
  Send,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Database,
  BarChart3,
  RefreshCw,
} from "lucide-react"

// Types
interface StaffProfile {
  id: string
  user_id: string
  staff_id: string
  full_name: string
  role: string
  email: string
}

interface Fisherman {
  id: string
  fisherman_id: string
  first_name: string
  last_name: string
  boat_name: string
  vessel_type?: string
  vessel_type_id?: string
  location: string
  location_id?: string
  phone_number: string
  fishing_gear?: string
  fishing_gear_id?: string
  total_boats_operated?: number
  total_crew?: number
  lean_months?: string
  lean_daily_avg_catch?: number
  peak_months?: string
  peak_daily_avg_catch?: number
  created_at?: string
}

interface CatchReport {
  id: string
  fisherman_id: string
  fisherman_name?: string
  species: string
  species_id?: string
  weight_kg: number
  landing_center: string
  location_id?: string
  processing_method: string
  processing_method_id?: string
  vessel_type?: string
  status: "pending" | "approved" | "rejected" | string
  created_at: string
}

interface LookupItem {
  id: string
  name_en: string
  name_tl?: string
  description?: string
  category?: string
  motorized?: boolean
  location?: string
  municipality?: string
}

interface Broadcast {
  id: string
  content: string
  sender_name?: string
  sender_role?: string
  created_at: string
}

interface Message {
  id: string
  sender_name: string
  sender_role: string
  content: string
  created_at: string
}

// Fallback Initial Data for seamless demo experience
const MOCK_FISHERMEN: Fisherman[] = [
  {
    id: "f-101",
    fisherman_id: "FM-2026-001",
    first_name: "Juan",
    last_name: "Dela Cruz",
    boat_name: "M/B Esperanza",
    vessel_type: "Motorized Boat",
    location: "Banicain Port",
    phone_number: "0917-123-4567",
    fishing_gear: "Gill Net (Pantukos)",
    total_boats_operated: 2,
    total_crew: 4,
    lean_months: "Nov - Feb",
    lean_daily_avg_catch: 18.5,
    peak_months: "May - Aug",
    peak_daily_avg_catch: 64.2,
    created_at: new Date().toISOString(),
  },
  {
    id: "f-102",
    fisherman_id: "FM-2026-002",
    first_name: "Pedro",
    last_name: "Santos",
    boat_name: "M/B Sea Breeze",
    vessel_type: "Motorized Boat",
    location: "Barretto Port",
    phone_number: "0918-987-6543",
    fishing_gear: "Hook and Line (Pancing)",
    total_boats_operated: 1,
    total_crew: 2,
    lean_months: "Dec - Mar",
    lean_daily_avg_catch: 14.0,
    peak_months: "Jun - Sep",
    peak_daily_avg_catch: 52.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "f-103",
    fisherman_id: "FM-2026-003",
    first_name: "Maria",
    last_name: "Reyes",
    boat_name: "M/B Isla Maria",
    vessel_type: "Non-Motorized Boat",
    location: "Kalaklan Port",
    phone_number: "0920-555-1234",
    fishing_gear: "Trap (Bubo)",
    total_boats_operated: 1,
    total_crew: 1,
    lean_months: "Oct - Jan",
    lean_daily_avg_catch: 8.2,
    peak_months: "Apr - Jul",
    peak_daily_avg_catch: 31.8,
    created_at: new Date().toISOString(),
  },
  {
    id: "f-104",
    fisherman_id: "FM-2026-004",
    first_name: "Antonio",
    last_name: "Bautista",
    boat_name: "M/B Ocean Voyager",
    vessel_type: "Large Fishing Vessel",
    location: "Olongapo City Fish Port",
    phone_number: "0999-444-8888",
    fishing_gear: "Seine Net (Pukot)",
    total_boats_operated: 3,
    total_crew: 8,
    lean_months: "Nov - Jan",
    lean_daily_avg_catch: 45.0,
    peak_months: "May - Sep",
    peak_daily_avg_catch: 185.0,
    created_at: new Date().toISOString(),
  },
]

const MOCK_REPORTS: CatchReport[] = [
  {
    id: "r-1",
    fisherman_id: "FM-2026-001",
    fisherman_name: "Juan Dela Cruz",
    species: "Milkfish (Bangus)",
    weight_kg: 145.5,
    landing_center: "Banicain Port",
    processing_method: "Fresh (Sariwa)",
    vessel_type: "Motorized Boat",
    status: "approved",
    created_at: new Date().toISOString(),
  },
  {
    id: "r-2",
    fisherman_id: "FM-2026-002",
    fisherman_name: "Pedro Santos",
    species: "Grouper (Lapu-lapu)",
    weight_kg: 42.0,
    landing_center: "Barretto Port",
    processing_method: "Fresh (Sariwa)",
    vessel_type: "Motorized Boat",
    status: "pending",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "r-3",
    fisherman_id: "FM-2026-003",
    fisherman_name: "Maria Reyes",
    species: "Tilapia (Tilapia)",
    weight_kg: 28.0,
    landing_center: "Kalaklan Port",
    processing_method: "Smoked (Tinapa)",
    vessel_type: "Non-Motorized Boat",
    status: "approved",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "r-4",
    fisherman_id: "FM-2026-004",
    fisherman_name: "Antonio Bautista",
    species: "Tuna (Tuna)",
    weight_kg: 320.0,
    landing_center: "Olongapo City Fish Port",
    processing_method: "Fresh (Sariwa)",
    vessel_type: "Large Fishing Vessel",
    status: "pending",
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
]

const INITIAL_SPECIES: LookupItem[] = [
  { id: "s-1", name_en: "Milkfish", name_tl: "Bangus", category: "Coastal" },
  { id: "s-2", name_en: "Tilapia", name_tl: "Tilapia", category: "Inland" },
  { id: "s-3", name_en: "Grouper", name_tl: "Lapu-lapu", category: "Reef" },
  { id: "s-4", name_en: "Tuna", name_tl: "Tuna / Tulingan", category: "Deep Sea" },
  { id: "s-5", name_en: "Sardines", name_tl: "Sardinas / Tamban", category: "Small Pelagic" },
  { id: "s-6", name_en: "Anchovies", name_tl: "Dilis", category: "Small Pelagic" },
]

const INITIAL_GEARS: LookupItem[] = [
  { id: "g-1", name_en: "Gill Net", name_tl: "Pantukos", description: "Entangling net suspended in water" },
  { id: "g-2", name_en: "Trap", name_tl: "Bubo", description: "Traditional bamboo fish trap" },
  { id: "g-3", name_en: "Hook and Line", name_tl: "Pancing", description: "Handline fishing gear" },
  { id: "g-4", name_en: "Seine Net", name_tl: "Pukot", description: "Surrounding net pulled by boats" },
]

const INITIAL_VESSELS: LookupItem[] = [
  { id: "v-1", name_en: "Motorized Boat", name_tl: "Bangka na may makina", motorized: true },
  { id: "v-2", name_en: "Non-Motorized Boat", name_tl: "Bangka na walang makina", motorized: false },
  { id: "v-3", name_en: "Large Fishing Vessel", name_tl: "Malaking barko ng isda", motorized: true },
]

const INITIAL_METHODS: LookupItem[] = [
  { id: "m-1", name_en: "Fresh", name_tl: "Sariwa", description: "Raw whole or gutted fish" },
  { id: "m-2", name_en: "Smoked", name_tl: "Tinapa", description: "Heat and wood smoked" },
  { id: "m-3", name_en: "Dried", name_tl: "Tuyo / Daing", description: "Sun-dried and salted" },
  { id: "m-4", name_en: "Salted", name_tl: "Buro / Asin", description: "Brine or dry salted" },
]

export function MunicipalFisherfolkDashboard() {
  // Navigation State
  const [activeModule, setActiveModule] = useState<"registry" | "reports" | "reference" | "communications">("registry")

  // Staff Profile State
  const [staffProfile, setStaffProfile] = useState<StaffProfile>({
    id: "sp-1",
    user_id: "u-1",
    staff_id: "STAFF-01",
    full_name: "Municipal Fisheries Officer",
    role: "Admin Officer",
    email: "fisheries@municipal.gov.ph",
  })

  // Data States
  const [fishermen, setFishermen] = useState<Fisherman[]>(MOCK_FISHERMEN)
  const [catchReports, setCatchReports] = useState<CatchReport[]>(MOCK_REPORTS)
  const [speciesList, setSpeciesList] = useState<LookupItem[]>(INITIAL_SPECIES)
  const [gearsList, setGearsList] = useState<LookupItem[]>(INITIAL_GEARS)
  const [vesselsList, setVesselsList] = useState<LookupItem[]>(INITIAL_VESSELS)
  const [methodsList, setMethodsList] = useState<LookupItem[]>(INITIAL_METHODS)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([
    {
      id: "b-1",
      content: "Gale Warning Issued: All small craft vessels advised not to venture out to sea due to rough waters.",
      sender_name: "Municipal Fisheries Office",
      sender_role: "System Admin",
      created_at: new Date().toISOString(),
    },
  ])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender_name: "Staff Admin",
      sender_role: "Inspector",
      content: "Banicain Port inspection complete. All daily catch logs verified.",
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ])

  // UI Drawer & Modal States
  const [selectedFisherman, setSelectedFisherman] = useState<Fisherman | null>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false)
  const [isBroadcastDrawerOpen, setIsBroadcastDrawerOpen] = useState(false)
  const [isAddFishermanOpen, setIsAddFishermanOpen] = useState(false)

  // Filters & Search
  const [registrySearch, setRegistrySearch] = useState("")
  const [catchStatusFilter, setCatchStatusFilter] = useState<string>("all")
  const [catchVesselFilter, setCatchVesselFilter] = useState<string>("all")
  const [catchLocationFilter, setCatchLocationFilter] = useState<string>("all")

  // Form Inputs
  const [newReport, setNewReport] = useState({
    fisherman_id: "",
    species: "",
    weight_kg: "",
    landing_center: "Banicain Port",
    processing_method: "Fresh (Sariwa)",
    status: "pending",
  })

  const [newBroadcastText, setNewBroadcastText] = useState("")
  const [newMessageText, setNewMessageText] = useState("")
  const [loading, setLoading] = useState(false)

  // Ref Data Add Form State
  const [refCategory, setRefCategory] = useState<"species" | "gears" | "vessels" | "methods">("species")
  const [newRefItem, setNewRefItem] = useState({ name_en: "", name_tl: "", description: "" })

  // Fetch Supabase Data on Mount
  useEffect(() => {
    async function loadDatabaseData() {
      setLoading(true)
      try {
        // Fetch Staff Profile
        const { data: staffData } = await supabase.from("staff_profiles").select("*").limit(1).single()
        if (staffData) setStaffProfile(staffData)

        // Fetch Fishermen
        const { data: fishData } = await supabase.from("fisherman_registration").select("*").order("created_at", { ascending: false })
        if (fishData && fishData.length > 0) {
          setFishermen(fishData.map((f: any) => ({
            id: f.id,
            fisherman_id: f.fisherman_id || `FM-${f.id.slice(0, 6)}`,
            first_name: f.first_name || "",
            last_name: f.last_name || "",
            boat_name: f.boat_name || "N/A",
            vessel_type: f.vessel_type || "Motorized Boat",
            location: f.location || "Banicain Port",
            phone_number: f.phone_number || "—",
            total_boats_operated: f.total_boats_operated || 1,
            total_crew: f.total_crew || 1,
            lean_months: f.lean_months || "Nov - Feb",
            lean_daily_avg_catch: Number(f.lean_daily_avg_catch) || 15.0,
            peak_months: f.peak_months || "May - Aug",
            peak_daily_avg_catch: Number(f.peak_daily_avg_catch) || 58.0,
            created_at: f.created_at,
          })))
        }

        // Fetch Catch Reports
        const { data: repData } = await supabase.from("reports").select("*").order("created_at", { ascending: false })
        if (repData && repData.length > 0) {
          setCatchReports(repData.map((r: any) => ({
            id: r.id,
            fisherman_id: r.fisherman_id || "FM-UNKNOWN",
            fisherman_name: r.boat_name || "Municipal Fisherman",
            species: r.species || "Milkfish (Bangus)",
            weight_kg: Number(r.weight_kg) || 0,
            landing_center: r.location || "Banicain Port",
            processing_method: r.processing_method || "Fresh (Sariwa)",
            vessel_type: r.vessel_type || "Motorized Boat",
            status: r.status || "pending",
            created_at: r.created_at,
          })))
        }

        // Fetch Reference Lookup Tables
        const { data: speciesD } = await supabase.from("fish_species").select("*")
        if (speciesD && speciesD.length > 0) setSpeciesList(speciesD)

        const { data: gearsD } = await supabase.from("fishing_gears").select("*")
        if (gearsD && gearsD.length > 0) setGearsList(gearsD)

        const { data: vesselsD } = await supabase.from("fishing_vessels").select("*")
        if (vesselsD && vesselsD.length > 0) setVesselsList(vesselsD)

        const { data: methodsD } = await supabase.from("processing_methods").select("*")
        if (methodsD && methodsD.length > 0) setMethodsList(methodsD)

        // Fetch Broadcasts & Messages
        const { data: bData } = await supabase.from("broadcasts").select("*").order("created_at", { ascending: false })
        if (bData && bData.length > 0) setBroadcasts(bData)

        const { data: mData } = await supabase.from("messages").select("*").order("created_at", { ascending: false })
        if (mData && mData.length > 0) setMessages(mData)
      } catch (err) {
        console.warn("Using fallback demo dataset:", err)
      } finally {
        setLoading(false)
      }
    }

    loadDatabaseData()
  }, [])

  // Filtered Fishermen Registry
  const filteredFishermen = useMemo(() => {
    if (!registrySearch.trim()) return fishermen
    const q = registrySearch.toLowerCase()
    return fishermen.filter(
      (f) =>
        f.fisherman_id.toLowerCase().includes(q) ||
        `${f.first_name} ${f.last_name}`.toLowerCase().includes(q) ||
        f.boat_name.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q)
    )
  }, [fishermen, registrySearch])

  // Filtered Catch Log Stream
  const filteredCatchReports = useMemo(() => {
    return catchReports.filter((r) => {
      if (catchStatusFilter !== "all" && r.status !== catchStatusFilter) return false
      if (catchVesselFilter !== "all" && r.vessel_type !== catchVesselFilter) return false
      if (catchLocationFilter !== "all" && !r.landing_center.includes(catchLocationFilter)) return false
      return true
    })
  }, [catchReports, catchStatusFilter, catchVesselFilter, catchLocationFilter])

  // Handle Catch Submission
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReport.fisherman_id || !newReport.weight_kg || !newReport.species) {
      toast.error("Please fill in all required catch fields.")
      return
    }

    const createdReport: CatchReport = {
      id: `r-${Date.now()}`,
      fisherman_id: newReport.fisherman_id,
      fisherman_name: fishermen.find((f) => f.fisherman_id === newReport.fisherman_id)?.first_name || "Fisherman",
      species: newReport.species,
      weight_kg: parseFloat(newReport.weight_kg),
      landing_center: newReport.landing_center,
      processing_method: newReport.processing_method,
      vessel_type: "Motorized Boat",
      status: newReport.status,
      created_at: new Date().toISOString(),
    }

    // Try Supabase insert
    try {
      await supabase.from("reports").insert([
        {
          fisherman_id: newReport.fisherman_id,
          species: newReport.species,
          weight_kg: parseFloat(newReport.weight_kg),
          landing_center: newReport.landing_center,
          processing_method: newReport.processing_method,
          status: newReport.status,
        },
      ])
    } catch (err) {
      console.log("Locally saved report")
    }

    setCatchReports([createdReport, ...catchReports])
    setIsReportDrawerOpen(false)
    setNewReport({
      fisherman_id: "",
      species: "",
      weight_kg: "",
      landing_center: "Banicain Port",
      processing_method: "Fresh (Sariwa)",
      status: "pending",
    })
    toast.success("Daily catch harvest report logged successfully!")
  }

  // Handle Emergency Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBroadcastText.trim()) return

    const bItem: Broadcast = {
      id: `b-${Date.now()}`,
      content: newBroadcastText.trim(),
      sender_name: staffProfile.full_name,
      sender_role: staffProfile.role,
      created_at: new Date().toISOString(),
    }

    try {
      await supabase.from("broadcasts").insert([{ content: newBroadcastText.trim() }])
    } catch (err) {
      console.log("Locally added broadcast")
    }

    setBroadcasts([bItem, ...broadcasts])
    setNewBroadcastText("")
    toast.success("Emergency Announcement Broadcasted System-wide!")
  }

  // Handle Internal Messaging
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessageText.trim()) return

    const mItem: Message = {
      id: `msg-${Date.now()}`,
      sender_name: staffProfile.full_name,
      sender_role: staffProfile.role,
      content: newMessageText.trim(),
      created_at: new Date().toISOString(),
    }

    try {
      await supabase.from("messages").insert([
        {
          sender_name: staffProfile.full_name,
          sender_role: staffProfile.role,
          content: newMessageText.trim(),
        },
      ])
    } catch (err) {
      console.log("Locally added message")
    }

    setMessages([mItem, ...messages])
    setNewMessageText("")
    toast.success("Staff message dispatched.")
  }

  // Add Reference Item
  const handleAddReferenceItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRefItem.name_en.trim()) return

    const item: LookupItem = {
      id: `ref-${Date.now()}`,
      name_en: newRefItem.name_en.trim(),
      name_tl: newRefItem.name_tl.trim() || undefined,
      description: newRefItem.description.trim() || undefined,
    }

    if (refCategory === "species") setSpeciesList([...speciesList, item])
    else if (refCategory === "gears") setGearsList([...gearsList, item])
    else if (refCategory === "vessels") setVesselsList([...vesselsList, item])
    else if (refCategory === "methods") setMethodsList([...methodsList, item])

    setNewRefItem({ name_en: "", name_tl: "", description: "" })
    toast.success("Bilingual reference lookup updated.")
  }

  // Quick Stats Computations
  const totalApprovedWeight = useMemo(() => {
    return catchReports
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + r.weight_kg, 0)
  }, [catchReports])

  const pendingReportsCount = useMemo(() => {
    return catchReports.filter((r) => r.status === "pending").length
  }, [catchReports])

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#0284C7]/20 flex flex-col">
      {/* ========================================================================= */}
      {/* MODULE A: HEADER & MAIN NAVIGATION LAYOUT */}
      {/* ========================================================================= */}
      <header className="bg-[#1E3A8A] text-white shadow-md sticky top-0 z-40 border-b border-[#1E3A8A]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* System Branding Title */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-md ring-2 ring-white/20">
                <Anchor className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                  Municipal Fisherfolk & Catch Registry
                </h1>
                <p className="text-xs text-blue-200 font-medium tracking-wide">
                  Local Government Unit Fisheries & Agriculture Management
                </p>
              </div>
            </div>

            {/* Active Staff Role Indicator & Action Badges */}
            <div className="flex items-center gap-4">
              {/* Staff Profile Badge */}
              <div className="hidden sm:flex items-center gap-2.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight">{staffProfile.full_name}</span>
                  <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">{staffProfile.staff_id} ({staffProfile.role})</span>
                </div>
              </div>

              {/* Message Inbox Badge */}
              <button
                onClick={() => setActiveModule("communications")}
                className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 group"
                title="Staff Messages"
              >
                <MessageSquare className="w-5 h-5 text-blue-100 group-hover:scale-110 transition-transform" />
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0284C7] text-[10px] font-black text-white ring-2 ring-[#1E3A8A]">
                    {messages.length}
                  </span>
                )}
              </button>

              {/* Broadcast Trigger Button */}
              <button
                onClick={() => setIsBroadcastDrawerOpen(true)}
                className="relative flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border border-red-500/30"
              >
                <Megaphone className="w-4 h-4 animate-bounce" />
                <span className="hidden md:inline">Emergency Broadcast</span>
                {broadcasts.length > 0 && (
                  <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                    {broadcasts.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <nav className="flex space-x-1 border-t border-blue-900/50 py-2.5 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveModule("registry")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeModule === "registry"
                  ? "bg-[#0284C7] text-white shadow-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" /> Fisherfolk Registry
            </button>

            <button
              onClick={() => setActiveModule("reports")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeModule === "reports"
                  ? "bg-[#0284C7] text-white shadow-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Fish className="w-4 h-4" /> Daily Catch Reports
              {pendingReportsCount > 0 && (
                <span className="bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.2 text-[10px] font-black rounded-full">
                  {pendingReportsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveModule("reference")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeModule === "reference"
                  ? "bg-[#0284C7] text-white shadow-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Database className="w-4 h-4" /> System Reference Data
            </button>

            <button
              onClick={() => setActiveModule("communications")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeModule === "communications"
                  ? "bg-[#0284C7] text-white shadow-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Broadcast & Messaging
            </button>
          </nav>
        </div>
      </header>

      {/* Emergency Alert Banner (If Recent Broadcast Exists) */}
      {broadcasts.length > 0 && (
        <div className="bg-[#FEE2E2] border-b border-red-200 text-[#DC2626] px-4 py-2.5 shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2.5 truncate">
              <span className="inline-flex items-center gap-1 bg-[#DC2626] text-white px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase">
                <AlertTriangle className="w-3 h-3" /> OFFICIAL BROADCAST
              </span>
              <span className="truncate font-medium">{broadcasts[0].content}</span>
            </div>
            <span className="text-[10px] text-red-500 font-mono hidden md:inline ml-4 shrink-0">
              {new Date(broadcasts[0].created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Top Summary Metrics Cards (Highlighted in Deep Navy) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Card 1 */}
          <Card className="bg-white border border-[#E2E8F0] shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Fisherfolk</p>
                <h3 className="text-2xl font-bold text-[#1E3A8A] mt-1">{fishermen.length}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Active municipal licenses</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="bg-white border border-[#E2E8F0] shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Catch Harvest</p>
                <h3 className="text-2xl font-bold text-[#1E3A8A] mt-1">{totalApprovedWeight.toLocaleString()} <span className="text-sm font-semibold text-slate-500">kg</span></h3>
                <p className="text-[11px] text-[#059669] font-medium mt-0.5">Approved daily volume</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="bg-white border border-[#E2E8F0] shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Submissions</p>
                <h3 className="text-2xl font-bold text-[#D97706] mt-1">{pendingReportsCount}</h3>
                <p className="text-[11px] text-[#D97706] font-medium mt-0.5">Awaiting staff verification</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="bg-white border border-[#E2E8F0] shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Vessels</p>
                <h3 className="text-2xl font-bold text-[#1E3A8A] mt-1">
                  {fishermen.reduce((acc, f) => acc + (f.total_boats_operated || 1), 0)}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Registered municipal craft</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0284C7] flex items-center justify-center">
                <Ship className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* MODULE B: FISHERFOLK REGISTRY MANAGEMENT MODULE */}
        {/* ========================================================================= */}
        {activeModule === "registry" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#1E3A8A]">Fisherfolk Registry Directory</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Search and manage registered municipal fishermen profiles, boat vessels, and gear details.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by ID, Name, Boat or Port..."
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      className="pl-9 bg-slate-50 border-[#E2E8F0] text-xs h-9 focus:ring-[#0284C7]"
                    />
                  </div>

                  <Button
                    onClick={() => setIsAddFishermanOpen(true)}
                    className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold h-9 px-4 rounded-lg shadow-sm gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Fisherfolk
                  </Button>
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-lg border border-[#E2E8F0] overflow-hidden bg-white">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-[#E2E8F0]">
                    <TableRow>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Fisherman ID</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Full Name</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Boat Name</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Vessel Type</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Home Port Location</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Phone Number</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFishermen.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs font-medium">
                          No fisherfolk records found matching query.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFishermen.map((f) => (
                        <TableRow key={f.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="font-mono text-xs font-bold text-[#0284C7]">{f.fisherman_id}</TableCell>
                          <TableCell className="font-bold text-xs text-slate-800">
                            {f.first_name} {f.last_name}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-slate-600">{f.boat_name}</TableCell>
                          <TableCell className="text-xs text-slate-500">{f.vessel_type || "Motorized Boat"}</TableCell>
                          <TableCell className="text-xs text-slate-600 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {f.location}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-500">{f.phone_number}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFisherman(f)
                                setIsDetailDrawerOpen(true)
                              }}
                              className="text-xs font-bold text-[#0284C7] border-[#0284C7]/30 hover:bg-blue-50 h-8 rounded-md"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE C: DAILY CATCH & HARVEST REPORTING MODULE */}
        {/* ========================================================================= */}
        {activeModule === "reports" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#1E3A8A]">Daily Catch Harvest Reporting Stream</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Real-time catch submissions from municipal fishermen and landing ports.
                  </p>
                </div>

                <Button
                  onClick={() => setIsReportDrawerOpen(true)}
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold h-9 px-4 rounded-lg shadow-sm gap-2"
                >
                  <Plus className="w-4 h-4" /> Log Catch Submission
                </Button>
              </div>

              {/* Filter Chips Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Filters:
                </span>

                {/* Status Chips */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCatchStatusFilter("all")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      catchStatusFilter === "all"
                        ? "bg-[#1E3A8A] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All Status
                  </button>

                  <button
                    onClick={() => setCatchStatusFilter("pending")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      catchStatusFilter === "pending"
                        ? "bg-[#FEF3C7] text-[#D97706] ring-1 ring-[#D97706]"
                        : "bg-amber-50 text-[#D97706] hover:bg-amber-100"
                    }`}
                  >
                    Pending Verification
                  </button>

                  <button
                    onClick={() => setCatchStatusFilter("approved")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      catchStatusFilter === "approved"
                        ? "bg-[#D1FAE5] text-[#059669] ring-1 ring-[#059669]"
                        : "bg-emerald-50 text-[#059669] hover:bg-emerald-100"
                    }`}
                  >
                    Verified / Approved
                  </button>
                </div>

                {/* Vessel Type Chip Select */}
                <div className="ml-auto flex items-center gap-2">
                  <Select value={catchVesselFilter} onValueChange={setCatchVesselFilter}>
                    <SelectTrigger className="h-8 text-xs bg-slate-50 border-[#E2E8F0] w-44">
                      <SelectValue placeholder="Vessel Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vessel Types</SelectItem>
                      <SelectItem value="Motorized Boat">Motorized Boat</SelectItem>
                      <SelectItem value="Non-Motorized Boat">Non-Motorized Boat</SelectItem>
                      <SelectItem value="Large Fishing Vessel">Large Fishing Vessel</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={catchLocationFilter} onValueChange={setCatchLocationFilter}>
                    <SelectTrigger className="h-8 text-xs bg-slate-50 border-[#E2E8F0] w-48">
                      <SelectValue placeholder="Landing Center" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Landing Ports</SelectItem>
                      <SelectItem value="Banicain">Banicain Port</SelectItem>
                      <SelectItem value="Barretto">Barretto Port</SelectItem>
                      <SelectItem value="Kalaklan">Kalaklan Port</SelectItem>
                      <SelectItem value="Olongapo">Olongapo City Fish Port</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Catch Log Table */}
              <div className="rounded-lg border border-[#E2E8F0] overflow-hidden bg-white">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-[#E2E8F0]">
                    <TableRow>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Fisherman ID</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Fish Species</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Weight (kg)</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Landing Center</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Processing Method</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase">Submission Status</TableHead>
                      <TableHead className="text-xs font-bold text-[#1E3A8A] uppercase text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCatchReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs font-medium">
                          No catch submissions found for current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCatchReports.map((r) => (
                        <TableRow key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="font-mono text-xs font-bold text-[#0284C7]">{r.fisherman_id}</TableCell>
                          <TableCell className="font-bold text-xs text-slate-800">{r.species}</TableCell>
                          <TableCell className="font-black text-xs text-[#1E3A8A]">{r.weight_kg} kg</TableCell>
                          <TableCell className="text-xs text-slate-600">{r.landing_center}</TableCell>
                          <TableCell className="text-xs text-slate-500">{r.processing_method}</TableCell>
                          <TableCell>
                            {r.status === "approved" ? (
                              <span className="inline-flex items-center gap-1 bg-[#D1FAE5] text-[#059669] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#D97706] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                                <Clock className="w-3 h-3" /> Pending Review
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {r.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setCatchReports(
                                    catchReports.map((item) => (item.id === r.id ? { ...item, status: "approved" } : item))
                                  )
                                  toast.success(`Catch report #${r.fisherman_id} verified & approved!`)
                                }}
                                className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold h-7 px-3 rounded"
                              >
                                Approve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE D: SYSTEM REFERENCE DATA MANAGEMENT MODULE */}
        {/* ========================================================================= */}
        {activeModule === "reference" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-[#1E3A8A]">Bilingual Lookup Tables & System Reference Data</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Manage standardized bilingual (English / Tagalog) reference data across all municipal catch reporting forms.
                </p>
              </div>

              {/* Add New Reference Entry Inline Form */}
              <form onSubmit={handleAddReferenceItem} className="bg-slate-50 p-4 rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add New Lookup Reference Item
                  </h4>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-bold text-slate-500">Category:</Label>
                    <select
                      value={refCategory}
                      onChange={(e: any) => setRefCategory(e.target.value)}
                      className="text-xs bg-white border border-[#E2E8F0] rounded-md px-2 py-1 font-bold text-[#0284C7]"
                    >
                      <option value="species">Fish Species (fish_species)</option>
                      <option value="gears">Fishing Gears (fishing_gears)</option>
                      <option value="vessels">Fishing Vessels (fishing_vessels)</option>
                      <option value="methods">Processing Methods (processing_methods)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-[11px] font-semibold text-slate-600">English Name (name_en)*</Label>
                    <Input
                      placeholder="e.g. Red Snapper"
                      value={newRefItem.name_en}
                      onChange={(e) => setNewRefItem({ ...newRefItem, name_en: e.target.value })}
                      className="bg-white text-xs h-8 border-[#E2E8F0]"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-slate-600">Tagalog Name (name_tl)</Label>
                    <Input
                      placeholder="e.g. Maya-maya"
                      value={newRefItem.name_tl}
                      onChange={(e) => setNewRefItem({ ...newRefItem, name_tl: e.target.value })}
                      className="bg-white text-xs h-8 border-[#E2E8F0]"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="text-[11px] font-semibold text-slate-600">Description / Details</Label>
                      <Input
                        placeholder="e.g. Commercial reef fish"
                        value={newRefItem.description}
                        onChange={(e) => setNewRefItem({ ...newRefItem, description: e.target.value })}
                        className="bg-white text-xs h-8 border-[#E2E8F0]"
                      />
                    </div>
                    <Button type="submit" className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold h-8 px-4">
                      Add
                    </Button>
                  </div>
                </div>
              </form>

              {/* Reference Tabs */}
              <Tabs defaultValue="species" className="w-full">
                <TabsList className="bg-slate-100 p-1 border border-[#E2E8F0] rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-1">
                  <TabsTrigger value="species" className="text-xs font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                    🐟 Fish Species ({speciesList.length})
                  </TabsTrigger>
                  <TabsTrigger value="gears" className="text-xs font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                    ⚓ Fishing Gears ({gearsList.length})
                  </TabsTrigger>
                  <TabsTrigger value="vessels" className="text-xs font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                    ⛵ Fishing Vessels ({vesselsList.length})
                  </TabsTrigger>
                  <TabsTrigger value="methods" className="text-xs font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                    🔥 Processing Methods ({methodsList.length})
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Fish Species */}
                <TabsContent value="species" className="mt-4">
                  <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">English Name (name_en)</TableHead>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">Tagalog Name (name_tl)</TableHead>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">Category</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {speciesList.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-bold text-xs text-slate-800">{item.name_en}</TableCell>
                            <TableCell className="text-xs text-[#0284C7] font-semibold">{item.name_tl || "—"}</TableCell>
                            <TableCell className="text-xs text-slate-500">{item.category || "General"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Tab 2: Fishing Gears */}
                <TabsContent value="gears" className="mt-4">
                  <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">English Name</TableHead>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">Tagalog Name</TableHead>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gearsList.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-bold text-xs text-slate-800">{item.name_en}</TableCell>
                            <TableCell className="text-xs text-[#0284C7] font-semibold">{item.name_tl || "—"}</TableCell>
                            <TableCell className="text-xs text-slate-500">{item.description || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Tab 3: Fishing Vessels */}
                <TabsContent value="vessels" className="mt-4">
                  <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">Vessel Type (EN)</TableHead>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">Vessel Type (TL)</TableHead>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">Motorized Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vesselsList.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-bold text-xs text-slate-800">{item.name_en}</TableCell>
                            <TableCell className="text-xs text-[#0284C7] font-semibold">{item.name_tl || "—"}</TableCell>
                            <TableCell className="text-xs">
                              {item.motorized ? (
                                <span className="bg-emerald-100 text-[#059669] font-bold px-2 py-0.5 rounded text-[10px]">Motorized</span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px]">Non-Motorized</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Tab 4: Processing Methods */}
                <TabsContent value="methods" className="mt-4">
                  <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">Method (EN)</TableHead>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">Method (TL)</TableHead>
                          <TableHead className="text-xs font-bold text-[#1E3A8A]">Process Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {methodsList.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-bold text-xs text-slate-800">{item.name_en}</TableCell>
                            <TableCell className="text-xs text-[#0284C7] font-semibold">{item.name_tl || "—"}</TableCell>
                            <TableCell className="text-xs text-slate-500">{item.description || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE E: EMERGENCY BROADCAST & MESSAGING MODULE */}
        {/* ========================================================================= */}
        {activeModule === "communications" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Emergency Broadcast Panel */}
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#DC2626]">
                <Megaphone className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-[#1E3A8A]">Emergency Broadcast Announcements</h3>
              </div>
              <p className="text-xs text-slate-500">
                Issue urgent maritime safety warnings, storm advisories, or municipal fishery announcements.
              </p>

              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="Enter public broadcast message..."
                  value={newBroadcastText}
                  onChange={(e) => setNewBroadcastText(e.target.value)}
                  className="w-full text-xs p-3 border border-red-200 rounded-lg focus:ring-red-500 bg-red-50/30 text-slate-800"
                />
                <Button type="submit" className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs h-9 gap-2">
                  <Megaphone className="w-4 h-4" /> Broadcast Announcement System-wide
                </Button>
              </form>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Broadcast History</h4>
                {broadcasts.map((b) => (
                  <div key={b.id} className="p-3 bg-[#FEE2E2]/60 border border-red-200 rounded-lg text-xs space-y-1">
                    <p className="font-semibold text-slate-800">{b.content}</p>
                    <div className="flex items-center justify-between text-[10px] text-red-600">
                      <span>{b.sender_name || "Municipal Office"}</span>
                      <span>{new Date(b.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Internal Staff Communications Feed */}
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#0284C7]">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="font-extrabold text-base text-[#1E3A8A]">Internal Staff Communication Dispatch</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Secure staff-only channel for municipal port inspectors and data entry officers.
                </p>

                {/* Message Log */}
                <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                  {messages.map((m) => (
                    <div key={m.id} className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-bold text-[#1E3A8A]">
                        <span>{m.sender_name} <span className="text-[10px] text-slate-400">({m.sender_role})</span></span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-slate-700">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-slate-100">
                <Input
                  placeholder="Type staff message..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="text-xs h-9 bg-slate-50 border-[#E2E8F0]"
                />
                <Button type="submit" className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold h-9 px-4 gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Send
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* FISHERMAN DETAIL DRAWER / MODAL (LEAN VS PEAK SEASON METRICS) */}
      {/* ========================================================================= */}
      {selectedFisherman && (
        <Dialog open={isDetailDrawerOpen} onOpenChange={setIsDetailDrawerOpen}>
          <DialogContent className="bg-white text-slate-800 border-[#E2E8F0] w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-left space-y-1 border-b border-slate-100 pb-4">
              <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase">{selectedFisherman.fisherman_id}</span>
              <DialogTitle className="text-xl font-extrabold text-[#1E3A8A]">
                {selectedFisherman.first_name} {selectedFisherman.last_name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Registered Municipal Fisherfolk Profile & Harvest Analytics
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              {/* Lean vs Peak Season Statistics Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#0284C7]" /> Season Harvest Metrics
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {/* Lean Season Card */}
                  <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl text-left space-y-1">
                    <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider">Lean Months</span>
                    <p className="text-xs text-slate-600 font-semibold">{selectedFisherman.lean_months || "Nov - Feb"}</p>
                    <div className="pt-1">
                      <span className="text-xl font-black text-[#D97706]">
                        {selectedFisherman.lean_daily_avg_catch || 18.5} <span className="text-xs font-bold text-amber-700">kg/day</span>
                      </span>
                    </div>
                  </div>

                  {/* Peak Season Card */}
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl text-left space-y-1">
                    <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider">Peak Months</span>
                    <p className="text-xs text-slate-600 font-semibold">{selectedFisherman.peak_months || "May - Aug"}</p>
                    <div className="pt-1">
                      <span className="text-xl font-black text-[#059669]">
                        {selectedFisherman.peak_daily_avg_catch || 64.2} <span className="text-xs font-bold text-emerald-700">kg/day</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vessel & Gear Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-[#E2E8F0] space-y-3">
                <h4 className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-[#0284C7]" /> Vessel & Gear Specifications
                </h4>

                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Vessel Name</span>
                    <span className="font-bold text-slate-800">{selectedFisherman.boat_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Vessel Type</span>
                    <span className="font-bold text-slate-800">{selectedFisherman.vessel_type || "Motorized Boat"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Fishing Gear</span>
                    <span className="font-bold text-slate-800">{selectedFisherman.fishing_gear || "Gill Net (Pantukos)"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Home Port</span>
                    <span className="font-bold text-slate-800">{selectedFisherman.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Boats Operated</span>
                    <span className="font-bold text-slate-800">{selectedFisherman.total_boats_operated || 1} craft</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Total Crew</span>
                    <span className="font-bold text-slate-800">{selectedFisherman.total_crew || 1} members</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="w-full bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs h-9 rounded-lg"
                >
                  Close Profile Details
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* REPORT SUBMISSION DRAWER / MODAL */}
      {/* ========================================================================= */}
      <Dialog open={isReportDrawerOpen} onOpenChange={setIsReportDrawerOpen}>
        <DialogContent className="bg-white text-slate-800 border-[#E2E8F0] w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left space-y-1 border-b border-slate-100 pb-4">
            <DialogTitle className="text-xl font-extrabold text-[#1E3A8A]">Log Daily Catch Submission</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit daily harvest details directly to the municipal catch stream.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReportSubmit} className="py-4 space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Fisherman ID *</Label>
              <Select
                value={newReport.fisherman_id}
                onValueChange={(val) => setNewReport({ ...newReport, fisherman_id: val })}
              >
                <SelectTrigger className="h-9 text-xs bg-slate-50 border-[#E2E8F0]">
                  <SelectValue placeholder="Select Registered Fisherman" />
                </SelectTrigger>
                <SelectContent>
                  {fishermen.map((f) => (
                    <SelectItem key={f.id} value={f.fisherman_id}>
                      {f.fisherman_id} - {f.first_name} {f.last_name} ({f.boat_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Fish Species (Bilingual lookup) *</Label>
              <Select
                value={newReport.species}
                onValueChange={(val) => setNewReport({ ...newReport, species: val })}
              >
                <SelectTrigger className="h-9 text-xs bg-slate-50 border-[#E2E8F0]">
                  <SelectValue placeholder="Select Fish Species" />
                </SelectTrigger>
                <SelectContent>
                  {speciesList.map((s) => (
                    <SelectItem key={s.id} value={`${s.name_en}${s.name_tl ? ` (${s.name_tl})` : ""}`}>
                      {s.name_en} {s.name_tl ? `(${s.name_tl})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Total Harvest Weight (kg) *</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 85.5"
                value={newReport.weight_kg}
                onChange={(e) => setNewReport({ ...newReport, weight_kg: e.target.value })}
                className="h-9 text-xs bg-slate-50 border-[#E2E8F0]"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Landing Center Port *</Label>
              <Select
                value={newReport.landing_center}
                onValueChange={(val) => setNewReport({ ...newReport, landing_center: val })}
              >
                <SelectTrigger className="h-9 text-xs bg-slate-50 border-[#E2E8F0]">
                  <SelectValue placeholder="Select Landing Center" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Banicain Port">Banicain Port</SelectItem>
                  <SelectItem value="Barretto Port">Barretto Port</SelectItem>
                  <SelectItem value="Kalaklan Port">Kalaklan Port</SelectItem>
                  <SelectItem value="Olongapo City Fish Port">Olongapo City Fish Port</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Processing Method *</Label>
              <Select
                value={newReport.processing_method}
                onValueChange={(val) => setNewReport({ ...newReport, processing_method: val })}
              >
                <SelectTrigger className="h-9 text-xs bg-slate-50 border-[#E2E8F0]">
                  <SelectValue placeholder="Select Processing Method" />
                </SelectTrigger>
                <SelectContent>
                  {methodsList.map((m) => (
                    <SelectItem key={m.id} value={`${m.name_en}${m.name_tl ? ` (${m.name_tl})` : ""}`}>
                      {m.name_en} {m.name_tl ? `(${m.name_tl})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Initial Verification Status</Label>
              <Select
                value={newReport.status}
                onValueChange={(val) => setNewReport({ ...newReport, status: val })}
              >
                <SelectTrigger className="h-9 text-xs bg-slate-50 border-[#E2E8F0]">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                  <SelectItem value="approved">Verified / Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs h-10 mt-4">
              Commit Catch Report
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* EMERGENCY BROADCAST DRAWER */}
      {/* ========================================================================= */}
      <Dialog open={isBroadcastDrawerOpen} onOpenChange={setIsBroadcastDrawerOpen}>
        <DialogContent className="bg-white text-slate-800 border-red-200 w-full sm:max-w-md p-6">
          <DialogHeader className="text-left space-y-1 border-b border-red-100 pb-4">
            <div className="flex items-center gap-2 text-[#DC2626]">
              <Megaphone className="w-5 h-5" />
              <DialogTitle className="text-xl font-extrabold text-[#DC2626]">Emergency Broadcast Trigger</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Post real-time municipal warning or gale advisory to all connected mobile portals.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendBroadcast} className="py-4 space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Broadcast Announcement Text *</Label>
              <textarea
                rows={4}
                placeholder="Write warning message..."
                value={newBroadcastText}
                onChange={(e) => setNewBroadcastText(e.target.value)}
                className="w-full text-xs p-3 border border-red-200 rounded-lg focus:ring-red-500 bg-red-50/20 text-slate-800"
              />
            </div>

            <Button type="submit" className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs h-10 gap-2">
              <Megaphone className="w-4 h-4" /> Trigger Emergency Alert
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* ADD FISHERMAN MODAL */}
      {/* ========================================================================= */}
      <Dialog open={isAddFishermanOpen} onOpenChange={setIsAddFishermanOpen}>
        <DialogContent className="bg-white border-[#E2E8F0] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-[#1E3A8A]">Register Municipal Fisherfolk</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Provision new fisherfolk record into municipal database.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const newF: Fisherman = {
                id: `f-${Date.now()}`,
                fisherman_id: (fd.get("fisherman_id") as string) || `FM-2026-0${fishermen.length + 1}`,
                first_name: (fd.get("first_name") as string) || "Fisherman",
                last_name: (fd.get("last_name") as string) || "User",
                boat_name: (fd.get("boat_name") as string) || "M/B Sea Hawk",
                location: (fd.get("location") as string) || "Banicain Port",
                phone_number: (fd.get("phone_number") as string) || "0917-000-0000",
                lean_daily_avg_catch: parseFloat((fd.get("lean_catch") as string) || "15.0"),
                peak_daily_avg_catch: parseFloat((fd.get("peak_catch") as string) || "60.0"),
              }

              setFishermen([newF, ...fishermen])
              setIsAddFishermanOpen(false)
              toast.success(`Fisherfolk profile ${newF.fisherman_id} registered.`)
            }}
            className="space-y-3 py-2"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-semibold text-slate-700">First Name*</Label>
                <Input name="first_name" required className="h-8 text-xs bg-slate-50" />
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-slate-700">Last Name*</Label>
                <Input name="last_name" required className="h-8 text-xs bg-slate-50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-semibold text-slate-700">Fisherman ID*</Label>
                <Input name="fisherman_id" defaultValue={`FM-2026-00${fishermen.length + 1}`} required className="h-8 text-xs bg-slate-50 font-mono text-[#0284C7]" />
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-slate-700">Vessel Name*</Label>
                <Input name="boat_name" required className="h-8 text-xs bg-slate-50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-semibold text-slate-700">Home Port*</Label>
                <Input name="location" defaultValue="Banicain Port" required className="h-8 text-xs bg-slate-50" />
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-slate-700">Phone Contact*</Label>
                <Input name="phone_number" defaultValue="0917-123-4567" required className="h-8 text-xs bg-slate-50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div>
                <Label className="text-[11px] font-semibold text-[#D97706]">Lean Catch Avg (kg/day)</Label>
                <Input name="lean_catch" type="number" defaultValue="16.5" className="h-8 text-xs bg-amber-50/40 border-amber-200" />
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-[#059669]">Peak Catch Avg (kg/day)</Label>
                <Input name="peak_catch" type="number" defaultValue="62.0" className="h-8 text-xs bg-emerald-50/40 border-emerald-200" />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="submit" className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold h-9">
                Save & Register Fisherfolk
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MunicipalFisherfolkDashboard
