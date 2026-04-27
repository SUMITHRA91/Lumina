import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export type EmotionScores = {
  happy: number;
  sad: number;
  angry: number;
  surprised: number;
  fearful: number;
  disgusted: number;
  neutral: number;
};

const EMPTY: EmotionScores = {
  happy: 0, sad: 0, angry: 0, surprised: 0, fearful: 0, disgusted: 0, neutral: 0,
};

const API_URL = "http://localhost:8000/api/detect-emotion/";

export type PostureFeedback = {
  shoulders_raised: boolean;
  leaning_forward: boolean;
  detected: boolean;
};

const EMPTY_POSTURE: PostureFeedback = {
  shoulders_raised: false,
  leaning_forward: false,
  detected: false,
};

export function useEmotionDetection(videoRef: RefObject<HTMLVideoElement>, active: boolean) {
  const [scores, setScores] = useState<EmotionScores>(EMPTY);
  const [posture, setPosture] = useState<PostureFeedback>(EMPTY_POSTURE);
  const [ready, setReady] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Temporal Buffer for Emotional Smoothing
  const bufferRef = useRef<EmotionScores[]>([]);
  const BUFFER_SIZE = 3;

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, [videoRef]);

  const tick = useCallback(async () => {
    if (!active) return;
    
    const frame = captureFrame();
    if (!frame) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frame }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      
      if (data.posture) {
        setPosture(data.posture);
      }
      
      if (data.scores) {
        const s = data.scores;
        const newScore: EmotionScores = {
          happy: s.happy || 0,
          sad: s.sad || 0,
          angry: s.angry || 0,
          surprised: s.surprise || 0,
          fearful: s.fearful || 0,
          disgusted: s.disgust || 0,
          neutral: s.neutral || 0,
        };

        // Update Buffer
        bufferRef.current.push(newScore);
        if (bufferRef.current.length > BUFFER_SIZE) {
          bufferRef.current.shift();
        }

        // Calculate Average (Smoothing)
        const averaged: EmotionScores = { ...EMPTY };
        const len = bufferRef.current.length;
        bufferRef.current.forEach(item => {
          (Object.keys(item) as (keyof EmotionScores)[]).forEach(k => {
            averaged[k] += item[k] / len;
          });
        });

        setScores(averaged);
        setFaceDetected(true);
      } else {
        setFaceDetected(false);
      }
    } catch (e) {
      console.error("Failed to detect emotion:", e);
    }
  }, [active, captureFrame]);

  useEffect(() => {
    if (!active) return;
    // Tick every 1 second (backend processing takes some time)
    intervalRef.current = window.setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [active, tick]);

  return { scores, posture, ready, error, faceDetected };
}

export const dominantEmotion = (s: EmotionScores): keyof EmotionScores => {
  if (!s || typeof s !== 'object') return "neutral";
  return (Object.keys(s) as (keyof EmotionScores)[]).reduce((a, b) => (s[a] >= s[b] ? a : b), "neutral");
};

export const distressScore = (s: EmotionScores) =>
  Math.min(1, s.sad * 0.6 + s.fearful * 0.25 + s.angry * 0.15);