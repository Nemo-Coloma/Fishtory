"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Loader2, Calendar } from "lucide-react"
import { toast } from "sonner"
import { exportRecentReports } from "@/app/actions/export-reports"

export function DownloadReportsButton() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleDownload = async () => {
    // Sanitization: Ensure dates are in correct format before passing to server
    const rangeDescription = startDate && endDate 
      ? `from ${startDate} to ${endDate}` 
      : "for the last 30 days";
      
    console.log(`[Download Button] Triggering export ${rangeDescription}...`);
    console.log('[Download Button] Client-side date values:', {
      startDate,
      endDate,
      startDateType: typeof startDate,
      endDateType: typeof endDate,
      startDateLength: startDate?.length,
      endDateLength: endDate?.length
    });
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDate && !dateRegex.test(startDate)) {
      console.error('[Download Button] Invalid start date format:', startDate);
      toast.error("Invalid Date Format", { description: "Start date must be in YYYY-MM-DD format" });
      return;
    }
    if (endDate && !dateRegex.test(endDate)) {
      console.error('[Download Button] Invalid end date format:', endDate);
      toast.error("Invalid Date Format", { description: "End date must be in YYYY-MM-DD format" });
      return;
    }
    
    setIsDownloading(true)
    
    try {
      const result = await exportRecentReports(startDate, endDate)
      
      console.log('[Download Button] Action Response:', { 
        success: result.success, 
        hasData: result.hasData,
        count: result.count 
      });
      
      // Error handling for server-side failures (db down, etc)
      if (!result.success) {
        throw new Error(result.error || 'Failed to process export')
      }
      
      // Graceful UI handling for empty results
      if (result.hasData === false) {
        toast.info("No Reports Found", {
          description: `There are no records in the system ${rangeDescription}.`
        })
        return;
      }
      
      if (!result.data) {
        throw new Error('Export succeeded but no binary data was returned.')
      }
      
      console.log('[Download Button] Converting data to binary blob...');
      const uint8Array = new Uint8Array(result.data as number[])
      const blob = new Blob([uint8Array], { type: result.mimeType })
      const url = window.URL.createObjectURL(blob)
      
      console.log('[Download Button] Initializing browser download...');
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename || 'catch-reports.xlsx'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success("Download Started", {
        description: `Successfully exported ${result.count} reports.`
      })
    } catch (error) {
      console.error('[Download Button] Client-side failure:', error)
      toast.error("Export Error", {
        description: error instanceof Error ? error.message : 'An unexpected error occurred during export.'
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-1.5 h-full py-1 pr-1">
      <div className="grid gap-1 px-4 py-0.5">
        <Label htmlFor="start-date" className="text-[9px] uppercase font-black text-slate-500 flex items-center gap-2 tracking-[0.2em] opacity-80">
          <Calendar className="w-3 h-3 text-blue-500" /> FROM
        </Label>
        <Input 
          id="start-date"
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)}
          className="h-8 w-full sm:w-[130px] text-xs font-bold bg-transparent border-none text-slate-100 outline-none cursor-pointer p-0 invert-[0.8] brightness-200"
        />
      </div>
      
      <div className="h-10 w-[1px] bg-slate-800/20 hidden sm:block self-center"></div>

      <div className="grid gap-1 px-4 py-0.5">
        <Label htmlFor="end-date" className="text-[9px] uppercase font-black text-slate-500 flex items-center gap-2 tracking-[0.2em] opacity-80">
          <Calendar className="w-3 h-3 text-blue-500" /> TO
        </Label>
        <Input 
          id="end-date"
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)}
          className="h-8 w-full sm:w-[130px] text-xs font-bold bg-transparent border-none text-slate-100 outline-none cursor-pointer p-0 invert-[0.8] brightness-200"
        />
      </div>

      <div className="px-3">
        <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 h-10 px-6 bg-gradient-to-tr from-blue-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 group border border-white/5"
        >
            {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            )}
            <div className="flex flex-col items-start leading-none">
                <span className="text-[8px] opacity-70 uppercase tracking-widest font-bold">Export Data</span>
                <span className="text-xs">EXCEL</span>
            </div>
        </Button>
      </div>
    </div>
  )
}
