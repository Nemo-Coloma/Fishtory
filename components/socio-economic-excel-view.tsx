"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { 
    Loader2, 
    Search, 
    Download, 
    Edit3, 
    CheckCircle2, 
    XCircle,
    Users,
    TrendingUp,
    Anchor,
    Shield,
    Heart,
    Package
} from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "./ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

interface ProfileRecord {
    fisherman_id: string;
    first_name: string;
    last_name: string;
    name: string;
    location: string;
    age?: number;
    gender?: string;
    education_attainment?: string;
    dependency_ratio?: number;
    monthly_income?: number;
    poverty_status?: boolean;
    secondary_livelihood?: string;
    fishing_gear?: string;
    boat_ownership_status?: string;
    boat_type_motorized?: boolean;
    catch_composition?: string;
    fishing_needs?: string;
    housing_condition?: string;
    water_access?: boolean;
    electricity_access?: boolean;
    toilet_access?: boolean;
    welfare_status?: string;
    philhealth?: boolean;
    sss?: boolean;
    pcic_insurance?: boolean;
    subsidies_received?: string;
    subsidy_requirements?: string;
}

export function SocioEconomicExcelView() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<ProfileRecord[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [editingProfile, setEditingProfile] = useState<ProfileRecord | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [regRes, profRes] = await Promise.all([
                supabase.from('fisherman_registration').select('fisherman_id, first_name, last_name, location'),
                supabase.from('fishermen_profiles').select('*')
            ])

            if (regRes.error) throw regRes.error

            const merged: ProfileRecord[] = (regRes.data || []).map((reg: any) => {
                const profile = profRes.data?.find((p: any) => p.fisherman_id === reg.fisherman_id) || {}
                return {
                    ...reg,
                    ...profile,
                    name: `${reg.first_name} ${reg.last_name}`
                }
            })

            setData(merged)
        } catch (error: any) {
            toast.error("Failed to fetch profiles", { description: error.message })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!editingProfile) return
        setIsSaving(true)
        
        try {
            const { name, first_name, last_name, ...profileToSave } = editingProfile as any
            
            const { error } = await supabase
                .from('fishermen_profiles')
                .upsert(profileToSave, { onConflict: 'fisherman_id' })

            if (error) throw error

            toast.success("Profile updated successfully")
            setEditingProfile(null)
            fetchData()
        } catch (error: any) {
            toast.error("Update failed", { description: error.message })
        } finally {
            setIsSaving(false)
        }
    }

    const filteredData = data.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.fisherman_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs italic">Syncing Monitoring Grid...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input 
                        placeholder="Filter by name, ID, or location..." 
                        className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl font-bold text-xs gap-2 shrink-0">
                        <Download className="h-4 w-4" /> EXPORT CSV
                    </Button>
                </div>
            </div>

            {/* Excel Container */}
            <div className="relative border border-slate-800 rounded-[2rem] overflow-hidden bg-slate-950/50 shadow-2xl backdrop-blur-md">
                <div className="overflow-x-auto max-h-[calc(100vh-340px)] custom-scrollbar">
                    <Table className="border-collapse min-w-[2800px]">
                        <TableHeader className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-800 shadow-xl">
                            {/* Group Headers */}
                            <TableRow className="hover:bg-transparent border-slate-800">
                                <TableHead colSpan={3} className="border-r border-slate-800 text-center py-2 bg-slate-950/50">
                                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">BASIC INFO</span>
                                </TableHead>
                                <TableHead colSpan={4} className="border-r border-slate-800 text-center py-2 bg-blue-500/5">
                                    <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase flex items-center justify-center gap-2">
                                        <Users className="h-3 w-3" /> DEMOGRAPHIC
                                    </span>
                                </TableHead>
                                <TableHead colSpan={4} className="border-r border-slate-800 text-center py-2 bg-emerald-500/5">
                                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center justify-center gap-2">
                                        <TrendingUp className="h-3 w-3" /> ECONOMIC INDICATORS
                                    </span>
                                </TableHead>
                                <TableHead colSpan={5} className="border-r border-slate-800 text-center py-2 bg-amber-500/5">
                                    <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center justify-center gap-2">
                                        <Anchor className="h-3 w-3" /> OCCUPATIONAL PROFILE
                                    </span>
                                </TableHead>
                                <TableHead colSpan={5} className="border-r border-slate-800 text-center py-2 bg-purple-500/5">
                                    <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase flex items-center justify-center gap-2">
                                        <Shield className="h-3 w-3" /> WELFARE & CONDITIONS
                                    </span>
                                </TableHead>
                                <TableHead colSpan={5} className="text-center py-2 bg-rose-500/5">
                                    <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase flex items-center justify-center gap-2">
                                        <Package className="h-3 w-3" /> SUBSIDIES & PROTECTION
                                    </span>
                                </TableHead>
                            </TableRow>
                            
                            {/* Detailed Headers */}
                            <TableRow className="hover:bg-transparent border-slate-800">
                                <TableHead className="w-[80px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Action</TableHead>
                                <TableHead className="w-[120px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">FM ID</TableHead>
                                <TableHead className="w-[180px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Full Name</TableHead>
                                
                                {/* Demographics */}
                                <TableHead className="w-[60px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Age</TableHead>
                                <TableHead className="w-[80px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Gender</TableHead>
                                <TableHead className="w-[120px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Education</TableHead>
                                <TableHead className="w-[100px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Dep. Ratio</TableHead>
                                
                                {/* Economic */}
                                <TableHead className="w-[120px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Mo. Income</TableHead>
                                <TableHead className="w-[80px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Poverty</TableHead>
                                <TableHead className="w-[150px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Secondary Livelihood</TableHead>
                                <TableHead className="w-[150px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Life Assessment</TableHead>
                                
                                {/* Occupational */}
                                <TableHead className="w-[120px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Gear</TableHead>
                                <TableHead className="w-[100px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Boat Owner</TableHead>
                                <TableHead className="w-[100px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Motorized</TableHead>
                                <TableHead className="w-[150px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Catch Comp.</TableHead>
                                <TableHead className="w-[150px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Gears/Tool Needs</TableHead>
                                
                                {/* Welfare */}
                                <TableHead className="w-[120px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Housing</TableHead>
                                <TableHead className="w-[60px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Water</TableHead>
                                <TableHead className="w-[60px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Power</TableHead>
                                <TableHead className="w-[60px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Toilet</TableHead>
                                <TableHead className="w-[150px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Living Status</TableHead>
                                
                                {/* Subsidy */}
                                <TableHead className="w-[80px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">PhilHealth</TableHead>
                                <TableHead className="w-[80px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">SSS</TableHead>
                                <TableHead className="w-[80px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">PCIC</TableHead>
                                <TableHead className="w-[150px] text-slate-400 font-black uppercase text-[9px] border-r border-slate-800 px-4">Active Subsidies</TableHead>
                                <TableHead className="w-[150px] text-slate-400 font-black uppercase text-[9px] px-4">Requirements Needed</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((row) => (
                                <TableRow key={row.fisherman_id} className="border-slate-800 hover:bg-slate-900/40 group transition-colors">
                                    <TableCell className="border-r border-slate-800 px-4">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-blue-500 hover:bg-blue-500/10 rounded-lg"
                                            onClick={() => setEditingProfile(row)}
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 font-black text-xs text-slate-400 tracking-tighter truncate">{row.fisherman_id}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 font-bold text-xs truncate bg-slate-950/20">{row.name}</TableCell>
                                    
                                    {/* Demographics */}
                                    <TableCell className="px-4 border-r border-slate-800 text-xs font-medium text-slate-300 text-center">{row.age || "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-xs font-medium text-slate-300 capitalize">{row.gender || "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-[10px] font-bold text-slate-400 truncate">{row.education_attainment || "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-xs font-bold text-slate-300 text-center">{row.dependency_ratio || "-"}</TableCell>
                                    
                                    {/* Economic */}
                                    <TableCell className="px-4 border-r border-slate-800 text-xs font-black text-emerald-500 italic">
                                        {row.monthly_income ? `₱${Number(row.monthly_income).toLocaleString()}` : "-"}
                                    </TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-center">
                                        {row.poverty_status ? <CheckCircle2 className="h-4 w-4 text-rose-500 mx-auto" /> : <XCircle className="h-4 w-4 text-emerald-500/30 mx-auto" />}
                                    </TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-[10px] font-bold text-slate-400 truncate italic">{row.secondary_livelihood || "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-[9px] font-bold text-slate-500 truncate">{row.welfare_status || "-"}</TableCell>
                                    
                                    {/* Occupational */}
                                    <TableCell className="px-4 border-r border-slate-800 text-[10px] font-bold text-slate-300 truncate">{row.fishing_gear || "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-xs font-bold text-slate-400 text-center">{row.boat_ownership_status || "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-center">
                                        {row.boat_type_motorized ? <span className="text-[9px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">MOTO</span> : <span className="text-[9px] font-black px-2 py-0.5 bg-slate-800 text-slate-500 rounded-full">NON</span>}
                                    </TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-[10px] font-bold text-slate-400 truncate italic">{row.catch_composition || "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-[9px] font-bold text-amber-500/80 truncate">{row.fishing_needs || "-"}</TableCell>
                                    
                                    {/* Welfare */}
                                    <TableCell className="px-4 border-r border-slate-800 text-[10px] font-bold text-slate-300 truncate">{row.housing_condition || "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-center">{row.water_access ? <CheckCircle2 className="h-4 w-4 text-blue-500 mx-auto" /> : "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-center">{row.electricity_access ? <CheckCircle2 className="h-4 w-4 text-amber-500 mx-auto" /> : "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-center">{row.toilet_access ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-[9px] font-bold text-slate-500 truncate italic">{row.welfare_status || "-"}</TableCell>
                                    
                                    {/* Subsidy */}
                                    <TableCell className="px-4 border-r border-slate-800 text-center">{row.philhealth ? <CheckCircle2 className="h-4 w-4 text-blue-500 mx-auto" /> : "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-center">{row.sss ? <CheckCircle2 className="h-4 w-4 text-slate-400 mx-auto" /> : "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-center">{row.pcic_insurance ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /> : "-"}</TableCell>
                                    <TableCell className="px-4 border-r border-slate-800 text-[10px] font-bold text-emerald-500 truncate">{row.subsidies_received || "-"}</TableCell>
                                    <TableCell className="px-4 text-[10px] font-bold text-rose-400 truncate">{row.subsidy_requirements || "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination / Count */}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-900/40 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Showing {filteredData.length} records</span>
                <p className="text-[9px] font-bold text-slate-600 italic">Sector Socio-Economic Monitoring Portal • 2026 Registry</p>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingProfile} onOpenChange={(open) => !open && setEditingProfile(null)}>
                <DialogContent className="max-w-5xl bg-slate-950 border-slate-800 text-slate-100 p-0 overflow-hidden rounded-[2.5rem]">
                    <DialogHeader className="p-8 bg-slate-900/50 border-b border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                                <Users className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Socio-Economic Profile Entry</DialogTitle>
                                <DialogDescription className="text-slate-400 font-medium">Monitoring and Subsidy Tracking for <span className="text-blue-400 font-bold">{editingProfile?.name}</span></DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Demographic Section */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] border-b border-blue-500/20 pb-2 flex items-center gap-2">
                                <Users className="h-3 w-3" /> DEMOGRAPHICS
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-400">Current Age</Label>
                                    <Input 
                                        type="number" 
                                        className="bg-slate-900 border-slate-800 h-10 font-bold" 
                                        value={editingProfile?.age || ""} 
                                        onChange={(e) => setEditingProfile(prev => prev ? {...prev, age: parseInt(e.target.value)} : null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-400">Gender</Label>
                                    <Select value={editingProfile?.gender || ""} onValueChange={(val) => setEditingProfile(prev => prev ? {...prev, gender: val} : null)}>
                                        <SelectTrigger className="bg-slate-900 border-slate-800 h-10">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400">Education Level</Label>
                                <Select value={editingProfile?.education_attainment || ""} onValueChange={(val) => setEditingProfile(prev => prev ? {...prev, education_attainment: val} : null)}>
                                    <SelectTrigger className="bg-slate-900 border-slate-800 h-10">
                                        <SelectValue placeholder="Select Level" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                        <SelectItem value="Elementary">Elementary</SelectItem>
                                        <SelectItem value="High School">High School</SelectItem>
                                        <SelectItem value="College Graduate">College Graduate</SelectItem>
                                        <SelectItem value="Vocational">Vocational</SelectItem>
                                        <SelectItem value="No Formal Education">No Formal Education</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400">Dependency Ratio (Family Count)</Label>
                                <Input 
                                    type="number" 
                                    className="bg-slate-900 border-slate-800 h-10" 
                                    value={editingProfile?.dependency_ratio || ""} 
                                    onChange={(e) => setEditingProfile(prev => prev ? {...prev, dependency_ratio: parseFloat(e.target.value)} : null)}
                                />
                            </div>
                        </div>

                        {/* Economic Section */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-b border-emerald-500/20 pb-2 flex items-center gap-2">
                                <TrendingUp className="h-3 w-3" /> ECONOMIC STATUS
                            </h4>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400">Fishing Monthly Income (₱)</Label>
                                <Input 
                                    type="number" 
                                    className="bg-slate-900 border-slate-800 h-10 font-black text-emerald-500" 
                                    value={editingProfile?.monthly_income || ""} 
                                    onChange={(e) => setEditingProfile(prev => prev ? {...prev, monthly_income: parseFloat(e.target.value)} : null)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400">Secondary Livelihood</Label>
                                <Input 
                                    placeholder="Construction, Farming, etc."
                                    className="bg-slate-900 border-slate-800 h-10 italic" 
                                    value={editingProfile?.secondary_livelihood || ""} 
                                    onChange={(e) => setEditingProfile(prev => prev ? {...prev, secondary_livelihood: e.target.value} : null)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400">Everyday Living Assessment</Label>
                                <Textarea 
                                    placeholder="Is it enough for their daily needs? (e.g., Sufficient for family, Struggling with basic needs)"
                                    className="bg-slate-900 border-slate-800 h-20 text-xs italic" 
                                    value={editingProfile?.welfare_status || ""} 
                                    onChange={(e) => setEditingProfile(prev => prev ? {...prev, welfare_status: e.target.value} : null)}
                                />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                                <Checkbox 
                                    id="poverty" 
                                    checked={editingProfile?.poverty_status} 
                                    onCheckedChange={(checked: boolean) => setEditingProfile(prev => prev ? {...prev, poverty_status: !!checked} : null)}
                                />
                                <Label htmlFor="poverty" className="text-xs font-bold text-slate-300 uppercase italic">Below Poverty Threshold</Label>
                            </div>
                        </div>

                        {/* Occupational Section */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] border-b border-amber-500/20 pb-2 flex items-center gap-2">
                                <Anchor className="h-3 w-3" /> OCCUPATIONAL PROFILE
                            </h4>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400">Fishing Gear Used</Label>
                                <Input 
                                    placeholder="Lambat, Kawil, Panti, etc."
                                    className="bg-slate-900 border-slate-800 h-10" 
                                    value={editingProfile?.fishing_gear || ""} 
                                    onChange={(e) => setEditingProfile(prev => prev ? {...prev, fishing_gear: e.target.value} : null)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-400">Boat Status</Label>
                                    <Select value={editingProfile?.boat_ownership_status || ""} onValueChange={(val) => setEditingProfile(prev => prev ? {...prev, boat_ownership_status: val} : null)}>
                                        <SelectTrigger className="bg-slate-900 border-slate-800 h-10 text-[10px]">
                                            <SelectValue placeholder="Ownership" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                            <SelectItem value="Owned">Owned</SelectItem>
                                            <SelectItem value="Rented">Rented</SelectItem>
                                            <SelectItem value="Shared">Shared</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col justify-end gap-3 pb-2 px-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox 
                                            id="motorized" 
                                            checked={editingProfile?.boat_type_motorized} 
                                            onCheckedChange={(checked: boolean) => setEditingProfile(prev => prev ? {...prev, boat_type_motorized: !!checked} : null)}
                                        />
                                        <Label htmlFor="motorized" className="text-[10px] font-bold">Motorized Vessel?</Label>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400">Gear / Tools / Vessel Needs</Label>
                                <Textarea 
                                    placeholder="Ano ang mga needs nila? (e.g., Engine repair, new net, boat paint)"
                                    className="bg-slate-900 border-slate-800 h-24 text-xs italic" 
                                    value={editingProfile?.fishing_needs || ""} 
                                    onChange={(e) => setEditingProfile(prev => prev ? {...prev, fishing_needs: e.target.value} : null)}
                                />
                            </div>
                        </div>

                        {/* Subsidy Section */}
                        <div className="col-span-full space-y-6 pt-4">
                            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] border-b border-rose-500/20 pb-2 flex items-center gap-2">
                                <Package className="h-3 w-3" /> SUBSIDIES & COMPLIANCE REQUIREMENTS
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-400">Active Subsidies Received</Label>
                                    <Textarea 
                                        placeholder="What subsidies are they having? (e.g., Fuel subsidy, Tilapia fingerlings, Life vest)"
                                        className="bg-slate-900 border-slate-800 h-24 text-sm font-bold text-emerald-400" 
                                        value={editingProfile?.subsidies_received || ""} 
                                        onChange={(e) => setEditingProfile(prev => prev ? {...prev, subsidies_received: e.target.value} : null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-400">Requirements / Compliance Needed</Label>
                                    <Textarea 
                                        placeholder="Ano ang need nila i-comply? (e.g., Updated Boat Registration, RSBSA form 2026, Barangay Clearance)"
                                        className="bg-slate-900 border-slate-800 h-24 text-sm font-bold text-rose-400" 
                                        value={editingProfile?.subsidy_requirements || ""} 
                                        onChange={(e) => setEditingProfile(prev => prev ? {...prev, subsidy_requirements: e.target.value} : null)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-slate-900/50 border-t border-slate-800 gap-3">
                        <Button variant="ghost" onClick={() => setEditingProfile(null)} className="h-12 px-8 font-bold border-slate-800 text-slate-400 hover:bg-slate-800 rounded-2xl transition-all">
                            Discard
                        </Button>
                        <Button 
                            className="bg-blue-600 hover:bg-blue-500 h-12 px-10 font-black text-white rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            SAVE TO FISHERFOLK REGISTRY
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </div>
    )
}
