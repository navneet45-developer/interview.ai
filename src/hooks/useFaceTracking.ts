/**
 * src/hooks/useFaceTracking.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * React hook that wraps MediaPipe FaceLandmarker for live face tracking
 * during interview sessions.
 *
 * Usage:
 *   const { stats, currentFrame, isReady, start, stop } = useFaceTracking(videoRef);
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  loadFaceLandmarker,
  detectFaceLandmarks,
  createTrackingSession,
  type FaceLandmarkResult,
  type TrackingSession,
} from '../utils/mediapipe';

export interface FaceTrackingState {
  /** Current single-frame analysis result */
  currentFrame: FaceLandmarkResult;
  /** Aggregated session statistics */
  stats: TrackingSession;
  /** True once MediaPipe model has loaded */
  isReady: boolean;
  /** True while tracking loop is running */
  isTracking: boolean;
  /** Any load/runtime error message */
  error: string | null;
}

const DEFAULT_FRAME: FaceLandmarkResult = {
  faceDetected: false,
  eyeContactScore: 0,
  lookingAway: true,
  headYaw: 0,
  headPitch: 0,
  headRoll: 0,
};

const DEFAULT_STATS: TrackingSession = {
  eyeContactPercentage: 0,
  facePresenceRatio: 0,
  headStabilityScore: 0,
  totalFrames: 0,
  faceFrames: 0,
  eyeContactFrames: 0,
};

export function useFaceTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<FaceTrackingState>({
    currentFrame: DEFAULT_FRAME,
    stats: DEFAULT_STATS,
    isReady: false,
    isTracking: false,
    error: null,
  });

  const sessionRef   = useRef(createTrackingSession());
  const rafRef       = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  // ── Load MediaPipe on mount ──
  useEffect(() => {
    loadFaceLandmarker()
      .then(() => {
        setState(prev => ({ ...prev, isReady: true }));
      })
      .catch((err: any) => {
        const msg = String(err?.message || 'Failed to load MediaPipe FaceLandmarker');
        console.warn('[useFaceTracking] Load error:', msg);
        setState(prev => ({ ...prev, error: msg }));
      });

    return () => {
      stop();
    };
  }, []);

  // ── Frame loop ──
  const frameLoop = useCallback(() => {
    if (!isRunningRef.current) return;
    const video = videoRef.current;

    if (video && video.readyState >= 2) {
      const frame = detectFaceLandmarks(video, performance.now());
      sessionRef.current.update(frame);

      const stats = sessionRef.current.read();
      setState(prev => ({
        ...prev,
        currentFrame: frame,
        stats,
      }));
    }

    rafRef.current = requestAnimationFrame(frameLoop);
  }, [videoRef]);

  // ── Public API ──
  const start = useCallback(() => {
    if (isRunningRef.current) return;
    sessionRef.current.reset();
    isRunningRef.current = true;
    setState(prev => ({ ...prev, isTracking: true }));
    rafRef.current = requestAnimationFrame(frameLoop);
  }, [frameLoop]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setState(prev => ({ ...prev, isTracking: false }));
  }, []);

  const reset = useCallback(() => {
    sessionRef.current.reset();
    setState(prev => ({
      ...prev,
      currentFrame: DEFAULT_FRAME,
      stats: DEFAULT_STATS,
    }));
  }, []);

  return { ...state, start, stop, reset };
}
