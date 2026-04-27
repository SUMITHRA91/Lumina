import { useMemo } from "react";
import { Leaf, Apple, Zap, Activity } from "lucide-react";
import { dominantEmotion, type EmotionScores } from "@/hooks/lumina/useEmotionDetection";

interface Props {
  scores: EmotionScores;
}

type MoodCategory = "anxiety" | "sad" | "neutral";

const MOOD_FUEL: Record<
  MoodCategory,
  {
    state: string;
    stateClass: string;
    badgeClass: string;
    icon: typeof Zap;
    iconClass: string;
    borderClass: string;
    bgClass: string;
    why: string;
    nutrients: string;
    nutrientClass: string;
    foods: { name: string; emoji: string }[];
    score: (scores: EmotionScores) => number;
  }
> = {
  anxiety: {
    state: "High Anxiety",
    stateClass: "text-amber-700",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Zap,
    iconClass: "text-amber-500",
    borderClass: "border-amber-200/60",
    bgClass: "from-amber-50/80 to-orange-50/60",
    why: "Anxiety triggers 'Magnesium dumping' — your muscles tense and deplete this vital mineral. Replenishing it helps relax your nervous system.",
    nutrients: "Magnesium & L-Theanine",
    nutrientClass: "text-amber-600",
    foods: [
      { name: "Pumpkin seeds", emoji: "🎃" },
      { name: "Spinach", emoji: "🥬" },
      { name: "Green tea", emoji: "🍵" },
      { name: "Dark chocolate 70%+", emoji: "🍫" },
    ],
    score: (s) => Math.round((1 - (s.fearful + s.surprised) / 2) * 100),
  },
  sad: {
    state: "High Sadness",
    stateClass: "text-blue-700",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Activity,
    iconClass: "text-blue-500",
    borderClass: "border-blue-200/60",
    bgClass: "from-blue-50/80 to-indigo-50/60",
    why: "Sadness depletes Serotonin raw materials. Tryptophan and Vitamin D are the building blocks your brain needs to lift your mood naturally.",
    nutrients: "Tryptophan & Vitamin D",
    nutrientClass: "text-blue-600",
    foods: [
      { name: "Bananas", emoji: "🍌" },
      { name: "Oats", emoji: "🌾" },
      { name: "Turkey", emoji: "🦃" },
      { name: "Walnuts", emoji: "🫘" },
      { name: "Curd (probiotic)", emoji: "🥛" },
    ],
    score: (s) => Math.round((1 - s.sad) * 100),
  },
  neutral: {
    state: "Neutral / Steady",
    stateClass: "text-emerald-700",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: Leaf,
    iconClass: "text-emerald-500",
    borderClass: "border-emerald-200/60",
    bgClass: "from-emerald-50/80 to-teal-50/60",
    why: "Prevent the 'hangry' glucose crash. Blood sugar dips quietly trigger irritability and low focus — steady-state glucose keeps you balanced.",
    nutrients: "Steady-State Glucose",
    nutrientClass: "text-emerald-600",
    foods: [
      { name: "Hummus & carrots", emoji: "🥕" },
      { name: "Quinoa", emoji: "🌿" },
      { name: "Sweet potatoes", emoji: "🍠" },
    ],
    score: (s) => Math.round(s.neutral * 100),
  },
};

function getMoodCategory(scores: EmotionScores): MoodCategory {
  const em = dominantEmotion(scores);
  if (em === "fearful" || em === "surprised" || em === "angry") return "anxiety";
  if (em === "sad" || em === "disgusted") return "sad";
  return "neutral";
}

function ScoreGauge({ value, color }: { value: number; color: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/20"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-xl font-bold leading-none" style={{ color }}>
          {value}
        </p>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
          score
        </p>
      </div>
    </div>
  );
}

const GAUGE_COLORS: Record<MoodCategory, string> = {
  anxiety: "#f59e0b",
  sad: "#3b82f6",
  neutral: "#10b981",
};

export const MoodFuelPanel = ({ scores }: Props) => {
  const category = useMemo(() => getMoodCategory(scores), [scores]);
  const cfg = MOOD_FUEL[category];
  const Icon = cfg.icon;
  const score = useMemo(() => cfg.score(scores), [cfg, scores]);
  const gaugeColor = GAUGE_COLORS[category];

  return (
    <div
      className={`
        rounded-3xl border ${cfg.borderClass}
        bg-gradient-to-br ${cfg.bgClass}
        backdrop-blur p-5 space-y-4
        transition-all duration-700
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center">
            <Apple className="w-4 h-4 text-foreground/60" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
              Mood-Fuel Score
            </p>
            <p className={`font-serif text-sm font-semibold ${cfg.stateClass}`}>
              {cfg.state}
            </p>
          </div>
        </div>
        <ScoreGauge value={score} color={gaugeColor} />
      </div>

      {/* Nutrient badge */}
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${cfg.iconClass} flex-shrink-0`} />
        <span className={`text-xs font-bold ${cfg.nutrientClass}`}>
          {cfg.nutrients}
        </span>
      </div>

      {/* Why box */}
      <div className="bg-white/50 rounded-2xl p-3 border border-white/40">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">
          The Science
        </p>
        <p className="text-xs text-foreground/80 leading-relaxed">{cfg.why}</p>
      </div>

      {/* Food chips */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
          Recommended Now
        </p>
        <div className="flex flex-wrap gap-2">
          {cfg.foods.map((food) => (
            <span
              key={food.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-white/50 text-xs font-medium text-foreground/80 shadow-sm hover:bg-white/90 transition-colors cursor-default"
            >
              <span>{food.emoji}</span>
              {food.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
