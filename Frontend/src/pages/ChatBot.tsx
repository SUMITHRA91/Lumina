import { useEffect, useRef, useState, useCallback } from "react";
import {
  Sparkles, Mic, MicOff, Send, Plus, MessageSquare,
  Settings, User, ArrowLeft, Trash2, MoreHorizontal, Menu, X
} from "lucide-react";
import { Link } from "react-router-dom";
import { dominantEmotion, type EmotionScores } from "@/hooks/lumina/useEmotionDetection";
import { CrisisPanel } from "@/components/lumina/CrisisPanel";
import { UserProfileButton } from "@/components/lumina/UserProfileButton";

// ── Types ──────────────────────────────────────────────────────────────────────
type Message = { role: "user" | "lumina"; text: string; time: string };
type ChatSession = { id: string; title: string; messages: Message[]; createdAt: number };

const EMPTY_SCORES: EmotionScores = {
  happy: 0, sad: 0, angry: 0, surprised: 0, fearful: 0, disgusted: 0, neutral: 1,
};

const CRISIS_KEYWORDS = ["suicide", "kill myself", "hurt myself", "end my life", "want to die"];
const PANIC_KW  = ["cannot breathe", "can't breathe", "heart racing", "panic", "dizzy", "overwhelmed"];
const LETHARGY_KW = ["tired", "pointless", "heavy", "hopeless", "exhausted", "numb", "worthless"];

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ── TTS ────────────────────────────────────────────────────────────────────────
const speak = (text: string, onEnd?: () => void) => {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9; u.pitch = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(x => x.lang.startsWith("en") && x.name.includes("Female")) || voices.find(x => x.lang.startsWith("en")) || voices[0];
  if (v) u.voice = v;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  
  // Fallback timeout to prevent infinite wait if browser speech engine hangs
  setTimeout(() => {
    onEnd?.();
  }, 15000);

  setTimeout(() => window.speechSynthesis.speak(u), 50);
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const makeId = () => Math.random().toString(36).slice(2);
const makeGreeting = (): Message => ({
  role: "lumina",
  text: "Hi, I'm Lumina 🌿 I'm here to listen — no judgement, no rush. What's on your mind today?",
  time: now(),
});

const loadSessions = (): ChatSession[] => {
  try { return JSON.parse(localStorage.getItem("lumina_sessions") || "[]"); }
  catch { return []; }
};

const saveSessions = (sessions: ChatSession[]) => {
  localStorage.setItem("lumina_sessions", JSON.stringify(sessions));
};

// ── ChatBot Page ───────────────────────────────────────────────────────────────
export default function ChatBot() {
  const userName = localStorage.getItem("lumina_username") || "";

  // Sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const stored = loadSessions();
    if (stored.length) return stored;
    const first: ChatSession = { id: makeId(), title: "New conversation", messages: [makeGreeting()], createdAt: Date.now() };
    return [first];
  });
  const [activeId, setActiveId] = useState<string>(() => {
    const stored = loadSessions();
    return stored.length ? stored[0].id : sessions[0]?.id ?? "";
  });

  const activeSession = sessions.find(s => s.id === activeId);
  const messages = activeSession?.messages ?? [];

  // UI state
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCrisis, setShowCrisis] = useState(false);

  const scrollRef  = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Persist ──────────────────────────────────────────────────────────────────
  useEffect(() => { saveSessions(sessions); }, [sessions]);

  // ── Scroll ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  // ── Speech recognition ────────────────────────────────────────────────────────
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.onresult  = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognitionRef.current.onerror   = () => setIsListening(false);
    recognitionRef.current.onend     = () => setIsListening(false);
    return () => recognitionRef.current?.stop();
  }, []);

  // ── Textarea auto-resize ──────────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const updateSession = useCallback((id: string, updater: (s: ChatSession) => ChatSession) => {
    setSessions(prev => prev.map(s => s.id === id ? updater(s) : s));
  }, []);

  const newChat = () => {
    const s: ChatSession = { id: makeId(), title: "New conversation", messages: [makeGreeting()], createdAt: Date.now() };
    setSessions(prev => [s, ...prev]);
    setActiveId(s.id);
    setInput("");
  };

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (next.length === 0) {
        const fresh: ChatSession = { id: makeId(), title: "New conversation", messages: [makeGreeting()], createdAt: Date.now() };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  // ── Send ──────────────────────────────────────────────────────────────────────
  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = { role: "user", text, time: now() };

    // Auto-title from first user message
    updateSession(activeId, s => ({
      ...s,
      messages: [...s.messages, userMsg],
      title: s.messages.length === 1 ? text.slice(0, 40) + (text.length > 40 ? "…" : "") : s.title,
    }));
    setInput("");
    setThinking(true);

    // Crisis detection
    if (CRISIS_KEYWORDS.some(k => text.toLowerCase().includes(k))) setShowCrisis(true);

    const alert_state =
      PANIC_KW.some(k => text.toLowerCase().includes(k)) ? "panic_loop"
      : LETHARGY_KW.some(k => text.toLowerCase().includes(k)) ? "lethargy"
      : null;

    try {
      const res = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          emotion: "neutral",
          scores: EMPTY_SCORES,
          user_name: userName || "friend",
          user_id: "chat-user",
          alert_state,
        }),
      });

      const data = await res.json();
      const replies: string[] = Array.isArray(data.reply) ? data.reply : [data.reply];

      setThinking(false);

      for (let i = 0; i < replies.length; i++) {
        if (i > 0) await new Promise(r => setTimeout(r, 900));
        const aiMsg: Message = { role: "lumina", text: replies[i], time: now() };
        updateSession(activeId, s => ({ ...s, messages: [...s.messages, aiMsg] }));
        setSpeaking(true);
        await new Promise<void>(res => speak(replies[i], res));
        setSpeaking(false);
      }
    } catch {
      setThinking(false);
      const fallback: Message = {
        role: "lumina",
        text: "I'm having a moment of trouble connecting, but I'm still here. What were you saying?",
        time: now(),
      };
      updateSession(activeId, s => ({ ...s, messages: [...s.messages, fallback] }));
    }
  };

  const toggleListen = () => {
    if (isListening) recognitionRef.current?.stop();
    else { setInput(""); recognitionRef.current?.start(); setIsListening(true); }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">

      {/* ════════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════════ */}
      <aside
        className={`
          flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out
          bg-[hsl(38,40%,94%)] border-r border-border/60
          ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}
        `}
      >
        <div className="flex flex-col h-full p-3 min-w-[288px]">

          {/* Logo + collapse */}
          <div className="flex items-center justify-between mb-4 px-2 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-sage flex items-center justify-center shadow-glow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-xl text-foreground/90">Lumina</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-black/5 text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New chat button */}
          <button
            onClick={newChat}
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#3A5F4D] text-white text-sm font-medium hover:bg-[#2A4538] transition-all shadow-soft mb-4 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            New conversation
          </button>

          {/* Chat history */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 px-3 mb-2">
              Recent
            </p>
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`
                  group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                  ${s.id === activeId
                    ? "bg-[#3A5F4D]/10 border border-[#3A5F4D]/20 text-foreground"
                    : "hover:bg-black/5 text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${s.id === activeId ? "text-[#3A5F4D]" : ""}`} />
                <span className="flex-1 text-sm truncate">{s.title}</span>
                <button
                  onClick={e => { e.stopPropagation(); deleteSession(s.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-black/10 transition-all"
                >
                  <Trash2 className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          {/* Profile / footer */}
          <div className="pt-3 border-t border-border/40 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-black/5 hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <UserProfileButton />
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════
          MAIN CHAT AREA
      ════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-calm">

        {/* ── Top bar ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30 bg-background/60 backdrop-blur-sm flex-shrink-0">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-black/5 text-muted-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-sage flex items-center justify-center shadow-glow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
            </div>
            <div>
              <h1 className="font-serif text-base font-medium text-foreground">Lumina</h1>
              <p className="text-[10px] text-muted-foreground">
                {speaking ? "speaking…" : thinking ? "thinking…" : "● here with you"}
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <button className="p-2 rounded-xl hover:bg-black/5 text-muted-foreground transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* ── Messages ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 xl:px-32 py-8 space-y-6">

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 animate-fade-up ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

              {/* Avatar */}
              {m.role === "lumina" ? (
                <div className="w-8 h-8 rounded-full bg-gradient-sage flex items-center justify-center flex-shrink-0 shadow-glow mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#3A5F4D] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Bubble */}
              <div className={`flex flex-col gap-1 max-w-[70%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-5 py-3.5 rounded-3xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#3A5F4D] text-white rounded-tr-md shadow-soft"
                      : "bg-card/90 text-foreground rounded-tl-md border border-border/30 shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-muted-foreground/50 px-1">{m.time}</span>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {thinking && (
            <div className="flex gap-3 animate-fade-up">
              <div className="w-8 h-8 rounded-full bg-gradient-sage flex items-center justify-center flex-shrink-0 shadow-glow">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-card/90 border border-border/30 px-5 py-3.5 rounded-3xl rounded-tl-md shadow-sm flex gap-1.5 items-center">
                {[0, 0.15, 0.3].map((d, i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-[#3A5F4D]/40 animate-bounce" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div className="px-4 md:px-8 lg:px-16 xl:px-32 pb-6 pt-2 flex-shrink-0">
          <div className="bg-card/90 backdrop-blur-md border border-border/40 rounded-3xl shadow-soft overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Share what's on your mind…"
              rows={1}
              className="w-full resize-none bg-transparent px-6 pt-4 pb-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none leading-relaxed"
              style={{ maxHeight: 160 }}
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Enter</kbd>
                <span>to send</span>
                <span className="mx-1">·</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Shift+Enter</kbd>
                <span>for newline</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleListen}
                  className={`p-2 rounded-xl transition-all ${
                    isListening
                      ? "bg-red-100 text-red-500 animate-pulse"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={send}
                  disabled={thinking || !input.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A5F4D] text-white text-sm font-medium hover:bg-[#2A4538] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-muted-foreground/40 mt-2">
            Lumina can make mistakes. Not a substitute for professional care.
          </p>
        </div>
      </div>

      {showCrisis && <CrisisPanel onDismiss={() => setShowCrisis(false)} />}
    </div>
  );
}
