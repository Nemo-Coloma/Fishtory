"use server"

import { createClient } from "@/lib/supabase/server"
import * as XLSX from 'xlsx'

// Bilingual headers for the Excel file
const EXCEL_HEADERS = {
  reportDate: 'Report Date / Petsa ng Ulat',
  firstName: 'First Name / Pangalan',
  lastName: 'Last Name / Apelyido',
  phoneNumber: 'Phone Number / Numero ng Telepono',
  boatName: 'Boat Name / Pangalan ng Bangka',
  boatsOperated: 'Boats Operated / Bilang ng Bangka',
  totalCrew: 'Total Crew / Kabuuang Tripulante',
  speciesName: 'Species Name / Pangalan ng Isda',
  weightKg: 'Weight (kg) / Timbang (kg)',
  soldKg: 'Sold (kg) / Naibenta (kg)',
  processedKg: 'Processed (kg) / Naproseso (kg)',
  consumedKg: 'Consumed (kg) / Naconsumo (kg)',
  notMarketableKg: 'Not Marketable (kg) / Hindi Mapamilihan (kg)',
  leanDailyAvgCatch: 'Lean Daily Avg Catch (kg) / Avg na Hulihon sa Taghirapan',
  peakDailyAvgCatch: 'Peak Daily Avg Catch (kg) / Avg na Hulihon sa Tag-ani',
  status: 'Status / Estado',
  approvedByName: 'Approved By / Inaprubahan ni'
}

// Local language mappings for processing methods
const PROCESSING_METHODS: Record<string, string> = {
  'fresh': 'Sariwa',
  'smoked': 'Tinapa',
  'dried': 'Tuyo',
  'salted': 'Daing',
  'frozen': 'Na-freeze',
  'fermented': 'Bagoong'
}

// Local language mappings for status
const STATUS_MAPPING: Record<string, string> = {
  'pending': 'Nakabinbin',
  'approved': 'Aprubado',
  'rejected': 'Tinanggihan'
}

export interface ExportParams {
  startDate?: string
  endDate?: string
}

export interface ExportResult {
  success: boolean
  hasData?: boolean
  count?: number
  data?: number[]
  filename?: string
  mimeType?: string
  error?: string
}

/**
 * Export reports to Excel with full data including breakdown columns
 */
export async function exportRecentReports(startDate?: string, endDate?: string): Promise<ExportResult> {
  console.log(`[Export Action] Starting export process with dates: ${startDate || 'none'} to ${endDate || 'none'}...`)
  
  try {
    const supabase = await createClient()
    
    // Validate date formats if provided
    if (startDate && !isValidDate(startDate)) {
      return { success: false, error: 'Invalid start date format. Use YYYY-MM-DD.' }
    }
    if (endDate && !isValidDate(endDate)) {
      return { success: false, error: 'Invalid end date format. Use YYYY-MM-DD.' }
    }

    // Build date filter
    let dateFilter = ''
    if (startDate && endDate) {
      dateFilter = `AND r.created_at >= '${startDate}' AND r.created_at <= '${endDate}T23:59:59.999Z'`
    } else if (startDate) {
      dateFilter = `AND r.created_at >= '${startDate}'`
    } else if (endDate) {
      dateFilter = `AND r.created_at <= '${endDate}T23:59:59.999Z'`
    } else {
      // Default to last 30 days if no dates provided
      dateFilter = `AND r.created_at >= NOW() - INTERVAL '30 days'`
    }

    // Use raw SQL for complex joins with all required data
    const sqlQuery = `
      SELECT 
        r.id,
        r.created_at,
        r.species,
        r.weight_kg,
        r.sold_kg,
        r.processed_kg,
        r.consumed_kg,
        r.not_marketable_kg,
        r.status,
        r.location,
        r.processing_method,
        r.approved_by,
        r.fisherman_id,
        r.user_id,
        
        -- Fisherman data
        COALESCE(fr.first_name, 'N/A') as first_name,
        COALESCE(fr.last_name, 'N/A') as last_name,
        COALESCE(fr.boat_name, 'N/A') as boat_name,
        COALESCE(fr.phone_number, 'N/A') as phone_number,
        COALESCE(fr.total_boats_operated, 0) as total_boats_operated,
        COALESCE(fr.total_crew, 0) as total_crew,
        COALESCE(fr.lean_daily_avg_catch, 0) as lean_daily_avg_catch,
        COALESCE(fr.peak_daily_avg_catch, 0) as peak_daily_avg_catch,
        
        -- Species name from lookup
        COALESCE(fs.name_en, r.species, 'N/A') as species_name_en,
        COALESCE(fs.name_tl, '') as species_name_tl,
        
        -- Approver name (if approved)
        COALESCE(
          (SELECT CONCAT(sp.first_name, ' ', sp.last_name) 
           FROM staff_profiles sp 
           WHERE sp.user_id = r.approved_by 
           LIMIT 1),
          'N/A'
        ) as approved_by_name
        
      FROM reports r
      LEFT JOIN fisherman_registration fr ON r.user_id = fr.user_id
      LEFT JOIN fish_species fs ON r.species_id = fs.id
      WHERE 1=1 ${dateFilter}
      ORDER BY r.created_at DESC
    `

    console.log('[Export Action] Executing SQL query via RPC...')
    
    // Try using raw SQL via RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { query: sqlQuery })
    
    if (!rpcError && rpcData && rpcData.length > 0) {
      console.log(`[Export Action] RPC query returned ${rpcData.length} records`)
      return processAndExportData(rpcData, startDate, endDate)
    }

    // Fallback: Fetch data separately and combine
    console.log('[Export Action] RPC failed or returned no data, using fallback method...')
    
    // Fetch reports
    let reportsQuery = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (startDate && endDate) {
      const endDateTime = `${endDate}T23:59:59.999Z`
      reportsQuery = reportsQuery.gte('created_at', startDate).lte('created_at', endDateTime)
    } else if (startDate) {
      reportsQuery = reportsQuery.gte('created_at', startDate)
    } else if (endDate) {
      const endDateTime = `${endDate}T23:59:59.999Z`
      reportsQuery = reportsQuery.lte('created_at', endDateTime)
    } else {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const defaultStart = thirtyDaysAgo.toISOString().split('T')[0]
      reportsQuery = reportsQuery.gte('created_at', defaultStart)
    }

    const { data: reportsData, error: reportsError } = await reportsQuery
    
    if (reportsError) {
      console.error('[Export Action] Reports query error:', reportsError)
      return { success: false, error: `Database error: ${reportsError.message}` }
    }

    if (!reportsData || reportsData.length === 0) {
      return { success: true, hasData: false, count: 0 }
    }

    console.log(`[Export Action] Found ${reportsData.length} reports, fetching related data...`)

    // Fetch fisherman data for all user_ids
    const userIds = reportsData.map(r => r.user_id).filter(Boolean)
    const uniqueUserIds = [...new Set(userIds)]
    
    let fishermenData: any[] = []
    if (uniqueUserIds.length > 0) {
      const { data: fd } = await supabase
        .from('fisherman_registration')
        .select('user_id, first_name, last_name, boat_name, phone_number, total_boats_operated, total_crew, lean_daily_avg_catch, peak_daily_avg_catch')
        .in('user_id', uniqueUserIds)
      fishermenData = fd || []
    }

    // Create a map for quick lookup
    const fishermanMap = new Map(fishermenData.map(f => [f.user_id, f]))

    // Fetch species data
    const speciesIds = reportsData.map(r => r.species_id).filter(Boolean)
    const uniqueSpeciesIds = [...new Set(speciesIds)]
    
    let speciesData: any[] = []
    if (uniqueSpeciesIds.length > 0) {
      const { data: sd } = await supabase
        .from('fish_species')
        .select('id, name_en, name_tl')
        .in('id', uniqueSpeciesIds)
      speciesData = sd || []
    }

    const speciesMap = new Map(speciesData.map(s => [s.id, s]))

    // Fetch staff data for approvers
    const approverIds = reportsData.map(r => r.approved_by).filter(Boolean)
    const uniqueApproverIds = [...new Set(approverIds)]
    
    let staffData: any[] = []
    if (uniqueApproverIds.length > 0) {
      const { data: std } = await supabase
        .from('staff_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', uniqueApproverIds)
      staffData = std || []
    }

    const staffMap = new Map(staffData.map(s => [s.user_id, `${s.first_name} ${s.last_name}`]))

    // Combine data
    const combinedReports = reportsData.map(report => ({
      ...report,
      first_name: fishermanMap.get(report.user_id)?.first_name || 'N/A',
      last_name: fishermanMap.get(report.user_id)?.last_name || 'N/A',
      boat_name: fishermanMap.get(report.user_id)?.boat_name || 'N/A',
      phone_number: fishermanMap.get(report.user_id)?.phone_number || 'N/A',
      total_boats_operated: fishermanMap.get(report.user_id)?.total_boats_operated || 0,
      total_crew: fishermanMap.get(report.user_id)?.total_crew || 0,
      lean_daily_avg_catch: fishermanMap.get(report.user_id)?.lean_daily_avg_catch || 0,
      peak_daily_avg_catch: fishermanMap.get(report.user_id)?.peak_daily_avg_catch || 0,
      species_name_en: speciesMap.get(report.species_id)?.name_en || report.species || 'N/A',
      species_name_tl: speciesMap.get(report.species_id)?.name_tl || '',
      approved_by_name: report.status === 'approved' ? (staffMap.get(report.approved_by) || 'N/A') : '-'
    }))

    return processAndExportData(combinedReports, startDate, endDate)

  } catch (error) {
    console.error('[Export Action] Critical error:', error)
    return {
      success: false,
      error: 'A critical error occurred while processing the export.'
    }
  }
}

/**
 * Process data and generate Excel file
 */
async function processAndExportData(reports: any[], startDate?: string, endDate?: string): Promise<ExportResult> {
  console.log(`[Export Action] Processing ${reports.length} records for Excel generation...`)

  // Handle empty results
  if (!reports || reports.length === 0) {
    console.warn('[Export Action] No entries found for specified dates')
    return {
      success: true,
      hasData: false,
      count: 0
    }
  }

  // Transform data for Excel
  const excelData = reports.map((report: any) => ({
    [EXCEL_HEADERS.reportDate]: formatDateForExcel(report.created_at),
    [EXCEL_HEADERS.firstName]: report.first_name || 'N/A',
    [EXCEL_HEADERS.lastName]: report.last_name || 'N/A',
    [EXCEL_HEADERS.phoneNumber]: report.phone_number || 'N/A',
    [EXCEL_HEADERS.boatName]: report.boat_name || 'N/A',
    [EXCEL_HEADERS.boatsOperated]: report.total_boats_operated || 0,
    [EXCEL_HEADERS.totalCrew]: report.total_crew || 0,
    [EXCEL_HEADERS.speciesName]: report.species_name_en 
      ? `${report.species_name_en}${report.species_name_tl ? ` (${report.species_name_tl})` : ''}`
      : 'N/A',
    [EXCEL_HEADERS.weightKg]: report.weight_kg || 0,
    [EXCEL_HEADERS.soldKg]: report.sold_kg || 0,
    [EXCEL_HEADERS.processedKg]: report.processed_kg || 0,
    [EXCEL_HEADERS.consumedKg]: report.consumed_kg || 0,
    [EXCEL_HEADERS.notMarketableKg]: report.not_marketable_kg || 0,
    [EXCEL_HEADERS.leanDailyAvgCatch]: report.lean_daily_avg_catch || 0,
    [EXCEL_HEADERS.peakDailyAvgCatch]: report.peak_daily_avg_catch || 0,
    [EXCEL_HEADERS.status]: STATUS_MAPPING[report.status] || report.status || 'N/A',
    [EXCEL_HEADERS.approvedByName]: report.approved_by_name || '-'
  }))

  // Create Excel workbook
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Report Date
    { wch: 20 }, // First Name
    { wch: 20 }, // Last Name
    { wch: 15 }, // Phone Number
    { wch: 20 }, // Boat Name
    { wch: 12 }, // Boats Operated
    { wch: 12 }, // Total Crew
    { wch: 25 }, // Species Name
    { wch: 12 }, // Weight (kg)
    { wch: 12 }, // Sold (kg)
    { wch: 12 }, // Processed (kg)
    { wch: 12 }, // Consumed (kg)
    { wch: 15 }, // Not Marketable (kg)
    { wch: 15 }, // Lean Daily Avg Catch
    { wch: 15 }, // Peak Daily Avg Catch
    { wch: 12 }, // Status
    { wch: 20 }  // Approved By Name
  ]

  // Add header styling (bold)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 0, c: C })
    if (!worksheet[address]) continue
    worksheet[address].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "FFFF00" } },
      alignment: { horizontal: "center", vertical: "center" }
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Catch Reports')

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  const dateStamp = startDate && endDate 
    ? `${startDate}_to_${endDate}` 
    : new Date().toISOString().split('T')[0]

  console.log(`[Export Action] Export complete: ${reports.length} records`)

  return {
    success: true,
    hasData: true,
    data: Array.from(new Uint8Array(buffer)),
    filename: `catch-reports-${dateStamp}.xlsx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    count: reports.length
  }
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Format date for Excel (YYYY-MM-DD format)
 */
function formatDateForExcel(dateString: string): string {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  } catch {
    return dateString
  }
}