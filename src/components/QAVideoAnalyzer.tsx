import React, { useState } from 'react';
import { Upload, Star, Eye, MessageSquare, AlertTriangle, Play, CheckCircle, ChevronDown, Award, Lightbulb, UserCheck, Code } from 'lucide-react';

export default function QAVideoAnalyzer() {
  const [questionText, setQuestionText] = useState('Tell me about yourself');
  const [customQuestion, setCustomQuestion] = useState('');
  const [transcript, setTranscript] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const predefinedQuestions = [
    "Tell me about yourself",
    "Describe your B.Tech final year CSE major project architecture.",
    "Why should we choose MongoDB Atlas collections over standard file system DBs?",
    "Explain the critical differences between React Virtual DOM and the real browser DOM.",
    "How do you trace and eliminate connection memory leak limits under heavy client request loops?"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const executeQaAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) {
      setErrorText("Please write or paste your response text transcript first.");
      return;
    }

    setAnalyzing(true);
    setErrorText(null);

    const activeQuestion = questionText === "Custom Question" ? customQuestion : questionText;

    try {
      const token = localStorage.getItem('interview_token');
      const response = await fetch('/api/answers/analyze-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionText: activeQuestion || "Interview Question Answer",
          transcript,
          videoUrl: videoFile ? `https://mock-bucket.edu/${videoFile.name}` : "",
          duration: 45
        })
      });

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          setAnalysisResult(data.answer);
        } else {
          setErrorText(data.error || "NLP core evaluation failure.");
        }
      } else {
        setErrorText("NLP core evaluation failure: invalid response format from server.");
      }
    } catch (e) {
      setErrorText("Failed connecting to B.Tech single QA analysis service.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-5" id="qa-video-analyzer-root">
      <div>
        <h2 className="text-sm font-bold text-slate-800 tracking-tight uppercase flex items-center gap-1.5">
          <UserCheck className="h-4.5 w-4.5 text-blue-600" /> Question-Answer Video Analyzer
        </h2>
        <p className="text-[11px] text-slate-500">Record or submit a brief video answering a single question. Get targeted feedback on communications, counts of fillers, and a custom **AI Model Answer**</p>
      </div>

      {!analysisResult ? (
        <form onSubmit={executeQaAnalysis} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1">Target Interview Question</label>
              <select
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-hidden hover:border-slate-300 focus:border-blue-500 font-semibold"
              >
                {predefinedQuestions.map(q => (
                  <option key={q}>{q}</option>
                ))}
                <option>Custom Question</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1">Select Answer Video (Optional)</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="qa-video-input-tag"
              />
              <label
                htmlFor="qa-video-input-tag"
                className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded px-2.5 py-1.5 text-xs text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer font-bold border-dashed border-slate-300"
              >
                <Upload className="h-3.5 w-3.5" />
                {videoFile ? videoFile.name : "Select Video File"}
              </label>
            </div>
          </div>

          {questionText === "Custom Question" && (
            <div className="animate-fade-in">
              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1">Enter Custom Challenge Question</label>
              <input
                type="text"
                required
                placeholder="e.g. Compare SQL joins vs MongoDB document lookup aggregates..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1">Enter / Paste Spoken Transcript Response</label>
            <textarea
              required
              rows={4}
              placeholder="Type or paste your spoken answer script context here for thorough lexical analysis..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded p-2 text-xs outline-hidden transition-all font-sans font-medium leading-relaxed text-slate-800"
            />
          </div>

          {errorText && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-100">
              {errorText}
            </div>
          )}

          <button
            type="submit"
            disabled={analyzing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs uppercase font-extrabold py-2.5 rounded shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {analyzing ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Evaluating Single-Answer speech telemetry...
              </>
            ) : (
              "Submit Answer for Lexical Diagnostics"
            )}
          </button>
        </form>
      ) : (
        /* Single QA report card results */
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-blue-600 font-extrabold uppercase font-mono tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Single QA Evaluation Complete</span>
            <button
              onClick={() => { setAnalysisResult(null); setTranscript(''); }}
              className="text-[11px] text-blue-600 font-bold hover:underline"
            >
              Analyze Another Answer
            </button>
          </div>

          <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-800 shadow-sm space-y-1">
            <span className="text-[8px] text-slate-400 font-mono font-bold tracking-wide uppercase">Evaluated Challenge Question</span>
            <p className="text-xs font-black text-slate-100">{analysisResult.questionText}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
              <span className="block text-[8.5px] font-bold text-slate-400 uppercase font-mono">technical correct</span>
              <span className="block text-2xl font-black text-emerald-500 font-mono">{analysisResult.score}<strong className="text-slate-400 font-medium text-xs font-mono">/10</strong></span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
              <span className="block text-[8.5px] font-bold text-slate-400 uppercase font-mono">confidence rating</span>
              <span className="block text-2xl font-black text-blue-600 font-mono">{analysisResult.confidence}<strong className="text-slate-400 font-medium text-xs font-mono">/10</strong></span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
              <span className="block text-[8.5px] font-bold text-slate-400 uppercase font-mono">speech pace</span>
              <span className="block text-2xl font-black text-amber-500 font-mono">{analysisResult.wpm}<strong className="text-slate-400 font-medium text-[9px] font-mono"> WPM</strong></span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
              <span className="block text-[8.5px] font-bold text-slate-400 uppercase font-mono">attention tracking</span>
              <span className="block text-2xl font-black text-purple-600 font-mono">{analysisResult.eyeContact}<strong className="text-slate-400 font-medium text-xs font-mono">%</strong></span>
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-bold text-amber-800 uppercase font-mono flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" /> Verbal Filler Words Tracking Hits
            </h4>
            <div className="grid grid-cols-5 gap-2 text-center">
              {Object.entries(analysisResult.fillerWords).map(([word, hits]: any) => (
                <div key={word} className="bg-white border border-amber-100 rounded p-1.5">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase">"{word}"</span>
                  <span className={`text-xs font-mono font-bold ${hits > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{hits} hits</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase font-mono">
              <MessageSquare className="h-3.5 w-3.5 text-blue-600" /> AI Feedback Review
            </h4>
            <p className="text-[11px] text-slate-600 italic font-medium leading-relaxed">
              "{analysisResult.feedbackReview}"
            </p>
          </div>

          {/* AI Model answer proposed display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-12 w-12 bg-blue-600/5 rounded-full pointer-events-none blur-md" />
            <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5 uppercase font-mono">
              <Lightbulb className="h-4.5 w-4.5 text-amber-500 fill-amber-300 animate-bounce" /> Proposed Improved AI Model Answer
            </h4>
            <p className="text-[11px] text-blue-950 font-medium leading-relaxed whitespace-pre-line bg-white/60 border border-blue-100 p-3 rounded-md shadow-2xs font-mono">
              {analysisResult.improvedSampleAnswer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
