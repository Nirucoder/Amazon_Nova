"use client";

import React from "react";
import { 
  Play, 
  Activity, 
  Rocket,
  CheckCircle2,
  Eye,
  MoreVertical,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function HUDView() {
  const [goal, setGoal] = React.useState("");

  const steps = [
    { title: "Neural Mesh Init", status: "success", desc: "Handshake complete. 4096 nodes synced.", time: "0.4s" },
    { title: "Environment Scan", status: "active", desc: "Parsing spatial metadata & sensor logs...", time: "" },
    { title: "Path Optimization", status: "pending", desc: "Awaiting environment data confirmation.", time: "" },
    { title: "Node Syncing", status: "pending", desc: "Queued: Step 4", time: "" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="grid grid-cols-1 xl:grid-cols-12 gap-8"
    >
      {/* Left Column: Video & Goal */}
      <div className="xl:col-span-7 space-y-8">
        {/* Video Feed Area */}
        <section className="relative group overflow-hidden rounded-3xl border border-white/10 shadow-3xl">
          <div className="aspect-video bg-surface overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop" 
              alt="Live Feed"
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            
            <div className="absolute top-6 left-6 space-y-2">
              <div className="flex items-center space-x-3 glass-card px-4 py-2 text-[10px] font-black uppercase tracking-widest border-primary/30">
                <span className="w-2 h-2 rounded-full bg-critical animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                <span>LINK_ESTABLISHED // CAM_ALPHA_84</span>
              </div>
              <p className="text-[10px] font-mono opacity-40 px-1 italic">VIRTUAL COORDINATES: 40.7128° N, 74.0060° W</p>
            </div>

            <button className="absolute inset-0 m-auto w-20 h-20 bg-primary/20 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center hover:scale-110 transition-all group/btn shadow-glow">
              <Play className="w-10 h-10 text-white fill-white group-hover/btn:scale-110 transition-transform" />
            </button>

            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-[10px] font-mono opacity-80">
              <div className="flex space-x-8">
                <div>ISO: <span className="text-primary font-bold">800</span></div>
                <div>SHUTTER: <span className="text-primary font-bold">1/60</span></div>
                <div>APERTURE: <span className="text-primary font-bold">f/2.8</span></div>
              </div>
              <div className="text-xs font-black font-mono tracking-widest text-primary">REEL_TIME: 00:42:15:09</div>
            </div>
          </div>
        </section>

        {/* Goal Interface */}
        <section className="glass-card p-8 space-y-6 border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-foreground/80">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-sm uppercase font-black tracking-[0.3em]">Objective Command</h2>
            </div>
            <span className="text-[9px] font-bold text-white/20 italic tracking-widest uppercase">NLP ENGINE v4.2</span>
          </div>
          
          <div className="relative group">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Inject natural language parameters for the agents..."
              className="w-full bg-surface/30 border border-white/10 rounded-2xl p-6 text-sm min-h-[160px] focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10 resize-none"
            />
            <button className="absolute bottom-4 right-4 bg-primary hover:bg-accent text-white px-8 py-3 rounded-xl text-xs font-black transition-all duration-500 shadow-glow flex items-center space-x-3 group/btn hover:scale-105 active:scale-95">
              <Rocket className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
              <span className="tracking-widest">DEPLOY_MISSION</span>
            </button>
          </div>
        </section>
      </div>

      {/* Right Column: Execution & Load */}
      <div className="xl:col-span-5 space-y-8">
        {/* Execution Flow */}
        <section className="glass-card p-8 space-y-8 border-white/5 flex flex-col h-full bg-white/[0.01]">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-black tracking-[0.3em] text-white/40">Neural Execution Feed</h2>
            <div className="flex items-center space-x-4">
               <div className="flex space-x-1">
                  {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i*200}ms` }} />)}
               </div>
               <span className="text-[10px] font-black text-primary uppercase">Active</span>
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {steps.map((step, i) => (
              <div key={i} className="relative flex space-x-6 group">
                {i !== steps.length - 1 && (
                  <div className="absolute left-[13px] top-10 w-[2px] h-full bg-gradient-to-b from-primary/40 to-transparent" />
                )}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center z-10 transition-all duration-500 shrink-0",
                  step.status === 'success' ? "bg-primary shadow-glow" : 
                  step.status === 'active' ? "bg-accent/40 border-2 border-accent animate-pulse" :
                  "bg-surface border border-white/10"
                )}>
                  {step.status === 'success' ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Activity className="w-4 h-4 text-white/40" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={cn("text-sm font-black tracking-wide", step.status === 'pending' ? "text-white/20" : "text-white")}>
                      {step.title}
                    </h3>
                    {step.status === 'success' && <span className="text-[9px] font-black text-primary">[{step.time}]</span>}
                  </div>
                  <p className="text-[11px] text-white/40 font-bold leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mini System Load Integrated */}
          <div className="pt-8 border-t border-white/5 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Load Telemetry</h3>
            <div className="grid grid-cols-2 gap-8">
              {[
                { label: "Core Sync", value: 78 },
                { label: "Neural Bandwidth", value: 42 }
              ].map((bar, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-tight">
                    <span className="text-white/30">{bar.label}</span>
                    <span className="text-primary">{bar.value}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary shadow-glow"
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.value}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
