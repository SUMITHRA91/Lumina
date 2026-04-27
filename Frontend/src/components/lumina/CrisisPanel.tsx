import { useEffect, useState } from "react";
import { Phone, MessageCircle, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COUNSELORS = [
    { name: "Dr. Maya Chen", specialty: "Anxiety & Depression", available: "Available now" },
    { name: "Samuel Okafor, LCSW", specialty: "Trauma-Informed Care", available: "Available in 5 min" },
    { name: "Dr. Priya Raman", specialty: "Crisis Counseling", available: "Available now" },
];

export const CrisisPanel = ({ onDismiss }: { onDismiss: () => void }) => {
    const [alertStatus, setAlertStatus] = useState("Notifying your trusted contacts...");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAlertStatus("Alert successfully sent to your trusted circle.");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-up">
      <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-soft border border-border p-8 space-y-6">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-crisis/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-crisis" />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-2xl text-foreground">You don't have to do this alone</h2>
            <div className="flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-crisis/10 border border-crisis/20 w-fit">
              <span className={`w-2 h-2 rounded-full ${alertStatus.includes("successfully") ? "bg-sage" : "bg-crisis animate-pulse"}`} />
              <p className="text-[10px] font-bold uppercase tracking-wider text-crisis">{alertStatus}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              I've noticed some heavy feelings. A real person is ready to listen, right now.
            </p>
          </div>
        </div>

        <a
          href="tel:988"
          className="flex items-center justify-between p-4 rounded-2xl bg-crisis text-destructive-foreground hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5" />
            <div>
              <p className="font-medium">Call 988 — Crisis Lifeline</p>
              <p className="text-xs opacity-90">Free, confidential, 24/7</p>
            </div>
          </div>
          <span className="text-sm font-medium">SOS</span>
        </a>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Human counselors available
          </p>
          {COUNSELORS.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-2xl bg-muted/60 hover:bg-muted transition-colors">
              <div>
                <p className="font-medium text-sm text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.specialty} · <span className="text-sage">{c.available}</span></p>
              </div>
              <Button size="sm" variant="secondary" className="rounded-full">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Connect
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          You are safe here. Lumina will keep listening when you're ready.
        </p>
      </div>
    </div>
  );
};