/**
 * src/utils/mediapipe.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Real browser-side MediaPipe Face Landmarker integration.
 *
 * Replaces all fake/heuristic eye-contact and head-pose logic.
 *
 * Features:
 *  - Eye Contact Percentage
 *  - Face Detection / Face Presence Monitoring
 *  - Looking Away Detection
 *  - Head Pose Estimation (yaw, pitch, roll)
 *  - Head Stability Score
 */

// MediaPipe CDN (loaded lazily via dynamic import in browser)
const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FaceLandmarkResult {
  /** Is a face currently detected in frame? */
  faceDetected: boolean;
  /** Eye contact score (0–100). 100 = looking directly at camera. */
  eyeContactScore: number;
  /** Is the user clearly looking away? */
  lookingAway: boolean;
  /** Estimated head yaw in degrees (left/right rotation). */
  headYaw: number;
  /** Estimated head pitch in degrees (up/down tilt). */
  headPitch: number;
  /** Estimated head roll in degrees (side tilt). */
  headRoll: number;
}

export interface TrackingSession {
  /** Running eye-contact percentage across all frames (0–100). */
  eyeContactPercentage: number;
  /** Fraction of time a face was present (0–1). */
  facePresenceRatio: number;
  /** Head stability score (0–100). 100 = perfectly still. */
  headStabilityScore: number;
  /** Total frames analyzed. */
  totalFrames: number;
  /** Frames where face was detected. */
  faceFrames: number;
  /** Frames counted as good eye contact. */
  eyeContactFrames: number;
}

// ─── MediaPipe Loader (lazy, singleton) ──────────────────────────────────────

let _faceLandmarker: any = null;
let _loadPromise: Promise<any> | null = null;

export async function loadFaceLandmarker(): Promise<any> {
  if (_faceLandmarker) return _faceLandmarker;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    // Dynamic import of MediaPipe from CDN
    const { FaceLandmarker, FilesetResolver } = await import(
      /* @vite-ignore */
      `${MEDIAPIPE_CDN}/vision_bundle.js`
    );

    const filesetResolver = await FilesetResolver.forVisionTasks(
      `${MEDIAPIPE_CDN}/wasm`
    );

    _faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `${MEDIAPIPE_CDN}/models/face_landmarker.task`,
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
    });

    console.log('[MediaPipe] FaceLandmarker loaded successfully.');
    return _faceLandmarker;
  })();

  return _loadPromise;
}

// ─── Core Detection ───────────────────────────────────────────────────────────

/**
 * Analyze a single video frame for facial landmarks.
 * @param video - HTMLVideoElement that is actively streaming.
 * @param timestampMs - Performance.now() timestamp for this frame.
 */
export function detectFaceLandmarks(video: HTMLVideoElement, timestampMs: number): FaceLandmarkResult {
  const EMPTY: FaceLandmarkResult = {
    faceDetected: false,
    eyeContactScore: 0,
    lookingAway: true,
    headYaw: 0,
    headPitch: 0,
    headRoll: 0,
  };

  if (!_faceLandmarker || !video || video.readyState < 2) return EMPTY;

  try {
    const results = _faceLandmarker.detectForVideo(video, timestampMs);
    if (!results?.faceLandmarks?.length) return EMPTY;

    const landmarks = results.faceLandmarks[0];
    const matrix = results.facialTransformationMatrixes?.[0]?.data;

    // ── Head Pose from transformation matrix ──
    let yaw = 0, pitch = 0, roll = 0;
    if (matrix) {
      // Extract Euler angles from 4×4 column-major matrix
      // Rotation sub-matrix is top-left 3×3
      const r00 = matrix[0], r10 = matrix[1], r20 = matrix[2];
      const r21 = matrix[6], r22 = matrix[10];
      pitch = Math.atan2(-r20, Math.sqrt(r00 * r00 + r10 * r10)) * (180 / Math.PI);
      yaw   = Math.atan2(r10, r00) * (180 / Math.PI);
      roll  = Math.atan2(r21, r22) * (180 / Math.PI);
    } else {
      // Fallback: estimate from nose/chin landmarks
      const nose = landmarks[1];   // nose tip
      const chin = landmarks[152]; // chin
      if (nose && chin) {
        yaw   = (nose.x - 0.5) * 90;
        pitch = (nose.y - chin.y) * 60 - 5;
      }
    }

    // ── Eye Contact Score ──
    // Looking straight at camera: |yaw| < 15°, |pitch| < 15°
    const absYaw   = Math.abs(yaw);
    const absPitch = Math.abs(pitch);

    let eyeContact = 100;
    if (absYaw > 15)  eyeContact -= Math.min((absYaw - 15)  * 3, 60);
    if (absPitch > 15) eyeContact -= Math.min((absPitch - 15) * 2, 40);
    eyeContact = Math.max(0, Math.round(eyeContact));

    // ── Looking Away ──
    const lookingAway = absYaw > 25 || absPitch > 25;

    return {
      faceDetected: true,
      eyeContactScore: eyeContact,
      lookingAway,
      headYaw: Math.round(yaw),
      headPitch: Math.round(pitch),
      headRoll: Math.round(roll),
    };
  } catch (err) {
    console.warn('[MediaPipe] Frame detection error:', err);
    return EMPTY;
  }
}

// ─── Session Aggregator ───────────────────────────────────────────────────────

/**
 * Creates a tracking session accumulator.
 * Call update() each frame, then read() to get aggregated stats.
 */
export function createTrackingSession(): {
  update: (frame: FaceLandmarkResult) => void;
  read: () => TrackingSession;
  reset: () => void;
} {
  let totalFrames = 0;
  let faceFrames = 0;
  let eyeContactFrames = 0;
  let eyeContactSum = 0;

  // For stability: track rolling window of yaw/pitch
  const yawHistory: number[] = [];
  const pitchHistory: number[] = [];
  const WINDOW = 30;

  function update(frame: FaceLandmarkResult) {
    totalFrames++;
    if (!frame.faceDetected) return;

    faceFrames++;
    eyeContactSum += frame.eyeContactScore;
    if (frame.eyeContactScore >= 50) eyeContactFrames++;

    yawHistory.push(frame.headYaw);
    pitchHistory.push(frame.headPitch);
    if (yawHistory.length > WINDOW)   yawHistory.shift();
    if (pitchHistory.length > WINDOW) pitchHistory.shift();
  }

  function read(): TrackingSession {
    if (totalFrames === 0) {
      return {
        eyeContactPercentage: 0,
        facePresenceRatio: 0,
        headStabilityScore: 0,
        totalFrames: 0,
        faceFrames: 0,
        eyeContactFrames: 0,
      };
    }

    // Eye contact percentage over face-present frames
    const eyeContactPercentage =
      faceFrames > 0 ? Math.round(eyeContactSum / faceFrames) : 0;

    // Face presence ratio
    const facePresenceRatio = faceFrames / totalFrames;

    // Head stability: low std-dev of yaw + pitch = high stability
    const stdDev = (arr: number[]) => {
      if (arr.length < 2) return 0;
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const variance = arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length;
      return Math.sqrt(variance);
    };

    const yawStd   = stdDev(yawHistory);
    const pitchStd = stdDev(pitchHistory);
    const avgStd   = (yawStd + pitchStd) / 2;
    // Map avg std 0 → 100 score, std ≥ 20 → 0 score
    const headStabilityScore = Math.round(Math.max(0, 100 - avgStd * 5));

    return {
      eyeContactPercentage,
      facePresenceRatio,
      headStabilityScore,
      totalFrames,
      faceFrames,
      eyeContactFrames,
    };
  }

  function reset() {
    totalFrames = 0;
    faceFrames = 0;
    eyeContactFrames = 0;
    eyeContactSum = 0;
    yawHistory.length = 0;
    pitchHistory.length = 0;
  }

  return { update, read, reset };
}
