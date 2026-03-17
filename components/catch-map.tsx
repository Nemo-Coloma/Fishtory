"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

// Fix for default marker icons in Leaflet with React
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const LOCATION_COORDS: Record<string, [number, number]> = {
    "Banicain": [14.8315, 120.2835],
    "Barretto": [14.8518, 120.2625],
    "Kalaklan": [14.8412, 120.2745],
}

const JUMP_COORDS = {
    "Banicain": { lat: 14.8289035, lng: 120.2740998, zoom: 19 },
    "Barretto": { lat: 14.8485351, lng: 120.2630462, zoom: 17 },
    "Kalaklan": { lat: 14.8324373, lng: 120.2664607, zoom: 19 },
}

interface Report {
    id: string
    fisherman_id: string
    species: string
    weight_kg: number
    location: string
    status: string
    created_at: string
}

// Helper component to control map center/zoom
function MapController({ target }: { target: { lat: number, lng: number, zoom: number } | null }) {
    const map = useMap()
    useEffect(() => {
        if (target) {
            map.setView([target.lat, target.lng], target.zoom, { animate: true })
        }
    }, [target, map])
    return null
}

export default function CatchMap({ reports }: { reports: Report[] }) {
    const [mounted, setMounted] = useState(false)
    const [mapTarget, setMapTarget] = useState<{ lat: number, lng: number, zoom: number } | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="h-[500px] w-full bg-slate-100 flex items-center justify-center">Loading Map...</div>

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
                {/* Map View */}
                <div className="h-[400px] lg:h-[500px] w-full rounded-lg overflow-hidden border border-slate-200 lg:col-span-2 relative z-0">
                    <MapContainer 
                        center={[14.84, 120.27]} 
                        zoom={13} 
                        style={{ height: "100%", width: "100%", zIndex: 0 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapController target={mapTarget} />
                        {reports.map((report) => {
                            const coords = LOCATION_COORDS[report.location]
                            if (!coords) return null

                            // Add a tiny random offset to distinguish multiple reports at the same location
                            const jitter = () => (Math.random() - 0.5) * 0.001
                            const position: [number, number] = [coords[0] + jitter(), coords[1] + jitter()]

                            return (
                                <Marker key={report.id} position={position} icon={icon} />
                            )
                        })}
                    </MapContainer>
                </div>

                {/* Side Panel for Notifications */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-[350px] lg:h-[500px] flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Live Arrivals
                    </h3>
                    <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                        {reports.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No arrivals recorded yet.</p>
                        ) : (
                            reports.map((report) => (
                                <div key={report.id} className="bg-white border border-slate-200 rounded-md p-3 shadow-sm hover:border-blue-300 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <h4 className="font-bold text-blue-900 m-0">{report.fisherman_id}</h4>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-slate-600 m-0">Has arrived at:</p>
                                    <p className="text-base sm:text-lg font-bold text-blue-700 m-0">{report.location}</p>
                                    <p className="text-xs text-slate-500 mt-2 pt-2 border-t">
                                        Time: {new Date(report.created_at).toLocaleString('en-US', {
                                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                <span className="text-xs sm:text-sm font-medium text-slate-500 w-full sm:w-auto">Quick Jump:</span>
                {Object.entries(JUMP_COORDS).map(([name, coords]) => (
                    <Button 
                        key={name} 
                        variant="outline" 
                        size="sm"
                        className="flex gap-1.5 sm:gap-2 text-xs sm:text-sm"
                        onClick={() => setMapTarget(coords)}
                    >
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        {name}
                    </Button>
                ))}
                <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs sm:text-sm"
                    onClick={() => setMapTarget({ lat: 14.84, lng: 120.27, zoom: 13 })}
                >
                    Reset View
                </Button>
            </div>
        </div>
    )
}
