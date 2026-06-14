import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { 
  Play, Calendar, User, BarChart2, Star, Eye, MessageSquare, 
  AlertCircle, Info, RefreshCw, Layers, ShieldCheck, Zap, TrendingUp, Sparkles
} from 'lucide-react';
import { DashboardStats } from '../types';

interface DashboardProps {
  currentUser: any | null;
  onSelectRole: (role: string, difficulty: 'Easy' | 'Medium' | 'Hard', resumeId?: string, recruiterRole?: string) => void;
  onSelectReplay: (interviewId: string) => void;
}

export default function Dashboard({ currentUser, onSelectRole, onSelectReplay }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('MERN Developer');
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [recruiterRole, setRecruiterRole] = useState('MERN Interviewer');

  useEffect(() => {
    if (currentUser) {
      loadStatsAndHistory();
    }
  }, [currentUser]);

  const loadStatsAndHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('interview_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const statsRes = await fetch('/api/interviews/stats', { headers });
      if (statsRes.ok && statsRes.headers.get('content-type')?.includes('application/json')) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      const historyRes = await fetch('/api/interviews/history', { headers });
      if (historyRes.ok && historyRes.headers.get('content-type')?.includes('application/json')) {
        const historyData = await historyRes.json();
        if (historyData.success) {
          setHistoryList(historyData.history);
        }
      }
    } catch (e) {
      console.error('Error fetching dashboard statistics: ', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = () => {
    const chosenRole = role === 'Custom Role' && customRole.trim() ? customRole : role;
    onSelectRole(chosenRole, difficulty, undefined, recruiterRole);
  };

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center" id="empty-dashboard-state">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-8 shadow-2xl relative"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          <div className="bg-indigo-600/10 text-indigo-400 rounded-full h-14 w-14 flex items-center justify-center mx-auto mb-5 border border-indigo-500/20">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Access Your Mock Prep Portal</h2>
          <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
            Please register a student account or sign in with our one-click simulated student profile using the header controls above to unlock advanced metrics dashboards, audio replays, and technical filler-word speech trends.
          </p>
          <div className="flex justify-center mt-6">
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 text-left w-full max-w-md">
              <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 font-mono">
                <Info className="h-4 w-4 text-indigo-400" /> Platform Auto-Seeding Setup
              </h4>
              <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                The mock database comes equipped with preseeded developer ratings and acoustic posturing records designed for instant campus thesis demonstrations.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Fallback defaults if database is bootstrapping
  const activeStats = stats || {
    totalInterviews: 1,
    completedSessions: 1,
    overallAverage: 8.5,
    technicalAverage: 8.5,
    communicationAverage: 8.2,
    confidenceAverage: 8.5,
    eyeContactAverage: 88,
    fillerWordsTrend: [
      { name: "um", count: 2 },
      { name: "uh", count: 1 },
      { name: "like", count: 3 },
      { name: "basically", count: 1 },
      { name: "actually", count: 2 }
    ],
    progressTrend: [
      { date: "May 25", score: 7.2 },
      { date: "May 28", score: 7.8 },
      { date: "Jun 02", score: 8.2 },
      { date: "Today", score: 8.5 }
    ]
  };

  // Ensure progressTrend has clean chart format
  const chartProgressData = activeStats.progressTrend.map(pt => ({
    name: pt.date,
    score: pt.score
  }));

  // Recharts color scheme for dark interface
  const fillerData = activeStats.fillerWordsTrend.map(item => ({
    word: `"${item.name}"`,
    occurrences: item.count
  }));

  return (
    <div className="space-y-6 text-zinc-100" id="dashboard-root">
      
      {/* 1. Header Overview Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight uppercase flex items-center gap-2">
            <span>Interview Analytics Workspace</span>
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
          </h2>
          <p className="text-xs text-zinc-400">Speech analytics, natural language assessments, and telemetry records</p>
        </div>
        <button 
          onClick={loadStatsAndHistory}
          disabled={loading}
          className="text-xs text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 font-bold px-4 py-2 rounded-lg transition-all border border-indigo-500/25 flex items-center gap-2 self-start md:self-center cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Workspace</span>
        </button>
      </div>

      {/* 2. Premium AI Score Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="stats-panel">
        
        {/* Card 1: ATS / Technical score */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-4 rounded-xl flex flex-col justify-between shadow-lg relative group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-bl-full group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 font-mono">ATS / Technical Scope</span>
            <div className="p-1 px-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <Star className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{activeStats.technicalAverage}</span>
            <span className="text-[10px] text-zinc-500 font-mono">/ 10.0</span>
          </div>
          <div className="w-full bg-zinc-900 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
              style={{ width: `${(activeStats.technicalAverage / 10) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Card 2: Communication Score */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="glass-panel p-4 rounded-xl flex flex-col justify-between shadow-lg relative group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 font-mono">Speech Clarity</span>
            <div className="p-1 px-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-blue-400 font-mono">{activeStats.communicationAverage}</span>
            <span className="text-[10px] text-zinc-500 font-mono">/ 10.0</span>
          </div>
          <div className="w-full bg-zinc-900 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" 
              style={{ width: `${(activeStats.communicationAverage / 10) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Card 3: Confidence Score */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-panel p-4 rounded-xl flex flex-col justify-between shadow-lg relative group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 font-mono">Self-Confidence</span>
            <div className="p-1 px-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
              <Layers className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">{activeStats.confidenceAverage}</span>
            <span className="text-[10px] text-zinc-500 font-mono">/ 10.0</span>
          </div>
          <div className="w-full bg-zinc-900 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" 
              style={{ width: `${(activeStats.confidenceAverage / 10) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Card 4: Eye Contact Score */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="glass-panel p-4 rounded-xl flex flex-col justify-between shadow-lg relative group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 font-mono">Posture & Focus</span>
            <div className="p-1 px-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
              <Eye className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-purple-400 font-mono">{activeStats.eyeContactAverage}%</span>
            <span className="text-[10px] text-zinc-500 font-mono">interest</span>
          </div>
          <div className="w-full bg-zinc-900 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-full" 
              style={{ width: `${activeStats.eyeContactAverage}%` }}
            />
          </div>
        </motion.div>

        {/* Card 5: Overall Platform Evaluation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-panel p-4 rounded-xl flex flex-col justify-between border-indigo-500/20 bg-indigo-950/20 shadow-lg relative overflow-hidden group"
        >
          <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500" />
          <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-300 font-mono">Overall Rating</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-white font-mono glow-text-purple">{activeStats.overallAverage}</span>
            <span className="text-xs text-indigo-300 font-mono font-semibold">/ 10</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-normal mt-2">
            Measured across <strong>{activeStats.totalInterviews}</strong> simulated trials. Placement ready!
          </p>
        </motion.div>

      </div>

      {/* 3. Recharts Graphics Division */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-charts">
        
        {/* Recharts Column 1: Verbal Filler Distribution */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl flex flex-col justify-between border border-zinc-800">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase font-mono">Diagnostic Logs</span>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mt-1 uppercase">
              <MessageSquare className="h-4.5 w-4.5 text-indigo-400" /> Verbal Filler Frequencies
            </h3>
            <p className="text-xs text-zinc-400 leading-normal mt-1">
              Speech pattern detection indicating crutch words that hurt performance.
            </p>
          </div>

          <div className="h-48 w-full mt-4" id="filler-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fillerData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="word" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#f4f4f5', fontSize: '11px' }}
                />
                <Bar dataKey="occurrences" radius={[4, 4, 0, 0]}>
                  {fillerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? '#818cf8' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-950/60 rounded-xl p-3 text-[11px] text-zinc-300 flex items-start gap-2.5 mt-4 border border-zinc-900">
            <Info className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Speech Coach Analytics:</strong> Practicing key technical pauses over verbal fillers increases your communication clarity metric.
            </span>
          </div>
        </div>

        {/* Recharts Column 2: Progression timeline */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl flex flex-col justify-between border border-zinc-800">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase font-mono">Performance Timeline</span>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mt-1 uppercase">
              <BarChart2 className="h-4.5 w-4.5 text-emerald-400" /> Progression Track
            </h3>
            <p className="text-xs text-zinc-400 leading-normal mt-1">
              Chronological score results showing overall interview readiness growth.
            </p>
          </div>

          <div className="h-48 w-full mt-4" id="timeline-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#f4f4f5', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gradientScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-emerald-950/20 rounded-xl p-3 text-[11px] text-emerald-300 flex items-start gap-2.5 mt-4 border border-emerald-900/30">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Corporate Target Guideline:</strong> Reach and maintain stats above <strong>8.0 / 10.0</strong> to satisfy benchmark requirements for technical placements.
            </span>
          </div>
        </div>

      </div>

      {/* 4. Adaptive launcher pane with stunning modern interactive elements */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-6" id="launcher-panel">
        
        {/* Launcher Fields Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-indigo-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Launch Adaptive AI Coaching Session</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            AI synthesizes high-fidelity interviews tailored specifically to your chosen corporate track. The voice coach reads the technical prompt aloud, reviews user answers, and updates score dashboards instantly.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="text-left">
              <label className="block text-[9px] uppercase font-bold tracking-widest text-zinc-450 font-mono mb-2">Target Career Field</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                id="role-select"
              >
                <option>MERN Developer</option>
                <option>Java Developer</option>
                <option>Python Developer</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Data Analyst</option>
                <option>Data Scientist</option>
                <option>HR Interview</option>
                <option>Custom Role</option>
              </select>
            </div>

            <div className="text-left">
              <label className="block text-[9px] uppercase font-bold tracking-widest text-zinc-455 font-mono mb-2">Interviewer Persona</label>
              <select 
                value={recruiterRole} 
                onChange={(e) => setRecruiterRole(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer text-indigo-300 font-semibold"
                id="recruiter-select"
              >
                <option value="HR Recruiter">HR Recruiter (STAR Soft Skill)</option>
                <option value="MERN Interviewer">Lead Fullstack Architect Persona</option>
                <option value="Java Interviewer">Spring Enterprise Senior Dev</option>
                <option value="Python Interviewer">Scientific Core Systems Engineer</option>
                <option value="Engineering Manager">Delivery Team Manager</option>
                <option value="System Design Interviewer">Systems Architect Coach</option>
              </select>
            </div>

            <div className="text-left">
              <label className="block text-[9px] uppercase font-bold tracking-widest text-zinc-460 font-mono mb-2">Complexity Level</label>
              <div className="flex space-x-1 p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                {(['Easy', 'Medium', 'Hard'] as const).map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 text-center py-1.5 text-[11px] font-bold rounded-md cursor-pointer transition-all ${difficulty === diff ? 'bg-indigo-600/20 border border-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {role === 'Custom Role' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-1 text-left"
            >
              <label className="block text-[9px] uppercase font-bold tracking-widest text-zinc-400 font-mono mb-1.5">Specify Targeted Position</label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud Security Analyst, Flutter Developer"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                id="custom-role-input"
              />
            </motion.div>
          )}
        </div>

        {/* Launcher Trigger Button Column */}
        <div className="flex flex-col justify-center border-l border-zinc-800/40 pl-0 md:pl-6">
          <button
            onClick={handleStartInterview}
            className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all group border border-indigo-500/40"
            id="start-session-button"
          >
            <Play className="h-4.5 w-4.5 fill-current text-white animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider font-extrabold">Compile & Launch AI</span>
          </button>
          <span className="text-[10px] text-zinc-500 text-center mt-3 font-semibold flex items-center justify-center gap-1.5">
            <span>🎤 Live audio-posture recording active</span>
          </span>
        </div>
      </div>

      {/* 5. Complete Session History List Table */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800" id="history-section">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1 uppercase tracking-tight text-left">
          <Calendar className="h-4.5 w-4.5 text-indigo-400" /> Complete Performance Record Sheets
        </h3>
        <p className="text-xs text-zinc-400 mb-4 text-left">Select a previous interview review sheet to analyze timing errors, speech metrics, and transcripts</p>

        {historyList.length > 0 ? (
          <div className="divide-y divide-zinc-800 overflow-hidden border border-zinc-800 rounded-xl bg-zinc-950/40">
            {historyList.map((hist) => (
              <div 
                key={hist.id} 
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-transparent hover:bg-zinc-900/30 transition-all gap-4"
                id={`history-row-${hist.id}`}
              >
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-white">{hist.role}</span>
                    <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md ${
                      hist.difficulty === 'Easy' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : hist.difficulty === 'Medium' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {hist.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-[10px] text-zinc-400 font-mono">
                    <span>Attempt {new Date(hist.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Speech Duration: {hist.metrics?.duration || 0}s</span>
                    <span>•</span>
                    <span>Cadence: {hist.metrics?.wpm || 0} WPM</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 justify-between sm:justify-end shrink-0">
                  <div className="text-right font-mono">
                    <span className="block text-[8px] text-zinc-500 uppercase font-bold">Match Score</span>
                    <span className="text-xs font-black text-indigo-400">{hist.overallScore}/10</span>
                  </div>
                  <button
                    onClick={() => onSelectReplay(hist.interviewId)}
                    className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-indigo-500/20 transition-all"
                    id={`view-replay-btn-${hist.id}`}
                  >
                    View Replay Sheet
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-950/40 border border-dashed border-zinc-800 rounded-xl p-8 text-center" id="empty-history-alert">
            <p className="text-xs text-zinc-500 font-mono">No simulation sessions conducted yet. Select a career position & click Compile above!</p>
          </div>
        )}
      </div>

    </div>
  );
}
