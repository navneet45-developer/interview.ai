/**
 * src/components/InterviewerSession.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Refactored with real MediaPipe face tracking replacing fake heuristics.
 * All original functionality preserved.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, Volume2, Mic, CheckCircle2, Loader2, ArrowRight,
  Video, Play, StopCircle, AlertTriangle,
} from 'lucide-react';
import { AnswerDetail } from '../types';
import FaceTracker from './FaceTracker';
import { useFaceTracking, type TrackingSession } from '../hooks/useFaceTracking.ts';

interface InterviewerSessionProps {
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  resumeId?: string;
  recruiterRole?: string;
  onSessionComplete: (report: any) => void;
  onCancel: () => void;
}

export default function InterviewerSession({
  role, difficulty, resumeId, recruiterRole, onSessionComplete, onCancel,
}: InterviewerSessionProps) {
  const [stage, setStage] = useState<'generating' | 'ready' | 'interview' | 'submitting'>('generating');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState('');

  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [wordCount, setWordCount] = useState(0);

  // Video
  const videoRef    = useRef<HTMLVideoElement | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const timerRef    = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // ── Real face tracking (replaces fake logic) ──
  const faceTracking = useFaceTracking(videoRef);
  const [sessionTrackingStats, setSessionTrackingStats] = useState<TrackingSession | null>(null);

  const handleTrackingStats = useCallback((stats: TrackingSession) => {
    setSessionTrackingStats(stats);
  }, []);

  // ── Bootstrap ──
  useEffect(() => {
    generateAIQuestions();
    return () => {
      stopRecordingMechanisms();
      stopWebcam();
      faceTracking.stop();
    };
  }, []);

  // ── Speech recognition ──
  const initSpeechRecognition = () => {
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechClass) return;
    const recog = new SpeechClass();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-US';
    recog.onresult = (e: any) => {
      let finalStr = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) finalStr += e.results[i][0].transcript + ' ';
      }
      if (finalStr) {
        setTranscript(prev => {
          const a = prev + finalStr;
          setWordCount(a.trim().split(/\s+/).filter(Boolean).length);
          return a;
        });
      }
    };
    recog.onerror = (err: any) => console.warn('Speech recognition error (ignored):', err);
    recognitionRef.current = recog;
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) { console.warn('Camera unavailable:', e); }
  };

  const stopWebcam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const generateAIQuestions = async () => {
    setLoading(true); setErrorCode('');
    try {
      const token = localStorage.getItem('interview_token');
      const res = await fetch('/api/interviews/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role, difficulty, resumeId, recruiterRole }),
      });
      if (!res.headers.get('content-type')?.includes('application/json'))
        throw new Error('Server returned non-JSON response.');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error.');
      if (data.questions?.length > 0) {
        setQuestions(data.questions);
        setStage('ready');
        initSpeechRecognition();
        await startWebcam();
      } else throw new Error('No questions returned.');
    } catch (e: any) {
      setErrorCode(e.message || 'Unable to generate questions.');
    } finally { setLoading(false); }
  };

  const handleStartInterviewMode = () => {
    setStage('interview');
    setCurrentIdx(0); setAnswers([]); setTranscript(''); setDuration(0);
    faceTracking.reset();
    faceTracking.start(); // ← start real tracking
    setTimeout(() => speakQuestion(questions[0]), 500);
  };

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
    }
  };

  const stopRecordingMechanisms = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    try { recognitionRef.current?.stop(); } catch {}
    setIsRecording(false);
  };

  const startActiveRecording = () => {
    setTranscript(''); setWordCount(0); setDuration(0); setIsRecording(true);
    timerRef.current = setInterval(() => setDuration(p => p + 1), 1000);
    try { recognitionRef.current?.start(); } catch (e) { console.error('Speech start failed:', e); }
  };

  const stopActiveRecording = () => stopRecordingMechanisms();

  const handleNextOrSubmit = async () => {
    if (!transcript.trim()) {
      alert('Please provide an answer transcript first.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('interview_token');
      const res = await fetch('/api/answers/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questionText: questions[currentIdx], transcript, duration }),
      });
      if (!res.headers.get('content-type')?.includes('application/json'))
        throw new Error('Non-JSON server response.');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed.');

      // ── Use REAL face tracking score, fall back to AI estimate ──
      const realEyeContact = sessionTrackingStats && sessionTrackingStats.totalFrames > 30
        ? sessionTrackingStats.eyeContactPercentage
        : data.answer.eyeContact;

      const answerDetail: AnswerDetail = {
        questionId:    `q_${currentIdx + 1}`,
        questionText:  questions[currentIdx],
        transcript,
        score:         data.answer.score,
        feedbackReview:data.answer.feedbackReview,
        fillerWords:   data.answer.fillerWords,
        wpm:           data.answer.wpm,
        duration:      data.answer.duration,
        confidence:    data.answer.confidence,
        eyeContact:    realEyeContact, // ← real MediaPipe value
      };

      const newAnswers = [...answers, answerDetail];
      setAnswers(newAnswers);
      stopRecordingMechanisms();

      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(p => p + 1);
        setTranscript(''); setWordCount(0); setDuration(0);
        faceTracking.reset(); // reset per-question tracking
        setTimeout(() => speakQuestion(questions[currentIdx + 1]), 300);
      } else {
        faceTracking.stop();
        await compileFullFeedbackReport(newAnswers);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to analyze answer.');
    } finally { setLoading(false); }
  };

  const compileFullFeedbackReport = async (finalAnswers: AnswerDetail[]) => {
    setStage('submitting');
    try {
      const token = localStorage.getItem('interview_token');
      const res = await fetch('/api/interviews/complete-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role, difficulty, questions, answers: finalAnswers, recruiterRole }),
      });
      if (!res.headers.get('content-type')?.includes('application/json'))
        throw new Error('Non-JSON completion response.');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Session failure.');
      stopWebcam();
      onSessionComplete(data.report);
    } catch (e: any) {
      alert(e.message || 'Unable to compile feedback. Please retry.');
      setStage('interview');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs max-w-4xl mx-auto font-sans" id="interviewer-session-root">

      {/* 1. GENERATING */}
      {stage === 'generating' && (
        <div className="py-12 text-center space-y-4" id="session-generating-stage">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight font-mono">Synthesizing Target Questions Plan</h3>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto font-medium">
              Formulating professional challenges for <strong>{role}</strong> at <strong>{difficulty}</strong> level.
            </p>
          </div>
          {errorCode && (
            <div className="bg-red-50 text-red-700 p-3.5 border border-red-200 rounded text-xs max-w-md mx-auto">
              <span className="block font-bold">Generation failed</span>
              <p className="mt-1">{errorCode}</p>
              <button onClick={generateAIQuestions} className="mt-2.5 bg-red-600 text-white font-bold py-1 px-3 rounded hover:bg-red-700 text-[10px]">
                Retry Question Set
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. READY */}
      {stage === 'ready' && (
        <div className="space-y-4 animate-fade-in" id="session-ready-stage">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Confirm AI Test Framework Configuration</h2>
              <p className="text-[11px] text-slate-500 font-medium">{role} • {difficulty} level</p>
            </div>
            <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Camera preview */}
            <div className="bg-slate-900 rounded overflow-x-hidden relative aspect-video flex flex-col justify-between p-3.5 shadow-inner border border-slate-800">
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover scale-x-[-1]" />
              <div className="z-10 bg-slate-900/70 backdrop-blur-xs px-2 py-1 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/20 mr-auto flex items-center gap-1.5 animate-pulse">
                <Video className="h-3 w-3" /> VIDEO FEED ESTABLISHED
              </div>
              {/* Real-time tracking badge */}
              <div className="z-10 absolute top-2 right-2">
                <FaceTracker videoRef={videoRef} isActive={false} compact />
              </div>
              <div className="z-10 bg-slate-900/90 text-white p-3 rounded border border-slate-800 leading-normal">
                <h4 className="text-xs font-bold text-slate-100 font-mono">MediaPipe Facial Tracking Ready</h4>
                <p className="text-[10px] text-slate-400 mt-1">Real eye-contact and head-pose data will be captured during your session.</p>
              </div>
            </div>

            {/* Questions outline */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Questions ({questions.length} items)
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {questions.map((q, idx) => (
                    <div key={idx} className="flex gap-1.5 text-xs">
                      <span className="font-mono text-blue-500 font-bold">Q{idx + 1}:</span>
                      <p className="text-slate-700 font-semibold leading-normal">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] text-slate-400 leading-normal font-medium">
                  Speech recognition and MediaPipe tracking require browser permissions.
                </p>
                <button
                  onClick={handleStartInterviewMode}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase font-mono tracking-wider"
                  id="launch-ready-session"
                >
                  <Play className="h-4 w-4 fill-current" /> Begin Attempt Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTERVIEW */}
      {stage === 'interview' && (
        <div className="space-y-4 animate-fade-in" id="session-active-state">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest font-mono">Mock Interview in Progress</span>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase">Question {currentIdx + 1} of {questions.length}</h3>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 font-mono flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
              Timer: <strong>{duration}s</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Video + live tracker */}
            <div className="md:col-span-1 space-y-3">
              <div className="bg-slate-900 aspect-video rounded overflow-x-hidden relative shadow-sm border border-slate-800">
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover scale-x-[-1]" />
                {/* Compact badge overlay */}
                <div className="absolute top-2 left-2 z-10">
                  <FaceTracker
                    videoRef={videoRef}
                    isActive={stage === 'interview'}
                    onStats={handleTrackingStats}
                    compact
                  />
                </div>
              </div>

              {/* Full tracker panel */}
              <FaceTracker
                videoRef={videoRef}
                isActive={stage === 'interview'}
                onStats={handleTrackingStats}
              />

              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2.5">
                <button
                  onClick={() => speakQuestion(questions[currentIdx])}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold py-1.5 px-3 border border-slate-200 rounded text-xs flex items-center justify-center gap-1 cursor-pointer"
                  id="re-read-question-btn"
                >
                  <Volume2 className="h-3.5 w-3.5 text-blue-600" /> Read Aloud
                </button>
                <div className="text-[10px] text-slate-500 space-y-1 bg-white p-2.5 rounded border border-slate-200 font-medium">
                  <span className="font-bold text-slate-700 block uppercase text-[8px] font-mono mb-1">Guidelines:</span>
                  <p>1. Record your response aloud or type below.</p>
                  <p>2. Maintain camera eye contact for higher scores.</p>
                  <p>3. Minimize fillers like 'basically' or 'like'.</p>
                </div>
              </div>
            </div>

            {/* Question + transcript */}
            <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
              <div className="bg-slate-900 text-white rounded p-4 border border-slate-800">
                <span className="text-[8px] uppercase font-bold tracking-widest text-slate-400 font-mono">Question Statement</span>
                <p className="text-xs font-bold mt-1 leading-relaxed text-slate-100">{questions[currentIdx]}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Response Transcript</label>
                  <span className="text-[9px] text-slate-400 font-mono font-bold">{wordCount} words</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-3">
                  <textarea
                    value={transcript}
                    onChange={e => { setTranscript(e.target.value); setWordCount(e.target.value.trim().split(/\s+/).filter(Boolean).length); }}
                    placeholder="Click the mic to record or type your answer..."
                    className="w-full bg-white border border-slate-200 rounded p-2.5 text-xs text-slate-800 h-28 outline-hidden focus:border-blue-500 font-medium resize-none leading-normal"
                    id="transcript-input-area"
                  />
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={isRecording ? stopActiveRecording : startActiveRecording}
                      className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 transition-colors cursor-pointer ${isRecording ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      id="mic-record-toggle"
                    >
                      {isRecording ? <><StopCircle className="h-3.5 w-3.5 animate-pulse" /> Stop Recording</> : <><Mic className="h-3.5 w-3.5" /> Record</>}
                    </button>
                    <div className="text-[9px] text-slate-500 bg-white border border-slate-200 rounded py-0.5 px-2 font-mono font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                      <span>Workspace editor active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-200 mt-2">
                <button type="button" onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 font-bold" id="abandon-session-btn">
                  Abandon Attempt
                </button>
                <button
                  type="button"
                  onClick={handleNextOrSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 uppercase font-mono tracking-wider"
                  id="advance-question-btn"
                >
                  {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...</> : <>{currentIdx + 1 === questions.length ? 'Submit All Responses' : 'Next Question'} <ArrowRight className="h-3.5 w-3.5" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBMITTING */}
      {stage === 'submitting' && (
        <div className="py-16 text-center space-y-4" id="session-submitting-stage">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-800 font-mono">Assembling Career Analytics Sheet</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto font-medium">
              Compiling technical metrics, speech analysis, MediaPipe eye contact data, and generating your full evaluation report...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
