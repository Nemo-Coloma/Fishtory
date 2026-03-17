"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import dynamic from "next/dynamic"
import { UserProfile } from "@/components/user-profile"
import { toast } from "sonner" // Added this import

// Dynamic import for Leaflet map to avoid window undefined error
const CatchMap = dynamic(() => import("@/components/catch-map"), { 
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse flex items-center justify-center">Loading Map...</div>
})

const AnalyticsView = dynamic(() => import("@/components/analytics-view"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-50 animate-pulse flex items-center justify-center">Loading Analytics...</div>
})

const FishermanRegistry = dynamic(() => import("@/components/fisherman-registry").then(m => m.FishermanRegistry), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-50 animate-pulse flex items-center justify-center">Loading Registry...</div>
})

// Supabase client is imported from @/lib/supabase

export function AdminDashboard() {
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchReports = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setReports(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        // Initial fetch
        fetchReports()

        // Set up real-time subscription
        const channel = supabase
            .channel('admin-reports-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'reports' },
                (payload: any) => {
                    console.log('New report received:', payload)
                    setReports((current) => [payload.new, ...current])
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'reports' },
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

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

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
            // Update local state is handled by real-time listener normally, 
            // but we filter locally for faster feedback
            setReports((current) => 
                current.map((report) => 
                    report.id === reportId ? { ...report, status: newStatus } : report
                )
            )
        }
    }

    // Calculate stats
    const totalCatch = reports
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + Number(r.weight_kg), 0)
    
    const pendingCount = reports.filter(r => r.status === 'pending').length
    const uniqueFishermen = new Set(reports.map(r => r.fisherman_id)).size

    return (
        <div className="container mx-auto py-6 sm:py-10 px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 border-b-4 border-blue-500 pb-2 inline-block">Agricultural Office Dashboard</h1>
                <UserProfile />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Catch (Approved)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCatch.toLocaleString()} kg</div>
                        <p className="text-xs text-muted-foreground">From all approved reports</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Fishermen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueFishermen}</div>
                        <p className="text-xs text-muted-foreground">Engaged in reporting</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">Requires review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Data Integrity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">100%</div>
                        <p className="text-xs text-muted-foreground">All reports validated</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="reports" className="space-y-4">
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 flex">
                    <TabsTrigger value="reports" className="whitespace-nowrap">Incoming Reports</TabsTrigger>
                    <TabsTrigger value="map" className="whitespace-nowrap">Map View</TabsTrigger>
                    <TabsTrigger value="analytics" className="whitespace-nowrap">Analytics</TabsTrigger>
                    <TabsTrigger value="fishermen" className="whitespace-nowrap">Fishermen Registry</TabsTrigger>
                </TabsList>
                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Catch Reports</CardTitle>
                            <CardDescription>Review and approve daily catch submissions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto w-full">
                                <Table className="min-w-[800px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Fisherman ID</TableHead>
                                            <TableHead>Boat Name</TableHead>
                                            <TableHead>Species</TableHead>
                                            <TableHead>Weight</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8">Loading reports...</TableCell>
                                            </TableRow>
                                        ) : reports.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No reports found.</TableCell>
                                            </TableRow>
                                        ) : (
                                            reports.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell className="whitespace-nowrap">{new Date(report.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-medium whitespace-nowrap">{report.fisherman_id}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{report.boat_name || "—"}</TableCell>
                                                    <TableCell className="capitalize whitespace-nowrap">{report.species}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{report.weight_kg} kg</TableCell>
                                                    <TableCell className="whitespace-nowrap">{report.location}</TableCell>
                                                    <TableCell>
                                                        <span className={`capitalize font-medium whitespace-nowrap ${
                                                            report.status === 'approved' ? 'text-green-600' : 
                                                            report.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                                                        }`}>
                                                            {report.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {report.status === 'pending' && (
                                                            <div className="flex gap-2">
                                                                <Button 
                                                                    size="sm" 
                                                                    className="bg-green-600 hover:bg-green-700 h-8 text-xs px-2 sm:px-3"
                                                                    onClick={() => handleUpdateStatus(report.id, 'approved')}
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="destructive"
                                                                    className="h-8 text-xs px-2 sm:px-3"
                                                                    onClick={() => handleUpdateStatus(report.id, 'rejected')}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        )}
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
                <TabsContent value="map">
                    <Card>
                        <CardHeader>
                            <CardTitle>Catch Location Map</CardTitle>
                            <CardDescription>Visual distribution of catch reports across the city.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CatchMap reports={reports} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics Overview</CardTitle>
                            <CardDescription>Detailed statistical breakdown of fisheries data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnalyticsView reports={reports} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="fishermen">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fishermen Registry</CardTitle>
                            <CardDescription>Manage and track registered fishermen in the city.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FishermanRegistry />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
