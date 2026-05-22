"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, AlertCircle, ExternalLink, Users } from "lucide-react"
import { toast } from "sonner"
import { isSupabaseConfigured } from "@/lib/supabase"

export function StaffLoginForm() {
    const router = useRouter()
    const [id, setId] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { supabase } = await import('@/lib/supabase')

            // Staff login uses email directly, just like fisherman login
            const loginEmail = String(id).trim()

            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password
            })

            if (error) {
                toast.error("Login failed", {
                    description: error.message || "Authentication failed. Please check your credentials."
                })
                setLoading(false)
                return
            }

            const userRole = data.user?.user_metadata?.role

            if (userRole === 'staff') {
                router.refresh()
                router.push('/staff/dashboard')
            } else {
                // If it's not a staff account, sign them out and show error
                await supabase.auth.signOut()
                toast.error("Access Denied", {
                    description: "This portal is strictly for authorized staff only."
                })
                setLoading(false)
            }
        } catch (err: any) {
            toast.error("System Error", {
                description: err.message || "An unexpected error occurred."
            })
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto bg-slate-900/60 backdrop-blur-xl shadow-2xl rounded-2xl border-slate-800/50 ring-1 ring-white/5 overflow-hidden">
            <CardHeader className="text-center pb-2 pt-8">
                <div className="mx-auto bg-emerald-500/10 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Users className="h-8 w-8 text-emerald-400" />
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-white">Staff Portal</CardTitle>
                <CardDescription className="text-slate-400">Enter your Staff Code securely.</CardDescription>
            </CardHeader>
            
            {!isSupabaseConfigured && (
                <div className="mx-6 p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col gap-2 animate-pulse">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                        <AlertCircle className="h-4 w-4" />
                        System Configuration Missing
                    </div>
                    <p className="text-xs text-red-600 leading-relaxed">
                        Supabase environment variables are not set.
                    </p>
                    <a 
                        href="https://vercel.com/dashboard" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-red-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                        Go to Vercel Dashboard <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            )}
            
            <form onSubmit={handleLogin}>
                <CardContent className="space-y-6 pt-6 pb-2">
                    <div className="space-y-3">
                        <Label htmlFor="id" className="text-slate-300 font-medium">Email Address</Label>
                        <Input
                            id="id"
                            type="email"
                            placeholder="your.email@office.gov"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                            className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500 h-12 rounded-xl"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500 h-12 rounded-xl"
                        />
                    </div>
                </CardContent>
                <CardFooter className="pb-8 pt-6 flex flex-col gap-4">
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-md h-12 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2" disabled={loading}>
                        <ShieldCheck className="h-5 w-5" />
                        {loading ? "Authenticating..." : "Login to System"}
                    </Button>
                    <p className="text-xs text-slate-500 text-center font-medium uppercase tracking-widest">
                        Authorized Personnel Only
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}
