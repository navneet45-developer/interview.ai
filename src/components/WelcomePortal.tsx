import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Key, 
  User, 
  Mail, 
  Lock, 
  Briefcase, 
  ShieldAlert, 
  CheckCircle, 
  UserCheck, 
  Globe, 
  MessageSquare, 
  Sparkles, 
  TrendingUp, 
  Award,
  Video,
  Database,
  ArrowRight
} from 'lucide-react';

interface WelcomePortalProps {
  onUserUpdate: (user: any | null) => void;
}

export default function WelcomePortal({ onUserUpdate }: WelcomePortalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [preferredRole, setPreferredRole] = useState('MERN Developer');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadDemo = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@btech.edu', password: 'demo123' })
      });
      
      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        localStorage.setItem('interview_token', data.token);
        localStorage.setItem('interview_user', JSON.stringify(data.user));
        setSuccessMsg('Academic Demo Loaded! Initializing environment dashboard...');
        setTimeout(() => {
          onUserUpdate(data.user);
          setIsLoading(false);
        }, 800);
      } else {
        throw new Error('Database is offline or baseline seeding is missing.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to automate evaluator authentication. Please register custom credentials below.');
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const body = isRegistering 
      ? { email, password, fullName, preferredRole } 
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        
        localStorage.setItem('interview_token', data.token);
        localStorage.setItem('interview_user', JSON.stringify(data.user));
        setSuccessMsg(isRegistering ? 'Account registered successfully!' : 'Login authenticated successfully!');
        
        setTimeout(() => {
          onUserUpdate(data.user);
          setIsLoading(false);
        }, 800);
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Server responded with a validation error.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification rejected. Check credentials or try another track.');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-[calc(100vh-2rem)] flex items-center justify-center p-4 md:p-12 overflow-hidden bg-[#030303]" 
      id="welcome-portal-stage"
    >
      {/* Immersive Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/10 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[5%] left-[5%] w-[35vw] h-[35vw] rounded-full bg-violet-600/10 blur-[110px]" />
        <div className="absolute inset-0 opacity-20 subtle-grid" />
      </div>

      <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="welcome-portal-container">
        
        {/* LEFT COLUMN: Hero Presentation & Product Design */}
        <div className="lg:col-span-6 space-y-8 text-left" id="welcome-hero-panel">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
          >
            <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-300 font-mono uppercase tracking-widest">
              High-Fidelity AI Career Platform
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              interview<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 glow-text-blue">.ai</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-lg font-medium">
              Elevate career preparation using high-end diagnostics. Real-time ATS analytics, voice-driven custom interviews, filler word detection speed indicators, and dynamic curricular roadmaps.
            </p>
          </motion.div>

          {/* Redesigned Bento Grid of Features */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4" 
            id="welcome-features-grid"
          >
            <div className="glass-panel p-4 rounded-xl flex gap-3 text-left hover:border-zinc-700/60 transition-all group">
              <div className="h-9 w-9 shrink-0 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Globe className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-100 font-sans tracking-tight">Smart ATS Analyzer</h4>
                <p className="text-[10px] text-zinc-400 leading-snug">Extract advanced skills, score match metrics & fix fatal resume gaps.</p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl flex gap-3 text-left hover:border-zinc-700/60 transition-all group">
              <div className="h-9 w-9 shrink-0 bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
                <Video className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-100 font-sans tracking-tight">Adaptive Interviewer</h4>
                <p className="text-[10px] text-zinc-400 leading-snug">Continuous audio conversational questions tailored dynamically to target positions.</p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl flex gap-3 text-left hover:border-zinc-700/60 transition-all group">
              <div className="h-9 w-9 shrink-0 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-100 font-sans tracking-tight">Speech & Filler Audit</h4>
                <p className="text-[10px] text-zinc-400 leading-snug">Extracts posture cues, verbal tempo (WPM), and crutch filler words instantly.</p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl flex gap-3 text-left hover:border-zinc-700/60 transition-all group">
              <div className="h-9 w-9 shrink-0 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-100 font-sans tracking-tight">Study Path Compiler</h4>
                <p className="text-[10px] text-zinc-400 leading-snug">Generate highly categorized study modules based on discovered career gaps.</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Institutional Micro Badge */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono pt-6 border-t border-zinc-800"
          >
            <div className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-blue-500" />
              <span>MongoDB Atlas Secure Network</span>
            </div>
            <div className="h-3 w-px bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-violet-400" />
              <span>Placement Portal Edition</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Interactive Form with stunning glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-6 w-full max-w-md mx-auto" 
          id="welcome-interactive-card"
        >
          <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <div className="p-6 bg-gradient-to-b from-zinc-900/40 to-transparent border-b border-zinc-800 text-center">
              <h3 className="text-lg font-bold text-white tracking-tight">Secure Access Portal</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Authenticate to synchronize simulated ratings & record analytics</p>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Alert Notification System */}
              {errorMsg && (
                <div className="bg-red-950/45 text-red-300 text-xs p-3.5 rounded-xl border border-red-500/20 flex gap-2.5 items-start">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-950/45 text-emerald-300 text-xs p-3.5 rounded-xl border border-emerald-500/20 flex gap-2.5 items-start">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Authentication Tabs with premium styling */}
              <div className="flex border-b border-zinc-800 mb-2" id="auth-tabs">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${!isRegistering ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${isRegistering ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                >
                  Create Account
                </button>
              </div>

              {/* Login/Signup Forms */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {isRegistering && (
                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Navneet Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-800 outline-none focus:border-indigo-500/60 rounded-lg px-3 py-2 pl-10 text-xs text-white placeholder-zinc-600 transition-all font-sans"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                    E-mail Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="student@btech.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 outline-none focus:border-indigo-500/60 rounded-lg px-3 py-2 pl-10 text-xs text-white placeholder-zinc-600 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                    Secure Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 outline-none focus:border-indigo-500/60 rounded-lg px-3 py-2 pl-10 text-xs text-white placeholder-zinc-600 transition-all font-sans"
                    />
                  </div>
                </div>

                {isRegistering && (
                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                      Target Career Track
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <select
                        value={preferredRole}
                        onChange={(e) => setPreferredRole(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-800 outline-none focus:border-indigo-500/60 rounded-lg px-3 py-2 lg:py-2.5 pl-10 text-xs text-white transition-all font-sans appearance-none"
                      >
                        <option>MERN Developer</option>
                        <option>Java Developer</option>
                        <option>Python Developer</option>
                        <option>Frontend Developer</option>
                        <option>Backend Developer</option>
                        <option>Data Analyst</option>
                        <option>Data Scientist</option>
                        <option>HR Interview</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all border border-indigo-500/20"
                >
                  <span>{isLoading ? 'Verifying Coordinates...' : (isRegistering ? 'Register & Initialize' : 'Log In to Workspace')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* DEMO BYPASS SECTION FOR INSTITUTIONAL EVALUATORS */}
              <div className="mt-6 pt-5 border-t border-zinc-800 text-center space-y-3" id="reviewer-quick-lane">
                <p className="text-[10px] text-zinc-500 font-bold leading-none uppercase tracking-widest font-mono">
                  Reviewer Quick Lane
                </p>
                
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-center">
                  <span className="block text-[10px] text-zinc-400 leading-normal font-sans mb-3">
                    Skip onboarding to pre-populate mock transcripts, speech analysis databases, and custom career path roadmaps instantly:
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleLoadDemo}
                    disabled={isLoading}
                    className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white text-xs font-bold py-2 px-3 rounded-lg border border-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <UserCheck className="h-4 w-4 text-indigo-400" />
                    <span>1-Click Load demo evaluator account (demo123)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
