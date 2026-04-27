import type { EmotionScores } from "@/hooks/lumina/useEmotionDetection";

const LABELS: { key: keyof EmotionScores; label: string; color: string }[] = [
  { key: "happy", label: "Happy", color: "bg-amber-300" },
  { key: "sad", label: "Sad", color: "bg-sky-400" },
  { key: "angry", label: "Angry", color: "bg-rose-400" },
  { key: "surprised", label: "Surprised", color: "bg-violet-300" },
  { key: "fearful", label: "Fearful", color: "bg-indigo-300" },
  { key: "neutral", label: "Calm", color: "bg-sage-soft" },
];

export const EmotionMeter = ({ scores }: { scores: EmotionScores }) => {
  return (
    <div className="space-y-3">
      {LABELS.map(({ key, label, color }) => {
        const v = Math.round(scores[key] * 100);
        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{label}</span>
              <span className="tabular-nums">{v}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full ${color} transition-all duration-700 ease-out rounded-full`}
                style={{ width: `${v}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};