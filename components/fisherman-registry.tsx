"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, Plus, Edit, Trash2, Save, Loader2, X, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FishermanPrintableReport } from "./fisherman-printable-report"

// Supabase client is imported from @/lib/supabase

interface Fisherman {
  id: string
  fisherman_id: string | null
  last_name: string | null
  first_name: string | null
  boat_name: string | null
  location: string | null
  phone_number: string | null
  status: string | null
  created_at: string | null
}

export function FishermanRegistry() {
  const [fishermen, setFishermen] = useState<Fisherman[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFisherman, setEditingFisherman] = useState<Fisherman | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [fishermanToPrint, setFishermanToPrint] = useState<Fisherman | null>(null)
  
  // Form State
  const [formState, setFormState] = useState({
    fisherman_id: "",
    last_name: "",
    first_name: "",
    boat_name: "",
    location: "",
    phone_number: ""
  })

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFishermen(searchQuery)
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchFishermen()

    // Set up real-time subscription for fisherman profiles
    const channel = supabase
      .channel('fisherman-registry-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fisherman_registration' },
        (payload: any) => {
          console.log('New fisherman registered:', payload)

          const safeFisherman: Fisherman = {
            id: payload.new.id ?? crypto.randomUUID(),
            fisherman_id: payload.new.fisherman_id ?? "",
            last_name: payload.new.last_name ?? "",
            first_name: payload.new.first_name ?? "",
            boat_name: payload.new.boat_name ?? "",
            location: payload.new.location ?? "",
            phone_number: payload.new.phone_number ?? "",
            status: payload.new.status ?? "",
            created_at: payload.new.created_at ?? null,
          }

          setFishermen((current) => [safeFisherman, ...current])
        }
      )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'fisherman_registration' },
      (payload: any) => {
        console.log('Fisherman profile updated:', payload)

        const safeFisherman: Fisherman = {
          id: payload.new.id ?? "",
          fisherman_id: payload.new.fisherman_id ?? "",
          last_name: payload.new.last_name ?? "",
          first_name: payload.new.first_name ?? "",
          boat_name: payload.new.boat_name ?? "",
          location: payload.new.location ?? "",
          phone_number: payload.new.phone_number ?? "",
          status: payload.new.status ?? "",
          created_at: payload.new.created_at ?? null,
        }

        setFishermen((current) =>
          current.map((f) => (f.id === safeFisherman.id ? safeFisherman : f))
        )
      }
    )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'fisherman_registration' },
        (payload: any) => {
          console.log('Fisherman profile deleted:', payload)
          setFishermen((current) =>
            current.filter((f) => f.id !== payload.old.id)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchFishermen = async (query: string = "") => {
    console.log('[Fisherman Registry] Starting fetch with query:', query)
    setLoading(true)
    
    try {
      let supabaseQuery = supabase
        .from('fisherman_registration')
        .select('*')
      
      // Server-side filtering with multi-column search using .or() and .ilike()
      if (query && query.trim() !== "") {
        const searchTerm = `%${query.trim()}%`
        console.log('[Fisherman Registry] Applying filter with term:', searchTerm)
        supabaseQuery = supabaseQuery.or(
          `last_name.ilike.${searchTerm},first_name.ilike.${searchTerm},fisherman_id.ilike.${searchTerm},boat_name.ilike.${searchTerm},location.ilike.${searchTerm}`
        )
      }
      
      console.log('[Fisherman Registry] Executing Supabase query...')
      const { data, error } = await supabaseQuery.order('created_at', { ascending: false })
      
      console.log('[Fisherman Registry] Supabase response:', {
        hasError: !!error,
        error: error?.message,
        hasData: !!data,
        dataCount: data?.length || 0,
        dataSample: data?.[0] || null
      })

      const sanitizedData: Fisherman[] = (data || []).map((item: any) => ({
        id: item.id ?? crypto.randomUUID(),
        fisherman_id: item.fisherman_id ?? "",
        last_name: item.last_name ?? "",
        first_name: item.first_name ?? "",
        boat_name: item.boat_name ?? "",
        location: item.location ?? "",
        phone_number: item.phone_number ?? "",
        status: item.status ?? "",
        created_at: item.created_at ?? null,
      }))

      setFishermen(sanitizedData)
    } catch (err) {
      console.error('[Fisherman Registry] Network or unexpected error:', err)
      setFishermen([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdate = async () => {
    setLoading(true)
    try {
      if (editingFisherman) {
        // Update
        const { error } = await supabase
          .from('fisherman_registration')
          .update({
            last_name: formState.last_name,
            first_name: formState.first_name,
            boat_name: formState.boat_name,
            location: formState.location,
            phone_number: formState.phone_number,
            fisherman_id: formState.fisherman_id
          })
          .eq('id', editingFisherman.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('fisherman_registration')
          .insert([
            {
              fisherman_id: formState.fisherman_id,
              last_name: formState.last_name,
              first_name: formState.first_name,
              boat_name: formState.boat_name,
              location: formState.location,
              phone_number: formState.phone_number
            }
          ])

        if (error) throw error
      }
      
      setIsDialogOpen(false)
      setEditingFisherman(null)
      setFormState({ fisherman_id: "", last_name: "", first_name: "", boat_name: "", location: "", phone_number: "" })
      // No need to manually fetchFishermen() here as the realtime subscription will handle the UI update
    } catch (error: any) {
      alert("Action failed: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fisherman?")) return
    
    setLoading(true)
    const { error } = await supabase
      .from('fisherman_registration')
      .delete()
      .eq('id', id)

    if (error) {
      alert("Delete failed: " + error.message)
    }
    // No need to manually fetchFishermen() as the realtime subscription will handle the UI update
    setLoading(false)
  }

  const openAddDialog = () => {
    setEditingFisherman(null)
    setFormState({ fisherman_id: "", last_name: "", first_name: "", boat_name: "", location: "", phone_number: "" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (fisherman: Fisherman) => {
    setEditingFisherman(fisherman)

    setFormState({
      fisherman_id: fisherman.fisherman_id ?? "",
      last_name: fisherman.last_name ?? "",
      first_name: fisherman.first_name ?? "",
      boat_name: fisherman.boat_name ?? "",
      location: fisherman.location ?? "",
      phone_number: fisherman.phone_number ?? "",
    })

    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, ID or boat..."
            className="pl-9 w-full bg-slate-950/50 border-slate-800 rounded-xl focus:ring-blue-600 focus:ring-offset-0 text-slate-100 placeholder:text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 flex gap-2">
              <Plus className="h-4 w-4" />
              Add Fisherman
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white tracking-tight">
                {editingFisherman ? 'Edit Fisherman Profile' : 'Register New Fisherman'}
              </DialogTitle>
              <DialogDescription className="text-slate-300 font-medium">
                Update municipal registry information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fid" className="text-right text-[10px] font-bold uppercase text-slate-500">FM ID</Label>
                <Input
                  id="fid"
                  placeholder="FM-2024-XXX"
                  className="col-span-3 bg-slate-950/50 border-slate-800 rounded-xl"
                  value={formState.fisherman_id}
                  onChange={(e) => setFormState({...formState, fisherman_id: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastname" className="text-right text-[10px] font-bold uppercase text-slate-500">Surname</Label>
                <Input
                  id="lastname"
                  placeholder="Last Name"
                  className="col-span-3 bg-slate-950/50 border-slate-800 rounded-xl"
                  value={formState.last_name}
                  onChange={(e) => setFormState({...formState, last_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstname" className="text-right text-[10px] font-bold uppercase text-slate-500">Given Name</Label>
                <Input
                  id="firstname"
                  placeholder="First Name"
                  className="col-span-3 bg-slate-950/50 border-slate-800 rounded-xl"
                  value={formState.first_name}
                  onChange={(e) => setFormState({...formState, first_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="boat" className="text-right text-[10px] font-bold uppercase text-slate-500">Vessel</Label>
                <Input
                  id="boat"
                  placeholder="Vessel Name"
                  className="col-span-3 bg-slate-950/50 border-slate-800 rounded-xl"
                  value={formState.boat_name}
                  onChange={(e) => setFormState({...formState, boat_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right text-[10px] font-bold uppercase text-slate-500">Port</Label>
                <Input
                  id="location"
                  placeholder="Home Port"
                  className="col-span-3 bg-slate-950/50 border-slate-800 rounded-xl"
                  value={formState.location}
                  onChange={(e) => setFormState({...formState, location: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right text-[10px] font-bold uppercase text-slate-500">Contact</Label>
                <Input
                  id="contact"
                  placeholder="Mobile Number"
                  className="col-span-3 bg-slate-950/50 border-slate-800 rounded-xl"
                  value={formState.phone_number}
                  onChange={(e) => setFormState({...formState, phone_number: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button onClick={handleCreateOrUpdate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 font-bold h-12 rounded-xl">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {editingFisherman ? 'Commit Changes' : 'Register Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 overflow-x-auto w-full shadow-2xl">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-slate-950/50 border-b border-slate-800">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="px-6 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Registry ID</TableHead>
              <TableHead className="px-6 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Last Name</TableHead>
              <TableHead className="px-6 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px]">First Name</TableHead>
              <TableHead className="px-6 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Vessel</TableHead>
              <TableHead className="px-6 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Port</TableHead>
              <TableHead className="px-6 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contact</TableHead>
              <TableHead className="px-6 h-14 text-slate-400 font-bold uppercase tracking-wider text-[10px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && fishermen.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                </TableCell>
              </TableRow>
            ) : fishermen.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500 font-medium">
                  No fishermen found.
                </TableCell>
              </TableRow>
            ) : (
              fishermen.map((f: Fisherman) => (
                <TableRow key={f.id} className="border-slate-800/50 group hover:bg-slate-800/30 transition-all">
                  <TableCell className="px-6 py-4 font-black text-blue-400">
                    {f.fisherman_id || "N/A"}
                  </TableCell>

                  <TableCell className="px-6 py-4 font-bold text-slate-200">
                    {f.last_name || "N/A"}
                  </TableCell>

                  <TableCell className="px-6 py-4 font-bold text-slate-200">
                    {f.first_name || "N/A"}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-slate-400 uppercase text-[11px] font-bold">
                    {f.boat_name || "—"}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-slate-300 font-medium">
                    {f.location || "—"}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                    {f.phone_number || "—"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setFishermanToPrint(f)}
                        className="h-9 w-9 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                        title="Download Analytics PDF"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(f)}
                        className="h-9 w-9 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(f.id)}
                        className="h-9 w-9 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <FishermanPrintableReport 
        fisherman={fishermanToPrint}
        onFinished={() => {
          setFishermanToPrint(null)
        }}
      />
    </div>
  )
}
