import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Bell, Calendar, MapPin, Tag } from "lucide-react"

export const revalidate = 3600

interface Announcement {
    id: string;
    title: string;
    description: string;
    date_posted: string;
    event_date: string | null;
}

async function getAnnouncements(): Promise<Announcement[]> {
    const { data } = await supabase
        .from('hub_announcements')
        .select('*')
        .order('date_posted', { ascending: false })
    return (data as Announcement[]) || []
}

export default async function AnnouncementsPage() {
    const announcements = await getAnnouncements()

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return isNaN(d.getTime()) ? null : d
    }

    return (
        <div className="container mx-auto px-4 py-24 max-w-5xl space-y-16">
            <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
                    <Bell className="h-3 w-3" /> Latest Updates
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Announcements & Trainings</h1>
                <p className="text-slate-400 max-w-2xl mx-auto font-medium">
                    Critical advisories, training schedules, and community events from the Agriculture Office.
                </p>
            </div>

            <div className="space-y-6">
                {announcements.length === 0 ? (
                    <div className="py-20 text-center bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
                        <p className="text-slate-500 font-bold">No announcements at this time.</p>
                    </div>
                ) : (
                    announcements.map((announcement) => {
                        const postDate = formatDate(announcement.date_posted)
                        const eventDate = announcement.event_date ? formatDate(announcement.event_date) : null

                        return (
                            <Card key={announcement.id} className="bg-slate-900 border-slate-800 hover:border-blue-500/30 transition-all group overflow-hidden shadow-sm">
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-8 md:w-48 bg-slate-950/40 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-800">
                                        <span className="text-3xl font-black text-white">{postDate ? postDate.getDate() : '--'}</span>
                                        <span className="text-[10px] uppercase font-bold text-blue-500 tracking-widest">
                                            {postDate ? postDate.toLocaleString('default', { month: 'short' }) : '---'} {postDate ? postDate.getFullYear() : '----'}
                                        </span>
                                        <div className="mt-4 flex items-center gap-1.5 text-slate-500">
                                            <Tag className="h-3 w-3" />
                                            <span className="text-[9px] font-bold uppercase tracking-wider">Public Post</span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-4">
                                            {eventDate && (
                                                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest">
                                                    <Calendar className="h-3 w-3" /> EVENT DATE: {eventDate.toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                            {announcement.title}
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 text-base leading-relaxed font-medium">
                                            {announcement.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
