"use client";

import React, { useState } from "react";
import { 
  Download, 
  Eye, 
  MoreVertical, 
  ChevronDown, 
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const incidents = [
  { id: 1, title: "Unauthorized Access Attempt", description: "Facial recognition mismatch. Alert triggered at primary vault entry.", status: "CRITICAL", badge: "LIVE AI", location: "Server Room A", time: "14:22:05 Today", image: "https://images.unsplash.com/photo-1558494949-ef0109159d5e?q=80&w=2000&auto=format&fit=crop" },
  { id: 2, title: "Tailgating Detected", description: "Secondary person entered without badge swipe behind Authorized User #442.", status: "MEDIUM", badge: "MOTION", location: "West Wing Elevator", time: "13:45:12 Today", image: "https://images.unsplash.com/photo-1577705998148-ebbd7a31ec75?q=80&w=2000&auto=format&fit=crop" },
  { id: 3, title: "After-hours Activity", description: "Maintenance crew scheduled cleaning. Identification verified by onsite security.", status: "RESOLVED", badge: null, location: "Main Lobby", time: "02:10:00 Today", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop" }
];

export default function LogsView() {
  const [activeTab, setActiveTab] = useState("All Flagged");

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
            <ShieldAlert className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Violation Log</h1>
            <p className="text-[10px] uppercase font-bold text-primary tracking-widest">REAL-TIME MONITORING</p>
          </div>
        </div>
        <button title="Download Report" className="bg-primary/10 border border-primary/30 p-2 rounded-lg text-primary">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-white/5">
        {["All Flagged", "High Risk", "Resolved"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-3 text-sm font-bold transition-all relative",
              activeTab === tab ? "text-primary" : "text-white/40"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-glow" />
            )}
          </button>
        ))}
      </div>

      {/* Incident Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {incidents.map((incident, i) => (
            <motion.div 
              key={incident.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden border-white/5 hover:border-primary/20 transition-all duration-500 group relative flex flex-col h-full bg-white/[0.01]"
            >
              <div className="aspect-video relative overflow-hidden">
                <img src={incident.image} alt={incident.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />
                {incident.badge && (
                  <span className={cn(
                    "absolute top-4 left-4 px-3 py-1 text-[9px] font-black rounded-lg tracking-widest uppercase border border-white/20 backdrop-blur-md",
                    incident.badge === 'LIVE AI' ? "bg-critical/80 text-white" : "bg-primary/80 text-white"
                  )}>
                    {incident.badge}
                  </span>
                )}
              </div>
              
              <div className="p-6 space-y-4 flex flex-col flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-lg leading-tight text-white/90 group-hover:text-primary transition-colors">{incident.title}</h3>
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                    incident.status === 'CRITICAL' ? "bg-critical shadow-[0_0_10px_rgba(239,68,68,0.8)]" : 
                    incident.status === 'MEDIUM' ? "bg-accent shadow-[0_0_10px_rgba(168,85,247,0.8)]" : "bg-success"
                  )} />
                </div>
                <p className="text-xs text-white/40 leading-relaxed font-bold flex-1">{incident.description}</p>
                
                <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-widest pt-4 border-t border-white/5">
                   <span>{incident.location}</span>
                   <span>{incident.time}</span>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button className="flex-1 bg-primary/10 border border-primary/20 hover:bg-primary text-primary hover:text-white transition-all duration-300 rounded-xl py-3 font-black text-[10px] tracking-widest uppercase flex items-center justify-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>In-Depth</span>
                  </button>
                  <button title="More Options" className="glass-card w-14 flex items-center justify-center hover:bg-white/10 transition-colors border-white/5">
                    <MoreVertical className="w-4 h-4 opacity-40 hover:opacity-100" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}
