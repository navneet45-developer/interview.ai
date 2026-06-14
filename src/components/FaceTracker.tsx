/**
 * src/components/FaceTracker.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable overlay component that renders real-time MediaPipe face tracking
 * metrics over a video element during interview sessions.
 *
 * Props:
 *   videoRef   - ref to the <video> element being tracked
 *   isActive   - whether tracking should be running
 *   onStats    - optional callback fired each time stats update
 */

import React, { useEffect } from 'react';
import { Eye, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { useFaceTracking } from '../hooks/useFaceTracking.ts';

interface TrackingSession {
  totalFrames: number;
  eyeContactPercentage: number;
  headStabilityScore: number;
  facePresenceRatio: number;
}

interface FaceTrackerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  onStats?: (stats: TrackingSession) => void;
  compact?: boolean;
}

export default function FaceTracker({ videoRef, isActive, onStats, compact = false }: FaceTrackerProps) {
  const { currentFrame, stats, isReady, isTracking, error, start, stop } = useFaceTracking(videoRef);

  // Start/stop tracking when isActive changes
  useEffect(() => {
    if (isActive && isReady) {
      start();
    } else {
      stop();
    }
  }, [isActive, isReady, start, stop]);

  // Propagate stats upward
  useEffect(() => {
    if (onStats && isTracking) onStats(stats);
  }, [stats, isTracking, onStats]);

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1 text-[9px] text-amber-700 font-mono flex items-center gap-1">
        <AlertTriangle className="h-3 w-3 shrink-0" />
        <span>Face tracking unavailable</span>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="bg-slate-900/70 text-slate-400 px-2 py-1 rounded text-[9px] font-mono flex items-center gap-1 animate-pulse">
        <Activity className="h-3 w-3" />
        Loading tracker...
      </div>
    );
  }

  const eyeColor =
    currentFrame.eyeContactScore >= 70
      ? 'text-emerald-400'
      : currentFrame.eyeContactScore >= 40
      ? 'text-yellow-400'
      : 'text-red-400';

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-mono">
        <span className={`flex items-center gap-1 ${eyeColor}`}>
          <Eye className="h-3 w-3" />
          {currentFrame.eyeContactScore}%
        </span>
        {!currentFrame.faceDetected && (
          <span className="text-red-400 flex items-center gap-0.5 animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            No face
          </span>
        )}
        {currentFrame.lookingAway && currentFrame.faceDetected && (
          <span className="text-yellow-400">Looking away</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-700 rounded p-2.5 space-y-2 text-[10px] font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
          MediaPipe Tracker
        </span>
        <span className={`h-1.5 w-1.5 rounded-full ${isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
      </div>

      {/* Face detection status */}
      <div className="flex items-center gap-1.5">
        {currentFrame.faceDetected ? (
          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
        ) : (
          <AlertTriangle className="h-3 w-3 text-red-400 shrink-0 animate-pulse" />
        )}
        <span className={currentFrame.faceDetected ? 'text-emerald-300' : 'text-red-400'}>
          {currentFrame.faceDetected ? 'Face detected' : 'No face in frame'}
        </span>
      </div>

      {/* Eye contact */}
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span className="text-slate-400">Eye Contact</span>
          <span className={eyeColor}>{currentFrame.eyeContactScore}%</span>
        </div>
        <div className="bg-slate-700 rounded-full h-1.5 overflow-x-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              currentFrame.eyeContactScore >= 70
                ? 'bg-emerald-400'
                : currentFrame.eyeContactScore >= 40
                ? 'bg-yellow-400'
                : 'bg-red-400'
            }`}
            style={{ width: `${currentFrame.eyeContactScore}%` }}
          />
        </div>
      </div>

      {/* Head pose */}
      <div className="grid grid-cols-3 gap-1 text-center">
        <div className="bg-slate-800 rounded p-1">
          <div className="text-slate-500 text-[7px]">YAW</div>
          <div className="text-slate-200">{currentFrame.headYaw}°</div>
        </div>
        <div className="bg-slate-800 rounded p-1">
          <div className="text-slate-500 text-[7px]">PITCH</div>
          <div className="text-slate-200">{currentFrame.headPitch}°</div>
        </div>
        <div className="bg-slate-800 rounded p-1">
          <div className="text-slate-500 text-[7px]">ROLL</div>
          <div className="text-slate-200">{currentFrame.headRoll}°</div>
        </div>
      </div>

      {/* Session stats */}
      {stats.totalFrames > 10 && (
        <div className="border-t border-slate-700 pt-1.5 space-y-0.5">
          <div className="flex justify-between text-slate-400">
            <span>Session Eye Contact</span>
            <span className="text-white">{stats.eyeContactPercentage}%</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Head Stability</span>
            <span className="text-white">{stats.headStabilityScore}/100</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Face Presence</span>
            <span className="text-white">{Math.round(stats.facePresenceRatio * 100)}%</span>
          </div>
        </div>
      )}

      {/* Warning */}
      {currentFrame.lookingAway && currentFrame.faceDetected && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-1.5 flex items-center gap-1 text-yellow-300">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span className="text-[9px]">Look directly at your camera</span>
        </div>
      )}
    </div>
  );
}
