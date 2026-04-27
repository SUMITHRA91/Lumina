import { useEffect, useRef, useState, useCallback } from "react";
import { PoseLandmarker, FilesetResolver, type PoseLandmarkerResult } from "@mediapipe/tasks-vision";

export type PoseData = {
  results: PoseLandmarkerResult | null;
  alignmentScores: {
    rightArm: number;
    leftArm: number;
    rightLeg: number;
    leftLeg: number;
    torso: number;
  };
  feedback: string[];
  breathingRate: number; // Placeholder for biofeedback
};

export function usePoseDetection(videoRef: React.RefObject<HTMLVideoElement>, active: boolean) {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [poseData, setPoseData] = useState<PoseData>({
    results: null,
    alignmentScores: { rightArm: 1, leftArm: 1, rightLeg: 1, leftLeg: 1, torso: 1 },
    feedback: [],
    breathingRate: 0,
  });
  const requestRef = useRef<number>();
  const lastVideoTimeRef = useRef<number>(-1);

  // Initialize Landmarker
  useEffect(() => {
    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });
      setPoseLandmarker(landmarker);
    };
    init();
  }, []);

  const detect = useCallback(() => {
    if (!active || !poseLandmarker || !videoRef.current) return;

    const video = videoRef.current;
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const startTimeMs = performance.now();
      const results = poseLandmarker.detectForVideo(video, startTimeMs);
      
      // Analyze Alignment (Example: Tree Pose logic)
      const feedback: string[] = [];
      const scores = { rightArm: 1, leftArm: 1, rightLeg: 1, leftLeg: 1, torso: 1 };
      
      if (results.landmarks && results.landmarks.length > 0) {
        const lm = results.landmarks[0];
        
        // Simple Tree Pose Check (Right foot on left knee)
        // Landmarks: 28 (right ankle), 25 (left knee)
        if (lm[28] && lm[25]) {
           const dist = Math.sqrt(Math.pow(lm[28].x - lm[25].x, 2) + Math.pow(lm[28].y - lm[25].y, 2));
           if (dist > 0.2) {
             feedback.push("Lift your right foot a bit higher toward your knee.");
             scores.rightLeg = 0.5;
           }
        }

        // Torso alignment (Shoulders 11, 12 and Hips 23, 24)
        if (lm[11] && lm[12]) {
           const shoulderTilt = Math.abs(lm[11].y - lm[12].y);
           if (shoulderTilt > 0.05) {
             feedback.push("Level your shoulders for better balance.");
             scores.torso = 0.6;
           }
        }
      }

      setPoseData(prev => ({
        ...prev,
        results,
        alignmentScores: scores,
        feedback
      }));
    }
    requestRef.current = requestAnimationFrame(detect);
  }, [active, poseLandmarker, videoRef]);

  useEffect(() => {
    if (active && poseLandmarker) {
      requestRef.current = requestAnimationFrame(detect);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [active, poseLandmarker, detect]);

  return poseData;
}
