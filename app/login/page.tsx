"use client"

import { LoginForm } from "@/components/login-form"
import { Suspense, useEffect } from "react"

export default function LoginPage() {
    useEffect(() => {
        console.log("FISHTORY_VERSION: 1.0.7-DIAGNOSTIC")
    }, [])

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
