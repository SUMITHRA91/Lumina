import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { dominantEmotion, type EmotionScores } from "@/hooks/lumina/useEmotionDetection";
import { CounselorAvatar } from "./CounselorAvatar";
import { splitSentences, type TranscriptEntry } from "./TranscriptPanel";
import type { Gesture } from "./CounselorAvatar";
import { CrisisPanel } from "./CrisisPanel";

export type Message = { role: "user" | "lumina"; text: string; emotion?: string };

const API_URL = "http://localhost:8000/api/chat/";

export type AvatarState = {
  speaking: boolean;
  mood: "happy" | "concerned" | "surprised" | "neutral";
  gesture: Gesture;
  glow: boolean;
};

type Props = {
  scores: EmotionScores;
  onUserMessage: () => void;
  onAvatarStateChange?: (s: AvatarState) => void;
  onTranscriptChange?: (entries: TranscriptEntry[], currentSentence: number) => void;
  apiUrl?: string;
  alertState?: "panic_loop" | "lethargy" | null;
};

const speak = (text: string, lang = 'en-US', onEnd?: () => void) => {
  if (!window.speechSynthesis) {
    if (onEnd) setTimeout(onEnd, 100);
    return;
  }

  let resolved = false;
  const finish = () => {
    if (!resolved) {
      resolved = true;
      if (onEnd) onEnd();
    }
  };

  // Only cancel if something is already playing
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
  
  // Priming for empty strings (just to trigger engine)
  if (!text) {
    const primer = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(primer);
    return;
  }

  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // Explicitly set full volume
    
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.includes(lang.split('-')[0]) && v.name.includes('Female')) || 
                  voices.find(v => v.lang.includes(lang.split('-')[0])) || 
                  voices.find(v => v.name.includes('Google')) ||
                  voices[0];
                   
    if (voice) utterance.voice = voice;
    
    utterance.onend = finish;
    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      finish();
    };

    // Very generous fallback (30 seconds) to prevent infinite wait, but don't cut off normal speech
    setTimeout(finish, 30000);
    
    (window as any)._currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }, 50);
};

export const ChatPanel = ({ scores, onUserMessage, onAvatarStateChange, onTranscriptChange, apiUrl = "http://localhost:8000/api/chat/", alertState = null }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "lumina", text: "Hi, I'm Lumina. Take your time. When you're ready, share whatever feels true — in words or just by being seen." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [gesture, setGesture] = useState<Gesture>("none");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>(() => {
    const greeting = "Hi, I'm Lumina. Take your time. When you're ready, share whatever feels true — in words or just by being seen.";
    return [{ id: "intro", sentences: splitSentences(greeting), startedAt: Date.now() }];
  });
  const [currentSentence, setCurrentSentence] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentenceTimers = useRef<number[]>([]);

  const clearSentenceTimers = () => {
    sentenceTimers.current.forEach((t) => window.clearTimeout(t));
    sentenceTimers.current = [];
  };

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const resultTranscript = event.results[0][0].transcript;
        if (resultTranscript.trim()) {
          send(resultTranscript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      clearSentenceTimers();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    // Speak initial greeting after a short delay to ensure voices are loaded
    const timer = setTimeout(() => {
      speak(messages[0].text);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Auto-listen loop: seamlessly transition back to listening after avatar finishes speaking
  useEffect(() => {
    let timeoutId: number;

    if (!speaking && !thinking && recognitionRef.current && !isListening) {
      timeoutId = window.setTimeout(() => {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          // Ignore errors if recognition has already started
        }
      }, 400); // Slight delay prevents browser "not allowed" errors on rapid restarts
    } else if (speaking && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    return () => window.clearTimeout(timeoutId);
  }, [speaking, thinking, isListening]);

  useEffect(() => {
    onTranscriptChange?.(transcript, speaking ? currentSentence : -1);
  }, [transcript, currentSentence, speaking, onTranscriptChange]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  // Proactive Counseling Logic
  const lastProactiveTime = useRef<number>(0);
  const emotionTimer = useRef<{ emotion: string; start: number } | null>(null);

  useEffect(() => {
    if (thinking || speaking || messages.length === 0) return;

    const currentDominant = dominantEmotion(scores);
    if (currentDominant === "neutral") {
      emotionTimer.current = null;
      return;
    }

    if (!emotionTimer.current || emotionTimer.current.emotion !== currentDominant) {
      emotionTimer.current = { emotion: currentDominant, start: Date.now() };
    } else {
      const duration = Date.now() - emotionTimer.current.start;
      const cooldown = Date.now() - lastProactiveTime.current;

      if (duration > 6000 && cooldown > 120000) { // 6s duration, 2min cooldown
        lastProactiveTime.current = Date.now();
        emotionTimer.current = null;
        triggerProactiveResponse(currentDominant);
      }
    }
  }, [scores, thinking, speaking]);

  const triggerProactiveResponse = async (emotion: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/proactive-counselor/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion }),
      });

      if (!response.ok) return;
      const data = await response.json();
      const replies = Array.isArray(data.reply) ? data.reply : [data.reply];
      
      for (const replyText of replies) {
        setMessages((m) => [...m, { role: "lumina", text: replyText }]);
        setSpeaking(true);
        await new Promise<void>((resolve) => speak(replyText, 'en-US', resolve));
        setSpeaking(false);
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    } catch (e) {
      console.error("Proactive error:", e);
    }
  };

  const [showCrisis, setShowCrisis] = useState(false);
  const sessionEmotions = useRef<string[]>([]);

  const [glow, setGlow] = useState(false);

  // Map dominant user emotion to avatar's empathic mood — drives mirroring
  const userMood = dominantEmotion(scores);
  
  // Mirroring & Micro-Expressions: "Eyes brighten or aura glows" when user smiles
  useEffect(() => {
    if (userMood === "happy") {
      setGlow(true);
    } else {
      setGlow(false);
    }
  }, [userMood]);

  // Mirroring: "Nod" logic when user is talking and calm/neutral
  useEffect(() => {
    if (isListening && (userMood === "neutral" || userMood === "happy")) {
      const interval = setInterval(() => {
        setGesture("nod");
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isListening, userMood]);

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text) return;
    
    // Prime the voice engine with the user gesture
    speak("");
    
    const emotion = dominantEmotion(scores);
    sessionEmotions.current.push(emotion);
    
    // Adaptive Pacing (Don't Interrupt)
    // If user is "Sad", wait for a silence gap of 2 seconds
    if (emotion === "sad" && isListening) {
      setThinking(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setMessages((m) => [...m, { role: "user", text, emotion }]);
    setInput("");
    setThinking(true);
    onUserMessage();

    // Proactive Listening: If the user message is long or emotional, start with a check-in
    if (text.length > 50 || emotion === "sad" || emotion === "angry") {
      const checkIn = "I'm listening... tell me more about that.";
      setMessages((m) => [...m, { role: "lumina", text: checkIn }]);
      speak(checkIn);
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    // Pre-emptive empathic gesture based on the user's face when they sent the message
    const empathicGesture: Gesture =
      emotion === "sad" || emotion === "fearful"
        ? "hand-to-heart"
        : emotion === "happy"
          ? "wave"
          : emotion === "angry"
            ? "lean-in"
            : "tilt";
    setGesture(empathicGesture);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text, 
          emotion, 
          scores,
          user_name: (window as any).LuminaUserName || "friend",
          user_id: "default-user",
          alert_state: alertState ?? null,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Lumina");
      }

      const data = await response.json();
      
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      const langCode = data.language || 'en';
      const audioDataList = data.audio_data || [];

      const localeMap: Record<string, string> = {
        'kn': 'kn-IN',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'ml': 'ml-IN',
        'en': 'en-US'
      };
      const fullLocale = localeMap[langCode] || langCode;
      
      if (data.crisis) {
        setShowCrisis(true);
      }
      
      const replies = Array.isArray(data.reply) ? data.reply : [data.reply];
      
      setThinking(false);

      for (let i = 0; i < replies.length; i++) {
        const replyText = replies[i];
        
        // Add a slight delay between multiple messages
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        setMessages((m) => [...m, { role: "lumina", text: replyText }]);
        setSpeaking(true);
        
        // Use backend generated audio if available, else fallback to browser TTS
        const playAudioAndSync = () => new Promise<void>((resolve) => {
          if (audioDataList && audioDataList[i]) {
            const audio = new Audio(`data:audio/mp3;base64,${audioDataList[i]}`);
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
            audio.play().catch(() => resolve());
          } else {
            speak(replyText, fullLocale, () => resolve());
          }
        });

        const sentences = splitSentences(replyText);
        const entry: TranscriptEntry = {
          id: `t-${Date.now()}-${i}`,
          sentences,
          startedAt: Date.now(),
        };
        setTranscript((prev) => [...prev, entry]);
        setCurrentSentence(0);

        // Schedule approximate sentence-by-sentence highlighting
        clearSentenceTimers();
        let cursor = 0;
        
        sentences.forEach((s, idx) => {
          const dur = Math.max(900, s.length * 60);
          const timer = window.setTimeout(() => {
            if (idx === sentences.length - 1) {
              setCurrentSentence(-1);
            } else {
              setCurrentSentence(idx + 1);
              if (idx === Math.floor(sentences.length / 2)) setGesture("nod");
            }
          }, cursor + dur);
          cursor += dur;
          sentenceTimers.current.push(timer);
        });

        // Wait for actual audio/TTS to finish!
        await playAudioAndSync();
        
        setSpeaking(false);
        setCurrentSentence(-1);

        if (i < replies.length - 1) {
          await new Promise(r => setTimeout(r, 600));
        }
      }
    } catch (error) {
      console.error("Error calling backend:", error);
      const fallbackReply = "I'm having a little trouble connecting right now, but I'm still here with you. What else is on your mind?";
      setMessages((m) => [...m, { role: "lumina", text: fallbackReply }]);
      setThinking(false);
    }
  };

  const avatarMood: "happy" | "concerned" | "surprised" | "neutral" =
    userMood === "sad" || userMood === "fearful" || userMood === "angry"
      ? "concerned"
      : userMood === "happy"
        ? "happy"
        : userMood === "surprised"
          ? "surprised"
          : "neutral";

  useEffect(() => {
    onAvatarStateChange?.({ speaking: speaking || thinking, mood: avatarMood, gesture, glow });
  }, [speaking, thinking, avatarMood, gesture, glow, onAvatarStateChange]);

  return (
    <div className="flex flex-col h-full bg-card rounded-3xl shadow-soft border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-warm flex items-center justify-center flex-shrink-0">
          <CounselorAvatar speaking={speaking || thinking} mood={avatarMood} size={56} gesture={gesture} onGestureEnd={() => setGesture("none")} glow={glow} />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg leading-tight">Lumina</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-sage" />
            {speaking ? "speaking…" : thinking ? "listening…" : "here with you"}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}>
            <div
              className={`max-w-[85%] px-5 py-3 rounded-3xl text-sm leading-relaxed ${
                m.role === "user"
                  ? `${
                      m.emotion === "sad" ? "bg-blue-600/90" :
                      m.emotion === "angry" ? "bg-red-600/90" :
                      m.emotion === "fearful" ? "bg-purple-600/90" :
                      "bg-gradient-sage"
                    } text-primary-foreground rounded-br-md`
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              {m.text}
              {m.emotion && m.role === "user" && (
                <span className="block mt-1.5 text-[10px] uppercase tracking-wider opacity-70">felt: {m.emotion}</span>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="bg-muted px-5 py-3 rounded-3xl rounded-bl-md flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sage-soft animate-pulse-soft" />
              <span className="w-2 h-2 rounded-full bg-sage-soft animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
              <span className="w-2 h-2 rounded-full bg-sage-soft animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
      </div>

      {/* Listening Status Indicator */}
      <div className="p-4 border-t border-white/30 bg-white/40 flex items-center justify-center shrink-0">
        {isListening ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3A5F4D]/10 text-[#3A5F4D] text-xs font-bold uppercase tracking-widest animate-pulse">
            <Mic className="w-4 h-4" /> Listening to you...
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-widest">
            <MicOff className="w-4 h-4" /> Mic muted
          </div>
        )}
      </div>
      {showCrisis && <CrisisPanel onDismiss={() => setShowCrisis(false)} />}
    </div>
  );
};