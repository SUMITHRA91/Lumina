import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Sparkles, Calendar, Smile, Frown, Meh } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { UserProfileButton } from "@/components/lumina/UserProfileButton";

const MOCK_DATA = [
  { name: "Mon", happiness: 40, sadness: 60, anxiety: 50 },
  { name: "Tue", happiness: 45, sadness: 55, anxiety: 45 },
  { name: "Wed", happiness: 50, sadness: 45, anxiety: 40 },
  { name: "Thu", happiness: 65, sadness: 35, anxiety: 30 },
  { name: "Fri", happiness: 70, sadness: 25, anxiety: 20 },
  { name: "Sat", happiness: 85, sadness: 15, anxiety: 15 },
  { name: "Sun", happiness: 90, sadness: 10, anxiety: 10 },
];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");

  return (
    <div className="min-h-screen bg-gradient-calm font-sans text-foreground transition-colors duration-1000">
      {/* Header */}
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/40">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-sage flex items-center justify-center shadow-glow">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-2xl tracking-tight text-foreground/90">Mood Analytics</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/40 backdrop-blur-md p-1 rounded-full border border-white/20">
          <Button 
            variant={timeframe === "week" ? "default" : "ghost"} 
            size="sm" 
            className={`rounded-full px-6 transition-all ${timeframe === "week" ? "bg-sage text-white shadow-soft" : "hover:bg-white/50 text-muted-foreground"}`}
            onClick={() => setTimeframe("week")}
          >
            This Week
          </Button>
          <Button 
            variant={timeframe === "month" ? "default" : "ghost"} 
            size="sm" 
            className={`rounded-full px-6 transition-all ${timeframe === "month" ? "bg-sage text-white shadow-soft" : "hover:bg-white/50 text-muted-foreground"}`}
            onClick={() => setTimeframe("month")}
          >
            This Month
          </Button>
        </div>
        <UserProfileButton />
      </header>

      <main className="px-6 lg:px-12 max-w-7xl mx-auto py-8 space-y-12">
        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up">
          <div className="p-6 rounded-[30px] bg-white/40 backdrop-blur-xl border border-white/30 shadow-soft hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Average Mood</h3>
              <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center">
                <Smile className="w-4 h-4 text-sage" />
              </div>
            </div>
            <p className="text-4xl font-serif text-foreground">Content</p>
            <p className="text-sm text-sage flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4" /> +15% from last week
            </p>
          </div>
          
          <div className="p-6 rounded-[30px] bg-white/40 backdrop-blur-xl border border-white/30 shadow-soft hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Stress Levels</h3>
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-4xl font-serif text-foreground">Low</p>
            <p className="text-sm text-sage flex items-center gap-1 mt-2">
              <TrendingDown className="w-4 h-4" /> -20% from last week
            </p>
          </div>

          <div className="p-6 rounded-[30px] bg-white/40 backdrop-blur-xl border border-white/30 shadow-soft hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Sessions Logged</h3>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-4xl font-serif text-foreground">7</p>
            <p className="text-sm text-muted-foreground mt-2">
              Perfect daily streak! 🔥
            </p>
          </div>
        </div>

        {/* Main Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 rounded-[40px] bg-white/50 backdrop-blur-xl border border-white/30 shadow-soft animate-fade-up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif text-foreground/90">Emotion Trends</h2>
                <p className="text-muted-foreground text-sm mt-1">Your emotional journey over time</p>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-white/60 border border-white/40 text-xs font-semibold text-sage uppercase tracking-widest">
                Interactive
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -15px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                  <Line type="monotone" dataKey="happiness" name="Happiness" stroke="#10b981" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="sadness" name="Sadness" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="anxiety" name="Anxiety" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Report Panel */}
          <div className="space-y-6">
            <div className="p-8 rounded-[40px] bg-gradient-sage text-white shadow-glow animate-fade-up relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <Sparkles className="w-24 h-24" />
              </div>
              <h2 className="text-2xl font-serif mb-6 relative z-10">Weekly Mental Health Report</h2>
              
              <div className="space-y-6 relative z-10">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-full">
                      <TrendingDown className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-lg">Sadness Decreasing</h4>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Great progress! Your sadness levels have dropped consistently over the last 4 days.
                  </p>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-full">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-lg">Happiness Increasing</h4>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You've experienced more moments of joy, peaking over the weekend. Keep up the activities!
                  </p>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-lg">Anxiety Stabilized</h4>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Your baseline anxiety is much lower than last week. The breathing exercises are working.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-[30px] bg-white/40 backdrop-blur-xl border border-white/30 shadow-soft animate-fade-up">
              <h3 className="font-serif text-xl text-foreground/90 mb-4">AI Recommendation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your data shows significant improvement when engaging in physical activity. Try to maintain at least a 15-minute walk daily to keep the positive momentum.
              </p>
              <Link to="/therapy">
                <Button className="w-full mt-4 rounded-full bg-[#3A5F4D] hover:bg-[#2A4538] text-white transition-all">
                  View Therapy Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
