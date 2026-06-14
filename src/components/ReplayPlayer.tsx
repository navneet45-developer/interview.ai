/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, Users, Brain, Activity, Clock, ShieldCheck, Heart, AlertTriangle, ArrowLeft, Send, CheckSquare, Sparkles } from 'lucide-react';
import { Report } from '../types';

interface ReplayPlayerProps {
  report: Report;
  onBack: () => void;
}

export default function ReplayPlayer({ report, onBack }: ReplayPlayerProps) {
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeAnswer = report.answers[selectedAnswerIdx] || report.answers[0];

  // Helper score badges
  const renderRadialGauge = (label: string, score: number, max: number, subLabel: string, color: string) => {
    const percentage = Math.round((score / max) * 100);
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-xs flex flex-col justify-between h-full" id={`replay-gauge-${label.toLowerCase().replace(' ', '-')}`}>
        <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1">{label}</span>
        
        <div className="relative h-16 w-16 mx-auto my-2 flex items-center justify-center">
          {/* Custom SVG Radial Ring */}
          <svg className="absolute inset-0 h-full w-full transform -rotate-90">
            <circle 
              cx="32" 
              cy="32" 
              r="26" 
              className="stroke-slate-100 fill-none" 
              strokeWidth="5" 
            />
            <circle 
              cx="32" 
              cy="32" 
              r="26" 
              className={`fill-none ${color}`} 
              strokeWidth="5" 
              strokeDasharray="163" 
              strokeDashoffset={163 - (163 * percentage) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center">
            <span className="text-lg font-extrabold text-slate-800">{score}</span>
            <span className="text-[9px] text-slate-400 block -mt-1">/ {max}</span>
          </div>
        </div>

        <span className="text-[9px] font-bold text-slate-500 block mt-1 leading-normal font-sans">{subLabel}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in font-sans" id="replay-viewer-root">
      {/* Upper navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold bg-blue-50 border border-blue-100 px-2.5 py-1 rounded cursor-pointer transition-colors mb-1.5 uppercase font-mono"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </button>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">AI Interview Performance Evaluation & Replay</h2>
          <p className="text-[11px] text-slate-500">Position target: {report.role} • Level: {report.difficulty} difficulty</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 shrink-0 self-start sm:self-center">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-mono text-[10px]">EVALUATION SECURED ON {new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Numerical score gauges row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" id="score-gauges-row">
        {renderRadialGauge("Technical Knowledge", report.technicalScore, 10, "Accuracy of core stack", "stroke-emerald-500")}
        {renderRadialGauge("Communication Flow", report.communicationScore, 10, "Coherence and phrasing", "stroke-blue-500")}
        {renderRadialGauge("Confidence Level", report.confidenceScore, 10, "Tempo and hesitations", "stroke-amber-500")}
        {renderRadialGauge("Eye Contact Gaze", report.eyeContactScore, 100, "Visual focus stability", "stroke-purple-500")}
      </div>

      {/* Video replay alongside interactive transcript synchronization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="audio-video-transcription-studio">
        {/* Visual player loop simulation */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-slate-950 aspect-video rounded overflow-x-hidden relative shadow-sm border border-slate-900 flex flex-col justify-end p-3.5">
            {/* Visual simulation of high-fidelity facial focus contours */}
            <div className={`absolute inset-0 bg-radial-gradient flex items-center justify-center transition-all ${isPlaying ? 'bg-slate-900/40' : 'bg-slate-900/95'}`}>
              <div className="relative flex items-center justify-center h-20 w-20 border border-white/10 rounded-full animate-spin duration-10000">
                <div className="absolute top-0 left-0 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <div className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-blue-400" />
                <Users className="h-8 w-8 text-white/30 transform -rotate-45" />
              </div>
            </div>

            {isPlaying && (
              <div className="absolute inset-x-3 top-3 flex items-center justify-between z-10 animate-fade-in text-[9px] text-white font-mono">
                <div className="bg-black/60 px-2 py-0.5 rounded-sm flex items-center gap-1 border border-white/10">
                  <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping" />
                  REPLAYING AUDIO LOGS
                </div>
                <div className="bg-blue-600/80 px-2 py-0.5 rounded-sm">
                  Posture Gaze: {report.eyeContactScore}%
                </div>
              </div>
            )}

            <div className="z-10 bg-black/60 backdrop-blur-xs p-2.5 rounded border border-white/15 flex items-center justify-between">
              <div>
                <span className="block text-[8px] text-blue-300 uppercase font-mono font-bold">REPLAY PLAYER</span>
                <span className="text-xs text-white font-bold block truncate max-w-[120px]">{report.role} Mock</span>
              </div>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white hover:bg-slate-100 text-slate-900 px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                id="replay-video-toggle"
              >
                {isPlaying ? "Pause Logs" : "Play Logs"}
              </button>
            </div>
          </div>

          {/* Temporal Speech Rate metrics */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Activity className="h-4 w-4 text-blue-600" /> Speech Rate Analytics
            </h4>

            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400 font-mono">Talking Length</span>
                <span className="block text-lg font-extrabold text-slate-800 mt-0.5 font-mono">{report.metrics.duration}s</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400 font-mono">Average Tempo</span>
                <span className="block text-lg font-extrabold text-slate-800 mt-0.5 font-mono">{report.metrics.wpm} WPM</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-0.5">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pacing Meter</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-mono text-slate-400">Slow</span>
                  <div className="flex-1 bg-slate-100 h-2.5 rounded relative border border-slate-200/40">
                    <div className="absolute bg-emerald-400 h-full" style={{ left: '30%', right: '30%' }} title="Target Bounds (110-150)" />
                    <div 
                      className="absolute h-3.5 w-3.5 bg-blue-650 rounded-full top-1/2 -mt-1.75 shadow border border-white" 
                      style={{ left: `${Math.max(10, Math.min(90, (report.metrics.wpm / 200) * 100))}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">Fast</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded p-2.5 text-[10px] text-blue-800 leading-normal font-medium">
                {report.metrics.wpm >= 110 && report.metrics.wpm <= 150 ? (
                  <p>✓ <strong>Optimal pace detected.</strong> Speeches align flawlessly within standard comfort ranges for professional candidate assessments.</p>
                ) : (
                  <p>⚠️ <strong>Uneven pacing notes.</strong> Speech tempo fluctuates from recommended parameters. Slow down and adopt pausing intervals.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Syncronized transcripts viewer */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase font-mono">
              <Brain className="h-4 w-4 text-blue-600" /> Speech Logs & Transcripts
            </h3>
            <p className="text-xs text-slate-500 leading-normal font-medium">Select each formulated mock question answer synchronously to view hesitation telemetry details below:</p>

            {/* Questions Tabs */}
            <div className="flex space-x-1 p-0.5 bg-slate-50 border border-slate-200 rounded shrink-0 overflow-x-auto">
              {report.answers.map((ans, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswerIdx(idx)}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded transition-all cursor-pointer whitespace-nowrap ${selectedAnswerIdx === idx ? 'bg-blue-600 shadow-xs text-white font-mono' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                  id={`replay-tab-q-${idx}`}
                >
                  Question {idx + 1}
                </button>
              ))}
            </div>

            {/* Answer Display Card */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-3 animate-fade-in" id={`replay-display-card-${selectedAnswerIdx}`}>
              <div className="border-l-2 border-blue-500 pl-2.5">
                <span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider font-mono">Examining Question:</span>
                <p className="text-xs font-bold text-slate-800 leading-normal mt-0.5">{activeAnswer.questionText}</p>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Recorded Answer Speech Transcript:</span>
                <p className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded p-2.5 leading-relaxed mt-1 italic">
                  "{activeAnswer.transcript}"
                </p>
              </div>

              {/* Specific Question evaluation indices */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-0.5">
                <div className="bg-white border border-slate-200 rounded p-2.5">
                  <span className="block text-[8px] uppercase font-bold text-slate-400 font-mono">Grades Score</span>
                  <span className="block text-xs font-extrabold text-emerald-600 mt-0.5">{activeAnswer.score} / 10</span>
                </div>
                <div className="bg-white border border-slate-200 rounded p-2.5">
                  <span className="block text-[8px] uppercase font-bold text-slate-400 font-mono">Metric Rate</span>
                  <span className="block text-xs font-extrabold text-blue-600 mt-0.5">{activeAnswer.wpm} words</span>
                </div>
                <div className="bg-white border border-slate-200 rounded p-2.5">
                  <span className="block text-[8px] uppercase font-bold text-slate-400 font-mono">Gaze Stability</span>
                  <span className="block text-xs font-extrabold text-purple-600 mt-0.5">{activeAnswer.eyeContact}% center</span>
                </div>
                <div className="bg-white border border-slate-200 rounded p-2.5">
                  <span className="block text-[8px] uppercase font-bold text-slate-400 font-mono">Fluency Rate</span>
                  <span className="block text-xs font-extrabold text-amber-600 mt-0.5">{activeAnswer.confidence} / 10</span>
                </div>
              </div>

              {/* Word crutch specific triggers */}
              <div className="bg-white border border-slate-200 rounded p-2.5">
                <span className="block text-[8px] uppercase font-bold text-slate-400 font-mono mb-2">Crutch Words Hit (Speech Transcript)</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeAnswer.fillerWords).map(([word, hits]) => (
                    <span 
                      key={word} 
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${hits > 0 ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 font-medium'}`}
                    >
                      "{word}": <strong>{hits}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Specific answer review opinion */}
              <div className="bg-white border border-slate-200 rounded p-3 leading-normal">
                <span className="text-[8px] uppercase font-bold text-slate-400 font-mono block mb-1">AI Assessor Review Opinion</span>
                <p className="text-xs font-semibold text-slate-700">{activeAnswer.feedbackReview}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categorized AI Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="strengths-weaknesses-comparison">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-emerald-700 flex items-center gap-1.5 font-mono">
            <Heart className="h-4 w-4 text-emerald-600" /> Top Identified Strengths
          </h3>
          <ul className="space-y-2">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="flex gap-2 text-xs text-slate-700 leading-normal font-semibold bg-emerald-50/50 p-2.5 rounded border border-emerald-100">
                <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-red-700 flex items-center gap-1.5 font-mono">
            <AlertTriangle className="h-4 w-4 text-red-600" /> Delivery & Technical Gaps
          </h3>
          <ul className="space-y-2">
            {report.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex gap-2 text-xs text-slate-700 leading-normal font-semibold bg-red-50/50 p-2.5 rounded border border-red-100">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Step-by-Step Personalized Action Plan / Roadmap */}
      <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 shadow-sm relative overflow-x-hidden" id="career-improvement-plan">
        <div className="absolute right-0 bottom-0 bg-blue-600/5 h-44 w-44 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-650 text-white rounded p-1">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-bold tracking-tight uppercase font-mono">Personalized Career Improvement Roadmap</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-medium">
            This study plan has been custom compiled by our Gemini pipeline matching your transcript answers with best-practice engineering standards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {report.suggestions.map((sug, idx) => (
              <div key={idx} className="bg-white/[0.03] border border-white/5 rounded p-3.5 flex gap-3.5 items-start">
                <div className="bg-blue-600 text-white font-mono h-5 w-5 shrink-0 rounded flex items-center justify-center font-bold text-xs mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block font-mono">Action Task {idx + 1}</span>
                  <p className="text-xs text-slate-300 font-semibold leading-normal">{sug}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
