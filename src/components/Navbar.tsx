/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldAlert, 
  CheckCircle, 
  UserCheck, 
  LogOut, 
  Code, 
  Key,
  LayoutGrid, 
  Palette, 
  LayoutDashboard, 
  FileText, 
  Video, 
  Compass, 
  ChevronDown, 
  Sparkles, 
  Sliders, 
  Settings, 
  Wand2, 
  Laptop, 
  Moon, 
  Sun,
  Activity
} from 'lucide-react';

interface NavbarProps {
  onUserUpdate: (user: any | null) => void;
  currentUser: any | null;
  currentTab?: 'dashboard' | 'resume_analyzer' | 'video_interview_upload' | 'qa_video_analyzer' | 'career_roadmaps' | 'admin_panel';
  onTabChange?: (tab: 'dashboard' | 'resume_analyzer' | 'video_interview_upload' | 'qa_video_analyzer' | 'career_roadmaps' | 'admin_panel') => void;
  activeTheme?: string;
  onThemeChange?: (theme: string) => void;
  onCancelSession?: () => void;
  onCancelReplay?: () => void;
}

export default function Navbar({ 
  onUserUpdate, 
  currentUser,
  currentTab = 'dashboard',
  onTabChange,
  activeTheme = 'academic_day',
  onThemeChange,
  onCancelSession,
  onCancelReplay
}: NavbarProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [preferredRole, setPreferredRole] = useState('MERN Developer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showOpsDropdown, setShowOpsDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  // Handle auto load profile on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('interview_token');
    const savedUser = localStorage.getItem('interview_user');
    if (savedToken && savedUser) {
      try {
        onUserUpdate(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('interview_token');
        localStorage.removeItem('interview_user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('interview_token');
    localStorage.removeItem('interview_user');
    onUserUpdate(null);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const url = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const body = isRegistering 
      ? { email, password, fullName, preferredRole } 
      : { email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication process failed.');
      }

      localStorage.setItem('interview_token', data.token);
      localStorage.setItem('interview_user', JSON.stringify(data.user));
      onUserUpdate(data.user);
      setSuccess('Successfully authenticated!');
      setTimeout(() => {
        setShowAuthModal(false);
        // Clean inputs
        setEmail('');
        setPassword('');
        setFullName('');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
    }
  };

  const loadDemoUser = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@btech.edu', password: 'demo123' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem('interview_token', data.token);
      localStorage.setItem('interview_user', JSON.stringify(data.user));
      onUserUpdate(data.user);
      setSuccess('Demo account loaded!');
      setTimeout(() => {
        setShowAuthModal(false);
      }, 800);
    } catch (err: any) {
      setError('Unable to load demo account.');
    }
  };

  return (
    <header className="border-b border-zinc-800 bg-[#000000]/70 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between shadow-2xl shrink-0 text-white animate-fade-in" id="app-header">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-lg px-2.5 py-1 flex items-center justify-center font-black text-xs shadow-md tracking-tight">
          i<span className="text-zinc-300">.ai</span>
        </div>
        <div>
          <h1 className="text-sm md:text-base font-bold tracking-tight text-white flex items-center gap-1.5 leading-tight">
            interview.ai <span className="text-[10px] bg-zinc-900 text-indigo-400 font-medium px-2 py-0.5 rounded-md border border-zinc-800">v2.4.0</span>
          </h1>
          <p className="text-[10px] text-zinc-400 font-mono tracking-tight font-medium">Replay, Filler Tracker & Interactive Speech Scoring</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {currentUser ? (
          <div className="flex items-center space-x-3 animate-fade-in" id="user-profile-badge">
            {/* 1. OPERATIONS MENU DROPDOWN UNDER AN ICON */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowOpsDropdown(!showOpsDropdown);
                  setShowThemeDropdown(false);
                }}
                className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  showOpsDropdown 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
                title="Operations Hub"
                id="header-ops-menu-trigger"
              >
                <LayoutGrid className="h-4.5 w-4.5 shrink-0" />
                <span className="hidden lg:inline text-[11px]">Operations Center</span>
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${showOpsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showOpsDropdown && (
                <div 
                  className="absolute right-0 mt-2.5 w-72 bg-[#09090b]/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl p-2.5 z-50 text-white animate-fade-in animate-scale-in"
                  id="header-ops-dropdown-panel"
                >
                  <div className="px-2 py-1.5 border-b border-zinc-900 mb-2">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Select Active Topic / Activity</span>
                  </div>
                  
                  <div className="space-y-1">
                    {(() => {
                      const operations = [
                        { id: 'dashboard', name: 'Dashboard & Metrics', icon: LayoutDashboard, color: 'text-blue-400' },
                        { id: 'resume_analyzer', name: 'Resume ATS Analyzer', icon: FileText, color: 'text-emerald-400' },
                        { id: 'video_interview_upload', name: 'Interview Video Upload', icon: Video, color: 'text-rose-400' },
                        { id: 'qa_video_analyzer', name: 'QA Video Analyzer', icon: UserCheck, color: 'text-amber-400' },
                        { id: 'career_roadmaps', name: 'Career study path', icon: Compass, color: 'text-purple-400' }
                      ];
                      
                      if (currentUser && currentUser.role === 'admin') {
                        operations.push({
                          id: 'admin_panel',
                          name: 'Admin Control Hub',
                          icon: Sliders,
                          color: 'text-red-400'
                        });
                      }

                      return operations.map((item) => {
                        const IconComponent = item.icon;
                        const isSelected = currentTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (onCancelSession) onCancelSession();
                              if (onCancelReplay) onCancelReplay();
                              if (onTabChange) onTabChange(item.id as any);
                              setShowOpsDropdown(false);
                            }}
                            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all text-left cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-600 font-bold text-white shadow-md' 
                                : 'text-zinc-300 hover:bg-zinc-900/60 hover:text-white'
                            }`}
                          >
                            <IconComponent className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : item.color}`} />
                            <span className="flex-1">{item.name}</span>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* 2. THEME SWITCHER DROPDOWN UNDER AN ICON */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowThemeDropdown(!showThemeDropdown);
                  setShowOpsDropdown(false);
                }}
                className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  showThemeDropdown 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
                title="Visual Theme Center"
                id="header-theme-menu-trigger"
              >
                <Palette className="h-4.5 w-4.5 shrink-0" />
                <span className="hidden lg:inline text-[11px]">User Themes</span>
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${showThemeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showThemeDropdown && (
                <div 
                  className="absolute right-0 mt-2.5 w-64 bg-[#09090b]/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl p-2.5 z-50 text-white animate-fade-in animate-scale-in"
                  id="header-theme-dropdown-panel"
                >
                  <div className="px-2 py-1.5 border-b border-zinc-900 mb-2">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Change Interface Theme</span>
                  </div>
                  
                  <div className="space-y-1">
                    {[
                      { id: 'academic_day', name: 'Academic Slate (Light)', icon: Sun, color: 'text-blue-400', isDark: false },
                      { id: 'slate_midnight', name: 'Slate Midnight (Dark)', icon: Moon, color: 'text-indigo-400', isDark: true },
                      { id: 'cyber_glass', name: 'Cyber Glass (Dark Neon)', icon: Sparkles, color: 'text-rose-400', isDark: true },
                      { id: 'mint_aurora', name: 'Ecology Mint (Light)', icon: Wand2, color: 'text-emerald-400', isDark: false },
                      { id: 'fuchsia_cosmos', name: 'Cosmic Purple (Dark)', icon: Palette, color: 'text-purple-400', isDark: true },
                    ].map((themeItem) => {
                      const IconComponent = themeItem.icon;
                      const isSelected = activeTheme === themeItem.id;
                      return (
                        <button
                          key={themeItem.id}
                          type="button"
                          onClick={() => {
                            if (onThemeChange) onThemeChange(themeItem.id);
                            setShowThemeDropdown(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-semibold tracking-tight transition-all text-left cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-600 font-bold text-white shadow-xs' 
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <IconComponent className={`h-4 w-4 shrink-0 ${themeItem.color}`} />
                          <div className="flex-1 flex flex-col">
                            <span>{themeItem.name}</span>
                            <span className="text-[9px] text-slate-400 lowercase">{themeItem.isDark ? 'Dark Theme' : 'Light Theme'}</span>
                          </div>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right hidden sm:block border-l border-slate-800 pl-3">
              <span className="block text-xs font-semibold text-slate-100">{currentUser.fullName}</span>
              <span className="block text-[10px] text-slate-400 font-mono">{currentUser.preferredRole || 'MERN Developer'}</span>
            </div>
            <div className="h-8 w-8 bg-slate-800 border border-slate-700 rounded-md flex items-center justify-center text-blue-400">
              <UserCheck className="h-4.5 w-4.5" />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors"
              title="Logout session"
              id="logout-button"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-[11px]">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setIsRegistering(false);
              setShowAuthModal(true);
            }}
            className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-3.5 py-1.5 rounded-md text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            id="login-trigger-button"
          >
            <Key className="h-3.5 w-3.5" />
            Sign In / Register
          </button>
        )}
      </div>

      {/* Auth Modal overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-panel rounded-2xl max-w-sm w-full shadow-2xl border border-zinc-800 overflow-x-hidden text-zinc-100 relative" id="auth-modal-content">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            <div className="bg-gradient-to-b from-zinc-900/60 to-transparent p-5 text-center border-b border-zinc-800/80">
              <h3 className="text-sm font-bold tracking-tight text-white">Academic Portal Auth</h3>
              <p className="text-[10px] text-zinc-400 mt-1 font-mono">Secure JWT session environment for evaluation</p>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="p-5 space-y-3">
              {error && (
                <div className="bg-red-950/45 text-red-300 text-[11px] p-3 rounded-lg border border-red-500/20 flex items-start gap-1.5 text-left">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-emerald-950/45 text-emerald-300 text-[11px] p-3 rounded-lg border border-emerald-500/20 flex items-start gap-1.5 text-left">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {isRegistering && (
                <div className="text-left font-sans">
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-zinc-400 mb-1 font-mono">Full Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navneet Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 outline-none focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 transition-all"
                  />
                </div>
              )}

              <div className="text-left font-sans">
                <label className="block text-[9px] uppercase font-bold tracking-widest text-zinc-400 mb-1 font-mono">E-mail Address</label>
                <input
                  type="email"
                  required
                  placeholder="student@btech.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 outline-none focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 transition-all"
                />
              </div>

              <div className="text-left font-sans">
                <label className="block text-[9px] uppercase font-bold tracking-widest text-zinc-400 mb-1 font-mono">Access Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 outline-none focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 transition-all"
                />
              </div>

              {isRegistering && (
                <div className="text-left font-sans">
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-zinc-400 mb-1 font-mono">Target Track Role</label>
                  <select
                    value={preferredRole}
                    onChange={(e) => setPreferredRole(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 outline-none focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white transition-all appearance-none"
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
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors font-bold cursor-pointer"
                >
                  {isRegistering ? 'Have an account? Sign In' : 'Create an Account'}
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold hover:bg-indigo-500 px-4 py-2 rounded-lg text-xs shadow-md border border-indigo-500/20 cursor-pointer transition-all"
                >
                  {isRegistering ? 'Register Now' : 'Sign In'}
                </button>
              </div>

              {!isRegistering && (
                <div className="border-t border-zinc-900 pt-3 text-center" id="demo-credentials-prompt">
                  <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-850 flex flex-col items-center">
                    <p className="text-[10px] text-zinc-400 text-center leading-normal mb-2.5 font-sans">
                      Academic reviewer or evaluator? Pre-seed student logs instantly:
                    </p>
                    <button
                      type="button"
                      onClick={loadDemoUser}
                      className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white text-[10px] font-bold py-1.5 rounded-lg border border-indigo-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                      <span>1-Click Demo Login</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full mt-2 text-center text-[10px] text-zinc-500 hover:text-zinc-300 pt-3 border-t border-zinc-900 font-bold tracking-wider uppercase font-mono"
              >
                Close Window
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
