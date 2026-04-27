import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmotionDetection, type EmotionScores, dominantEmotion } from "@/hooks/lumina/useEmotionDetection";
import { usePoseDetection } from "@/hooks/lumina/usePoseDetection";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";

type Props = {
  onScores: (s: EmotionScores) => void;
  onActiveChange?: (active: boolean) => void;
  mode?: "face" | "body";
};

export const CameraFeed = ({ onScores, onActiveChange, mode = "face" }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasOverlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  
  const { scores, posture, ready: emotionReady, faceDetected } = useEmotionDetection(videoRef, active && mode === "face");
  const poseData = usePoseDetection(videoRef, active && mode === "body");

  useEffect(() => { onScores(scores); }, [scores, onScores]);
  useEffect(() => { onActiveChange?.(active); }, [active, onActiveChange]);

  // Handle Drawing Skeleton
  useEffect(() => {
    if (mode !== "body" || !active || !poseData.results || !canvasOverlayRef.current || !videoRef.current) return;
    
    const ctx = canvasOverlayRef.current.getContext("2d");
    if (!ctx) return;

    const video = videoRef.current;
    canvasOverlayRef.current.width = video.videoWidth;
    canvasOverlayRef.current.height = video.videoHeight;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const drawingUtils = new DrawingUtils(ctx);

    for (const landmarks of poseData.results.landmarks) {
      drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
        color: "#3A5F4D",
        lineWidth: 4
      });
      drawingUtils.drawLandmarks(landmarks, {
        color: "#FFFFFF",
        fillColor: "#3A5F4D",
        radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1)
      });
    }
  }, [poseData, active, mode]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false, // Reduced noise for therapy
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      setPermError(null);
    } catch (e: any) {
      setPermError(e?.message ?? "Camera access denied");
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  };

  useEffect(() => () => stop(), []);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-warm shadow-soft border border-border/50 aspect-[4/3] group/camera">
      <video
        ref={videoRef}
        muted
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-700 ${active ? "opacity-100" : "opacity-0"}`}
      />
      
      {active && mode === "body" && (
        <canvas 
          ref={canvasOverlayRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 opacity-80"
        />
      )}

      {!active && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center bg-white/40 backdrop-blur-md z-20">
          <div className="w-20 h-20 rounded-full bg-gradient-sage flex items-center justify-center animate-breathe shadow-glow">
            {mode === "face" ? <Camera className="w-9 h-9 text-primary-foreground" /> : <User className="w-9 h-9 text-primary-foreground" />}
          </div>
          <div className="space-y-1">
            <p className="font-serif text-xl text-foreground">
              {mode === "face" ? "Begin when you're ready" : "Position yourself in view"}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Lumina uses {mode === "face" ? "facial sensing" : "body tracking"} privately in your browser.
            </p>
          </div>
          <Button onClick={start} size="lg" className="rounded-full px-7 bg-[#3A5F4D] hover:bg-[#2A4538]">
            Start {mode === "face" ? "session" : "tracking"}
          </Button>
          {permError && <p className="text-xs text-crisis">{permError}</p>}
        </div>
      )}

      {active && (
        <>
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-30">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur text-xs shadow-sm">
              <span className={`w-2 h-2 rounded-full ${faceDetected || (mode === "body" && poseData.results) ? "bg-sage animate-pulse-soft" : "bg-muted-foreground"}`} />
              {mode === "face" ? (
                !emotionReady ? <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Loading model…</span> : faceDetected ? "Sensing" : "Looking for you…"
              ) : (
                poseData.results ? "Tracking Body" : "Detecting posture…"
              )}
            </div>
            
            {faceDetected && mode === "face" && (
              <div className="px-3 py-1.5 rounded-full bg-sage/90 backdrop-blur text-[10px] text-primary-foreground uppercase tracking-widest font-bold animate-fade-in shadow-md">
                Emotion: {dominantEmotion(scores)}
              </div>
            )}
          </div>
          
          <button
            onClick={stop}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background transition-colors shadow-sm z-30 opacity-0 group-hover/camera:opacity-100 transition-opacity"
            aria-label="Stop camera"
          >
            <CameraOff className="w-4 h-4" />
          </button>

          {/* Body Correction Feedback */}
          {mode === "body" && poseData.feedback.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 animate-fade-up z-30">
              <div className="bg-white/95 backdrop-blur-md border-l-4 border-amber-400 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Correction</span>
                </div>
                <p className="text-xs font-medium text-foreground">{poseData.feedback[0]}</p>
              </div>
            </div>
          )}

          {/* Posture Feedback for Face Mode */}
          {mode === "face" && posture?.detected && (posture.shoulders_raised || posture.leaning_forward) && (
            <div className="absolute bottom-4 left-4 right-4 animate-fade-up z-30">
              <div className="bg-white/95 backdrop-blur-md border border-sage/30 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-sage" />
                  <span className="text-[10px] font-bold text-sage uppercase tracking-widest">Lively Tip</span>
                </div>
                <p className="text-xs text-foreground">
                  {posture.shoulders_raised 
                    ? "Try to drop your shoulders and keep them still; let's release that tension and breathe deep."
                    : "Sit up a little taller; it will help the air flow more easily."}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};