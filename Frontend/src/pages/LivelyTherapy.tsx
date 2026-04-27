import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeft, Sparkles, Music, Wind, CheckCircle2, Eye, Move, Volume2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CameraFeed } from "@/components/lumina/CameraFeed";
import { useEmotionDetection, type EmotionScores, dominantEmotion } from "@/hooks/lumina/useEmotionDetection";
import { CounselorAvatar, type Gesture } from "@/components/lumina/CounselorAvatar";
import { Coffee, Activity, ArrowRight, User } from "lucide-react";
import { UserProfileButton } from "@/components/lumina/UserProfileButton";

type Phase = "check-in" | "plan-overview" | "preparation" | "action" | "completion" | "focus-dot" | "mirroring";

export default function LivelyTherapy() {
  const [phase, setPhase] = useState<Phase>("check-in");
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const [breathCount, setBreathCount] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [dotPos, setDotPos] = useState({ x: 50, y: 50 });
  const [mirrorSync, setMirrorSync] = useState(0);
  const [aiGesture, setAiGesture] = useState<Gesture>("none");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentMood, setCurrentMood] = useState<string>("neutral");
  const [activeDetail, setActiveDetail] = useState<"none" | "diet" | "exercise" | "activities">("none");
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });

  // ── TTS Logic ───────────────────────────────────────────────────────────────
  const speakTip = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.8;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  }, []);

  // ── Mouse Dynamic Background ────────────────────────────────────────────────
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setBgPos({ x: (e.clientX / window.innerWidth) * 20, y: (e.clientY / window.innerHeight) * 20 });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // ── Phase Transitions ───────────────────────────────────────────────────────
  const handleScores = useCallback((scores: EmotionScores) => {
    if (phase === "check-in" && !hasCheckedIn) {
      setCurrentMood(dominantEmotion(scores));
    }
  }, [phase, hasCheckedIn]);

  useEffect(() => {
    if (phase === "check-in" && !hasCheckedIn) {
      const timer = setTimeout(() => {
        setHasCheckedIn(true);
        setPhase("plan-overview");
        speakTip("Welcome back. I've designed a personalized plan to help you find your balance today.");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase, hasCheckedIn, speakTip]);

  // ── Interaction Logic ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "action") {
      // 4-7-8 Breathing Method with Orb
      let bPhase: "in" | "hold" | "out" = "in";
      let count = 0;
      const interval = setInterval(() => {
        count++;
        if (bPhase === "in" && count > 4) { bPhase = "hold"; count = 1; }
        else if (bPhase === "hold" && count > 7) { bPhase = "out"; count = 1; }
        else if (bPhase === "out" && count > 8) { bPhase = "in"; count = 1; }
        setBreathPhase(bPhase);
        setBreathCount(count);
      }, 1000);
      return () => clearInterval(interval);
    }

    if (phase === "focus-dot") {
      const interval = setInterval(() => {
        setDotPos({ 
          x: 20 + Math.random() * 60, 
          y: 20 + Math.random() * 60 
        });
      }, 3000);
      return () => clearInterval(interval);
    }

    if (phase === "mirroring") {
      const interval = setInterval(() => {
        const gestures: Gesture[] = ["wave", "hand-to-heart", "nod", "tilt"];
        const next = gestures[Math.floor(Math.random() * gestures.length)];
        setAiGesture(next);
        speakTip(`Now mirror this ${next} gesture.`);
      }, 5000);

      const syncInterval = setInterval(() => {
        setMirrorSync(prev => Math.min(100, prev + Math.random() * 15));
      }, 1000);
      return () => {
        clearInterval(interval);
        clearInterval(syncInterval);
      };
    }
  }, [phase, speakTip]);

  return (
    <div 
      className="min-h-screen font-sans text-foreground transition-all duration-1000 overflow-hidden relative"
      style={{
        background: `radial-gradient(circle at ${50 + bgPos.x}% ${50 + bgPos.y}%, #f0f4f0 0%, #e8efe8 50%, #dce4dc 100%)`
      }}
    >
      {/* ── Glassmorphism Header ── */}
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto relative z-50 backdrop-blur-md bg-white/20 border-b border-white/30 sticky top-0">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/40">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#3A5F4D] flex items-center justify-center shadow-lg shadow-[#3A5F4D]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl tracking-tight">Lumina Lively</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex px-4 py-1.5 rounded-full bg-white/40 border border-white/50 text-[10px] font-bold uppercase tracking-widest text-[#3A5F4D]">
            Live Biofeedback Active
          </div>
          <UserProfileButton />
        </div>
      </header>

      <main className="px-6 lg:px-12 max-w-7xl mx-auto py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-start">
          
          {/* ── Left Column: Interaction Zone ── */}
          <div className="space-y-8">
            <div className="relative group/camera rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/50 bg-black/5 aspect-[4/3]">
              <CameraFeed onScores={handleScores} mode={phase === "plan-overview" || phase === "action" ? "face" : "body"} />
              
              {/* Focus Dot Exercise Overlay */}
              {phase === "focus-dot" && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                  <div 
                    className="w-12 h-12 rounded-full bg-sage shadow-[0_0_40px_rgba(58,95,77,0.6)] animate-pulse transition-all duration-1000 absolute"
                    style={{ left: `${dotPos.x}%`, top: `${dotPos.y}%`, transform: 'translate(-50%, -50%)' }}
                  />
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-white/80 backdrop-blur border border-white/50 text-xs font-bold uppercase tracking-widest">
                    Follow the calming light with your eyes
                  </div>
                </div>
              )}

              {/* Mirroring Overlay */}
              {phase === "mirroring" && (
                <div className="absolute inset-0 z-50 pointer-events-none bg-sage/5 backdrop-blur-[1px] flex flex-col items-center justify-center gap-4">
                  <div className="p-4 rounded-3xl bg-white/60 backdrop-blur-md shadow-xl border border-white/50 animate-bounce-slow">
                    <CounselorAvatar size={160} gesture={aiGesture} onGestureEnd={() => setAiGesture("none")} />
                  </div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 h-4 bg-white/40 rounded-full overflow-hidden border border-white/50">
                    <div 
                      className="h-full bg-sage transition-all duration-500" 
                      style={{ width: `${mirrorSync}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#3A5F4D] uppercase">
                      Sync Score: {Math.round(mirrorSync)}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hold Meter / Progress Ring */}
            {phase === "mirroring" && (
              <div className="p-8 rounded-[40px] bg-white/60 backdrop-blur-xl border border-white/50 shadow-soft flex items-center gap-8 animate-fade-up">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-black/5" />
                    <circle 
                      cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={251}
                      strokeDashoffset={251 - (251 * mirrorSync) / 100}
                      className="text-sage transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-serif text-xl">
                    {Math.round(mirrorSync)}%
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-2xl mb-1">Posture Hold</h3>
                  <p className="text-muted-foreground text-sm mb-4">Perfecting your alignment. Hold steady.</p>
                  <Button onClick={() => setPhase("plan-overview")} variant="outline" size="sm" className="rounded-xl">
                    Finish Mirroring
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Content & Controls ── */}
          <div className="flex flex-col gap-8 min-h-[600px]">
            
            {/* Phase: Check-in */}
            {phase === "check-in" && (
              <div className="animate-fade-up space-y-8 py-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/40 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A5F4D]">
                  <Activity className="w-3 h-3" /> Initializing Sensing
                </div>
                <h2 className="text-5xl font-serif leading-tight">Finding your <br/><span className="text-[#3A5F4D] italic">rhythm.</span></h2>
                <p className="text-xl text-muted-foreground leading-relaxed">Position your face clearly. Lumina is tuning into your emotional frequency.</p>
                <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-sage w-1/2 animate-shimmer" />
                </div>
              </div>
            )}

            {/* Phase: Plan Overview */}
            {phase === "plan-overview" && (
              <div className="animate-fade-up space-y-8">
                <div className="flex items-center justify-between">
                   <h2 className="text-4xl font-serif">Today's Journey</h2>
                   <div className="px-4 py-2 rounded-2xl bg-sage/10 text-[#3A5F4D] text-xs font-bold">
                     Mood: {currentMood}
                   </div>
                </div>
                
                <div className="grid gap-4">
                  <button 
                    onClick={() => setPhase("focus-dot")}
                    className="p-6 rounded-[32px] bg-white/80 hover:bg-white border border-white/50 shadow-sm hover:shadow-glow transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Eye className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl mb-1">Focus Point</h4>
                      <p className="text-xs text-muted-foreground">Eye tracking & neck mobility exercise.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </button>

                  <button 
                    onClick={() => setPhase("preparation")}
                    className="p-6 rounded-[32px] bg-white/80 hover:bg-white border border-white/50 shadow-sm hover:shadow-glow transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wind className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl mb-1">Bio-Sync Breathing</h4>
                      <p className="text-xs text-muted-foreground">Synchronized heart-rate regulation.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </button>

                  <button 
                    onClick={() => setPhase("mirroring")}
                    className="p-6 rounded-[32px] bg-white/80 hover:bg-white border border-white/50 shadow-sm hover:shadow-glow transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Move className="w-8 h-8 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl mb-1">Mirror Yoga</h4>
                      <p className="text-xs text-muted-foreground">Real-time posture & balance correction.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>

                <div className="p-6 rounded-[32px] bg-[#3A5F4D] text-white shadow-xl shadow-[#3A5F4D]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Lively Recommendation</span>
                  </div>
                  <p className="text-sm leading-relaxed font-medium">
                    I've noticed your focus has been slightly scattered. Let's start with the "Focus Point" exercise to ground your attention before we move to breathing.
                  </p>
                </div>
              </div>
            )}

            {/* Phase: Preparation / Breathing */}
            {phase === "preparation" || phase === "action" ? (
              <div className="animate-fade-up space-y-12 flex flex-col items-center justify-center flex-1">
                <div className="relative">
                  {/* The Orb */}
                  <div 
                    className={`
                      w-64 h-64 rounded-full transition-all duration-[4000ms] ease-in-out
                      flex items-center justify-center relative z-10
                      ${breathPhase === 'in' ? 'scale-110 bg-[#3A5F4D]/20 blur-xl' : breathPhase === 'hold' ? 'scale-110 bg-indigo-500/20 blur-2xl' : 'scale-75 bg-transparent blur-md'}
                    `}
                  />
                  <div 
                    className={`
                      absolute inset-0 rounded-full transition-all duration-[4000ms] ease-in-out
                      flex items-center justify-center border-2 border-white/30
                      ${breathPhase === 'in' ? 'scale-100 bg-gradient-sage shadow-[0_0_100px_rgba(58,95,77,0.3)]' : breathPhase === 'hold' ? 'scale-100 bg-indigo-500 shadow-[0_0_120px_rgba(99,102,241,0.4)]' : 'scale-[0.4] bg-white shadow-none'}
                    `}
                  >
                     <div className="text-white font-serif text-4xl">
                        {breathCount}
                     </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-serif">
                    {breathPhase === 'in' ? 'Breathe In' : breathPhase === 'hold' ? 'Hold Steady' : 'Release'}
                  </h3>
                  <p className="text-muted-foreground italic">"Let the orb guide your chest's movement."</p>
                  
                  {phase === "preparation" && (
                    <Button onClick={() => setPhase("action")} className="rounded-full px-8 h-12 bg-[#3A5F4D]">
                      Begin Session
                    </Button>
                  )}
                  {phase === "action" && (
                    <Button onClick={() => setPhase("plan-overview")} variant="outline" className="rounded-full px-8 h-12 mt-4">
                      Finish Breathing
                    </Button>
                  )}
                </div>
              </div>
            ) : null}

            {/* Focus Dot Phase Detail */}
            {phase === "focus-dot" && (
              <div className="animate-fade-up space-y-8 flex-1 flex flex-col justify-center">
                 <h2 className="text-4xl font-serif">Eye & Neck Mobility</h2>
                 <p className="text-muted-foreground text-lg">Follow the green focus point with your eyes. This simple task recalibrates your attention and releases neck tension.</p>
                 <div className="p-8 rounded-[40px] bg-white/40 border border-white/50 shadow-soft">
                   <div className="flex items-center gap-4 mb-6">
                      <Volume2 className="w-6 h-6 text-indigo-600" />
                      <p className="text-sm font-medium">Lumina is monitoring your head tilt and eye focus for optimal engagement.</p>
                   </div>
                   <Button onClick={() => setPhase("plan-overview")} variant="outline" className="w-full rounded-2xl h-12">
                     Finish Exercise
                   </Button>
                 </div>
              </div>
            )}

            {/* Completion */}
            {phase === "completion" && (
              <div className="animate-fade-up space-y-8 flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-4xl font-serif">Session Balanced</h2>
                <p className="text-muted-foreground text-lg max-w-md">Your bio-sync score was excellent. You've successfully regulated your nervous system.</p>
                <Link to="/">
                  <Button className="rounded-full px-8 h-12 bg-[#3A5F4D]">Return Home</Button>
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
