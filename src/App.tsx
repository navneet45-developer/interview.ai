/**
 * AI Interview Replay Analyzer & AI Interviewer
 * Main Frontend Coordinator
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import InterviewerSession from './components/InterviewerSession';
import ReplayPlayer from './components/ReplayPlayer';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import MockInterviewVideoUpload from './components/MockInterviewVideoUpload';
import QAVideoAnalyzer from './components/QAVideoAnalyzer';
import CareerRoadmaps from './components/CareerRoadmaps';
import WelcomePortal from './components/WelcomePortal';
import AdminPanel from './components/AdminPanel';

import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  UserCheck, 
  Compass, 
  HeartHandshake, 
  ShieldCheck,
  AlertTriangle,
  Database,
  WifiOff,
  Copy,
  Check,
  Sliders
} from 'lucide-react';
import { Report } from './types';

// Helper function to resolve dynamic decorative background blobs and themes based on selected topic
function getDynamicBackground(tab: string, activeTheme: string): { bgClass: string; decorNode: React.ReactNode } {
  const getThemeAccents = () => {
    switch(activeTheme) {
      case 'cyber_glass':
        return {
          glow1: 'from-rose-600/15 to-pink-500/10',
          glow2: 'from-amber-600/10 to-red-500/5',
          orb: 'bg-rose-500/5'
        };
      case 'mint_aurora':
        return {
          glow1: 'from-emerald-600/15 to-teal-500/10',
          glow2: 'from-blue-600/10 to-cyan-500/5',
          orb: 'bg-emerald-500/5'
        };
      case 'fuchsia_cosmos':
        return {
          glow1: 'from-purple-600/20 to-fuchsia-500/10',
          glow2: 'from-pink-600/10 to-indigo-500/5',
          orb: 'bg-purple-500/5'
        };
      case 'academic_day':
        return {
          glow1: 'from-slate-600/15 to-zinc-500/10',
          glow2: 'from-slate-800/10 to-neutral-500/5',
          orb: 'bg-zinc-500/5'
        };
      case 'slate_midnight':
      default:
        return {
          glow1: 'from-blue-600/15 to-indigo-600/10',
          glow2: 'from-violet-600/10 to-cyan-500/5',
          orb: 'bg-blue-600/5'
        };
    }
  };

  const accents = getThemeAccents();

  const isLight = activeTheme === 'academic_day' || activeTheme === 'mint_aurora';
  const bgValue = isLight 
    ? (activeTheme === 'academic_day' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#f0fdf4] text-emerald-950')
    : (activeTheme === 'cyber_glass' ? 'bg-[#020204]' : activeTheme === 'fuchsia_cosmos' ? 'bg-[#05030d]' : 'bg-[#030303]');
  const textValue = isLight ? 'text-slate-900' : 'text-zinc-100';

  return {
    bgClass: `${bgValue} ${textValue} relative overflow-x-hidden transition-colors duration-550`,
    decorNode: (
      <div className="absolute inset-0 pointer-events-none overflow-x-hidden z-0" id="ambient-cosmos-backdrop">
        {/* Subtle grid pattern layer */}
        <div className="absolute inset-0 subtle-grid opacity-25" />
        
        {/* Glowing Aurora Node 1 */}
        <div 
          className={`aurora-bg w-full max-w-md h-[500px] bg-gradient-to-tr ${accents.glow1}`} 
          style={{ 
            top: '-5%', 
            left: '10%',
            animationDuration: '25s',
            animationDelay: '0s'
          }} 
        />
        
        {/* Glowing Aurora Node 2 */}
        <div 
          className={`aurora-bg w-[650px] h-[650px] bg-gradient-to-br ${accents.glow2}`} 
          style={{ 
            bottom: '-10%', 
            right: '5%',
            animationDuration: '35s',
            animationDelay: '-8s'
          }} 
        />
        
        {/* Dynamic theme-informed tab highlights */}
        {tab === 'dashboard' && (
          <div className={`absolute top-[15%] right-[20%] w-[450px] h-[450px] rounded-full blur-[130px] animate-pulse pointer-events-none ${accents.orb}`} />
        )}
        {tab === 'resume_analyzer' && (
          <div className={`absolute top-[10%] right-[30%] w-[450px] h-[450px] rounded-full blur-[130px] animate-pulse pointer-events-none ${accents.orb}`} />
        )}
        {tab === 'video_interview_upload' && (
          <div className={`absolute top-[25%] left-[20%] w-[450px] h-[450px] rounded-full blur-[130px] animate-pulse pointer-events-none ${accents.orb}`} />
        )}
        {tab === 'qa_video_analyzer' && (
          <div className={`absolute top-[20%] left-[40%] w-[450px] h-[450px] rounded-full blur-[130px] animate-pulse pointer-events-none ${accents.orb}`} />
        )}
        {tab === 'career_roadmaps' && (
          <div className={`absolute bottom-[20%] left-[10%] w-[450px] h-[450px] rounded-full blur-[130px] animate-pulse pointer-events-none ${accents.orb}`} />
        )}
        {tab === 'admin_panel' && (
          <div className={`absolute top-[5%] left-[20%] w-[450px] h-[450px] rounded-full blur-[130px] animate-pulse pointer-events-none ${accents.orb}`} />
        )}
      </div>
    )
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'resume_analyzer' | 'video_interview_upload' | 'qa_video_analyzer' | 'career_roadmaps' | 'admin_panel'
  >('dashboard');

  const [activeTheme, setActiveTheme] = useState<string>(() => localStorage.getItem('active_theme') || 'academic_day');

  // Persist active theme selection
  useEffect(() => {
    localStorage.setItem('active_theme', activeTheme);
  }, [activeTheme]);

  const [dbStatus, setDbStatus] = useState<{ error: string | null; isConnected: boolean; hasUri: boolean } | null>(null);
  const [showDbGuide, setShowDbGuide] = useState(false);

  // Periodic MongoDB diagnostic query
  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch('/api/db-status');
        if (res.ok) {
          const data = await res.json();
          setDbStatus(data);
        }
      } catch (err) {
        console.warn("DB offline diagnostic service not responding yet.", err);
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 5000);
    return () => clearInterval(interval);
  }, []);

  // Interactive interview orchestrators
  const [activeSession, setActiveSession] = useState<{
    role: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    resumeId?: string;
    recruiterRole?: string;
  } | null>(null);

  const [activeReplay, setActiveReplay] = useState<Report | null>(null);

  // Sync token state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('interview_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('interview_user');
      }
    }
  }, []);

  const handleSelectRole = (
    role: string, 
    difficulty: 'Easy' | 'Medium' | 'Hard', 
    resumeId?: string, 
    recruiterRole?: string
  ) => {
    setActiveSession({ role, difficulty, resumeId, recruiterRole });
    setActiveReplay(null); // Clear active reviews
  };

  const handleSelectReplay = async (interviewId: string) => {
    try {
      const token = localStorage.getItem('interview_token');
      const response = await fetch(`/api/interviews/${interviewId}/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          setActiveReplay(data.report);
          setActiveSession(null); // Close active grids
        } else {
          alert(data.error || "Unable to retrieve replay details.");
        }
      } else {
        alert("Unable to retrieve replay details: server returned an error.");
      }
    } catch (e) {
      alert("Error loading specific visual replay reports.");
    }
  };

  const handleSessionComplete = (newReport: Report) => {
    setActiveSession(null);
    setActiveReplay(newReport); // Cascade straight into replay sheet logs
  };

  // Launch Resume-based interviews directly from CV Analyzer results screen
  const handleSelectResumeInterview = (resumeId: string, role: string) => {
    setActiveSession({
      role,
      difficulty: 'Medium',
      resumeId,
      recruiterRole: 'MERN Interviewer'
    });
    setActiveReplay(null);
  };

  // Compile path roadmap results directly on resume complete
  const handleNavigateToRoadmapOnResume = (resumeId: string, role: string) => {
    setCurrentTab('career_roadmaps');
  };

  // Mouse coordinate state tracking for elite neon glow movement
  const [mouseCoords, setMouseCoords] = useState({ x: -1000, y: -1000 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouseCoords({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  const { bgClass, decorNode } = getDynamicBackground(currentTab, activeTheme);

  return (
    <div className={`min-min-h-screen flex flex-col font-sans transition-all duration-700 theme-${activeTheme} ${bgClass}`} id="app-viewport">
      {/* Interactive cursor glow tracking circle */}
      {currentUser && (
        <div 
          className="interactive-cursor-glow" 
          style={{ 
            left: `${mouseCoords.x}px`, 
            top: `${mouseCoords.y}px`
          }} 
        />
      )}

      {/* Dynamic Background decor */}
      {currentUser && decorNode}

      {/* Upper Navigation Section */}
      <Navbar 
        currentUser={currentUser} 
        onUserUpdate={(user) => {
          setCurrentUser(user);
          if (!user) {
            setActiveSession(null);
            setActiveReplay(null);
            setCurrentTab('dashboard');
          } else if (user.role === 'admin') {
            setActiveSession(null);
            setActiveReplay(null);
            setCurrentTab('admin_panel');
          } else {
            setActiveSession(null);
            setActiveReplay(null);
            setCurrentTab('dashboard');
          }
        }} 
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeTheme={activeTheme}
        onThemeChange={setActiveTheme}
        onCancelSession={() => setActiveSession(null)}
        onCancelReplay={() => setActiveReplay(null)}
      />

      {/* MongoDB Status Alert Banner */}
      {dbStatus && !dbStatus.isConnected && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 py-3.5 px-6 shadow-xs w-full max-w-7xl mx-auto rounded-lg mt-4" id="db-warning-banner">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>MongoDB Atlas Connection Required</span>
                  <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full font-mono">Status: Offline / Auth Failure</span>
                </h3>
                <p className="text-xs text-amber-800 mt-1 max-w-3xl leading-relaxed">
                  {dbStatus.error && dbStatus.error.toLowerCase().includes("auth") ? (
                    <strong className="text-red-700 font-bold mr-1">[Authentication Failed - bad auth]:</strong>
                  ) : null}
                  {dbStatus.error || "Please verify your database connection credentials in Settings -> Secrets."}
                </p>
                <p className="text-[11px] text-amber-700/80 mt-1 font-medium">
                  To complete the CSE Graduation Thesis presentation requirements, the application must connect successfully to a production MongoDB Atlas cluster.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <button 
                onClick={() => setShowDbGuide(!showDbGuide)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-md transition-all cursor-pointer shadow-xs"
                id="toggle-guide-btn"
              >
                {showDbGuide ? "Close Instructions" : "Step-by-Step Atlas Setup Guide"}
              </button>
            </div>
          </div>

          {/* Collapsible Step-by-Step connection instruction details */}
          {showDbGuide && (
            <div className="mt-4 border-t border-amber-200 pt-4 text-xs text-slate-700 space-y-4 animate-fade-in" id="db-setup-guide">
              <div className="bg-white border border-amber-100 rounded-md p-4 shadow-xs space-y-3">
                <span className="block text-[10px] font-bold text-amber-700 uppercase tracking-widest font-mono">Mongoose Database Atlas Connection Checklist</span>
                
                <ol className="list-decimal list-inside space-y-2.5 text-xs font-medium text-slate-600">
                  <li>
                    <strong className="text-slate-800">Generate Atlas Database:</strong> Create or log in to your account on <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 font-bold">MongoDB Atlas Portal</a> and spin up an <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">M0 Shared Free Tier Cluster</span>.
                  </li>
                  <li>
                    <strong className="text-slate-800">Configure Database Access User:</strong> Under <span className="font-semibold text-slate-800">Security &rarr; Database Access</span>, create a user with <span className="font-semibold text-slate-800">Read and Write to any database</span> privileges. Make sure the password contains only standard alphanumeric letters (avoid characters like <code className="bg-slate-100 font-mono text-red-500">@, :, /, +</code>, or URL-encode them appropriately).
                  </li>
                  <li>
                    <strong className="text-slate-800">Allow Global Network Access:</strong> Under <span className="font-semibold text-slate-800">Security &rarr; Network Access</span>, choose to <span className="font-bold text-amber-800">Allow Access From Anywhere (0.0.0.0/0)</span> and Confirm (vital so dynamic cloud container engines can reach the cluster).
                  </li>
                  <li>
                    <strong className="text-slate-800">Obtain Driver Connection URI:</strong> Go back to Databases, select <span className="font-semibold">Connect</span>, choose <span className="font-semibold">Drivers</span>. Copy your application connection string matching:
                    <div className="bg-slate-900 text-slate-200 p-2.5 rounded-md font-mono text-[10px] mt-2 select-all overflow-x-auto border border-slate-800 relative">
                      mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.abcde.mongodb.net/interview_ai?retryWrites=true&amp;w=majority
                    </div>
                  </li>
                  <li>
                    <strong className="text-slate-800">Paste in Settings Secrets:</strong> Click the <span className="font-semibold text-slate-800">Settings</span> cog icon in the top-right corner of Google AI Studio &rarr; choose <span className="font-semibold">Secrets</span>. Put <span className="text-blue-600 font-mono font-bold">MONGODB_URI</span> as the Key, and paste your connection string as the Value (replacing <code className="bg-slate-100 font-mono text-xs font-bold text-red-600">&lt;password&gt;</code> with your actual password!). Save, and the applet will restart automatically with high-fidelity live Atlas integration.
                  </li>
                </ol>

                <div className="flex gap-2 items-center bg-blue-50 border border-blue-100 rounded-md p-2.5 text-[11px] text-blue-800 font-semibold">
                  <Database className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>The app validates connection instantly. Once a valid is connected, this warning banner will hide automatically.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!currentUser ? (
        <WelcomePortal onUserUpdate={(user) => setCurrentUser(user)} />
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col gap-4 relative z-10 animate-fade-in">
          {/* Primary Page Canvas Area */}
          <main className="flex-1 min-w-0 space-y-4 font-sans" id="primary-visual-canvas">
            {activeSession ? (
              /* Active Live Interview Session Flow Route */
              <InterviewerSession
                role={activeSession.role}
                difficulty={activeSession.difficulty}
                resumeId={activeSession.resumeId}
                recruiterRole={activeSession.recruiterRole}
                onSessionComplete={handleSessionComplete}
                onCancel={() => setActiveSession(null)}
              />
            ) : activeReplay ? (
              /* Selected Completed Replay and Performance scorecard Route */
              <ReplayPlayer
                report={activeReplay}
                onBack={() => setActiveReplay(null)}
              />
            ) : (
              /* Choose view dynamically based on navigation rail */
              <>
                {currentTab === 'dashboard' && (
                  <Dashboard
                    currentUser={currentUser}
                    onSelectRole={handleSelectRole}
                    onSelectReplay={handleSelectReplay}
                  />
                )}

                {currentTab === 'resume_analyzer' && (
                  <ResumeAnalyzer
                    currentUser={currentUser}
                    onSelectResumeInterview={handleSelectResumeInterview}
                    onNavigateToRoadmap={handleNavigateToRoadmapOnResume}
                  />
                )}

                {currentTab === 'video_interview_upload' && (
                  <MockInterviewVideoUpload
                    currentUser={currentUser}
                    onAnalysisResult={(newReport: any) => {
                      setActiveReplay(newReport); // jump straight to report
                    }}
                  />
                )}

                {currentTab === 'qa_video_analyzer' && (
                  <QAVideoAnalyzer />
                )}

                {currentTab === 'career_roadmaps' && (
                  <CareerRoadmaps currentUser={currentUser} />
                )}

                {currentTab === 'admin_panel' && currentUser?.role === 'admin' && (
                  <AdminPanel currentUser={currentUser} />
                )}
              </>
            )}
          </main>
        </div>
      )}

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0 z-30" id="high-density-footer">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> PYTHON MICROLAYER: ACTIVE
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> MONGODB ATLAS: SECURED
          </div>
        </div>
        <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
          CSE THESIS SUBMISSION | B.TECH 2026
        </div>
      </footer>
    </div>
  );
}
