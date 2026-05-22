"use client"

import dynamic from "next/dynamic"
import React from "react"

const ProductionCharts = dynamic(() => import("./production-charts"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-900/40 animate-pulse rounded-3xl flex items-center justify-center text-slate-500">Loading Analytics...</div>
})

export default function ProductionChartsWrapper({ reports }: { reports: any[] }) {
    return <ProductionCharts reports={reports} />
}
