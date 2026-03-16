"use client";

import React from "react";
import { 
  Play, 
  Share2, 
  Info, 
  CheckCircle2, 
  LayoutGrid,
  ShieldCheck,
  Search,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Submission {
  id: string;
  filename: string;
  title: string;
  agent: string;
  time: string;
  status: string;
  url: string;
  size: string;
}

export default function ClientPortal({ onSelect }: { onSelect: (sub: Submission) => void }) {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/submissions`);
        const data = await res.json();
        if (data && Array.isArray(data.submissions)) {
          setSubmissions(data.submissions);
        } else {
          setSubmissions([]);
        }
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-white flex items-center space-x-3">
            <LayoutGrid className="w-8 h-8 text-accent animate-pulse" />
            <span>NOVAFOLW CLIENT PORTAL</span>
          </h1>
          <p className="text-[10px] font-bold text-accent/60 uppercase tracking-widest mt-1">
            System Status: Optimal // Encryption Active
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-surface/50 border border-white/5 rounded-xl px-4 py-2 flex items-center space-x-3 focus-within:border-accent/40 transition-all">
            <Search className="w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Filter Nodes..." 
              className="bg-transparent border-none outline-none text-[10px] uppercase font-black tracking-widest text-white placeholder:text-white/10 w-48"
            />
          </div>
          <button className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/10 transition-all group">
            <Filter className="w-4 h-4 text-white/40 group-hover:text-accent" />
          </button>
        </div>
      </header>

      {/* Tabs / Filters */}
      <div className="flex space-x-4">
        {["ALL AGENTS", "LLAVA-01", "BEDROCK-ALPHA"].map((tab, i) => (
          <button 
            key={tab}
            className={cn(
              "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              i === 0 ? "bg-accent text-white shadow-glow-accent" : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/5"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Submission Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 pb-20">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="glass-card h-80 animate-pulse bg-white/[0.02] rounded-3xl border border-white/5" />
          ))
        ) : (
          (submissions || []).map((sub) => (
            <motion.div 
              key={sub.id}
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="glass-card overflow-hidden border-white/5 hover:border-accent/40 bg-white/[0.01] flex flex-col group"
            >
              {/* Thumbnail Area */}
              <div className="aspect-video relative overflow-hidden bg-black/40">
                <video 
                  src={sub.url} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  muted
                  onMouseOver={(e) => (e.target as any).play()}
                  onMouseOut={(e) => (e.target as any).pause()}
                />
                
                {sub.status === "VERIFIED" && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-[#020617]/80 backdrop-blur-md border border-success/30 px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-success animate-pulse" />
                    <span className="text-[8px] font-black text-success tracking-widest uppercase">Verified</span>
                  </div>
                )}

                <div className="absolute bottom-4 right-4 bg-[#020617]/80 backdrop-blur-sm px-2 py-1 rounded-md">
                   <span className="text-[9px] font-black text-white/60 tracking-tighter uppercase">00:45:12</span>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white tracking-widest uppercase truncate">{sub.title}</h3>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1 italic">
                    Agent: {sub.agent} // ID: {sub.id.slice(-6)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => onSelect(sub)}
                    className="flex flex-col items-center justify-center space-y-2 py-3 rounded-xl bg-white/5 hover:bg-accent/20 border border-white/5 hover:border-accent/30 transition-all group/btn"
                  >
                    <Play className="w-4 h-4 text-white/40 group-hover/btn:text-accent" />
                    <span className="text-[8px] font-black text-white/20 group-hover/btn:text-white uppercase tracking-widest">Play</span>
                  </button>
                  <button className="flex flex-col items-center justify-center space-y-2 py-3 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/30 transition-all group/btn">
                    <Share2 className="w-4 h-4 text-white/40 group-hover/btn:text-primary" />
                    <span className="text-[8px] font-black text-white/20 group-hover/btn:text-white uppercase tracking-widest">Post</span>
                  </button>
                  <button className="flex flex-col items-center justify-center space-y-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group/btn">
                    <Info className="w-4 h-4 text-white/40 group-hover/btn:text-white" />
                    <span className="text-[8px] font-black text-white/20 group-hover/btn:text-white uppercase tracking-widest">Details</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
