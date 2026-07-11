import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeft, Sparkles, Music, Wind, CheckCircle2, Eye, Move, Volume2, Info, Target, Anchor, Cloud, Sun, Heart, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CameraFeed } from "@/components/lumina/CameraFeed";
import { useEmotionDetection, type EmotionScores, dominantEmotion } from "@/hooks/lumina/useEmotionDetection";
import { CounselorAvatar, type Gesture } from "@/components/lumina/CounselorAvatar";
import { Coffee, Activity, ArrowRight, User } from "lucide-react";
import { UserProfileButton } from "@/components/lumina/UserProfileButton";

type Phase = "check-in" | "plan-overview" | "preparation" | "action" | "completion" | "focus-dot" | "mirroring" | "tree-pose" | "sun-salutation" | "warrior-two" | "downward-dog" | "childs-pose" | "cobra-pose" | "seated-forward-bend" | "savasana";

const YOGA_PHASES: Phase[] = ["tree-pose", "sun-salutation", "warrior-two", "downward-dog", "childs-pose", "cobra-pose", "seated-forward-bend", "savasana"];

// ── Animated SVG Stick Figure Poses ────────────────────────────────────────
function YogaPoseDemo({ pose }: { pose: Phase }) {
  const W = 200, H = 260;
  const style = { transition: "all 1.2s cubic-bezier(.4,0,.2,1)" };

  if (pose === "tree-pose") return (
    <svg width={W} height={H} viewBox="0 0 200 260">
      <style>{`@keyframes treeWay{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}} .branch{transform-origin:100px 80px;animation:treeWay 3s ease-in-out infinite;}`}</style>
      {/* body */}
      <circle cx="100" cy="40" r="18" fill="#3A5F4D" opacity="0.9"/>
      <line x1="100" y1="58" x2="100" y2="160" stroke="#3A5F4D" strokeWidth="5" strokeLinecap="round"/>
      {/* standing leg */}
      <line x1="100" y1="160" x2="100" y2="240" stroke="#3A5F4D" strokeWidth="5" strokeLinecap="round"/>
      {/* raised foot on knee */}
      <line x1="100" y1="185" x2="75" y2="200" stroke="#3A5F4D" strokeWidth="5" strokeLinecap="round"/>
      {/* arms up */}
      <g className="branch">
        <line x1="100" y1="90" x2="55" y2="70" stroke="#3A5F4D" strokeWidth="5" strokeLinecap="round"/>
        <line x1="100" y1="90" x2="145" y2="70" stroke="#3A5F4D" strokeWidth="5" strokeLinecap="round"/>
      </g>
      <text x="100" y="258" textAnchor="middle" fontSize="13" fill="#3A5F4D" fontFamily="serif">Tree Pose</text>
    </svg>
  );

  if (pose === "warrior-two") return (
    <svg width={W} height={H} viewBox="0 0 200 260">
      <style>{`@keyframes wrrMove{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}} .warrior{animation:wrrMove 2s ease-in-out infinite;}`}</style>
      <g className="warrior">
        <circle cx="100" cy="40" r="18" fill="#DC2626" opacity="0.85"/>
        {/* torso */}
        <line x1="100" y1="58" x2="100" y2="135" stroke="#DC2626" strokeWidth="5" strokeLinecap="round"/>
        {/* wide arms */}
        <line x1="100" y1="85" x2="30" y2="85" stroke="#DC2626" strokeWidth="5" strokeLinecap="round"/>
        <line x1="100" y1="85" x2="170" y2="85" stroke="#DC2626" strokeWidth="5" strokeLinecap="round"/>
        {/* wide stance legs */}
        <line x1="100" y1="135" x2="55" y2="220" stroke="#DC2626" strokeWidth="5" strokeLinecap="round"/>
        <line x1="100" y1="135" x2="145" y2="185" stroke="#DC2626" strokeWidth="5" strokeLinecap="round"/>
        <line x1="145" y1="185" x2="145" y2="230" stroke="#DC2626" strokeWidth="5" strokeLinecap="round"/>
      </g>
      <text x="100" y="258" textAnchor="middle" fontSize="13" fill="#DC2626" fontFamily="serif">Warrior II</text>
    </svg>
  );

  if (pose === "downward-dog") return (
    <svg width={W} height={H} viewBox="0 0 200 260">
      <style>{`@keyframes ddMove{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}} .ddog{animation:ddMove 2.5s ease-in-out infinite;}`}</style>
      <g className="ddog">
        {/* hips up */}
        <circle cx="100" cy="80" r="14" fill="#2563EB" opacity="0.85"/>
        {/* arms down-forward */}
        <line x1="100" y1="94" x2="45" y2="160" stroke="#2563EB" strokeWidth="5" strokeLinecap="round"/>
        {/* legs down-back */}
        <line x1="100" y1="94" x2="155" y2="160" stroke="#2563EB" strokeWidth="5" strokeLinecap="round"/>
        {/* hands */}
        <circle cx="45" cy="165" r="6" fill="#2563EB"/>
        {/* feet */}
        <circle cx="155" cy="165" r="6" fill="#2563EB"/>
        {/* head */}
        <circle cx="55" cy="150" r="12" fill="#2563EB" opacity="0.9"/>
      </g>
      <text x="100" y="210" textAnchor="middle" fontSize="13" fill="#2563EB" fontFamily="serif">Downward Dog</text>
    </svg>
  );

  if (pose === "childs-pose") return (
    <svg width={W} height={H} viewBox="0 0 200 260">
      <style>{`@keyframes childBreath{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.03)}} .child{transform-origin:100px 170px;animation:childBreath 3s ease-in-out infinite;}`}</style>
      <g className="child">
        {/* body curled forward */}
        <ellipse cx="100" cy="170" rx="60" ry="22" fill="#4F46E5" opacity="0.15"/>
        <line x1="55" y1="165" x2="145" y2="165" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round"/>
        {/* arms stretched */}
        <line x1="55" y1="165" x2="20" y2="155" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round"/>
        <line x1="55" y1="165" x2="20" y2="175" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round"/>
        {/* head on ground */}
        <circle cx="28" cy="162" r="14" fill="#4F46E5" opacity="0.85"/>
        {/* bum up */}
        <ellipse cx="145" cy="150" rx="18" ry="14" fill="#4F46E5" opacity="0.6"/>
        {/* legs folded */}
        <line x1="145" y1="163" x2="130" y2="195" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round"/>
        <line x1="145" y1="163" x2="160" y2="195" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round"/>
      </g>
      <text x="100" y="230" textAnchor="middle" fontSize="13" fill="#4F46E5" fontFamily="serif">Child's Pose</text>
    </svg>
  );

  if (pose === "cobra-pose") return (
    <svg width={W} height={H} viewBox="0 0 200 260">
      <style>{`@keyframes cobraLift{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} .cobra-head{animation:cobraLift 2s ease-in-out infinite;}`}</style>
      {/* body on ground */}
      <line x1="30" y1="190" x2="175" y2="190" stroke="#CA8A04" strokeWidth="5" strokeLinecap="round"/>
      {/* legs */}
      <line x1="130" y1="190" x2="115" y2="220" stroke="#CA8A04" strokeWidth="5" strokeLinecap="round"/>
      <line x1="155" y1="190" x2="170" y2="220" stroke="#CA8A04" strokeWidth="5" strokeLinecap="round"/>
      {/* arms pressing up */}
      <line x1="70" y1="185" x2="55" y2="165" stroke="#CA8A04" strokeWidth="5" strokeLinecap="round"/>
      <line x1="90" y1="185" x2="105" y2="165" stroke="#CA8A04" strokeWidth="5" strokeLinecap="round"/>
      <g className="cobra-head">
        {/* chest & head lifted */}
        <line x1="55" y1="165" x2="50" y2="130" stroke="#CA8A04" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="50" cy="115" r="16" fill="#CA8A04" opacity="0.9"/>
      </g>
      <text x="100" y="248" textAnchor="middle" fontSize="13" fill="#CA8A04" fontFamily="serif">Cobra Pose</text>
    </svg>
  );

  if (pose === "seated-forward-bend") return (
    <svg width={W} height={H} viewBox="0 0 200 260">
      <style>{`@keyframes sfbFold{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-8deg)}} .sfb-torso{transform-origin:100px 155px;animation:sfbFold 3s ease-in-out infinite;}`}</style>
      {/* legs extended */}
      <line x1="40" y1="195" x2="170" y2="195" stroke="#DB2777" strokeWidth="5" strokeLinecap="round"/>
      <g className="sfb-torso">
        {/* torso folding */}
        <line x1="80" y1="155" x2="80" y2="195" stroke="#DB2777" strokeWidth="5" strokeLinecap="round"/>
        {/* arms reaching */}
        <line x1="80" y1="175" x2="145" y2="195" stroke="#DB2777" strokeWidth="5" strokeLinecap="round"/>
        <line x1="80" y1="180" x2="145" y2="200" stroke="#DB2777" strokeWidth="5" strokeLinecap="round"/>
        {/* head */}
        <circle cx="80" cy="138" r="16" fill="#DB2777" opacity="0.9"/>
      </g>
      <text x="100" y="235" textAnchor="middle" fontSize="13" fill="#DB2777" fontFamily="serif">Forward Bend</text>
    </svg>
  );

  if (pose === "savasana") return (
    <svg width={W} height={H} viewBox="0 0 200 260">
      <style>{`@keyframes savaBreath{0%,100%{opacity:1}50%{opacity:0.4}} .savaBreathe{animation:savaBreath 4s ease-in-out infinite;}`}</style>
      {/* full body lying flat */}
      <line x1="20" y1="150" x2="180" y2="150" stroke="#475569" strokeWidth="6" strokeLinecap="round"/>
      {/* head */}
      <circle cx="25" cy="150" r="16" fill="#475569" opacity="0.85"/>
      {/* arms slightly out */}
      <line x1="80" y1="150" x2="75" y2="180" stroke="#475569" strokeWidth="4" strokeLinecap="round"/>
      <line x1="110" y1="150" x2="115" y2="180" stroke="#475569" strokeWidth="4" strokeLinecap="round"/>
      {/* breathing aura */}
      <g className="savaBreathe">
        <ellipse cx="100" cy="150" rx="65" ry="28" fill="none" stroke="#475569" strokeWidth="1.5" opacity="0.4"/>
        <ellipse cx="100" cy="150" rx="80" ry="38" fill="none" stroke="#475569" strokeWidth="1" opacity="0.2"/>
      </g>
      <text x="100" y="215" textAnchor="middle" fontSize="13" fill="#475569" fontFamily="serif">Savasana</text>
    </svg>
  );

  if (pose === "sun-salutation") {
    const sunSteps = [
      // Mountain Pose
      <g key="mountain">
        <circle cx="100" cy="40" r="18" fill="#EA580C" opacity="0.9"/>
        <line x1="100" y1="58" x2="100" y2="170" stroke="#EA580C" strokeWidth="5" strokeLinecap="round"/>
        <line x1="100" y1="85" x2="70" y2="120" stroke="#EA580C" strokeWidth="5" strokeLinecap="round"/>
        <line x1="100" y1="85" x2="130" y2="120" stroke="#EA580C" strokeWidth="5" strokeLinecap="round"/>
        <line x1="100" y1="170" x2="75" y2="235" stroke="#EA580C" strokeWidth="5" strokeLinecap="round"/>
        <line x1="100" y1="170" x2="125" y2="235" stroke="#EA580C" strokeWidth="5" strokeLinecap="round"/>
      </g>
    ];
    return (
      <svg width={W} height={H} viewBox="0 0 200 260">
        <style>{`@keyframes sunPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.8;transform:scale(0.97)}} .sunFig{transform-origin:100px 130px;animation:sunPulse 2s ease-in-out infinite;}`}</style>
        <g className="sunFig">{sunSteps}</g>
        <text x="100" y="258" textAnchor="middle" fontSize="13" fill="#EA580C" fontFamily="serif">Sun Salutation</text>
      </svg>
    );
  }

  // default tree
  return (
    <svg width={W} height={H} viewBox="0 0 200 260">
      <circle cx="100" cy="40" r="18" fill="#3A5F4D"/>
      <line x1="100" y1="58" x2="100" y2="240" stroke="#3A5F4D" strokeWidth="5" strokeLinecap="round"/>
      <text x="100" y="258" textAnchor="middle" fontSize="13" fill="#3A5F4D" fontFamily="serif">{pose}</text>
    </svg>
  );
}

export default function LivelyTherapy() {
  const [phase, setPhase] = useState<Phase>("check-in");
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const [breathCount, setBreathCount] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [dotPos, setDotPos] = useState({ x: 50, y: 50 });
  const [mirrorSync, setMirrorSync] = useState(0);
  const [yogaStep, setYogaStep] = useState(0);
  const [yogaSync, setYogaSync] = useState(0);
  const [showingDemo, setShowingDemo] = useState(false);
  const [demoCountdown, setDemoCountdown] = useState(5);
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

  // ── Demo Countdown (show pose animation before hold) ──────────────────────
  useEffect(() => {
    if (!showingDemo) return;
    setDemoCountdown(5);
    const tick = setInterval(() => {
      setDemoCountdown(prev => {
        if (prev <= 1) {
          clearInterval(tick);
          setShowingDemo(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [showingDemo]);

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

    if (phase === "tree-pose") {
      if (showingDemo) return;
      speakTip("Now try it yourself. Shift your weight to your left leg, raise your right foot and balance. Arms up high.");
      const syncInterval = setInterval(() => {
        setYogaSync(prev => Math.min(100, prev + Math.random() * 10));
      }, 1000);
      return () => clearInterval(syncInterval);
    }

    if (phase === "sun-salutation") {
      if (showingDemo) return;
      const steps = [
        "Mountain Pose. Stand tall with your feet together, shoulders relaxed.",
        "Upward Salute. Inhale and sweep your arms up, reaching for the sky.",
        "Forward Fold. Exhale and hinge at your hips, bringing your hands to the floor or your shins.",
        "Halfway Lift. Inhale and lengthen your spine, looking forward.",
        "Return to Mountain Pose. Exhale and rise back up to a standing position."
      ];
      speakTip(steps[0]);
      let stepIndex = 0;
      const interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
          setYogaStep(stepIndex);
          speakTip(steps[stepIndex]);
        } else {
          clearInterval(interval);
          speakTip("Great job. You have completed the Sun Salutation.");
        }
      }, 8000);
      const syncInterval = setInterval(() => {
        setYogaSync(prev => Math.min(100, prev + Math.random() * 8));
      }, 1000);
      return () => {
        clearInterval(interval);
        clearInterval(syncInterval);
      };
    }

    if (phase === "warrior-two") {
      if (showingDemo) return;
      speakTip("Now try Warrior Two. Step wide, bend your front knee, arms out strong.");
      const syncInterval = setInterval(() => {
        setYogaSync(prev => Math.min(100, prev + Math.random() * 12));
      }, 1000);
      return () => clearInterval(syncInterval);
    }
    
    if (phase === "downward-dog") {
      if (showingDemo) return;
      speakTip("Now try Downward Dog. Hips high, hands and feet pressing the floor.");
      const syncInterval = setInterval(() => {
        setYogaSync(prev => Math.min(100, prev + Math.random() * 10));
      }, 1000);
      return () => clearInterval(syncInterval);
    }

    if (phase === "childs-pose") {
      if (showingDemo) return;
      speakTip("Now rest in Child's Pose. Sink back onto your heels and let everything go.");
      const syncInterval = setInterval(() => {
        setYogaSync(prev => Math.min(100, prev + Math.random() * 5));
      }, 1000);
      return () => clearInterval(syncInterval);
    }

    if (phase === "cobra-pose") {
      if (showingDemo) return;
      speakTip("Now try Cobra Pose. Lie down, press your palms, and gently lift your chest.");
      const syncInterval = setInterval(() => {
        setYogaSync(prev => Math.min(100, prev + Math.random() * 8));
      }, 1000);
      return () => clearInterval(syncInterval);
    }

    if (phase === "seated-forward-bend") {
      if (showingDemo) return;
      speakTip("Now try the forward bend. Sit tall, inhale, then fold forward reaching for your feet.");
      const syncInterval = setInterval(() => {
        setYogaSync(prev => Math.min(100, prev + Math.random() * 9));
      }, 1000);
      return () => clearInterval(syncInterval);
    }

    if (phase === "savasana") {
      if (showingDemo) return;
      speakTip("Now find your Savasana. Lie flat, close your eyes, and let your whole body relax.");
      const syncInterval = setInterval(() => {
        setYogaSync(prev => Math.min(100, prev + Math.random() * 4));
      }, 1000);
      return () => clearInterval(syncInterval);
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

              {/* Yoga Overlays */}
              {YOGA_PHASES.includes(phase) && (
                <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center">
                  {showingDemo ? (
                    // ── Demo phase: full-screen animated pose ──
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A5F4D] mb-2">Watch & Copy This Pose</div>
                      <div className="drop-shadow-xl">
                        <YogaPoseDemo pose={phase} />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#3A5F4D] text-white flex items-center justify-center font-serif text-lg font-bold">{demoCountdown}</div>
                        <span className="text-sm text-[#3A5F4D] font-medium">Your turn in {demoCountdown}s</span>
                      </div>
                    </div>
                  ) : (
                    // ── Hold phase: posture sync bar ──
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 h-4 bg-white/40 rounded-full overflow-hidden border border-white/50">
                      <div
                        className="h-full bg-sage transition-all duration-500"
                        style={{ width: `${yogaSync}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#3A5F4D] uppercase">
                        Posture Sync: {Math.round(yogaSync)}%
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hold Meter / Progress Ring */}
            {["mirroring", "tree-pose", "sun-salutation", "warrior-two", "downward-dog", "childs-pose", "cobra-pose", "seated-forward-bend", "savasana"].includes(phase) && (
              <div className="p-8 rounded-[40px] bg-white/60 backdrop-blur-xl border border-white/50 shadow-soft flex items-center gap-8 animate-fade-up">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-black/5" />
                    <circle 
                      cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={251}
                      strokeDashoffset={251 - (251 * (phase === "mirroring" ? mirrorSync : yogaSync)) / 100}
                      className="text-sage transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-serif text-xl">
                    {Math.round(phase === "mirroring" ? mirrorSync : yogaSync)}%
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-2xl mb-1">
                    {phase === "mirroring" ? "Posture Hold" : phase === "sun-salutation" ? "Flow Sync" : "Pose Hold"}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {phase === "mirroring" ? "Perfecting your alignment. Hold steady." : phase === "sun-salutation" ? "Move with your breath. Stay aligned." : "Ground yourself and hold the pose."}
                  </p>
                  <Button onClick={() => setPhase("plan-overview")} variant="outline" size="sm" className="rounded-xl">
                    Finish {phase === "mirroring" ? "Mirroring" : "Yoga"}
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

                  <button 
                    onClick={() => { setPhase("tree-pose"); setYogaSync(0); setShowingDemo(true); speakTip("Watch the Tree Pose. Get ready to copy it."); }}
                    className="p-6 rounded-[32px] bg-white/80 hover:bg-white border border-white/50 shadow-sm hover:shadow-glow transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Activity className="w-8 h-8 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl mb-1">Tree Pose</h4>
                      <p className="text-xs text-muted-foreground">Grounding balance & stability exercise.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </button>

                  <button 
                    onClick={() => { setPhase("sun-salutation"); setYogaStep(0); setYogaSync(0); setShowingDemo(true); speakTip("Watch the Sun Salutation flow. Get ready to follow along."); }}
                    className="p-6 rounded-[32px] bg-white/80 hover:bg-white border border-white/50 shadow-sm hover:shadow-glow transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl mb-1">Sun Salutation</h4>
                      <p className="text-xs text-muted-foreground">Dynamic flow for energy and flexibility.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </button>

                  <button 
                    onClick={() => { setPhase("warrior-two"); setYogaSync(0); setShowingDemo(true); speakTip("Watch Warrior Two. Copy this powerful stance."); }}
                    className="p-6 rounded-[32px] bg-white/80 hover:bg-white border border-white/50 shadow-sm hover:shadow-glow transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl mb-1">Warrior II</h4>
                      <p className="text-xs text-muted-foreground">Build stamina, focus, and strength.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </button>

                  <button 
                    onClick={() => { setPhase("downward-dog"); setYogaSync(0); setShowingDemo(true); speakTip("Watch Downward Dog. Prepare to stretch."); }}
                    className="p-6 rounded-[32px] bg-white/80 hover:bg-white border border-white/50 shadow-sm hover:shadow-glow transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Anchor className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl mb-1">Downward Dog</h4>
                      <p className="text-xs text-muted-foreground">Full body stretch and inversion.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </button>

                  <button 
                    onClick={() => { setPhase("childs-pose"); setYogaSync(0); setShowingDemo(true); speakTip("Watch Child's Pose. Get ready to rest deeply."); }}
                    className="p-6 rounded-[32px] bg-white/80 hover:bg-white border border-white/50 shadow-sm hover:shadow-glow transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Cloud className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl mb-1">Child's Pose</h4>
                      <p className="text-xs text-muted-foreground">Deeply relaxing resting posture.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </button>

                  <button 
                    onClick={() => { setPhase("cobra-pose"); setYogaSync(0); setShowingDemo(true); speakTip("Watch Cobra Pose. Prepare to open your heart."); }}
                    className="p-6 rounded-[32px] bg-white/80 hover:bg-white border border-white/50 shadow-sm hover:shadow-glow transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sun className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl mb-1">Cobra Pose</h4>
                      <p className="text-xs text-muted-foreground">Heart opening and spine strengthening.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </button>

                  <button 
                    onClick={() => { setPhase("seated-forward-bend"); setYogaSync(0); setShowingDemo(true); speakTip("Watch the Seated Forward Bend. Prepare to stretch forward."); }}
                    className="p-6 rounded-[32px] bg-white/80 hover:bg-white border border-white/50 shadow-sm hover:shadow-glow transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Heart className="w-8 h-8 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl mb-1">Seated Forward Bend</h4>
                      <p className="text-xs text-muted-foreground">Calms the mind and stretches hamstrings.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </button>

                  <button 
                    onClick={() => { setPhase("savasana"); setYogaSync(0); setShowingDemo(true); speakTip("Watch Savasana. Prepare to fully relax."); }}
                    className="p-6 rounded-[32px] bg-white/80 hover:bg-white border border-white/50 shadow-sm hover:shadow-glow transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Leaf className="w-8 h-8 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl mb-1">Savasana</h4>
                      <p className="text-xs text-muted-foreground">Final relaxation and integration.</p>
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

            {/* Yoga Phase Details */}
            {phase === "tree-pose" && (
              <div className="animate-fade-up space-y-8 flex-1 flex flex-col justify-center">
                 <h2 className="text-4xl font-serif">Tree Pose (Vrksasana)</h2>
                 <p className="text-muted-foreground text-lg">Shift your weight, find a focal point, and balance. Let your roots grow deep and your branches reach high.</p>
                 <div className="p-8 rounded-[40px] bg-white/40 border border-white/50 shadow-soft">
                   <div className="flex items-center gap-4 mb-6">
                      <Volume2 className="w-6 h-6 text-teal-600" />
                      <p className="text-sm font-medium">Lumina is tracking your stability and balance alignment.</p>
                   </div>
                   <Button onClick={() => setPhase("plan-overview")} variant="outline" className="w-full rounded-2xl h-12">
                     Finish Exercise
                   </Button>
                 </div>
              </div>
            )}

            {phase === "sun-salutation" && (
              <div className="animate-fade-up space-y-8 flex-1 flex flex-col justify-center">
                 <h2 className="text-4xl font-serif">Sun Salutation</h2>
                 <p className="text-muted-foreground text-lg">A dynamic sequence to awaken the body and coordinate breath with movement.</p>
                 <div className="p-8 rounded-[40px] bg-white/40 border border-white/50 shadow-soft">
                   <div className="flex items-center gap-4 mb-6">
                      <Volume2 className="w-6 h-6 text-orange-600" />
                      <p className="text-sm font-medium">Follow the vocal cues. Current Step: {
                        [
                          "Mountain Pose",
                          "Upward Salute",
                          "Forward Fold",
                          "Halfway Lift",
                          "Return to Mountain Pose"
                        ][yogaStep] || "Complete"
                      }</p>
                   </div>
                   <Button onClick={() => setPhase("plan-overview")} variant="outline" className="w-full rounded-2xl h-12">
                     Finish Sequence
                   </Button>
                 </div>
              </div>
            )}

            {phase === "warrior-two" && (
              <div className="animate-fade-up space-y-8 flex-1 flex flex-col justify-center">
                 <h2 className="text-4xl font-serif">Warrior II (Virabhadrasana II)</h2>
                 <p className="text-muted-foreground text-lg">A powerful pose that increases stamina, strengthens the legs, and opens the hips and chest.</p>
                 <div className="p-8 rounded-[40px] bg-white/40 border border-white/50 shadow-soft">
                   <div className="flex items-center gap-4 mb-6">
                      <Volume2 className="w-6 h-6 text-red-600" />
                      <p className="text-sm font-medium">Lumina is tracking your arm level and stance width.</p>
                   </div>
                   <Button onClick={() => setPhase("plan-overview")} variant="outline" className="w-full rounded-2xl h-12">
                     Finish Exercise
                   </Button>
                 </div>
              </div>
            )}

            {phase === "downward-dog" && (
              <div className="animate-fade-up space-y-8 flex-1 flex flex-col justify-center">
                 <h2 className="text-4xl font-serif">Downward-Facing Dog (Adho Mukha Svanasana)</h2>
                 <p className="text-muted-foreground text-lg">An essential inversion that stretches the entire back of the body, creating space in the spine.</p>
                 <div className="p-8 rounded-[40px] bg-white/40 border border-white/50 shadow-soft">
                   <div className="flex items-center gap-4 mb-6">
                      <Volume2 className="w-6 h-6 text-blue-600" />
                      <p className="text-sm font-medium">Lumina is monitoring the alignment of your spine and hips.</p>
                   </div>
                   <Button onClick={() => setPhase("plan-overview")} variant="outline" className="w-full rounded-2xl h-12">
                     Finish Exercise
                   </Button>
                 </div>
              </div>
            )}

            {phase === "childs-pose" && (
              <div className="animate-fade-up space-y-8 flex-1 flex flex-col justify-center">
                 <h2 className="text-4xl font-serif">Child's Pose (Balasana)</h2>
                 <p className="text-muted-foreground text-lg">A restful posture that gently stretches your lower back, hips, thighs, and ankles while calming the brain.</p>
                 <div className="p-8 rounded-[40px] bg-white/40 border border-white/50 shadow-soft">
                   <div className="flex items-center gap-4 mb-6">
                      <Volume2 className="w-6 h-6 text-indigo-600" />
                      <p className="text-sm font-medium">Breathe deeply into your lower back.</p>
                   </div>
                   <Button onClick={() => setPhase("plan-overview")} variant="outline" className="w-full rounded-2xl h-12">
                     Finish Exercise
                   </Button>
                 </div>
              </div>
            )}

            {phase === "cobra-pose" && (
              <div className="animate-fade-up space-y-8 flex-1 flex flex-col justify-center">
                 <h2 className="text-4xl font-serif">Cobra Pose (Bhujangasana)</h2>
                 <p className="text-muted-foreground text-lg">A backbend that opens the heart and lungs, strengthening the spine and shoulders.</p>
                 <div className="p-8 rounded-[40px] bg-white/40 border border-white/50 shadow-soft">
                   <div className="flex items-center gap-4 mb-6">
                      <Volume2 className="w-6 h-6 text-yellow-600" />
                      <p className="text-sm font-medium">Lumina is checking for a gentle, safe curve in your upper back.</p>
                   </div>
                   <Button onClick={() => setPhase("plan-overview")} variant="outline" className="w-full rounded-2xl h-12">
                     Finish Exercise
                   </Button>
                 </div>
              </div>
            )}

            {phase === "seated-forward-bend" && (
              <div className="animate-fade-up space-y-8 flex-1 flex flex-col justify-center">
                 <h2 className="text-4xl font-serif">Seated Forward Bend (Paschimottanasana)</h2>
                 <p className="text-muted-foreground text-lg">A classic stretch for the entire back side of the body that helps relieve stress and anxiety.</p>
                 <div className="p-8 rounded-[40px] bg-white/40 border border-white/50 shadow-soft">
                   <div className="flex items-center gap-4 mb-6">
                      <Volume2 className="w-6 h-6 text-pink-600" />
                      <p className="text-sm font-medium">Focus on lengthening your spine with each inhale.</p>
                   </div>
                   <Button onClick={() => setPhase("plan-overview")} variant="outline" className="w-full rounded-2xl h-12">
                     Finish Exercise
                   </Button>
                 </div>
              </div>
            )}

            {phase === "savasana" && (
              <div className="animate-fade-up space-y-8 flex-1 flex flex-col justify-center">
                 <h2 className="text-4xl font-serif">Corpse Pose (Savasana)</h2>
                 <p className="text-muted-foreground text-lg">The ultimate resting pose. Allow your body to fully surrender to gravity and your mind to quiet.</p>
                 <div className="p-8 rounded-[40px] bg-white/40 border border-white/50 shadow-soft">
                   <div className="flex items-center gap-4 mb-6">
                      <Volume2 className="w-6 h-6 text-slate-600" />
                      <p className="text-sm font-medium">Lumina detects your breathing rate slowing down as you relax.</p>
                   </div>
                   <Button onClick={() => setPhase("plan-overview")} variant="outline" className="w-full rounded-2xl h-12">
                     Finish Session
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
