"use client";

import React from "react";
import { 
  Bot, 
  Cpu, 
  Terminal, 
  Zap,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AgentsView() {
  const stats = [
    { label: "System CPU", value: "42%", delta: "-5%", color: "primary" },
    { label: "System GPU", value: "68%", delta: "+12%", color: "accent" },
  ];

  const agents = [
    { name: "Router-Agent", status: "ACTIVE", type: "Traffic Orchestration V1.2", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2000&auto=format&fit=crop" },
    { name: "Executor-7", status: "PROCESSING", type: "Task Execution Pipeline", image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=2000&auto=format&fit=crop" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header Info */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 glass-card flex items-center justify-center border-primary/30">
          <Bot className="text-primary w-6 h-6 drop-shadow-glow" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Active Agents</h1>
          <p className="text-[10px] uppercase font-bold text-primary tracking-[0.2em]">3 ONLINE • SYSTEM STABLE</p>
        </div>
      </div>

      {/* System Stats & Node Overview Combined Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-8 space-y-6">
              <div className="flex justify-between items-center text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                <span>{stat.label}</span>
                <Cpu className="w-5 h-5 text-primary drop-shadow-glow" />
              </div>
              <div className="flex items-baseline space-x-4">
                <span className="text-5xl font-black text-white tracking-tighter">{stat.value}</span>
                <span className={cn(
                  "text-[10px] font-black px-3 py-1 rounded-lg tracking-widest",
                  stat.delta.startsWith('+') ? "bg-success/20 text-success" : "bg-critical/20 text-critical"
                )}>
                  {stat.delta}
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                   initial={{ width: 0 }}
                   animate={{ width: stat.value }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className={cn("h-full shadow-glow", stat.color === 'primary' ? "bg-primary" : "bg-accent")}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 glass-card p-8 bg-primary/5 border-primary/20 flex flex-col justify-center space-y-6">
           <div>
              <p className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-3">Runtime Stability</p>
              <div className="flex items-center space-x-6">
                 <div className="flex-1 h-20 glass-card border-success/30 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-success">99.9%</span>
                    <span className="text-[8px] font-bold opacity-40 uppercase">Uptime</span>
                 </div>
                 <div className="flex-1 h-20 glass-card border-primary/30 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-primary">2.1ms</span>
                    <span className="text-[8px] font-bold opacity-40 uppercase">Latency</span>
                 </div>
              </div>
           </div>
           <button className="w-full bg-primary hover:bg-accent text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-glow flex items-center justify-center space-x-3 group">
              <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
              <span>Scale Cluster</span>
           </button>
        </div>
      </section>

      {/* Agents List in Horizontal Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase font-black tracking-[0.3em] text-white/40">Active Neural Units</h2>
          <span className="text-[10px] font-black text-primary tracking-widest">3 OPERATIONAL UNITS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card overflow-hidden group border-white/5 relative bg-white/[0.01]"
            >
              <div className="aspect-[16/9] relative">
                <img src={agent.image} className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    <span className="text-[9px] font-black tracking-[0.2em] uppercase text-success">{agent.status}</span>
                  </div>
                  <h3 className="font-black text-xl text-white tracking-widest uppercase">{agent.name}</h3>
                  <p className="text-[10px] font-bold text-white/30 truncate">{agent.type}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Emergency Console */}
      <section className="glass-card p-4 border-critical/30 bg-critical/5 flex items-center justify-between">
         <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-critical" />
            <h3 className="text-[10px] font-black text-critical uppercase tracking-widest">Override</h3>
         </div>
         <button className="bg-critical/20 text-critical text-[10px] font-black px-4 py-2 rounded-lg border border-critical/30">
           TERMINATE
         </button>
      </section>
    </motion.div>
  );
}
