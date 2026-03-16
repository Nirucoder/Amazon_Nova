"use client";

import React, { useState } from "react";
import { LogOut, LayoutDashboard, Users, History, Settings, Bell, Command, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import { cn } from "./lib/utils";

import HUDView from "./components/HUDView";
import AgentsView from "./components/AgentsView";
import LogsView from "./components/LogsView";
import ClientPortal from "./components/ClientPortal";
import ProjectDetailView from "./components/ProjectDetailView";

type ViewType = "HUD" | "AGENTS" | "LOGS" | "PROFILE" | "CLIENT";

export default function UnifiedCommandCenter() {
  const [activeView, setActiveView] = useState<ViewType>("HUD");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) return null; // Logic in AuthContext handles redirect to /login

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[150px] rounded-full" 
        />
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 border-r border-white/5 bg-surface/30 backdrop-blur-3xl z-50 flex flex-col items-center lg:items-stretch transition-all duration-500">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-glow shrink-0">
            <Command className="text-white w-6 h-6" />
          </div>
          <div className="hidden lg:block overflow-hidden whitespace-nowrap">
            <h1 className="text-xl font-bold tracking-tight">NovaFlow</h1>
            <p className="text-[10px] uppercase font-bold text-primary tracking-[0.2em]">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-2 w-full">
          {[
            { label: "HUD Dashboard", icon: LayoutDashboard, view: "HUD" },
            { label: "Client Portal", icon: LayoutDashboard, view: "CLIENT" },
            { label: "Agents Health", icon: Users, view: "AGENTS" },
            { label: "Violation Logs", icon: History, view: "LOGS" },
            { label: "System Config", icon: Settings, view: "PROFILE" },
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => setActiveView(item.view as ViewType)}
              className={cn(
                "w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group",
                activeView === item.view 
                  ? "bg-primary text-white shadow-glow" 
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-6 h-6 shrink-0", activeView === item.view ? "drop-shadow-glow" : "group-hover:scale-110 transition-transform")} />
              <span className="hidden lg:block font-bold text-sm tracking-wide">{item.label}</span>
              {activeView === item.view && (
                <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-8 bg-white lg:hidden" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 w-full space-y-4">
          <button 
            onClick={() => setActiveView("PROFILE")}
            className={cn(
              "w-full flex items-center space-x-4 p-4 rounded-2xl transition-all group",
              activeView === "PROFILE" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
            )}
          >
            <UserCircle className="w-6 h-6 shrink-0 group-hover:rotate-12 transition-transform" />
            <div className="hidden lg:block text-left overflow-hidden">
               <p className="text-sm font-bold truncate">{user.username}</p>
               <p className="text-[10px] uppercase font-black tracking-tighter text-primary">Status: Secure [{user.role}]</p>
            </div>
          </button>

          <button 
            onClick={logout}
            title="Secure Exit"
            className="w-full flex items-center space-x-4 p-4 rounded-2xl text-critical/60 hover:bg-critical/10 hover:text-critical transition-all group"
          >
            <LogOut className="w-6 h-6 shrink-0 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden lg:block font-bold text-sm tracking-wide">SECURE_EXIT</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="h-20 border-b border-white/5 bg-background/20 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center space-x-4">
             <div className="w-1.5 h-6 bg-primary rounded-full shadow-glow" />
             <h2 className="text-xl font-black uppercase tracking-widest text-white/90">{activeView} INTERFACE</h2>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 glass-card px-4 py-2 border-white/5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/60">Node: US-EAST-1 (OPTIMAL)</span>
            </div>
            <button className="p-2.5 glass-card hover:bg-white/10 transition-colors relative">
              <Bell className="w-5 h-5 text-white/80" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-critical rounded-full border-2 border-background" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              {activeView === "HUD" && <HUDView key="hud" />}
              {activeView === "CLIENT" && (
                selectedSubmission ? (
                  <ProjectDetailView 
                    key="detail" 
                    submission={selectedSubmission} 
                    onBack={() => setSelectedSubmission(null)} 
                  />
                ) : (
                  <ClientPortal 
                    key="client" 
                    onSelect={(sub) => setSelectedSubmission(sub)} 
                  />
                )
              )}
              {activeView === "AGENTS" && <AgentsView key="agents" />}
              {activeView === "LOGS" && <LogsView key="logs" />}
              {activeView === "PROFILE" && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                 >
                    <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/30 p-2 shadow-glow">
                         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Niru" className="w-full h-full rounded-full" alt="Avatar" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black text-white">Commander Niru</h2>
                         <p className="text-xs uppercase font-extrabold text-primary tracking-[0.4em] mt-2">Level 10 Overseer</p>
                      </div>
                      <div className="flex space-x-4 w-full pt-4">
                        <button className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-glow">Identity Protocol</button>
                        <button className="flex-1 bg-white/5 border border-white/10 text-white/60 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Revoke Access</button>
                      </div>
                    </div>
                    <div className="glass-card p-8 space-y-6">
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Security Clearance</h3>
                       <div className="space-y-4">
                          {[
                            { label: "Bio-Sync", level: "98%", status: "VERIFIED" },
                            { label: "Grid Isolation", level: "ENABLED", status: "SAFE" },
                            { label: "Neural Bridge", level: "ACTIVE", status: "ACTIVE" }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                               <span className="text-xs font-bold text-white/80">{item.label}</span>
                               <span className="text-[10px] font-black text-primary">{item.level} // {item.status}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
