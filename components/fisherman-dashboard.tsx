"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/components/user-profile"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { DigitalIdCard } from "@/components/digital-id-card"
import { toast } from "sonner"

// Supabase client is imported from @/lib/supabase

export function FishermanDashboard() {
    const [activeTab, setActiveTab] = useState("new-report")
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [reports, setReports] = useState<any[]>([])

    // Form state
    const [species, setSpecies] = useState("")
    const [weight, setWeight] = useState("")
    const [processingMethod, setProcessingMethod] = useState("")
    const [location, setLocation] = useState("")

    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")

    useEffect(() => {
        let channel: any;

        // Fetch current user and their reports
        const fetchUserAndData = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setUser(session.user)

                // Load from cache first for immediate feedback
                const cachedReports = localStorage.getItem(`fishtory_reports_cache_${session.user.id}`)
                if (cachedReports) {
                    try {
                        setReports(JSON.parse(cachedReports))
                    } catch (e) {
                        console.error("Failed to parse cached reports", e)
                    }
                }

                // Fetch only the reports for this specific user
                fetchReports(session.user.id)

                // Set up real-time subscription for this specific user's reports
                channel = supabase
                    .channel(`fisherman-reports-${session.user.id}`)
                    .on(
                        'postgres_changes',
                        { 
                            event: 'INSERT', 
                            schema: 'public', 
                            table: 'reports',
                            filter: `user_id=eq.${session.user.id}`
                        },
                        (payload: any) => {
                            console.log('New report received:', payload)
                            setReports((current) => [payload.new, ...current])
                        }
                    )
                    .on(
                        'postgres_changes',
                        { 
                            event: 'UPDATE', 
                            schema: 'public', 
                            table: 'reports',
                            filter: `user_id=eq.${session.user.id}`
                        },
                        (payload: any) => {
                            console.log('Report updated:', payload)
                            setReports((current) =>
                                current.map((report) =>
                                    report.id === payload.new.id ? payload.new : report
                                )
                            )
                        }
                    )
                    .subscribe()
            }
        }
        fetchUserAndData()

        return () => {
            if (channel) {
                supabase.removeChannel(channel)
            }
        }
    }, [activeTab]) // Re-fetch when switching tabs

    const fetchReports = async (userId: string) => {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setReports(data)
            // Save to localStorage so they persist after logout/refresh
            localStorage.setItem(`fishtory_reports_cache_${userId}`, JSON.stringify(data))
        }
    }

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Speech Recognition Not Supported", {
                description: "Your browser does not support Speech Recognition. Please use Chrome or Edge."
            })
            return
        }

        const SpeechRecognitionApi = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRecognitionApi()

        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'tl-PH' // Tagalog primary, usually understands English mixed in

        recognition.onstart = () => {
            setIsListening(true)
            setTranscript("Listening... Please speak now.")
        }

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript.toLowerCase()
            setTranscript(`Heard: "${text}"`)
            
            // --- Parsers ---

            // Species parsing
            if (text.includes("bangus") || text.includes("milkfish")) setSpecies("bangus")
            else if (text.includes("tilapia")) setSpecies("tilapia")
            else if (text.includes("lapu") || text.includes("grouper")) setSpecies("lapu-lapu")
            else if (text.includes("dilis") || text.includes("anchov")) setSpecies("dilis")
            else if (text.includes("sardinas") || text.includes("sardine")) setSpecies("sardinas")
            else if (text.includes("tuna")) setSpecies("tuna")

            // Processing parsing
            if (text.includes("sariwa") || text.includes("fresh")) setProcessingMethod("fresh")
            else if (text.includes("tinapa") || text.includes("smoked")) setProcessingMethod("smoked")
            else if (text.includes("tuyo") || text.includes("dried")) setProcessingMethod("dried")
            else if (text.includes("daing") || text.includes("salt")) setProcessingMethod("salted")

            // Location parsing
            if (text.includes("banicain")) setLocation("Banicain")
            else if (text.includes("barretto") || text.includes("bareto")) setLocation("Barretto")
            else if (text.includes("kalaklan") || text.includes("calaclan")) setLocation("Kalaklan")

            // Weight parsing (looks for numbers before "kilo" or just standalone numbers if it makes sense)
            const weightMatch = text.match(/([\d.]+)\s*(kilo|kg|kilograms?)/)
            if (weightMatch && weightMatch[1]) {
                setWeight(weightMatch[1])
            } else {
                // Try grabbing the first number spoken if no unit was specified
                const numMatch = text.match(/(\d+(\.\d+)?)/)
                if (numMatch && numMatch[1]) {
                    setWeight(numMatch[1])
                }
            }

            setTimeout(() => setTranscript(""), 4000)
        }

        recognition.onerror = (event: any) => {
            console.error("Speech error", event?.error || "Unknown error")
            setTranscript("Error: Could not hear clearly.")
            setIsListening(false)
            setTimeout(() => setTranscript(""), 3000)
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognition.start()
    }

    const handleSubmit = async () => {
        if (!user) return toast.error("Authentication required", {
            description: "You must be logged in to submit a report."
        })
        if (!species || !weight || !processingMethod || !location) {
            return toast.error("Missing Information", {
                description: "Please fill in all fields."
            })
        }

        setLoading(true)

        // Pull these silently from user metadata — not shown in form
        const fishermanId = user.user_metadata?.fisherman_id || 'Unknown'
        const boatName = user.user_metadata?.boat_name || 'Unknown'

        const { error } = await supabase
            .from('reports')
            .insert([
                {
                    fisherman_id: fishermanId,
                    user_id: user.id,
                    boat_name: boatName,
                    species,
                    weight_kg: Number(weight),
                    processing_method: processingMethod,
                    location,
                    status: 'pending'
                }
            ])

        if (error) {
            toast.error("Submission Failed", {
                description: error.message
            })
        } else {
            toast.success("Report Submitted", {
                description: "Your catch report has been sent successfully!"
            })
            // Reset form
            setSpecies("")
            setWeight("")
            setProcessingMethod("")
            setLocation("")
            // Switch to reports tab to see it
            setActiveTab("my-reports")
        }
        setLoading(false)
    }

    // Helper to format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    // Helper for status color
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'text-green-600'
            case 'rejected': return 'text-red-600'
            default: return 'text-yellow-600'
        }
    }

    return (
        <div className="container mx-auto py-6 sm:py-10 px-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 border-b-4 border-blue-500 pb-2 inline-block">Fishtory Dashboard</h1>
                <UserProfile />
            </div>

            <Tabs value={activeTab} defaultValue="submit" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-full sm:max-w-[500px] mb-8 h-auto sm:h-auto gap-1 sm:gap-0 bg-transparent sm:bg-slate-100 p-0 sm:p-1">
                    <TabsTrigger value="new-report" className="w-full data-[state=inactive]:bg-slate-100 sm:data-[state=inactive]:bg-transparent">New Catch</TabsTrigger>
                    <TabsTrigger value="my-reports" className="w-full data-[state=inactive]:bg-slate-100 sm:data-[state=inactive]:bg-transparent">My Reports</TabsTrigger>
                    <TabsTrigger value="my-id" className="w-full data-[state=inactive]:bg-slate-100 sm:data-[state=inactive]:bg-transparent">My ID Card</TabsTrigger>
                </TabsList>

                <TabsContent value="new-report">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl">Submit Catch Report</CardTitle>
                                    <CardDescription>
                                        Fill out the details below, or use voice command.
                                    </CardDescription>
                                </div>
                                <Button 
                                    variant={isListening ? "destructive" : "secondary"}
                                    onClick={startListening}
                                    className="flex items-center gap-2 w-full sm:w-auto"
                                >
                                    {isListening ? (
                                        <>
                                            <span className="animate-pulse h-2 w-2 bg-white rounded-full"></span>
                                            Listening...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                                            Use Voice
                                        </>
                                    )}
                                </Button>
                            </div>
                            {transcript && (
                                <p className="text-sm font-medium text-blue-600 bg-blue-50 p-2 rounded-md mt-2 border border-blue-100">
                                    {transcript}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Fish Species / Uri ng Isda</Label>
                                <Select value={species} onValueChange={setSpecies}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select fish / Pumili ng isda" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bangus">Bangus (Milkfish)</SelectItem>
                                        <SelectItem value="tilapia">Tilapia</SelectItem>
                                        <SelectItem value="lapu-lapu">Lapu-lapu (Grouper)</SelectItem>
                                        <SelectItem value="dilis">Dilis (Anchovies)</SelectItem>
                                        <SelectItem value="sardinas">Sardinas (Sardines)</SelectItem>
                                        <SelectItem value="tuna">Tuna</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Weight (kg) / Bigat</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="0.0" 
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Processing / Pagproseso</Label>
                                    <Select value={processingMethod} onValueChange={setProcessingMethod}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select process / Pumili ng proseso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fresh">Fresh / Sariwa</SelectItem>
                                            <SelectItem value="smoked">Smoked / Tinapa</SelectItem>
                                            <SelectItem value="dried">Dried / Tuyo</SelectItem>
                                            <SelectItem value="salted">Salted / Daing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Location / Lokasyon</Label>
                                <Select value={location} onValueChange={setLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location / Pumili ng lokasyon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Banicain">Banicain</SelectItem>
                                        <SelectItem value="Barretto">Barretto</SelectItem>
                                        <SelectItem value="Kalaklan">Kalaklan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        </CardContent>
                        <CardFooter>
                            <Button 
                                className="w-full md:w-auto" 
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Submit Report / Ipasa ang Ulat"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="my-reports">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report History</CardTitle>
                            <CardDescription>
                                View the status of your submitted reports.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto w-full">
                                <Table className="min-w-[400px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Fish</TableHead>
                                            <TableHead>Weight</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reports.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                    No reports found. Submit your first catch report!
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            reports.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell className="whitespace-nowrap">{formatDate(report.created_at)}</TableCell>
                                                    <TableCell className="capitalize whitespace-nowrap">{report.species}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{report.weight_kg} kg</TableCell>
                                                    <TableCell className={`${getStatusColor(report.status)} font-medium capitalize whitespace-nowrap`}>
                                                        {report.status}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="my-id">
                    <div className="flex justify-center py-4 sm:py-8 overflow-hidden transform scale-90 sm:scale-100 origin-top">
                        <DigitalIdCard />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
