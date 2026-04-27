import { useEffect, useRef, useState } from "react";

export type Mood = "happy" | "sad" | "angry" | "surprised" | "fearful" | "neutral" | "concerned";
export type Gesture = "none" | "nod" | "tilt" | "wave" | "hand-to-heart" | "lean-in";

type Props = {
  speaking?: boolean;
  mood?: Mood;
  size?: number;
  /** Triggered gesture. Setting to a new value plays it once, then auto-resets. */
  gesture?: Gesture;
  /** Called when the played gesture finishes. */
  onGestureEnd?: () => void;
  /** If true, Lumina's aura glows warm yellow and eyes brighten */
  glow?: boolean;
};

/**
 * Lumina — an animated SVG counselor avatar.
 * - Soft "toy-like" character with warm sage palette
 * - Idle breathing + gentle head sway
 * - Auto-blinking
 * - Mouth animates while `speaking` is true
 * - Eyebrows + mouth shape react to `mood`
 */
export const CounselorAvatar = ({
  speaking = false,
  mood = "neutral",
  size = 240,
  gesture = "none",
  onGestureEnd,
  glow = false,
}: Props) => {
  const [blink, setBlink] = useState(false);
  const [mouthFrame, setMouthFrame] = useState(0);
  const [breath, setBreath] = useState(0);
  const [gestureStart, setGestureStart] = useState<number | null>(null);
  const lastGestureRef = useRef<Gesture>("none");

  // Auto-blink every 3-5s
  useEffect(() => {
    let timeout: number;
    const loop = () => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 140);
      timeout = window.setTimeout(loop, 3000 + Math.random() * 2500);
    };
    timeout = window.setTimeout(loop, 1500);
    return () => window.clearTimeout(timeout);
  }, []);

  // Mouth animation while speaking
  useEffect(() => {
    if (!speaking) {
      setMouthFrame(0);
      return;
    }
    const id = window.setInterval(() => setMouthFrame((f) => (f + 1) % 4), 130);
    return () => window.clearInterval(id);
  }, [speaking]);

  // Breathing / sway tick
  useEffect(() => {
    let raf: number;
    const tick = () => {
      setBreath(performance.now() / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Trigger gesture lifecycle
  useEffect(() => {
    if (gesture === "none") return;
    if (gesture === lastGestureRef.current && gestureStart !== null) return;
    lastGestureRef.current = gesture;
    setGestureStart(performance.now() / 1000);
    const dur = gesture === "wave" ? 1800 : gesture === "hand-to-heart" ? 1600 : gesture === "lean-in" ? 1400 : 1100;
    const id = window.setTimeout(() => {
      setGestureStart(null);
      lastGestureRef.current = "none";
      onGestureEnd?.();
    }, dur);
    return () => window.clearTimeout(id);
  }, [gesture, onGestureEnd, gestureStart]);

  const breathScale = 1 + Math.sin(breath * 1.3) * 0.012;
  const sway = Math.sin(breath * 0.8) * 2.2;

  // Compute gesture progress 0..1
  const gestureT = gestureStart !== null ? Math.min(1, (breath - gestureStart) / 1.2) : 0;
  // Smooth bell curve for one-shot motion
  const bell = (t: number) => Math.sin(Math.PI * t);
  const ease = bell(gestureT);

  // Gesture-driven head transform deltas
  const headTiltZ =
    gesture === "tilt" ? ease * 8 :
    gesture === "lean-in" ? ease * 2 :
    0;
  const headNodY =
    gesture === "nod" ? Math.sin(gestureT * Math.PI * 2) * 8 :
    gesture === "lean-in" ? ease * 6 :
    0;
  const leanScale = gesture === "lean-in" ? 1 + ease * 0.06 : 1;

  // Hand transforms
  const waveAngle = gesture === "wave" ? Math.sin(gestureT * Math.PI * 4) * 22 : 0;
  const handToHeart = gesture === "hand-to-heart" ? ease : 0;

  // Mood-driven features
  const browY = mood === "sad" || mood === "concerned" ? -2 : mood === "surprised" ? -6 : mood === "angry" ? 1 : 0;
  const browTilt = mood === "sad" || mood === "concerned" ? 8 : mood === "angry" ? -10 : 0;

  // Mouth shapes by mood + speaking phase
  const mouthPath = (() => {
    if (speaking) {
      const shapes = [
        "M 92 152 Q 120 158 148 152", // small
        "M 92 150 Q 120 168 148 150", // open
        "M 92 152 Q 120 160 148 152", // mid
        "M 92 152 Q 120 156 148 152", // closed-ish
      ];
      return shapes[mouthFrame];
    }
    if (mood === "happy") return "M 90 150 Q 120 172 150 150";
    if (mood === "sad" || mood === "concerned") return "M 92 160 Q 120 148 148 160";
    if (mood === "surprised") return "M 110 152 Q 120 168 130 152 Q 120 158 110 152";
    if (mood === "angry") return "M 95 158 Q 120 152 145 158";
    return "M 96 154 Q 120 162 144 154"; // gentle smile
  })();

  const eyeScaleY = blink ? 0.08 : 1;

  return (
    <div
      className="relative inline-block"
      style={{
        width: size,
        height: size,
        transform: `translateY(${Math.sin(breath * 1.3) * 3 + headNodY * 0.4}px) rotate(${sway * 0.4 + headTiltZ * 0.3}deg) scale(${leanScale})`,
        transition: "transform 0.05s linear",
      }}
      aria-label="Lumina, your AI counselor"
    >
      {/* Soft glow halo */}
      <div
        className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${glow ? 'bg-amber-300 opacity-80 scale-110' : 'bg-gradient-sage opacity-60'}`}
        style={{ transform: glow ? `scale(${1.1 + Math.sin(breath * 1.3) * 0.04})` : `scale(${0.85 + Math.sin(breath * 1.3) * 0.04})` }}
      />

      <svg
        viewBox="0 0 240 260"
        width={size}
        height={size}
        style={{ position: "relative", transform: `scale(${breathScale})`, transformOrigin: "center" }}
      >
        <defs>
          <radialGradient id="skin" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="hsl(35 60% 92%)" />
            <stop offset="100%" stopColor="hsl(28 45% 80%)" />
          </radialGradient>
          <linearGradient id="hood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(150 28% 50%)" />
            <stop offset="100%" stopColor="hsl(150 22% 32%)" />
          </linearGradient>
          <radialGradient id="cheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(18 70% 75% / 0.55)" />
            <stop offset="100%" stopColor="hsl(18 70% 75% / 0)" />
          </radialGradient>
        </defs>

        {/* Body / hooded sweater */}
        <path
          d="M 30 250 Q 30 180 120 175 Q 210 180 210 250 Z"
          fill="url(#hood)"
        />
        {/* Hood collar */}
        <ellipse cx="120" cy="180" rx="78" ry="14" fill="hsl(150 22% 28%)" opacity="0.6" />

        {/* Left arm + hand — animates for wave / hand-to-heart */}
        <g
          style={{
            transformOrigin: "180px 195px",
            transform: `rotate(${waveAngle - handToHeart * 35}deg) translate(${handToHeart * -42}px, ${handToHeart * -18}px)`,
            transition: "transform 0.08s linear",
          }}
        >
          <path
            d="M 178 195 Q 200 200 210 230 Q 205 240 195 235 Q 188 215 175 210 Z"
            fill="url(#hood)"
          />
          <circle cx="207" cy="232" r="11" fill="url(#skin)" />
        </g>

        {/* Hair / hood top behind head */}
        <g
          style={{
            transformOrigin: "120px 150px",
            transform: `rotate(${headTiltZ}deg) translateY(${headNodY}px)`,
            transition: "transform 0.1s linear",
          }}
        >
        <path
          d="M 50 110 Q 60 30 120 28 Q 180 30 190 110 Q 190 130 175 130 L 65 130 Q 50 130 50 110 Z"
          fill="url(#hood)"
        />

        {/* Head */}
        <ellipse cx="120" cy="120" rx="68" ry="74" fill="url(#skin)" />

        {/* Cheeks */}
        <circle cx="78" cy="148" r="14" fill="url(#cheek)" />
        <circle cx="162" cy="148" r="14" fill="url(#cheek)" />

        {/* Hair fringe */}
        <path
          d="M 60 100 Q 90 60 120 70 Q 150 60 180 100 Q 165 88 140 92 Q 120 78 100 92 Q 75 88 60 100 Z"
          fill="hsl(150 22% 28%)"
        />

        {/* Eyebrows */}
        <g style={{ transform: `translateY(${browY}px)`, transformOrigin: "center" }}>
          <path
            d={`M 78 ${108} q 12 ${-3 + browTilt * 0.2} 24 0`}
            stroke="hsl(150 22% 22%)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            transform={`rotate(${browTilt} 90 108)`}
          />
          <path
            d={`M 138 ${108} q 12 ${-3 - browTilt * 0.2} 24 0`}
            stroke="hsl(150 22% 22%)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            transform={`rotate(${-browTilt} 150 108)`}
          />
        </g>

        {/* Eyes */}
        <g>
          <ellipse
            cx="90"
            cy="125"
            rx="7"
            ry={9 * eyeScaleY}
            fill="hsl(150 22% 18%)"
            style={{ transition: "all 0.1s ease" }}
          />
          <ellipse
            cx="150"
            cy="125"
            rx="7"
            ry={9 * eyeScaleY}
            fill="hsl(150 22% 18%)"
            style={{ transition: "all 0.1s ease" }}
          />
          {/* Eye shine */}
          {!blink && (
            <>
              <circle cx="92" cy="122" r={glow ? 3 : 2} fill="white" opacity={glow ? 1 : 0.9} />
              <circle cx="152" cy="122" r={glow ? 3 : 2} fill="white" opacity={glow ? 1 : 0.9} />
            </>
          )}
        </g>

        {/* Nose */}
        <path d="M 118 132 Q 116 142 120 144 Q 124 142 122 132" stroke="hsl(28 35% 60%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Mouth */}
        <path
          d={mouthPath}
          stroke="hsl(150 22% 20%)"
          strokeWidth="3"
          fill={mood === "surprised" ? "hsl(0 30% 25%)" : "none"}
          strokeLinecap="round"
          style={{ transition: "d 0.15s ease" }}
        />
        </g>

        {/* Tiny chest leaf — Lumina's emblem */}
        <g transform="translate(120 215)">
          <path
            d="M 0 -10 Q 8 -6 8 2 Q 4 8 0 8 Q -4 8 -8 2 Q -8 -6 0 -10 Z"
            fill="hsl(150 35% 75%)"
            opacity="0.9"
          />
          <path d="M 0 -8 L 0 6" stroke="hsl(150 22% 32%)" strokeWidth="1" />
        </g>
      </svg>

      {/* Speaking indicator ring */}
      {speaking && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse-soft" />
          <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
        </span>
      )}
    </div>
  );
};