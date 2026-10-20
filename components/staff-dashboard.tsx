"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { LogOut, User, Save, FileText, Anchor, Scale, MapPin, Calendar, CheckCircle2, Search, ClipboardList, Pencil, Lock, Loader2, ChevronRight } from "lucide-react"
import { createFishermanAccount } from "@/app/actions/create-fisherman"
import { cn } from "@/lib/utils"

export function StaffDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string; id: string } | null>(null)

  // Registration Form state (Option 1)
  const [formData, setFormData] = useState({
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
  
  // Data from database
  const [landingCenters, setLandingCenters] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Catch Report state (Option 2)
  const [fishermen, setFishermen] = useState<any[]>([])
  const [selectedFishermanId, setSelectedFishermanId] = useState("")
  const [searchFilter, setSearchFilter] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [catchSpecies, setCatchSpecies] = useState("")
  const [catchWeight, setCatchWeight] = useState("")
  const [catchDate, setCatchDate] = useState(new Date().toISOString().split('T')[0])
  
  // Additional Catch Report fields moved from Option 1
  const [leanMonths, setLeanMonths] = useState("")
  const [leanDailyAvgCatch, setLeanDailyAvgCatch] = useState("")
  const [peakMonths, setPeakMonths] = useState("")
  const [peakDailyAvgCatch, setPeakDailyAvgCatch] = useState("")
  
  const [submittingCatch, setSubmittingCatch] = useState(false)

  // My Reports (Option 3) state
  const [myReports, setMyReports] = useState<any[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [editingReport, setEditingReport] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ species: "", weight_kg: "", location: "", processing_method: "" })
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    const fetchUserDataAndFishermen = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      
      const { data: staffData } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      
      if (staffData) {
        setUser({ ...session.user, ...staffData })
      } else {
        setUser({ ...session.user, staff_id: 'STAFF', full_name: 'Staff Member' })
      }

      // Fetch fishermen for the dropdown - get ALL registered fishermen
      const { data: fishermenData, error: fishermenError } = await supabase
        .from('fisherman_registration')
        .select('id, fisherman_id, first_name, last_name, boat_name, user_id, location, phone_number')
        .order('created_at', { ascending: false })
      
      if (fishermenError) {
        console.error('[Staff Dashboard] Error fetching fishermen:', fishermenError)
      }
      
      if (fishermenData) {
        setFishermen(fishermenData)
        console.log('[Staff Dashboard] Loaded', fishermenData.length, 'fishermen')
      } else {
        console.warn('[Staff Dashboard] No fishermen data returned')
        setFishermen([])
      }
      
      // Fetch landing centers for location dropdown
      const { data: locationsData } = await supabase
        .from('landing_centers')
        .select('id, name, location')
        .order('name')
      
      if (locationsData) {
        setLandingCenters(locationsData)
      }
      
      setLoadingData(false)
    }
    
    fetchUserDataAndFishermen()
  }, [])

  const fetchMyReports = async () => {
    setLoadingReports(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { setLoadingReports(false); return }
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('submitted_by', session.user.id)
      .order('created_at', { ascending: false })
    if (!error && data) setMyReports(data)
    setLoadingReports(false)
  }

  const handleOpenEdit = (report: any) => {
    setEditingReport(report)
    setEditForm({
      species: report.species || "",
      weight_kg: String(report.weight_kg || ""),
      location: report.location || "",
      processing_method: report.processing_method || ""
    })
  }

  const handleSaveEdit = async () => {
    if (!editingReport) return
    setSavingEdit(true)
    const { error } = await supabase
      .from('reports')
      .update({
        species: editForm.species.trim(),
        weight_kg: parseFloat(editForm.weight_kg),
        location: editForm.location.trim(),
        processing_method: editForm.processing_method.trim()
      })
      .eq('id', editingReport.id)
    if (error) {
      toast.error("Failed to update report", { description: error.message })
    } else {
      toast.success("Report updated successfully")
      setEditingReport(null)
      fetchMyReports()
    }
    setSavingEdit(false)
  }

  // Auto-fill seasonality data when a fisherman is selected
  useEffect(() => {
    if (selectedFishermanId) {
      const fetchProfileDetails = async () => {
        const { data } = await supabase
          .from('fisherman_registration')
          .select('lean_months, lean_daily_avg_catch, peak_months, peak_daily_avg_catch')
          .eq('fisherman_id', selectedFishermanId)
          .single()
        
        if (data) {
          setLeanMonths(data.lean_months || "")
          setLeanDailyAvgCatch(data.lean_daily_avg_catch?.toString() || "")
          setPeakMonths(data.peak_months || "")
          setPeakDailyAvgCatch(data.peak_daily_avg_catch?.toString() || "")
        }
      }
      fetchProfileDetails()
    } else {
      // Reset fields if unselected
      setLeanMonths("")
      setLeanDailyAvgCatch("")
      setPeakMonths("")
      setPeakDailyAvgCatch("")
    }
  }, [selectedFishermanId])

  const selectedFishermanDetails = fishermen.find(f => f.fisherman_id === selectedFishermanId)

  // Sync search filter input with the selected fisherman's name and ID
  useEffect(() => {
    if (selectedFishermanDetails) {
      setSearchFilter(`${selectedFishermanDetails.first_name} ${selectedFishermanDetails.last_name} (${selectedFishermanDetails.fisherman_id})`)
    } else {
      setSearchFilter("")
    }
  }, [selectedFishermanId, selectedFishermanDetails])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // --- Option 1: Handle Profile Registration ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setCreatedCredentials(null)

    try {
      if (!formData.email) {
        throw new Error("Email address is required to create a fisherman login account.")
      }

      const res = await createFishermanAccount({
        email: formData.email,
        password: formData.password || undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        boatName: formData.vesselName,
        location: formData.location,
        phoneNumber: formData.phoneNumber,
        totalBoatsOperated: formData.totalBoatsOperated,
        totalCrew: formData.totalCrew
      })

      if (!res.success) {
        throw new Error(res.error)
      }

      toast.success("Account Created Successfully", {
        description: `Fisherman profile and auth account for ${formData.firstName} have been registered.`
      })

      // Store credentials so staff can show/copy them
      setCreatedCredentials({
        email: res.email || formData.email,
        pass: res.password || "",
        id: res.fishermanId || ""
      })

      // Refresh fishermen dropdown
      const { data: newFishermenData } = await supabase
        .from('fisherman_registration')
        .select('id, fisherman_id, first_name, last_name, boat_name, user_id, location')
        .order('first_name')
      
      if (newFishermenData) setFishermen(newFishermenData)

      setFormData({
        firstName: "", lastName: "", location: "", phoneNumber: "", vesselName: "",
        totalBoatsOperated: 1, totalCrew: 1, email: "", password: ""
      })
    } catch (error: any) {
      toast.error("Failed to Create Account", { description: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  // --- Option 2: Handle Catch Report ---
  const handleCatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFishermanId) {
      toast.error("Validation Error", { description: "Please select a fisherman." })
      return
    }

    setSubmittingCatch(true)
    const selectedFisherman = fishermen.find(f => f.fisherman_id === selectedFishermanId)

    try {
      // 1. Update Fisherman Profile with Seasonality data
      const { error: profileError } = await supabase
        .from('fisherman_registration')
        .update({
          lean_months: leanMonths,
          lean_daily_avg_catch: parseFloat(leanDailyAvgCatch) || 0,
          peak_months: peakMonths,
          peak_daily_avg_catch: parseFloat(peakDailyAvgCatch) || 0
        })
        .eq('fisherman_id', selectedFisherman.fisherman_id)

      if (profileError) throw profileError

      // Get current staff user id for submitted_by tracking
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      const staffUserId = currentSession?.user?.id

      // 2. Insert the actual transactional catch report
      const { error } = await supabase
        .from('reports')
        .insert({
          fisherman_id: selectedFisherman.fisherman_id,
          user_id: selectedFisherman.user_id,
          submitted_by: staffUserId,
          species: catchSpecies,
          weight_kg: parseFloat(catchWeight),
          location: selectedFisherman.location || "N/A",
          status: 'pending',
          created_at: catchDate ? new Date(catchDate).toISOString() : new Date().toISOString()
        })

      if (error) throw error

      toast.success("Catch Report Submitted", {
        description: "The daily catch log has been added to the registry."
      })

      // Reset
      setSelectedFishermanId("")
      setSearchFilter("")
      setCatchSpecies("")
      setCatchWeight("")
      setCatchDate(new Date().toISOString().split('T')[0])
      setLeanMonths("")
      setLeanDailyAvgCatch("")
      setPeakMonths("")
      setPeakDailyAvgCatch("")
    } catch (error: any) {
      toast.error("Failed to Submit", { description: error.message })
    } finally {
      setSubmittingCatch(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 text-slate-800">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] mix-blend-screen"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-blue-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 rounded-xl text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tighter">Staff Portal</h1>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  {user?.staff_id || 'STAFF'} • {user?.full_name || 'Staff Member'}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-xl">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="report" className="w-full space-y-6" onValueChange={(v) => { if (v === 'my-reports') fetchMyReports() }}>
          {/* Tabs Navigation */}
          <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-blue-100 w-full shadow-sm">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger value="register" className="rounded-xl px-3 py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-slate-700 hover:bg-blue-50">
                <span className="hidden sm:inline">Register Fisherman</span>
                <span className="sm:hidden">Register</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="rounded-xl px-3 py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-slate-700 hover:bg-blue-50">
                <span className="hidden sm:inline">Submit Daily Catch</span>
                <span className="sm:hidden">Submit Catch</span>
              </TabsTrigger>
              <TabsTrigger value="my-reports" className="rounded-xl px-3 py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-slate-700 hover:bg-blue-50">
                <span className="hidden sm:inline">My Reports</span>
                <span className="sm:hidden">Reports</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* OPTION 1: REGISTER FISHERMAN */}
          <TabsContent value="register" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-white/80 backdrop-blur-xl border-blue-100 rounded-3xl overflow-hidden shadow-[0_18px_45px_rgba(59,130,246,0.08)]">
              <CardHeader className="border-b border-blue-100 bg-blue-50/50 p-6">
                <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <User className="text-blue-600" /> Fisherman Registration
                </CardTitle>
                <CardDescription className="text-slate-600">Enter the fisherman's details to register them in the master registry.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {createdCredentials && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 space-y-3 animate-in zoom-in duration-300">
                    <div className="flex items-center gap-2 text-blue-700 font-bold">
                      <CheckCircle2 className="h-5 w-5" />
                      Account Created Successfully!
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-2 font-mono text-sm text-slate-700">
                      <div className="flex justify-between items-center py-1 border-b border-blue-100">
                        <span className="text-slate-500">Fisherman ID:</span>
                        <span className="text-blue-700 font-bold">{createdCredentials.id}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-blue-100">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-slate-800 font-bold select-all">{createdCredentials.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500">Password:</span>
                        <span className="text-slate-800 font-bold select-all">{createdCredentials.pass}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full bg-white border-blue-200 hover:bg-blue-50 text-blue-700"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Fisherman ID: ${createdCredentials.id}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.pass}`
                        )
                        toast.success("Credentials Copied")
                      }}
                    >
                      Copy Credentials
                    </Button>
                  </div>
                )}
                
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  {/* Fisherman Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest border-b border-blue-100 pb-2">Fisherman Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">First Name *</Label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required placeholder="e.g., Juan"
                          className="bg-blue-50/60 border-blue-200 rounded-xl h-12 focus:ring-blue-600 text-slate-800 placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">Last Name *</Label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required placeholder="e.g., Dela Cruz"
                          className="bg-blue-50/60 border-blue-200 rounded-xl h-12 focus:ring-blue-600 text-slate-800 placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">Location *</Label>
                        {loadingData ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-slate-500">Loading...</span>
                          </div>
                        ) : (
                          <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })} required>
                            <SelectTrigger className="bg-blue-50/60 border-blue-200 rounded-xl h-12 text-slate-800">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-blue-100 text-slate-800">
                              {landingCenters.map((center) => (
                                <SelectItem key={center.id} value={center.name}>
                                  {center.name}{center.location ? ` - ${center.location}` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">Phone Number *</Label>
                        <Input
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          required placeholder="Enter contact number"
                          className="bg-blue-50/60 border-blue-200 rounded-xl h-12 focus:ring-blue-600 text-slate-800 placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs font-bold text-slate-700">Email Address (For Login) *</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required placeholder="juan.delacruz@email.com"
                          className="bg-blue-50/60 border-blue-200 rounded-xl h-12 focus:ring-blue-600 text-slate-800 placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs font-bold text-slate-700">Temporary Password (Optional)</Label>
                        <Input
                          type="text"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Leave blank to auto-generate"
                          className="bg-blue-50/60 border-blue-200 rounded-xl h-12 focus:ring-blue-600 text-slate-800 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vessel Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest border-b border-blue-100 pb-2">Vessel Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs font-bold text-slate-700">Vessel Name *</Label>
                        <Input
                          value={formData.vesselName}
                          onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                          required placeholder="Enter vessel name"
                          className="bg-blue-50/60 border-blue-200 rounded-xl h-12 focus:ring-blue-600 text-slate-800 placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">Total Boats *</Label>
                        <Input
                          type="number" min="1"
                          value={formData.totalBoatsOperated}
                          onChange={(e) => setFormData({ ...formData, totalBoatsOperated: parseInt(e.target.value) })}
                          required
                          className="bg-blue-50/60 border-blue-200 rounded-xl h-12 focus:ring-blue-600 text-slate-800 placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">Total Crew *</Label>
                        <Input
                          type="number" min="1"
                          value={formData.totalCrew}
                          onChange={(e) => setFormData({ ...formData, totalCrew: parseInt(e.target.value) })}
                          required
                          className="bg-blue-50/60 border-blue-200 rounded-xl h-12 focus:ring-blue-600 text-slate-800 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 h-14 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/30 text-white">
                    {submitting ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Saving...</> : <><Save className="h-5 w-5 mr-2" /> Register Profile</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OPTION 2: SUBMIT CATCH REPORT */}
          <TabsContent value="report" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-white/80 backdrop-blur-xl border-blue-100 rounded-3xl overflow-hidden shadow-[0_18px_45px_rgba(59,130,246,0.08)]">
              <CardHeader className="border-b border-blue-100 bg-blue-50/50 p-6">
                <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <Scale className="text-blue-600" /> Submit Daily Catch
                </CardTitle>
                <CardDescription className="text-slate-600">Select a fisherman to log their daily catch.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCatchSubmit} className="space-y-6">
                  
                  {/* Fisherman Selection */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest border-b border-blue-100 pb-2 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" /> 1. Select Fisherman
                    </h3>
                    <div className="space-y-2 relative">
                      <Label className="text-xs font-bold text-slate-700">Search & Select *</Label>
                      <div className="relative">
                        <Input
                          type="text"
                          className="w-full h-12 bg-blue-50/60 border-blue-200 rounded-xl pl-10 pr-10 focus:ring-blue-600 text-slate-800 placeholder:text-slate-500"
                          placeholder="Type to search fisherman name or ID..."
                          value={searchFilter}
                          onChange={(e) => {
                            setSearchFilter(e.target.value)
                            setDropdownOpen(true)
                          }}
                          onFocus={() => setDropdownOpen(true)}
                        />
                        <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                        {selectedFishermanId && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 h-8 w-8 p-0 text-slate-500 hover:text-rose-400"
                            onClick={() => {
                              setSelectedFishermanId("")
                              setSearchFilter("")
                            }}
                          >
                            ×
                          </Button>
                        )}
                      </div>

                      {dropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
                          
                          <div className="absolute z-30 w-full mt-1 bg-white border border-blue-100 rounded-xl shadow-2xl max-h-[250px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                            {(() => {
                              const filtered = fishermen.filter(f => {
                                const name = `${f.first_name} ${f.last_name}`.toLowerCase()
                                const fid = f.fisherman_id.toLowerCase()
                                const query = searchFilter.toLowerCase()
                                return name.includes(query) || fid.includes(query)
                              })
                              
                              if (filtered.length === 0) {
                                return <div className="p-4 text-sm text-slate-500 text-center">No fishermen found</div>
                              }

                              return filtered.map(f => (
                                <button
                                  key={f.fisherman_id}
                                  type="button"
                                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors text-sm text-slate-700 flex justify-between items-center border-b border-blue-100 last:border-0"
                                  onClick={() => {
                                    setSelectedFishermanId(f.fisherman_id)
                                    setDropdownOpen(false)
                                  }}
                                >
                                  <span className="font-semibold">{f.first_name} {f.last_name}</span>
                                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-mono">{f.fisherman_id}</span>
                                </button>
                              ))
                            })()}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Autofill Display */}
                    {selectedFishermanDetails && (
                      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 mt-4 flex flex-wrap gap-4 animate-in fade-in">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <User className="h-4 w-4 text-blue-700" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Operator</p>
                            <p className="font-semibold text-slate-800">{selectedFishermanDetails.first_name} {selectedFishermanDetails.last_name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-cyan-100 p-2 rounded-lg">
                            <Anchor className="h-4 w-4 text-cyan-700" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Vessel</p>
                            <p className="font-semibold text-slate-800">{selectedFishermanDetails.boat_name || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-emerald-100 p-2 rounded-lg">
                            <MapPin className="h-4 w-4 text-emerald-700" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Location</p>
                            <p className="font-semibold text-slate-800">{selectedFishermanDetails.location || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Catch Input */}
                  <div className={cn("space-y-4 transition-opacity", selectedFishermanId ? "" : "opacity-50")}>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest border-b border-blue-100 pb-2 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-600" /> 2. Enter Catch
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">Date *</Label>
                        <Input
                          type="date"
                          className="bg-blue-50/60 border-blue-200 rounded-xl h-12 focus:ring-blue-600 text-slate-800"
                          value={catchDate}
                          onChange={(e) => setCatchDate(e.target.value)}
                          required
                          disabled={!selectedFishermanId}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">Species *</Label>
                        <Input
                          className="bg-blue-50/60 border-blue-200 rounded-xl h-12 focus:ring-blue-600 text-slate-800 placeholder:text-slate-500"
                          placeholder="e.g., Tilapia"
                          value={catchSpecies}
                          onChange={(e) => setCatchSpecies(e.target.value)}
                          required
                          disabled={!selectedFishermanId}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">Weight (kg) *</Label>
                        <Input
                          className="bg-blue-50/60 border-blue-200 rounded-xl h-12 focus:ring-blue-600 text-slate-800 placeholder:text-slate-500"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={catchWeight}
                          onChange={(e) => setCatchWeight(e.target.value)}
                          required
                          disabled={!selectedFishermanId}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seasonality Details */}
                  <div className={cn("space-y-4 transition-opacity", selectedFishermanId ? "" : "opacity-50")}>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest border-b border-blue-100 pb-2">
                      3. Seasonality (Updates Profile)
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-600">Lean Months</Label>
                          <Input
                            value={leanMonths}
                            onChange={(e) => setLeanMonths(e.target.value)}
                            placeholder="e.g., January, February"
                            disabled={!selectedFishermanId}
                            className="bg-white border-blue-200 rounded-xl h-10 text-slate-800 placeholder:text-slate-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-600">Lean Avg Catch (kg)</Label>
                          <Input
                            type="number" step="0.01"
                            value={leanDailyAvgCatch}
                            onChange={(e) => setLeanDailyAvgCatch(e.target.value)}
                            placeholder="e.g., 50.5"
                            disabled={!selectedFishermanId}
                            className="bg-white border-blue-200 rounded-xl h-10 text-slate-800 placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                      <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-600">Peak Months</Label>
                          <Input
                            value={peakMonths}
                            onChange={(e) => setPeakMonths(e.target.value)}
                            placeholder="e.g., June, July"
                            disabled={!selectedFishermanId}
                            className="bg-white border-blue-200 rounded-xl h-10 text-slate-800 placeholder:text-slate-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-600">Peak Avg Catch (kg)</Label>
                          <Input
                            type="number" step="0.01"
                            value={peakDailyAvgCatch}
                            onChange={(e) => setPeakDailyAvgCatch(e.target.value)}
                            placeholder="e.g., 150.0"
                            disabled={!selectedFishermanId}
                            className="bg-white border-blue-200 rounded-xl h-10 text-slate-800 placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submittingCatch || !selectedFishermanId} 
                    className="w-full bg-blue-600 hover:bg-blue-500 h-14 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/30 text-white"
                  >
                    {submittingCatch ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Submitting...</> : <><CheckCircle2 className="h-5 w-5 mr-2" /> Submit Daily Catch</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OPTION 3: MY SUBMITTED REPORTS */}
          <TabsContent value="my-reports" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-white/80 backdrop-blur-xl border-blue-100 rounded-3xl overflow-hidden shadow-[0_18px_45px_rgba(59,130,246,0.08)]">
              <CardHeader className="border-b border-blue-100 bg-blue-50/50 p-6">
                <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <ClipboardList className="text-blue-600" /> My Reports
                </CardTitle>
                <CardDescription className="text-slate-600">Reports you submitted. Pending reports can be edited.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loadingReports ? (
                  <div className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
                    <p className="text-slate-600">Loading reports...</p>
                  </div>
                ) : myReports.length === 0 ? (
                  <div className="text-center py-10">
                    <ClipboardList className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                    <p className="text-slate-700 font-medium">No reports submitted yet.</p>
                    <p className="text-sm text-slate-600">Submit a daily catch in Option 2 to see them here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[700px]">
                      <TableHeader className="bg-blue-50">
                        <TableRow className="border-blue-100">
                          <TableHead className="text-slate-700 font-bold uppercase text-xs">Date</TableHead>
                          <TableHead className="text-slate-700 font-bold uppercase text-xs">Fisherman ID</TableHead>
                          <TableHead className="text-slate-700 font-bold uppercase text-xs">Species</TableHead>
                          <TableHead className="text-slate-700 font-bold uppercase text-xs">Weight</TableHead>
                          <TableHead className="text-slate-700 font-bold uppercase text-xs">Location</TableHead>
                          <TableHead className="text-slate-700 font-bold uppercase text-xs">Status</TableHead>
                          <TableHead className="text-right text-slate-700 font-bold uppercase text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myReports.map((report) => (
                          <TableRow key={report.id} className="border-blue-100 hover:bg-blue-50/50">
                            <TableCell className="text-slate-700">{new Date(report.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="font-mono text-blue-700">{report.fisherman_id || '—'}</TableCell>
                            <TableCell className="text-slate-700">{report.species}</TableCell>
                            <TableCell className="text-slate-800 font-bold">{report.weight_kg} kg</TableCell>
                            <TableCell className="text-slate-600 text-sm">{report.location}</TableCell>
                            <TableCell>
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                report.status === 'approved' ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                                report.status === 'not_approved' ? "bg-rose-100 text-rose-700 border border-rose-200" :
                                "bg-amber-100 text-amber-700 border border-amber-200"
                              )}>
                                <span className={cn("h-1.5 w-1.5 rounded-full",
                                  report.status === 'approved' ? "bg-emerald-500" :
                                  report.status === 'not_approved' ? "bg-rose-500" : "bg-amber-500 animate-pulse"
                                )} />
                                {report.status === 'not_approved' ? 'Not Approved' : report.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {report.status === 'pending' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 bg-white border-blue-200 hover:bg-blue-50 text-slate-700"
                                  onClick={() => handleOpenEdit(report)}
                                >
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-500 flex items-center justify-end gap-1">
                                  <Lock className="h-3 w-3" /> Locked
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Report Dialog */}
        <Dialog open={!!editingReport} onOpenChange={(open) => { if (!open) setEditingReport(null) }}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-slate-400" />
                Edit Pending Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">Species</Label>
                <Input
                  value={editForm.species}
                  onChange={(e) => setEditForm({ ...editForm, species: e.target.value })}
                  placeholder="e.g. Tilapia"
                  className="bg-slate-950 border-slate-700 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.weight_kg}
                  onChange={(e) => setEditForm({ ...editForm, weight_kg: e.target.value })}
                  placeholder="0.00"
                  className="bg-slate-950 border-slate-700 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">Location</Label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="e.g. Banicain"
                  className="bg-slate-950 border-slate-700 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">Processing Method</Label>
                <Input
                  value={editForm.processing_method}
                  onChange={(e) => setEditForm({ ...editForm, processing_method: e.target.value })}
                  placeholder="e.g. fresh, dried"
                  className="bg-slate-950 border-slate-700 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditingReport(null)} className="bg-slate-800 border-slate-700">Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={savingEdit} className="bg-blue-600 hover:bg-blue-500">
                {savingEdit ? <><Loader2 className="animate-spin h-4 w-4 mr-1" /> Saving...</> : <><Save className="h-4 w-4 mr-1" /> Save</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}