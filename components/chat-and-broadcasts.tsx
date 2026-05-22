"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Send, Megaphone, User, Clock, Trash2, Plus, Loader2, X, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface UserInfo {
    id: string
    name: string
    role: string
}

export function ChatAndBroadcasts({ currentUser, role }: { currentUser: UserInfo, role: 'admin' | 'fisherman' }) {
    const [messages, setMessages] = useState<any[]>([])
    const [broadcasts, setBroadcasts] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [newBroadcast, setNewBroadcast] = useState("")
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Fetch initial data
    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50)
            if (data) setMessages(data.reverse())
        }

        const fetchBroadcasts = async () => {
            const { data } = await supabase
                .from('broadcasts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)
            if (data) setBroadcasts(data)
        }

        fetchMessages()
        fetchBroadcasts()

        const msgChannel = supabase
            .channel('messages-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
                setMessages((current) => [...current, payload.new])
            })
            .subscribe()

        const broadcastChannel = supabase
            .channel('broadcasts-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'broadcasts' }, (payload: any) => {
                setBroadcasts((current) => [payload.new, ...current])
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'broadcasts' }, (payload: any) => {
                setBroadcasts((current) => current.filter(b => b.id !== payload.old.id))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(msgChannel)
            supabase.removeChannel(broadcastChannel)
        }
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const { error } = await supabase.from('messages').insert([{
            sender_id: currentUser.id,
            sender_name: currentUser.name,
            sender_role: role,
            content: newMessage.trim()
        }])

        if (!error) {
            setNewMessage("")
        } else {
            toast.error("Failed to send message: " + error.message)
        }
    }

    const sendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBroadcast.trim() || role !== 'admin') return

        setLoading(true)
        const { error } = await supabase.from('broadcasts').insert([{
            content: newBroadcast.trim()
        }])

        setLoading(false)
        if (!error) {
            setNewBroadcast("")
            toast.success("Broadcast posted successfully!")
        } else {
            toast.error("Failed to post broadcast: " + error.message)
        }
    }

    const deleteBroadcast = async (id: string) => {
        const { error } = await supabase.from('broadcasts').delete().eq('id', id)
        if (!error) {
            toast.success("Broadcast removed.")
        }
    }

    const formatTime = (ts: string) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const [selectedBroadcast, setSelectedBroadcast] = useState<any>(null)

    // Render logic for the component...
    return (
        <div className="flex flex-col gap-6 w-full h-[calc(100vh-180px)] min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* --- INSTAGRAM STYLE STORIES (BROADCASTS) --- */}
            <div className="flex flex-col gap-3">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 flex items-center gap-2">
                    <Megaphone className="w-3 h-3 text-amber-500" /> Official Broadcasts
                </Label>
                <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 px-2 no-scrollbar scroll-smooth">
                    {/* Add Broadcast Story (Admin Only) */}
                    {role === 'admin' && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="flex-none flex flex-col items-center gap-2 group outline-none">
                                    <div className="p-[3px] rounded-full bg-slate-800 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:via-cyan-400 group-hover:to-blue-600 transition-all duration-500">
                                        <div className="bg-slate-950 p-1 rounded-full">
                                            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-blue-500/30 transition-all group-hover:scale-105 active:scale-95 shadow-xl">
                                                <Plus className="w-6 h-6 text-slate-500 group-hover:text-blue-500" />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-blue-400 transition-colors">Post News</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-3xl sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Broadcast Announcement</DialogTitle>
                                    <DialogDescription>Your message will appear at the top of everyone's feed.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={sendBroadcast} className="space-y-4 mt-2">
                                    <Input 
                                        placeholder="What's happening?..."
                                        value={newBroadcast}
                                        onChange={(e) => setNewBroadcast(e.target.value)}
                                        className="bg-slate-950 border-slate-800 h-14 rounded-2xl"
                                    />
                                    <Button type="submit" disabled={loading} className="w-full h-12 bg-amber-600 hover:bg-amber-500 font-bold rounded-xl">
                                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Post Broadcast"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Broadcast Stories */}
                    {broadcasts.length === 0 && role !== 'admin' && (
                        <div className="text-slate-600 text-[10px] uppercase font-bold italic px-4">No recent updates</div>
                    )}
                    
                    {broadcasts.map((b) => (
                        <button 
                            key={b.id} 
                            onClick={() => setSelectedBroadcast(b)}
                            className="flex-none flex flex-col items-center gap-2 group outline-none"
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl shadow-blue-900/10",
                                selectedBroadcast?.id === b.id && "scale-110 rotate-6 ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950"
                            )}>
                                <div className="w-full h-full rounded-full bg-slate-950 border-2 border-slate-950 flex items-center justify-center overflow-hidden">
                                    <Megaphone className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 w-16 truncate text-center">
                                {new Date(b.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Broadcast Viewer (Overlay style) */}
            {selectedBroadcast && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setSelectedBroadcast(null)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="h-1 bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-400 w-full" />
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <Megaphone className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white uppercase tracking-widest text-xs">Official Broadcast</h3>
                                        <p className="text-[10px] text-slate-500 font-bold">{new Date(selectedBroadcast.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {role === 'admin' && (
                                        <Button variant="ghost" size="sm" onClick={() => { deleteBroadcast(selectedBroadcast.id); setSelectedBroadcast(null); }} className="text-rose-500 hover:bg-rose-500/10 group">
                                            <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedBroadcast(null)} className="text-slate-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-slate-950/50 p-8 rounded-3xl border border-slate-800/50">
                                <p className="text-lg font-medium text-slate-100 leading-relaxed italic text-center">"{selectedBroadcast.content}"</p>
                            </div>
                            <Button className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold" onClick={() => setSelectedBroadcast(null)}>Dismiss</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAIN CHAT FEED --- */}
            <Card className="flex-1 flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden bg-slate-900/40 backdrop-blur-3xl border border-slate-800/40 ring-1 ring-white/5 relative group/chat">
                <CardHeader className="bg-slate-950/30 pb-4 border-b border-slate-800/50 p-6 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center text-white text-xl font-black tracking-tighter">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4 group-hover/chat:scale-110 transition-transform">
                            <MessageCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        Community Pulse
                    </CardTitle>
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                <User className="w-4 h-4" />
                            </div>
                        ))}
                    </div>
                </CardHeader>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-transparent scrollbar-none hover:scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-600 opacity-50">
                            <MessageCircle className="w-12 h-12" />
                            <p className="text-sm font-bold uppercase tracking-widest">Start a new conversation</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.sender_id === currentUser.id
                            const isAdmin = msg.sender_role === 'admin'
                            const nextMsg = messages[idx + 1]
                            const showAvatar = !nextMsg || nextMsg.sender_id !== msg.sender_id

                            return (
                                <div key={msg.id} className={cn("flex w-full animate-in fade-in slide-in-from-bottom-2 duration-500", isMe ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "flex gap-3 max-w-[75%]",
                                        isMe ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        {!isMe && showAvatar && (
                                            <div className="flex-none w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center self-end mb-1">
                                                <User className="w-4 h-4 text-slate-500" />
                                            </div>
                                        )}
                                        {!isMe && !showAvatar && <div className="w-8" />}
                                        
                                        <div className="flex flex-col gap-1.5">
                                            {!isMe && showAvatar && (
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest px-1",
                                                    isAdmin ? "text-amber-500" : "text-slate-500"
                                                )}>
                                                    {msg.sender_name} {isAdmin && "(MUNICIPAL)"}
                                                </span>
                                            )}
                                            <div className={cn(
                                                "rounded-3xl px-6 py-4 relative group/msg shadow-lg",
                                                isMe ? "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white rounded-br-lg" : 
                                                isAdmin ? "bg-amber-900/20 text-amber-50 border border-amber-900/30 rounded-bl-lg backdrop-blur-sm" :
                                                "bg-slate-800/40 border border-slate-800/50 text-slate-200 rounded-bl-lg"
                                            )}>
                                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                                <span className={cn(
                                                    "absolute bottom-[-20px] text-[9px] font-bold opacity-0 group-hover/msg:opacity-40 transition-opacity whitespace-nowrap",
                                                    isMe ? "right-2" : "left-2"
                                                )}>
                                                    {formatTime(msg.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                <div className="p-6 bg-slate-950/40 border-t border-slate-800/50">
                    <form onSubmit={sendMessage} className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-[2rem] border border-slate-800/80 focus-within:border-blue-500/50 transition-all shadow-inner">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Message the community..."
                            className="flex-1 bg-transparent border-none text-slate-100 placeholder:text-slate-600 focus-visible:ring-0 h-14 px-6 text-sm font-bold"
                        />
                        <Button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-500 h-12 w-12 rounded-full shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex-none p-0">
                            <Send className="w-5 h-5 text-white" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    )
}
