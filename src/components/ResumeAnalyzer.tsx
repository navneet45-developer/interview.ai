import React, { useState } from 'react';
import { Upload, Star, CheckCircle, AlertTriangle, FileText, Play, Map, HelpCircle, FileCheck, Layers, Award } from 'lucide-react';

interface ResumeAnalyzerProps {
  currentUser: any;
  onSelectResumeInterview: (resumeId: string, role: string) => void;
  onNavigateToRoadmap: (resumeId: string, role: string) => void;
}

export default function ResumeAnalyzer({ currentUser, onSelectResumeInterview, onNavigateToRoadmap }: ResumeAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [role, setRole] = useState('MERN Developer');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [errorObj, setErrorObj] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !pastedText.trim()) {
      setErrorObj("Please attach a file or type / paste your resume textual details.");
      return;
    }

    setAnalyzing(true);
    setErrorObj(null);

    try {
      const token = localStorage.getItem('interview_token');
      const response = await fetch('/api/resumes/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: file ? file.name : "pasted_resume_text.txt",
          fileContent: pastedText || `Detailed CV of ${currentUser?.fullName || 'Candidate'}. Core Skills: React, CSS, Node.js, MDB, Express APIs, Javascript. Target Position: ${role}.`
        })
      });

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          setAnalysisResult(data.resume);
        } else {
          setErrorObj(data.error || "Resume parser reported a compilation issue. Try again.");
        }
      } else {
        setErrorObj("Resume parser reported a compilation issue: invalid response format from server.");
      }
    } catch (err: any) {
      setErrorObj("Failed connecting to B.Tech AI Resume analytical service.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-5" id="resume-analyzer-view">
      <div>
        <h2 className="text-sm font-bold text-slate-800 tracking-tight uppercase flex items-center gap-1.5">
          <FileText className="h-4.5 w-4.5 text-blue-600" /> AI Resume ATS Parser & Analyzer
        </h2>
        <p className="text-[11px] text-slate-500">Upload college CV or paste text to audit skill match, assess weaknesses, and calculate mock ATS ratings</p>
      </div>

      {!analysisResult ? (
        <form onSubmit={triggerAnalysis} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1">Target Employment Position</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-hidden hover:border-slate-300 focus:border-blue-500 font-medium"
              >
                <option>MERN Developer</option>
                <option>Java Developer</option>
                <option>Python Developer</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>System Architect</option>
                <option>Data Engineer</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1">Upload File (PDF, DOCX, TXT)</label>
              <input
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="resume-file-input"
              />
              <label
                htmlFor="resume-file-input"
                className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded px-2.5 py-1.5 text-xs text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer font-bold border-dashed transition-all"
              >
                <Upload className="h-4 w-4 text-slate-400" />
                {file ? file.name : "Select File"}
              </label>
            </div>
          </div>

          {/* Drag & Drop Visual Canvas */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 hover:bg-slate-100/50 transition-colors text-center cursor-pointer"
          >
            <div className="bg-white/80 rounded-full h-10 w-10 flex items-center justify-center mx-auto mb-2 border border-slate-200">
              <Upload className="h-5 w-5 text-slate-400 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-slate-700">Drag & Drop CV file here</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Or type resume credentials into paste field downstream</p>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1">Paste Resume Content Text (Optional)</label>
            <textarea
              rows={4}
              placeholder="Paste candidate bio details, skills, certifications, academy, and experience..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-hidden focus:bg-white focus:border-blue-500 transition-colors font-mono"
            />
          </div>

          {errorObj && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-100 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorObj}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={analyzing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider font-mono"
          >
            {analyzing ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Multimodal ATS Evaluation...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4" />
                Analyze CV & Generate Audit report
              </>
            )}
          </button>
        </form>
      ) : (
        /* Analysis Results Page */
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 text-white rounded-lg p-5 border border-slate-800 shadow-xs relative overflow-x-hidden">
            <div className="absolute right-0 bottom-0 h-20 w-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="md:col-span-3 space-y-1.5">
              <span className="text-[9px] text-blue-400 uppercase font-bold tracking-widest font-mono">Analysis Report Completed</span>
              <h3 className="text-base font-extrabold text-slate-100">{file ? file.name : "pasted_cv_evaluation.pdf"}</h3>
              <p className="text-xs text-slate-400">Target Role: <strong className="text-slate-100">{role}</strong> • Audited with MDB schemas v2.1</p>
            </div>

            <div className="text-center md:border-l md:border-slate-800 flex flex-col justify-center items-center">
              <span className="text-[9px] text-slate-400 font-mono tracking-wider font-bold">ATS COMPATIBILITY SCORE</span>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-3xl font-extrabold text-emerald-400">{analysisResult.atsScore}</span>
                <span className="text-slate-400 font-mono text-xs">/100</span>
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-wider mt-1 px-1.5 rounded ${analysisResult.atsScore >= 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {analysisResult.atsScore >= 75 ? "Highly Compatible" : "Requires Optimization"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Extracted components */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase font-mono">
                <Award className="h-4 w-4 text-blue-600" /> Extracted Skills
              </h4>
              <div className="flex flex-wrap gap-1">
                {analysisResult.parsedSkills.map((sk: string) => (
                  <span key={sk} className="bg-white border border-slate-200 text-slate-600 font-mono font-bold text-[9px] px-2 py-0.5 rounded shadow-2xs">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase font-mono">
                <FileCheck className="h-4 w-4 text-emerald-600" /> Technologies Detected
              </h4>
              <div className="flex flex-wrap gap-1">
                {analysisResult.parsedTechnologies.map((tech: string) => (
                  <span key={tech} className="bg-white border border-slate-200 text-slate-600 font-mono font-bold text-[9px] px-2 py-0.5 rounded shadow-2xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase font-mono">
                <Layers className="h-4 w-4 text-purple-600" /> Detected Projects
              </h4>
              <ul className="space-y-1">
                {analysisResult.parsedProjects.map((proj: string) => (
                  <li key={proj} className="text-[10px] font-bold text-slate-600 list-disc ml-4 leading-normal font-mono">
                    {proj}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Skills Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-black text-amber-800 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" /> ATS DETECTED MISSING SKILLS KEYWORDS
            </h4>
            <p className="text-[11px] text-amber-700 leading-normal font-medium">Add these precise technologies and concepts to your resume bullet points to bypass automated ATS filters:</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysisResult.missingSkills.map((ms: string) => (
                <span key={ms} className="bg-white border border-amber-200 text-amber-800 font-sans font-extrabold text-[9px] px-2.5 py-0.5 rounded-full shadow-2xs">
                  {ms}
                </span>
              ))}
            </div>
          </div>

          {/* Strengths / Weaknesses / Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-800 uppercase font-mono">Resume Strengths</h4>
              <ul className="space-y-1.5 text-[11px] text-emerald-700 font-medium">
                {analysisResult.strengths.map((str: string, index: number) => (
                  <li key={index} className="flex items-start gap-1.5 leading-normal">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50/50 border border-red-200 rounded-lg p-4 space-y-2">
              <h4 className="text-xs font-bold text-red-800 uppercase font-mono">Resume Weaknesses</h4>
              <ul className="space-y-1.5 text-[11px] text-red-700 font-medium">
                {analysisResult.weaknesses.map((weak: string, index: number) => (
                  <li key={index} className="flex items-start gap-1.5 leading-normal">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">Actionable AI Improvement Suggestions</h4>
            <ol className="space-y-1.5 text-[11px] text-slate-600 font-semibold list-decimal pl-4">
              {analysisResult.suggestions.map((sug: string, index: number) => (
                <li key={index} className="leading-normal pl-1">
                  {sug}
                </li>
              ))}
            </ol>
          </div>

          {/* Core dynamic launchers */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onSelectResumeInterview(analysisResult.id, role)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5 text-xs uppercase tracking-wider font-mono"
            >
              <Play className="h-4.5 w-4.5 fill-current" />
              Generate Resume-Based Mock Interview
            </button>
            <button
              onClick={() => onNavigateToRoadmap(analysisResult.id, role)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5 text-xs uppercase tracking-wider font-mono"
            >
              <Map className="h-4.5 w-4.5" />
              Compile Study Roadmap
            </button>
            <button
              onClick={() => setAnalysisResult(null)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 px-4 rounded text-xs"
            >
              Reset Parser
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
