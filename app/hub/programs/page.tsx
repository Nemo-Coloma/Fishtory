import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Calendar, Clock, Image as ImageIcon } from "lucide-react"

export const revalidate = 3600

interface Program {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string | null;
    status: string;
    image_url: string | null;
}

async function getPrograms(): Promise<Program[]> {
    const { data } = await supabase
        .from('hub_programs')
        .select('*')
        .order('start_date', { ascending: false })
    return (data as Program[]) || []
}

export default async function ProgramsPage() {
    const programs = await getPrograms()

    return (
        <div className="container mx-auto px-4 py-24 space-y-16">
            <div className="space-y-4 text-center">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Programs & Projects</h1>
                <p className="text-slate-400 max-w-2xl mx-auto font-medium">
                    Current and completed initiatives by the Agriculture Office to support our fishery sector.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
                        <p className="text-slate-500 font-bold">No programs listed at this time.</p>
                    </div>
                ) : (
                    programs.map((program) => (
                        <Card key={program.id} className="bg-slate-900 border-slate-800 group hover:border-blue-500/30 transition-all overflow-hidden flex flex-col shadow-sm">
                            {program.image_url ? (
                                <div className="h-48 overflow-hidden">
                                    <img src={program.image_url} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            ) : (
                                <div className="h-48 bg-slate-800 flex items-center justify-center text-slate-600">
                                    <ImageIcon className="h-12 w-12 opacity-20" />
                                </div>
                            )}
                            <CardHeader className="p-8">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${(program.status || 'ongoing') === 'ongoing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-700/20 text-slate-400 border border-slate-700/30'}`}>
                                        {(program.status || 'UNKNOWN').toUpperCase()}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <Calendar className="h-3 w-3" />
                                        {program.start_date ? new Date(program.start_date).toLocaleDateString() : 'TBA'}
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{program.title}</CardTitle>
                                <CardDescription className="text-slate-400 mt-2 line-clamp-3 font-medium">{program.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 mt-auto">
                                <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
                                    <Clock className="h-4 w-4 text-slate-500" />
                                    <span className="text-xs font-bold text-slate-500">
                                        {program.end_date ? `Ends: ${new Date(program.end_date).toLocaleDateString()}` : 'Ongoing Initiative'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
