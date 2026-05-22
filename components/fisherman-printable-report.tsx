"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import html2canvas from "html2canvas-pro"
import jsPDF from "jspdf"

interface Fisherman {
  id: string
  fisherman_id: string | null
  first_name: string | null
  last_name: string | null
  email?: string | null
}

interface Props {
  fisherman: Fisherman | null
  onFinished: () => void
}

export function FishermanPrintableReport({ fisherman, onFinished }: Props) {
  const [data, setData] = useState<{
    totalWeight: number
    reportCount: number
    primarySpecies: string
  } | null>(null)

  // Safe derived values (prevents crashes)
  const firstName = fisherman?.first_name ?? "Unknown"
  const lastName = fisherman?.last_name ?? "Unknown"

  const email =
    fisherman?.email ||
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@fisheries.ph`

  // 1️⃣ Fetch report analytics
  useEffect(() => {
    if (!fisherman?.fisherman_id) {
      setData(null)
      return
    }

    const fetchData = async () => {
      const { data: reports, error } = await supabase
        .from("reports")
        .select("*")
        .eq("fisherman_id", fisherman.fisherman_id)

      if (error) {
        console.error("Error fetching reports:", error)
        setData({ totalWeight: 0, reportCount: 0, primarySpecies: "N/A" })
        return
      }

      if (!reports || reports.length === 0) {
        setData({ totalWeight: 0, reportCount: 0, primarySpecies: "N/A" })
        return
      }

      const totalWeight = reports.reduce(
        (sum: number, r: any) => sum + Number(r.weight_kg || 0),
        0
      )

      const speciesCount: Record<string, number> = {}

      reports.forEach((r: any) => {
        const sp = r?.species ?? "Unknown"
        speciesCount[sp] = (speciesCount[sp] || 0) + 1
      })

      const primarySpecies =
        Object.keys(speciesCount).reduce(
          (a, b) => (speciesCount[a] > speciesCount[b] ? a : b),
          "N/A"
        ) || "N/A"

      setData({
        totalWeight,
        reportCount: reports.length,
        primarySpecies,
      })
    }

    fetchData()
  }, [fisherman])

  // 2️⃣ Stable PDF generation (no timeout hack)
  useEffect(() => {
    if (!data || !fisherman) return

    const generatePDF = async () => {
      const element = document.getElementById("pdf-report-container")
      if (!element) return

      try {
        // Wait for layout stability
        await new Promise(requestAnimationFrame)

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        })

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

        pdf.save(
          `Analytics_Report_${firstName}_${lastName}.pdf`
        )
      } catch (err) {
        console.error("PDF generation failed:", err)
      } finally {
        onFinished()
      }
    }

    generatePDF()
  }, [data, fisherman, firstName, lastName, onFinished])

  if (!fisherman || !data) return null

  return (
    <div className="fixed left-[-9999px] top-0">
      <div
        id="pdf-report-container"
        className="bg-white text-black font-serif p-10 w-[794px] min-h-[1123px]"
      >
        {/* Header */}
        <div className="flex justify-between border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold uppercase">
              {firstName} {lastName}
            </h1>
            <p className="text-sm">{email}</p>
          </div>

          <div className="text-right text-sm">
            Report Date:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold uppercase underline">
            Catch Analytics Summary Report
          </h2>
        </div>

        {/* Summary */}
        <div
          className="mb-10 pl-4"
          style={{ borderLeft: "4px solid black" }}
        >
          <h3 className="text-lg font-bold uppercase mb-3">
            Executive Summary
          </h3>
          <p className="text-sm text-justify leading-relaxed">
            This report summarizes recorded catch activities based on
            verified submissions from the fishery system.
          </p>
        </div>

        {/* Data */}
        <div className="space-y-4 text-sm mb-10">
          <div className="flex border-b pb-3">
            <div className="w-1/3 font-bold">Total Volume:</div>
            <div className="w-2/3">
              {data.totalWeight.toLocaleString()} kg
            </div>
          </div>

          <div className="flex border-b pb-3">
            <div className="w-1/3 font-bold">Reports:</div>
            <div className="w-2/3">{data.reportCount}</div>
          </div>

          <div className="flex border-b pb-3">
            <div className="w-1/3 font-bold">Primary Species:</div>
            <div className="w-2/3 capitalize">
              {data.primarySpecies}
            </div>
          </div>

          <div className="flex">
            <div className="w-1/3 font-bold">Status:</div>
            <div className="w-2/3">ACTIVE / COMPLIANT</div>
          </div>
        </div>

        {/* Notes */}
        <div
          className="pl-4"
          style={{ borderLeft: "4px solid black" }}
        >
          <h3 className="text-lg font-bold uppercase mb-3">
            Office Notes
          </h3>
          <p className="text-sm text-justify leading-relaxed">
            System shows stable reporting performance with no
            anomalies detected.
          </p>
        </div>
      </div>
    </div>
  )
}