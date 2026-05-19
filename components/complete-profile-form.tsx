"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Fish, BadgeCheck, Loader2 } from "lucide-react"

export function CompleteProfileForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)
    const [generatedId, setGeneratedId] = useState("")
    const [user, setUser] = useState<any>(null)

    // Profile fields
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [boatName, setBoatName] = useState("")
    const [contactNumber, setContactNumber] = useState("")
    const [location, setLocation] = useState("")

    useEffect(() => {
        const initPage = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            // If already has fisherman_id, skip to dashboard
            if (user.user_metadata?.fisherman_id) {
                router.push("/dashboard")
                return
            }

            setUser(user)

            // Pre-fill name from sign-up metadata
            setFirstName(user.user_metadata?.first_name || "")
            setLastName(user.user_metadata?.last_name || "")

            // Generate the next ID for this year
            const year = new Date().getFullYear()
            const { data: latestIds, error } = await supabase
                .from("fishermen_profiles")
                .select("fisherman_id")
                .like("fisherman_id", `FM-${year}-%`)
                .order("fisherman_id", { ascending: false })
                .limit(1)

            if (!error && latestIds && latestIds.length > 0) {
                // Extract the number part from "FM-2026-0001" or "FM-2026-001"
                const lastIdStr = latestIds[0].fisherman_id
                const parts = lastIdStr.split('-')
                const lastNum = parseInt(parts[parts.length - 1], 10)
                const nextNum = (isNaN(lastNum) ? 0 : lastNum) + 1
                const paddedNum = String(nextNum).padStart(4, "0")
                setGeneratedId(`FM-${year}-${paddedNum}`)
            } else {
                // fallback if no IDs exist for this year
                setGeneratedId(`FM-${year}-0001`)
            }

            setCheckingSession(false)
        }
        initPage()
    }, [router])

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!boatName || !contactNumber || !location) {
            alert("Please fill in all fields.")
            return
        }

        setLoading(true)

        try {
            const fullName = `${firstName.trim()} ${lastName.trim()}`
            const year = new Date().getFullYear()

            // RLS prevents us from accurately querying max ID if we don't own the rows,
            // so we loop to find the next available unique ID if there's a collision.
            let currentNum = 1
            if (generatedId && generatedId.includes(`FM-${year}-`)) {
                const parts = generatedId.split('-')
                currentNum = parseInt(parts[parts.length - 1], 10) || 1
            }

            let insertedId = generatedId
            let success = false
            let insertAttempts = 0

            while (!success && insertAttempts < 50) {
                insertAttempts++
                const paddedNum = String(currentNum).padStart(4, "0")
                insertedId = `FM-${year}-${paddedNum}`

                // 1. Insert row into fishermen_profiles
                const { error: insertError } = await supabase
                    .from("fishermen_profiles")
                    .insert([{
                        user_id: user.id,
                        fisherman_id: insertedId,
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                        boat_name: boatName.trim(),
                        phone_number: contactNumber.trim(),
                        location,
                    }])

                if (insertError) {
                    if (insertError.code === '23505' || insertError.message?.includes("unique constraint") || insertError.message?.includes("duplicate key")) {
                        console.log(`ID ${insertedId} taken, trying next...`)
                        currentNum++
                        continue
                    } else {
                        console.error("Profile insert error:", insertError)
                        alert("Failed to save profile: " + insertError.message)
                        setLoading(false)
                        return
                    }
                } else {
                    success = true
                }
            }

            if (!success) {
                alert("Failed to generate a unique Fisherman ID after 50 attempts. Please contact support.")
                setLoading(false)
                return
            }

            // Update the UI state to what was actually inserted, just in case they see it before routing away
            if (insertedId !== generatedId) {
                setGeneratedId(insertedId)
            }

            // 2. Update Supabase auth metadata with fisherman_id and full_name
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    fisherman_id: insertedId,
                    full_name: fullName,
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    boat_name: boatName.trim(),
                    contact_number: contactNumber.trim(),
                    location,
                    role: "fisherman",
                }
            })

            if (updateError) {
                console.error("Metadata update error:", updateError)
                alert("Failed to update account: " + updateError.message)
                setLoading(false)
                return
            }

            // 3. Redirect to dashboard
            router.push("/dashboard")
        } catch (err: any) {
            console.error("Critical error:", err)
            alert("SYSTEM ERROR: " + err.message)
            setLoading(false)
        }
    }

    if (checkingSession) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4">
            <Card className="w-full max-w-lg shadow-xl rounded-2xl border border-slate-200/50">
                <CardHeader className="pb-2 text-center">
                    {/* Header icon */}
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg">
                        <Fish className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Complete Your Profile</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Fill in your details to receive your Fisherman ID.
                    </CardDescription>

                    {/* Generated ID preview */}
                    {generatedId && (
                        <div className="mt-5 flex items-center justify-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <BadgeCheck className="h-5 w-5 text-accent shrink-0" />
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Your assigned ID</span>
                                <span className="inline-flex items-center rounded-lg bg-primary text-white text-sm font-bold px-4 py-1.5 tracking-wider shadow-lg shadow-primary/20">
                                    {generatedId}
                                </span>
                            </div>
                        </div>
                    )}
                </CardHeader>

                <form onSubmit={handleSaveProfile}>
                    <CardContent className="space-y-5 pt-6">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-slate-700 font-semibold text-sm">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="Juan"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="focus-visible:ring-primary h-10 border-slate-200/60"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-slate-700 font-semibold text-sm">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="dela Cruz"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="focus-visible:ring-primary h-10 border-slate-200/60"
                                />
                            </div>
                        </div>

                        {/* Boat Name */}
                        <div className="space-y-2">
                            <Label htmlFor="boatName" className="text-slate-700 font-semibold text-sm">Boat Name / Pangalan ng Bangka</Label>
                            <Input
                                id="boatName"
                                placeholder="e.g., Bulalacao II"
                                value={boatName}
                                onChange={(e) => setBoatName(e.target.value)}
                                required
                                className="focus-visible:ring-primary h-10 border-slate-200/60"
                            />
                        </div>

                        {/* Contact */}
                        <div className="space-y-2">
                            <Label htmlFor="contact" className="text-slate-700 font-semibold text-sm">Contact Number</Label>
                            <Input
                                id="contact"
                                type="tel"
                                placeholder="e.g., 09XX-XXX-XXXX"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                required
                                className="focus-visible:ring-primary h-10 border-slate-200/60"
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-slate-700 font-semibold text-sm">Barangay / Location</Label>
                            <Select value={location} onValueChange={setLocation} required>
                                <SelectTrigger id="location" className="focus-visible:ring-primary h-10 border-slate-200/60">
                                    <SelectValue placeholder="Select your barangay" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Banicain">Banicain</SelectItem>
                                    <SelectItem value="Barretto">Barretto</SelectItem>
                                    <SelectItem value="Kalaklan">Kalaklan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>

                    <CardFooter className="flex-col gap-4 pb-6 pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white h-11 text-base font-semibold shadow-lg shadow-primary/20"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving profile...
                                </span>
                            ) : (
                                "Save Profile & Continue"
                            )}
                        </Button>
                        <p className="text-xs text-slate-500 text-center">
                            Your Fisherman ID <strong className="text-slate-700">{generatedId}</strong> will be permanently assigned to your account.
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
