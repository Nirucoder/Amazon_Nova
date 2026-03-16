"use client";

import React from "react";
import { 
  Play, 
  Activity, 
  CheckCircle2,
  Eye,
  MoreVertical,
  Zap,
  Rocket,
  FileVideo
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function HUDView() {
  const [goal, setGoal] = React.useState("");
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [activeVideoId, setActiveVideoId] = React.useState<string | null>(null);
  const [detections, setDetections] = React.useState<any[]>([]);
  const [currentTime, setCurrentTime] = React.useState(0);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const pollingRef = React.useRef<any>(null);

  const [videoSrc, setVideoSrc] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  React.useEffect(() => {
    const handleStorage = () => {
      const saved = JSON.parse(localStorage.getItem("novaflow_submissions") || "[]");
      setSubmissions(saved);
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const steps = [
    { title: "Neural Mesh Init", status: "success", desc: "Handshake complete. 4096 nodes synced.", time: "0.4s" },
    { title: "Environment Scan", status: "active", desc: "Parsing spatial metadata & sensor logs...", time: "" },
    { title: "Path Optimization", status: "pending", desc: "Awaiting environment data confirmation.", time: "" },
    { title: "Node Syncing", status: "pending", desc: "Queued: Step 4", time: "" },
  ];

  // Fetch violations polling
  React.useEffect(() => {
    if (!activeVideoId) return;

    const pollViolations = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/violations/${activeVideoId}`);
        const data = await res.json();
        if (data.detections) {
          setDetections(data.detections);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    };

    pollingRef.current = setInterval(pollViolations, 3000);
    return () => clearInterval(pollingRef.current);
  }, [activeVideoId]);

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
            <video 
              ref={videoRef}
              onTimeUpdate={(e) => setCurrentTime((e.target as any).currentTime)}
              src={videoSrc || "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}
              className="w-full h-full object-cover"
              controls
            />
            
            {/* Real-Time Bounding Box Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {detections
                .filter(d => Math.abs(d.timestamp - currentTime) < 0.5) // Show if within 0.5s of frame
                .map((d, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute border-2 border-critical shadow-[0_0_15px_rgba(239,68,68,0.8)] rounded-sm"
                  style={{
                    top: `${d.bounding_box[0] / 10}%`,
                    left: `${d.bounding_box[1] / 10}%`,
                    height: `${(d.bounding_box[2] - d.bounding_box[0]) / 10}%`,
                    width: `${(d.bounding_box[3] - d.bounding_box[1]) / 10}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-critical text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter whitespace-nowrap">
                    {d.category} ({Math.round(d.confidence * 100)}%)
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </section>

        {/* Video Submission Portal - INTEGRATED INTO HUD */}
        <section className="glass-card p-8 space-y-6 border-accent/20 bg-accent/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[60px] rounded-full -mr-16 -mt-16" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="bg-accent/20 p-2 rounded-xl border border-accent/30 shadow-glow-accent">
                <Rocket className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-sm uppercase font-black tracking-[0.2em] text-white">Audit Reel Submission</h2>
                <p className="text-[9px] font-bold text-accent/60 uppercase">Max 60 Seconds Duration</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={cn(
                "text-[9px] font-black px-2 py-0.5 rounded border tracking-widest uppercase",
                activeVideoId ? "border-success text-success bg-success/10" : "border-white/10 text-white/20"
              )}>
                {activeVideoId ? "SYNC_ACTIVE" : "AWAITING_PAYLOAD"}
              </span>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <input 
              type="file" 
              ref={videoInputRef}
              accept="video/*" 
              title="Video Upload Payload"
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }}
            />
            
            <div 
              onClick={() => videoInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer",
                selectedFile ? "border-accent/40 bg-accent/5 shadow-glow-accent" : "border-white/5 hover:border-accent/40 hover:bg-white/[0.02]"
              )}
            >
              <FileVideo className={cn("w-10 h-10 transition-colors", selectedFile ? "text-accent" : "text-white/10")} />
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-widest text-white/80">
                  {selectedFile ? selectedFile.name : "Drop Audit Reel Here"}
                </p>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter mt-1">
                  {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "MP4 / MOV / AVI (MAX 60S)"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                disabled={!selectedFile || isUploading || !!activeVideoId}
                onClick={async () => {
                  if (!selectedFile) return;
                  setIsUploading(true);
                  
                  const video = document.createElement('video');
                  video.preload = 'metadata';
                  video.onloadedmetadata = async function() {
                    window.URL.revokeObjectURL(video.src);
                    if (video.duration > 60) {
                      alert("⚠️ SYSTEM REJECTION: Video duration is " + Math.round(video.duration) + "s. Maximum allowed is 60s.");
                      setIsUploading(false);
                      return;
                    }

                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    
                    try {
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/upload-reel`, {
                        method: 'POST',
                        body: formData,
                      });
                      const data = await response.json();
                      if (data.video_id) {
                        setActiveVideoId(data.video_id);
                        setVideoSrc(data.video_url);
                        setSubmissions(prev => [{
                          id: data.video_id,
                          title: selectedFile.name.toUpperCase(),
                          time: new Date().toLocaleTimeString(),
                          status: "UPLOADED",
                          agent: "NovaProbe-1"
                        }, ...prev]);
                      }
                    } catch (err) {
                      alert("❌ UPLINK_ERROR: Check backend connection.");
                    } finally {
                      setIsUploading(false);
                    }
                  }
                  video.src = URL.createObjectURL(selectedFile);
                }}
                className={cn(
                  "h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3",
                  selectedFile && !activeVideoId ? "bg-accent text-white shadow-glow-accent hover:scale-[1.02]" : "bg-white/5 text-white/10 grayscale cursor-not-allowed"
                )}
              >
                <Rocket className={cn("w-4 h-4", isUploading && "animate-bounce")} />
                <span>{isUploading ? "Uploading..." : activeVideoId ? "Uploaded" : "Submit Reel"}</span>
              </button>

              <button 
                disabled={!activeVideoId || isAnalyzing}
                onClick={async () => {
                  if (!activeVideoId) return;
                  setIsAnalyzing(true);
                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/analyze/${activeVideoId}`, {
                      method: 'POST'
                    });
                    const data = await res.json();
                    alert("🚀 " + data.message);
                    setSubmissions(prev => prev.map(s => s.id === activeVideoId ? { ...s, status: "ANALYZING" } : s));
                  } catch (err) {
                    alert("❌ ANALYSIS_FAILED");
                  } finally {
                    setIsAnalyzing(false);
                  }
                }}
                className={cn(
                  "h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3",
                  activeVideoId ? "bg-primary text-white shadow-glow hover:scale-[1.02]" : "bg-white/5 text-white/10 grayscale cursor-not-allowed"
                )}
              >
                <Zap className={cn("w-4 h-4", isAnalyzing && "animate-pulse")} />
                <span>{isAnalyzing ? "Analyzing..." : "Analyze Video"}</span>
              </button>
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
                  {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ ["--delay" as any]: `${i*200}ms`, animationDelay: "var(--delay)" }} />)}
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
            <div className="flex justify-between items-center">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Recent Deliverables</h3>
               <span className="text-[8px] border border-primary/20 px-2 py-0.5 rounded text-primary font-bold">LIVE FEED</span>
            </div>
            
            <div className="space-y-3">
              {submissions.slice(0, 3).map((sub: any) => (
                <div key={sub.id} className="glass-card p-4 border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/80">{sub.title}</p>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">{sub.agent} • {sub.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[7px] font-black text-primary border border-primary/20 px-1.5 py-0.5 rounded uppercase">{sub.status}</span>
                    <button title="View Report" className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                      <Eye className="w-3.5 h-3.5 text-white/40" />
                    </button>
                  </div>
                </div>
              ))}
              {submissions.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest italic">Awaiting Agent Reports...</p>
                </div>
              )}
            </div>
          </div>

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
