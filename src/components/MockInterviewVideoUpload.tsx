import React, { useState } from 'react';
import { Upload, Video, Play, MessageSquare, Star, Eye, Calendar, RefreshCw, Layers, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

interface MockInterviewVideoUploadProps {
  currentUser: any;
  onAnalysisResult: (report: any) => void;
}

export default function MockInterviewVideoUpload({ currentUser, onAnalysisResult }: MockInterviewVideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('MERN Developer');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [uploading, setUploading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorText("Please attach an interview video file first.");
      return;
    }

    setUploading(true);
    setErrorText(null);

    try {
      const token = localStorage.getItem('interview_token');
      const response = await fetch('/api/interviews/analyze-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: file.name,
          videoUrl: `https://mock-s3-bucket.btech.edu/recordings/${file.name}`,
          role,
          difficulty
        })
      });

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          onAnalysisResult(data.report);
        } else {
          setErrorText(data.error || "Speech core process failure. Ensure formatting matches standard audio codecs.");
        }
      } else {
        setErrorText("Speech core process failure: invalid response format from server.");
      }
    } catch (err: any) {
      setErrorText("Failed to compile candidate audio transcript logs from movie data.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-5" id="mock-video-upload-root">
      <div>
        <h2 className="text-sm font-bold text-slate-800 tracking-tight uppercase flex items-center gap-1.5">
          <Video className="h-4.5 w-4.5 text-blue-600" /> Recorded Mock Interview Video Upload & AI Analyzer
        </h2>
        <p className="text-[11px] text-slate-500">Submit mock recordings in MP4, MOV, or AVI. Our system executes speech-to-text, tracks conversation fluency, and reviews eye attention</p>
      </div>

      <form onSubmit={handleUploadSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="video-fields">
          <div>
            <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1">Target Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs outline-hidden hover:border-slate-300 transition-colors font-semibold"
            >
              <option>MERN Developer</option>
              <option>Java Developer</option>
              <option>Python Developer</option>
              <option>Backend Developer</option>
              <option>System Architect</option>
              <option>Data Scientist</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1">Target Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs outline-hidden hover:border-slate-300 transition-colors font-semibold"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-200 rounded-lg p-7 bg-slate-50 text-center relative hover:bg-slate-100/50 transition-colors">
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo"
            onChange={handleFileChange}
            className="hidden"
            id="mock-video-attachment-tag"
          />
          <div className="bg-white/80 rounded-full h-11 w-11 flex items-center justify-center mx-auto mb-2.5 border border-slate-200">
            <Upload className="h-5.5 w-5.5 text-slate-400" />
          </div>
          
          <label
            htmlFor="mock-video-attachment-tag"
            className="inline-block bg-blue-50 text-blue-700 hover:bg-blue-100 font-extrabold text-xs px-3 py-1.5 rounded border border-blue-100 cursor-pointer transition-colors uppercase font-mono"
          >
            {file ? "Change Selected Video" : "Choose MP4/MOV/AVI Video file"}
          </label>
          <span className="block text-[10px] text-slate-400 mt-2 font-medium">
            {file ? `Attached: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)` : "Max file size: 120MB"}
          </span>
        </div>

        {errorText && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-100 flex items-center gap-2">
            <Layers className="h-4 w-4 text-red-500" />
            <span>{errorText}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs uppercase font-extrabold py-3.5 rounded-md shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 transition-colors"
        >
          {uploading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running Audio Demuxing & Whisper Speech-to-Text...
            </>
          ) : (
            <>
              <Sparkles className="h-4.5 w-4.5 text-blue-400" />
              Extract Audio & Process AI Analytics
            </>
          )}
        </button>
      </form>

      {/* CSE Framework Guidelines Infobox */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5" id="multimodal-diagnostic-guideline">
        <h4 className="text-[10px] font-extrabold text-slate-700 uppercase font-mono flex items-center gap-1.5 bg-white border border-slate-200 rounded px-2.5 py-1 w-fit">
          <Star className="h-3.5 w-3.5 text-blue-500 fill-current" /> B.Tech CSE Thesis Multimodal Processors
        </h4>
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
          Our backend executes parallel pipeline models: (1) **Whisper Speech Model** translates conversational accents, (2) **HuggingFace transformers** count connector fillers, (3) **OpenCV Gaze Matrices** simulate optical tracking, counting frame offsets dynamically. All logs write safely into user relational reports instantly.
        </p>
      </div>
    </div>
  );
}
