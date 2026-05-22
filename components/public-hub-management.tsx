"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "./ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Plus, Trash2, Edit, Save, Globe, Info, Bell, Loader2, TrendingUp, DollarSign, Activity } from "lucide-react"

export function PublicHubManagement() {
    const [loading, setLoading] = useState(true)
    const [programs, setPrograms] = useState<any[]>([])
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [marketPrices, setMarketPrices] = useState<any[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const [pRes, aRes, mRes] = await Promise.all([
            supabase.from('hub_programs').select('*').order('created_at', { ascending: false }),
            supabase.from('hub_announcements').select('*').order('created_at', { ascending: false }),
            supabase.from('hub_market_prices').select('*').order('species', { ascending: true }),
        ])

        if (!pRes.error) setPrograms(pRes.data || [])
        if (!aRes.error) setAnnouncements(aRes.data || [])
        if (!mRes.error) setMarketPrices(mRes.data || [])
        
        setLoading(false)
    }

    const handleDelete = async (table: string, id: string) => {
        const { error } = await supabase.from(table).delete().eq('id', id)
        if (error) {
            toast.error("Failed to delete item")
        } else {
            toast.success("Item deleted successfully")
            fetchData()
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Globe className="text-blue-500" /> Public Hub Content
                    </h2>
                    <p className="text-slate-400 font-medium italic opacity-70">Manage the content visible on the Public Transparency Hub.</p>
                </div>
                <Button onClick={fetchData} variant="outline" size="sm" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 rounded-xl font-bold">
                    Refresh Data
                </Button>
            </div>

            <Tabs defaultValue="programs" className="w-full">
                <TabsList className="bg-slate-900/60 border border-slate-800 p-1 rounded-2xl mb-8">
                    <TabsTrigger value="programs" className="rounded-xl px-6 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2">
                        <Info className="h-4 w-4" /> Programs
                    </TabsTrigger>
                    <TabsTrigger value="announcements" className="rounded-xl px-6 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2">
                        <Bell className="h-4 w-4" /> Announcements
                    </TabsTrigger>
                    <TabsTrigger value="market" className="rounded-xl px-6 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Market Watch
                    </TabsTrigger>
                </TabsList>

                {/* Programs Tab */}
                <TabsContent value="programs">
                    <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 p-8">
                            <div>
                                <CardTitle className="text-xl font-bold text-white">Programs & Projects</CardTitle>
                                <CardDescription className="text-slate-400">List of active and completed fishery support initiatives.</CardDescription>
                            </div>
                            <ProgramDialog onSave={fetchData} />
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-950/50 border-b border-slate-800">
                                    <TableRow className="hover:bg-transparent border-slate-800">
                                        <TableHead className="px-8 text-slate-400 font-bold uppercase text-[10px]">Title</TableHead>
                                        <TableHead className="px-8 text-slate-400 font-bold uppercase text-[10px]">Status</TableHead>
                                        <TableHead className="px-8 text-slate-400 font-bold uppercase text-[10px]">Start Date</TableHead>
                                        <TableHead className="px-8 text-right text-slate-400 font-bold uppercase text-[10px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {programs.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-500 italic">No programs found.</TableCell></TableRow>
                                    ) : (
                                        programs.map((p) => (
                                            <TableRow key={p.id} className="border-slate-800/50 hover:bg-slate-800/30">
                                                <TableCell className="px-8 py-4 font-bold text-slate-200">{p.title}</TableCell>
                                                <TableCell className="px-8 py-4 capitalize">
                                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${p.status === 'ongoing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-700/20 text-slate-400 border border-slate-700/30'}`}>
                                                        {p.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-8 py-4 text-slate-400 text-xs font-medium">{p.start_date || '—'}</TableCell>
                                                <TableCell className="px-8 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <ProgramDialog program={p} onSave={fetchData} />
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-500" onClick={() => handleDelete('hub_programs', p.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Announcements Tab */}
                <TabsContent value="announcements">
                    <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 p-8">
                            <div>
                                <CardTitle className="text-xl font-bold text-white">Announcements</CardTitle>
                                <CardDescription className="text-slate-400">Public updates and training schedules.</CardDescription>
                            </div>
                            <AnnouncementDialog onSave={fetchData} />
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-950/50 border-b border-slate-800">
                                    <TableRow className="hover:bg-transparent border-slate-800">
                                        <TableHead className="px-8 text-slate-400 font-bold uppercase text-[10px]">Title</TableHead>
                                        <TableHead className="px-8 text-slate-400 font-bold uppercase text-[10px]">Event Date</TableHead>
                                        <TableHead className="px-8 text-right text-slate-400 font-bold uppercase text-[10px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {announcements.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-20 text-slate-500 italic">No announcements found.</TableCell></TableRow>
                                    ) : (
                                        announcements.map((a) => (
                                            <TableRow key={a.id} className="border-slate-800/50 hover:bg-slate-800/30">
                                                <TableCell className="px-8 py-4 font-bold text-slate-200">{a.title}</TableCell>
                                                <TableCell className="px-8 py-4 text-slate-400 text-xs font-medium">
                                                    {a.event_date || '—'}
                                                </TableCell>
                                                <TableCell className="px-8 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <AnnouncementDialog announcement={a} onSave={fetchData} />
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-500" onClick={() => handleDelete('hub_announcements', a.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Market Watch Tab */}
                <TabsContent value="market">
                    <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 p-8">
                            <div>
                                <CardTitle className="text-xl font-bold text-white">Market Price Monitoring</CardTitle>
                                <CardDescription className="text-slate-400">Update daily fish prices for the public dashboard.</CardDescription>
                            </div>
                            <Button variant="outline" className="border-slate-800 hover:bg-slate-800 rounded-xl font-bold">
                                Update Prices
                            </Button>
                            <PriceDialog onSave={fetchData} />
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-950/50 border-b border-slate-800">
                                    <TableRow className="hover:bg-transparent border-slate-800">
                                        <TableHead className="px-8 text-slate-400 font-bold uppercase text-[10px]">Species</TableHead>
                                        <TableHead className="px-8 text-slate-400 font-bold uppercase text-[10px]">Price/kg</TableHead>
                                        <TableHead className="px-8 text-slate-400 font-bold uppercase text-[10px]">Trend</TableHead>
                                        <TableHead className="px-8 text-right text-slate-400 font-bold uppercase text-[10px]">Change</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {marketPrices.map((p) => (
                                        <TableRow key={p.species} className="border-slate-800/50 hover:bg-slate-800/30">
                                            <TableCell className="px-8 py-4 font-bold text-slate-200">{p.species}</TableCell>
                                            <TableCell className="px-8 py-4 text-white font-black italic">₱{p.price}</TableCell>
                                            <TableCell className="px-8 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${p.trend === 'up' ? 'bg-rose-500/10 text-rose-400' : p.trend === 'down' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/20 text-slate-400'}`}>
                                                    {p.trend}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-8 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <PriceDialog priceItem={p} onSave={fetchData} />
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-500" onClick={() => handleDelete('hub_market_prices', p.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function ProgramDialog({ program, onSave }: { program?: any, onSave: () => void }) {
    const [title, setTitle] = useState(program?.title || "")
    const [description, setDescription] = useState(program?.description || "")
    const [startDate, setStartDate] = useState(program?.start_date || "")
    const [endDate, setEndDate] = useState(program?.end_date || "")
    const [status, setStatus] = useState(program?.status || "ongoing")
    const [imageUrl, setImageUrl] = useState(program?.image_url || "")
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const payload = { title, description, start_date: startDate || null, end_date: endDate || null, status, image_url: imageUrl }

        let error
        if (program) {
            const res = await supabase.from('hub_programs').update(payload).eq('id', program.id)
            error = res.error
        } else {
            const res = await supabase.from('hub_programs').insert([payload])
            error = res.error
        }

        if (error) {
            toast.error("Failed to save program")
        } else {
            toast.success("Program saved successfully")
            onSave()
            setOpen(false)
        }
        setSaving(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 rounded-xl font-bold px-4">
                    {program ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />} {program ? "" : "Add Program"}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle>{program ? "Edit Program" : "Add New Program"}</DialogTitle>
                    <DialogDescription>Fill in the details for the public program.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Program Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Boat Engine Subsidy" className="bg-slate-800 border-slate-700" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder="Brief description of the program" className="bg-slate-800 border-slate-700 min-h-[100px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-800 border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-800 border-slate-700" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md h-10 px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Image URL (Optional)</Label>
                        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="bg-slate-800 border-slate-700" />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold h-12 rounded-xl mt-4" disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {program ? "Update Program" : "Create Program"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function PriceDialog({ priceItem, onSave }: { priceItem?: any, onSave: () => void }) {
    const [species, setSpecies] = useState(priceItem?.species || "")
    const [price, setPrice] = useState(priceItem?.price || "")
    const [trend, setTrend] = useState(priceItem?.trend || "stable")
    const [changeText, setChangeText] = useState(priceItem?.change_text || "")
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const payload = { species, price: Number(price), trend, change_text: changeText }

        let error
        if (priceItem) {
            const res = await supabase.from('hub_market_prices').update(payload).eq('id', priceItem.id)
            error = res.error
        } else {
            const res = await supabase.from('hub_market_prices').insert([payload])
            error = res.error
        }

        if (error) {
            toast.error("Failed to save price")
        } else {
            toast.success("Price saved successfully")
            onSave()
            setOpen(false)
        }
        setSaving(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 rounded-xl font-bold px-4">
                    {priceItem ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />} {priceItem ? "" : "Add Price"}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle>{priceItem ? "Edit Price" : "Add New Fish Price"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Species Name</Label>
                        <Input value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="e.g. Milkfish (Bangus)" className="bg-slate-800 border-slate-700" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Price per kg (₱)</Label>
                            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="180" className="bg-slate-800 border-slate-700" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Trend</Label>
                            <select value={trend} onChange={(e) => setTrend(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md h-10 px-3 text-sm outline-none">
                                <option value="stable">Stable</option>
                                <option value="up">Price Up</option>
                                <option value="down">Price Down</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Change Text (e.g. +₱5)</Label>
                        <Input value={changeText} onChange={(e) => setChangeText(e.target.value)} placeholder="+₱5" className="bg-slate-800 border-slate-700" />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold h-12 rounded-xl mt-4" disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {priceItem ? "Update Price" : "Save Price"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function AnnouncementDialog({ announcement, onSave }: { announcement?: any, onSave: () => void }) {
    const [title, setTitle] = useState(announcement?.title || "")
    const [description, setDescription] = useState(announcement?.description || "")
    const [eventDate, setEventDate] = useState(announcement?.event_date || "")
    const [category, setCategory] = useState(announcement?.category || "general")
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const payload = { title, description, event_date: eventDate || null, category }

        let error
        if (announcement) {
            const res = await supabase.from('hub_announcements').update(payload).eq('id', announcement.id)
            error = res.error
        } else {
            const res = await supabase.from('hub_announcements').insert([payload])
            error = res.error
        }

        if (error) {
            toast.error("Failed to save announcement")
        } else {
            toast.success("Announcement saved successfully")
            onSave()
            setOpen(false)
        }
        setSaving(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 rounded-xl font-bold px-4">
                    {announcement ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />} {announcement ? "" : "Add Announcement"}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle>{announcement ? "Edit Announcement" : "Add Announcement"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. FAO No. 250: Closed Season" className="bg-slate-800 border-slate-700" required />
                        <p className="text-[10px] text-slate-500 font-medium italic">* Use 'Order' for Admin Orders, 'Weather' for Bulletins</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md h-10 px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                            <option value="general">General Advisory</option>
                            <option value="order">Fisheries Admin Order</option>
                            <option value="weather">Weather & Safety</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} className="bg-slate-800 border-slate-700 min-h-[100px]" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Event Date (Optional)</Label>
                        <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="bg-slate-800 border-slate-700" />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold h-12 rounded-xl mt-4" disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Announcement
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}