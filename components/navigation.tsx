"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export function Navigation() {
    const pathname = usePathname()

    if (pathname === "/" || pathname === "/login") return null

    const isFisherman = pathname.startsWith("/dashboard")

    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4 max-w-6xl mx-auto">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="font-bold text-xl text-blue-700">Fishtory</span>
                </Link>
                <div className="ml-auto flex items-center space-x-4">
                    <div className="text-sm font-medium">
                        {isFisherman ? "Fisherman Portal" : "Agricultural Office"}
                    </div>
                    <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-red-600 transition-colors">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}
