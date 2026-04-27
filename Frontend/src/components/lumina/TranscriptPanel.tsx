import { useEffect, useRef } from "react";
import { Radio } from "lucide-react";

export type TranscriptEntry = {
  id: string;
  /** Sentences from a single counselor turn, in order. */
  sentences: string[];
  /** Timestamp (ms) when this turn started speaking. */
  startedAt: number;
};

type Props = {
  entries: TranscriptEntry[];
  /** Index of the sentence currently being spoken in the latest entry. -1 if not speaking. */
  currentSentence: number;
  speaking: boolean;
};

export const TranscriptPanel = ({ entries, currentSentence, speaking }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, currentSentence]);

  const latestId = entries[entries.length - 1]?.id;

  return (
    <div className="flex flex-col h-full bg-card/70 backdrop-blur rounded-3xl border border-border/40 shadow-soft overflow-hidden">
      <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${speaking ? "text-sage animate-pulse-soft" : "text-muted-foreground"}`} />
          <h3 className="font-serif text-base">Transcript</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {speaking ? "live" : "idle"}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm leading-relaxed">
        {entries.length === 0 && (
          <p className="text-muted-foreground italic">Lumina's words will appear here as she speaks.</p>
        )}
        {entries.map((entry) => {
          const isLatest = entry.id === latestId;
          return (
            <div key={entry.id} className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {new Date(entry.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-foreground/90">
                {entry.sentences.map((s, i) => {
                  const active = isLatest && speaking && i === currentSentence;
                  const spoken = isLatest ? i < currentSentence || (!speaking && currentSentence === -1) : true;
                  return (
                    <span
                      key={i}
                      className={
                        active
                          ? "bg-sage/20 text-foreground rounded px-1 py-0.5 transition-colors duration-300 ring-1 ring-sage/40"
                          : spoken
                            ? "text-foreground/85"
                            : "text-muted-foreground/60"
                      }
                    >
                      {s}
                      {i < entry.sentences.length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Split text into sentence chunks for transcript highlighting. */
export const splitSentences = (text: string): string[] => {
  const parts = text.match(/[^.!?…]+[.!?…]+|\S[^.!?…]*$/g);
  return (parts ?? [text]).map((s) => s.trim()).filter(Boolean);
};