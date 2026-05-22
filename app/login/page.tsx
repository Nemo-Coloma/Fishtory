"use client"

import { LoginForm } from "@/components/login-form"
import { Suspense, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
    useEffect(() => {
        console.log("FISHTORY_VERSION: 1.0.7-DIAGNOSTIC")
    }, [])

    return (
        <div className="relative min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-950 overflow-hidden font-sans selection:bg-blue-500/30">
            
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[100px] mix-blend-screen animate-pulse duration-10000"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/20 blur-[100px] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
            </div>

            {/* Responsive Back Button */}
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50">
                <Link href="/">
                    <Button variant="ghost" className="gap-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back to Home</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                </Link>
            </div>

            <div className="z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Suspense fallback={<div className="text-center text-blue-400 animate-pulse">Loading secure portal...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    )
}
