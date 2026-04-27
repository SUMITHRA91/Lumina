import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowLeft, MessageCircle, Activity, ShieldCheck, Heart, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CounselorAvatar, type Gesture } from "@/components/lumina/CounselorAvatar";
import { ChatPanel } from "@/components/lumina/ChatPanel";
import { CameraFeed } from "@/components/lumina/CameraFeed";
import { EmotionMeter } from "@/components/lumina/EmotionMeter";
import { type EmotionScores, dominantEmotion, distressScore } from "@/hooks/lumina/useEmotionDetection";
import { DiagnosticAlert } from "@/components/lumina/DiagnosticAlert";
import { MoodFuelPanel } from "@/components/lumina/MoodFuelPanel";
import { FallingLeaves } from "@/components/lumina/FallingLeaves";
import { UserProfileButton } from "@/components/lumina/UserProfileButton";

const EMPTY: EmotionScores = {
  happy: 0, sad: 0, angry: 0, surprised: 0, fearful: 0, disgusted: 0, neutral: 1,
};

const Counselor = () => {
  const [scores, setScores] = useState<EmotionScores>(EMPTY);
  const [avatarState, setAvatarState] = useState({
    speaking: false,
    mood: "neutral" as "happy" | "concerned" | "surprised" | "neutral",
    gesture: "none" as Gesture,
  });

  const [counselorType, setCounselorType] = useState<"standard" | "esconv" | null>(null);

  // --- Diagnostic Alerting (5-minute rolling window) ---
  const ALERT_WINDOW_MS = 5 * 60 * 1000;
  const ALERT_THRESHOLD = 0.70;
  const scoreBuffer = useRef<{ ts: number; scores: EmotionScores }[]>([]);
  const [alertState, setAlertState] = useState<"panic_loop" | "lethargy" | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    if (!counselorType) return;
    const now = Date.now();
    scoreBuffer.current = [
      ...scoreBuffer.current.filter((e) => now - e.ts < ALERT_WINDOW_MS),
      { ts: now, scores },
    ];
    const buf = scoreBuffer.current;
    if (buf.length < 2) return;
    const oldest = buf[0].ts;
    if (now - oldest < ALERT_WINDOW_MS) return;

    const panicRatio =
      buf.filter((e) => (e.scores.fearful ?? 0) + (e.scores.surprised ?? 0) > ALERT_THRESHOLD).length /
      buf.length;
    const lethargyRatio =
      buf.filter((e) => (e.scores.sad ?? 0) > ALERT_THRESHOLD).length / buf.length;

    if (panicRatio > 0.7 && !alertDismissed) setAlertState("panic_loop");
    else if (lethargyRatio > 0.7 && !alertDismissed) setAlertState("lethargy");
  }, [scores, counselorType]);

  useEffect(() => { setAlertDismissed(false); }, [alertState]);

  const emotion = dominantEmotion(scores);
  
  // Dynamic background matching the professional aesthetic
  const bgGrad =
    !counselorType        ? "from-[#f0f4f0] via-[#e8efe8] to-[#f5f8f5]"
    : emotion === "sad"     ? "from-blue-50 via-indigo-50 to-slate-100"
    : emotion === "angry"   ? "from-red-50 via-rose-50 to-orange-50"
    : emotion === "fearful" ? "from-purple-50 via-slate-50 to-indigo-100"
    : emotion === "happy"   ? "from-amber-50 via-yellow-50 to-lime-50"
    : "from-[#f0f4f0] via-[#e8efe8] to-[#f5f8f5]";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-1000 bg-gradient-to-br ${bgGrad} relative`}>
      <FallingLeaves />

      {/* ── Header ── */}
      <header className="px-6 lg:px-10 py-5 flex items-center justify-between max-w-[1600px] mx-auto relative z-30">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/50 hover:bg-white/80 border border-border/30">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-sage flex items-center justify-center shadow-lg">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-serif text-xl text-foreground/90">Expert Guidance Portal</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {counselorType === "standard" ? "Standard Clinical Model" : counselorType === "esconv" ? "Conversational Empathy Model" : "Path Selection"}
              </p>
            </div>
          </div>
        </div>

        {counselorType && (
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setCounselorType(null);
                setScores(EMPTY);
              }}
              className="rounded-full bg-white/60 backdrop-blur text-xs"
            >
              Change Path
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white/30 text-xs text-muted-foreground backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Secure Session
            </div>
          </div>
        )}
        <UserProfileButton />
      </header>

      <main className="px-4 lg:px-10 max-w-[1600px] mx-auto pb-10 relative z-10">
        {!counselorType ? (
          /* ── Path Selection Screen ── */
          <div className="max-w-5xl mx-auto text-center space-y-12 py-20 animate-fade-up">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur border border-white/40 text-xs font-bold uppercase tracking-widest text-[#3A5F4D]">
                <ShieldCheck className="w-4 h-4" />
                Select Clinical Model
              </div>
              <h1 className="font-serif text-5xl lg:text-6xl text-foreground/90 tracking-tight">
                How can we support you today?
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Choose the therapeutic approach that best fits your current needs. Both models use our secure, on-device emotion sensing technology.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 pt-8">
              {/* Standard Card */}
              <button 
                onClick={() => setCounselorType("standard")}
                className="group p-10 rounded-[40px] bg-white/70 backdrop-blur-xl border border-border/40 hover:bg-white hover:border-[#3A5F4D]/40 transition-all text-left shadow-sm hover:shadow-glow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3A5F4D]/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-[#3A5F4D]/10 transition-colors" />
                <div className="w-16 h-16 rounded-3xl bg-[#3A5F4D]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Activity className="w-8 h-8 text-[#3A5F4D]" />
                </div>
                <h3 className="font-serif text-3xl mb-4 text-foreground/90">Standard Guidance</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-6">
                  Our core psychiatric model focusing on structured support, cognitive reframing, and immediate relief techniques. Ideal for managing specific anxieties.
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#3A5F4D] uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                  Begin Standard Session <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </button>

              {/* Empathy Card */}
              <button 
                onClick={() => setCounselorType("esconv")}
                className="group p-10 rounded-[40px] bg-white/70 backdrop-blur-xl border border-border/40 hover:bg-white hover:border-indigo-400/40 transition-all text-left shadow-sm hover:shadow-glow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <MessageCircle className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="font-serif text-3xl mb-4 text-foreground/90">Conversational Empathy</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-6">
                  Powered by ESConv datasets, this model prioritizes nuanced dialogue, deep emotional understanding, and peer-support listening.
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                  Begin Empathy Session <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* ── Active Session Layout (3 Columns) ── */
          <div className="grid lg:grid-cols-[320px_1fr_400px] xl:grid-cols-[360px_1fr_450px] gap-6 items-start animate-fade-in mt-4">
            
            {/* Left Column: Diagnostics */}
            <div className="space-y-6">
              {/* Camera Container (Fixed to remove overflow blocking) */}
              <div className="p-4 rounded-[32px] bg-white/50 backdrop-blur-xl border border-border/40 shadow-sm relative z-20">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <ShieldCheck className="w-4 h-4 text-[#3A5F4D]" />
                  <h3 className="font-serif text-sm">Secure Vision Sensor</h3>
                </div>
                {/* The camera feed handles its own container inside, but we ensure it's clickable */}
                <div className="relative z-30">
                  <CameraFeed onScores={setScores} />
                </div>
              </div>

              {/* Emotion Sync */}
              <div className="p-5 rounded-[32px] bg-white/50 backdrop-blur-xl border border-border/40 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-[#3A5F4D]" />
                  <h3 className="font-serif text-sm">Emotional Sync</h3>
                </div>
                <EmotionMeter scores={scores} />
              </div>

              {/* Mood Fuel */}
              <MoodFuelPanel scores={scores} />
            </div>

            {/* Center Column: Avatar Stage */}
            <div className="flex flex-col gap-6">
              <div className="rounded-[40px] bg-white/40 backdrop-blur-2xl border border-border/30 shadow-lg p-10 flex flex-col items-center justify-center relative overflow-hidden h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                  <CounselorAvatar
                    size={200}
                    speaking={avatarState.speaking}
                    mood={avatarState.mood}
                    gesture={avatarState.gesture}
                  />
                  <div>
                    <h2 className="font-serif text-2xl text-foreground/90">
                      {counselorType === "standard" ? "Lumina Expert Guide" : "Lumina Empathic Soul"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                      {counselorType === "standard" 
                        ? "I'm offering structured psychiatric guidance today."
                        : "I'm here to listen deeply and walk through your feelings."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Status Card */}
              <div className="rounded-[32px] bg-white/50 backdrop-blur-xl border border-border/40 p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Distress Level</p>
                    <p className={`text-xs ${distressScore(scores) > 0.6 ? "text-red-500 font-bold" : "text-emerald-600"}`}>
                      {distressScore(scores) > 0.6 ? "Elevated" : distressScore(scores) > 0.3 ? "Moderate" : "Calm baseline"}
                    </p>
                  </div>
                </div>
                <div className="h-10 w-px bg-border/40 mx-4" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Alert Mode</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                      {alertState === "panic_loop" ? "Panic Loop" : alertState === "lethargy" ? "Lethargy" : "Monitoring"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Chat Panel */}
            <div className="h-[calc(100vh-140px)] rounded-[40px] overflow-hidden bg-white/60 backdrop-blur-2xl border border-border/40 shadow-xl relative z-10 flex flex-col">
              <div className="px-6 py-4 border-b border-border/30 bg-white/40 flex items-center gap-2 shrink-0">
                <MessageCircle className="w-4 h-4 text-[#3A5F4D]" />
                <span className="font-serif text-sm font-medium">Clinical Secure Chat</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatPanel
                  scores={scores}
                  onUserMessage={() => {}}
                  onAvatarStateChange={setAvatarState}
                  alertState={alertState}
                  apiUrl={`http://localhost:8000/api/${counselorType === 'standard' ? 'counselor' : 'esconv-counselor'}/`}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Diagnostic Alert Overlay */}
      {alertState && (
        <DiagnosticAlert
          alertType={alertState}
          onDismiss={() => {
            setAlertState(null);
            setAlertDismissed(true);
            scoreBuffer.current = [];
          }}
        />
      )}
    </div>
  );
};

export default Counselor;
