import { useEffect, useState } from "react";
import { X, Wind, Droplets, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

type AlertType = "panic_loop" | "lethargy";

interface Props {
  alertType: AlertType;
  onDismiss: () => void;
  /** seconds before auto-dismiss; default 40 */
  autoDismissSeconds?: number;
}

const ALERT_CONFIG = {
  panic_loop: {
    badge: "⚡ Panic-Loop Alert",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    borderClass: "border-amber-300/60",
    bgClass: "from-amber-50/95 to-orange-50/95",
    headerClass: "text-amber-800",
    icon: Zap,
    iconClass: "text-amber-500",
    title: "I'm noticing a rise in physical tension",
    message:
      "Your nervous system may be in a 'fight-or-flight' loop right now. That's okay — your body is trying to protect you. Let's interrupt that cycle together.",
    actions: [
      {
        id: "box-breath",
        label: "Box Breath (4-4-4-4)",
        icon: Wind,
        description: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 3×.",
      },
      {
        id: "ice-water",
        label: "Ice Water Technique",
        icon: Droplets,
        description:
          "Splash cold water on your face, or hold an ice cube for 30 seconds. This activates the vagus nerve instantly.",
      },
    ],
    lumina:
      "I'm noticing a rise in your physical tension. Let's try the 'Ice Water' technique or a 'Box Breath' to reset your nervous system before we continue.",
  },
  lethargy: {
    badge: "🔵 Lethargy-State Alert",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    borderClass: "border-blue-300/60",
    bgClass: "from-blue-50/95 to-indigo-50/95",
    headerClass: "text-blue-800",
    icon: Activity,
    iconClass: "text-blue-500",
    title: "Things feel very heavy right now",
    message:
      "When the weight of sadness settles in, talking can feel impossible. That's completely valid. Let's not talk — let's do one tiny thing together.",
    actions: [
      {
        id: "stretch",
        label: "Stand & Stretch (10s)",
        icon: Activity,
        description:
          "Stand up right now and stretch your arms above your head for just 10 seconds. I'll be right here.",
      },
      {
        id: "window",
        label: "Look Outside",
        icon: Wind,
        description:
          "Walk to the nearest window and look outside for 30 seconds. Notice one thing you see.",
      },
    ],
    lumina:
      "It seems things feel very heavy right now. Can we try just standing up and stretching for 10 seconds? I'll do it with you.",
  },
};

export const DiagnosticAlert = ({
  alertType,
  onDismiss,
  autoDismissSeconds = 40,
}: Props) => {
  const cfg = ALERT_CONFIG[alertType];
  const Icon = cfg.icon;
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(autoDismissSeconds);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onDismiss]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 animate-fade-up pointer-events-none">
      <div
        className={`
          pointer-events-auto w-full max-w-xl
          bg-gradient-to-br ${cfg.bgClass}
          backdrop-blur-xl border ${cfg.borderClass}
          rounded-3xl shadow-2xl overflow-hidden
        `}
      >
        {/* Progress bar */}
        <div className="h-1 bg-white/30">
          <div
            className="h-full bg-current transition-all ease-linear"
            style={{
              width: `${(countdown / autoDismissSeconds) * 100}%`,
              color: alertType === "panic_loop" ? "#f59e0b" : "#3b82f6",
              backgroundColor:
                alertType === "panic_loop" ? "#f59e0b" : "#3b82f6",
            }}
          />
        </div>

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${cfg.badgeClass}`}
              >
                {cfg.badge}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Diagnostic Alerting Mode
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-black/5 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lumina message */}
          <div className="flex gap-3 mb-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                alertType === "panic_loop" ? "bg-amber-100" : "bg-blue-100"
              }`}
            >
              <Icon className={`w-4 h-4 ${cfg.iconClass}`} />
            </div>
            <div>
              <p className={`font-serif text-base font-medium ${cfg.headerClass}`}>
                {cfg.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {cfg.lumina}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            {cfg.actions.map((action) => {
              const ActionIcon = action.icon;
              const isActive = activeAction === action.id;
              return (
                <button
                  key={action.id}
                  onClick={() =>
                    setActiveAction(isActive ? null : action.id)
                  }
                  className={`
                    text-left p-3 rounded-2xl border transition-all duration-200 group
                    ${
                      isActive
                        ? alertType === "panic_loop"
                          ? "bg-amber-100 border-amber-300"
                          : "bg-blue-100 border-blue-300"
                        : "bg-white/50 border-white/40 hover:bg-white/80"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ActionIcon
                      className={`w-4 h-4 ${cfg.iconClass} flex-shrink-0`}
                    />
                    <span className="text-xs font-bold text-foreground">
                      {action.label}
                    </span>
                  </div>
                  {isActive && (
                    <p className="text-xs text-muted-foreground leading-relaxed animate-fade-in">
                      {action.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground/60">
              Auto-dismisses in {countdown}s
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-xs h-7 rounded-full"
            >
              I'm okay now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
