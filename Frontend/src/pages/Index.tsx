import { Sparkles, Activity, Brain, ShieldCheck, Heart, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FallingLeaves } from "@/components/lumina/FallingLeaves";
import { UserProfileButton } from "@/components/lumina/UserProfileButton";
import { useEffect, useState } from "react";

const Index = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-calm font-sans relative overflow-x-hidden text-foreground">
      <FallingLeaves />

      {/* ── Professional Header ── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-border/40 shadow-sm py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-sage flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl tracking-tight text-foreground/90 font-medium">Lumina</span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <Link to="/contacts" className="hover:text-foreground transition-colors">Safety Network</Link>
            <Link to="/analytics" className="hover:text-foreground transition-colors">Analytics</Link>
          </nav>

          <div className="flex items-center gap-4">
            {localStorage.getItem("lumina_username") ? (
              <UserProfileButton />
            ) : (
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Log in
              </Link>
            )}
            <Link to="/chat">
              <Button className="rounded-full bg-[#3A5F4D] hover:bg-[#2A4538] text-white px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 lg:pt-48 pb-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
        
        {/* ── Hero Section ── */}
        <section className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur border border-white/40 text-xs font-bold uppercase tracking-widest text-[#3A5F4D] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Clinical-Grade Emotional Intelligence
          </div>

          <h1 className="font-serif text-6xl lg:text-[88px] text-foreground/90 leading-[1.05] tracking-tight">
            Compassionate AI for <br className="hidden lg:block" />
            <span className="text-[#3A5F4D] italic font-light">smarter, safer care.</span>
          </h1>

          <p className="text-xl text-muted-foreground/80 max-w-2xl leading-relaxed">
            Lumina is an advanced multi-modal mental health companion that combines real-time facial expression analysis with deep, conversational empathy to provide immediate, tailored support.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 w-full justify-center">
            <Link to="/chat">
              <Button size="lg" className="rounded-full h-14 px-8 text-base bg-[#3A5F4D] hover:bg-[#2A4538] text-white shadow-glow transition-all hover:-translate-y-1 gap-2 w-full sm:w-auto">
                <Sparkles className="w-5 h-5" />
                Launch AI Companion
              </Button>
            </Link>
            <Link to="/counselor">
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base bg-white/60 backdrop-blur-md border-border/40 hover:bg-white text-foreground transition-all shadow-soft hover:-translate-y-1 gap-2 w-full sm:w-auto">
                <Heart className="w-5 h-5 text-rose-500" />
                Expert Guidance Portal
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Capabilities Dashboard Preview (Abstract) ── */}
        <div className="mt-32 relative max-w-6xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 top-1/2 pointer-events-none" />
          <div className="rounded-[40px] bg-white/40 backdrop-blur-3xl border border-white/50 shadow-[0_20px_80px_-20px_rgba(58,95,77,0.15)] p-4 sm:p-8 overflow-hidden">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature Box 1 */}
              <div className="bg-white/80 rounded-3xl p-6 shadow-sm border border-border/30 group hover:bg-white transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-serif mb-2">Real-Time Sensing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  On-device vision models detect subtle shifts in emotional distress, operating entirely privately in the browser.
                </p>
              </div>

              {/* Feature Box 2 */}
              <div className="bg-white/80 rounded-3xl p-6 shadow-sm border border-border/30 group hover:bg-white transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-serif mb-2">Adaptive Empathy Engine</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Powered by Google Gemini, Lumina dynamically alters its therapeutic approach based on detected emotional states.
                </p>
              </div>

              {/* Feature Box 3 */}
              <div className="bg-white/80 rounded-3xl p-6 shadow-sm border border-border/30 group hover:bg-white transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-lg font-serif mb-2">Diagnostic Alerting</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Automatic escalation protocols trigger physical grounding techniques (e.g., Vagus Nerve Stimulation) during panic loops.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Expanded Platform Features ── */}
        <section id="features" className="mt-40 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl text-foreground/90 mb-4">A complete care ecosystem</h2>
            <p className="text-lg text-muted-foreground">Purpose-built tools for every stage of the emotional journey.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link to="/therapy" className="group rounded-[40px] p-10 bg-sage-soft/10 border border-sage-soft/20 hover:bg-sage-soft/20 transition-all flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm">
                  <Heart className="w-7 h-7 text-[#3A5F4D]" />
                </div>
                <h3 className="font-serif text-3xl mb-3">Lively Therapy Plan</h3>
                <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                  Structured daily goals, breathing exercises, and nutritional "Mood-Fuel" recommendations based on current emotional baselines.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[#3A5F4D] font-medium mt-8 group-hover:translate-x-2 transition-transform">
                Explore Therapy <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link to="/analytics" className="group rounded-[40px] p-10 bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-all flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm">
                  <Activity className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-serif text-3xl mb-3">Longitudinal Analytics</h3>
                <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                  Track emotional trends over time. Identify triggers and measure the effectiveness of ongoing therapeutic interventions.
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-600 font-medium mt-8 group-hover:translate-x-2 transition-transform">
                View Dashboard <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-white/40 backdrop-blur-xl py-12 relative z-10 mt-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-sage flex items-center justify-center opacity-80">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-xl tracking-tight text-foreground/80">Lumina Health</span>
          </div>
          <div className="text-sm text-muted-foreground/60 flex items-center gap-6">
            <span>© 2026 Lumina Platform.</span>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
