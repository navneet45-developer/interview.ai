import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Video, 
  TrendingUp, 
  Trash2, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  BarChart3, 
  Database, 
  AlertCircle, 
  Command, 
  RefreshCw, 
  Sliders, 
  LayoutDashboard, 
  CheckCircle,
  Calendar,
  Compass,
  AlertTriangle
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: any;
}

export default function AdminPanel({ currentUser }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'resumes' | 'interviews'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // States for query collections
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [resumesList, setResumesList] = useState<any[]>([]);
  const [interviewsList, setInterviewsList] = useState<any[]>([]);

  // Filtering states for users list
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userBlockFilter, setUserBlockFilter] = useState('');

  // Authentication configuration
  const getToken = () => localStorage.getItem('interview_token') || '';

  const triggerToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setError(null);
    } else {
      setError(msg);
      setSuccessMsg(null);
    }
    setTimeout(() => {
      setSuccessMsg(null);
      setError(null);
    }, 5000);
  };

  // 1. Fetch system statistics
  const fetchStats = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/detailed-stats', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || "Failed to load dashboard metrics.");
      }
    } catch (err: any) {
      setError("Server communications error during metrics load.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch users directory with parameters
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (userSearch) q.append('search', userSearch);
      if (userRoleFilter) q.append('role', userRoleFilter);
      if (userBlockFilter) q.append('isBlocked', userBlockFilter);

      const resp = await fetch(`/api/admin/users?${q.toString()}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setUsersList(data.users);
      } else {
        setError(data.error || "Failed to load user directories.");
      }
    } catch (err) {
      setError("Server connection offline during query.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch master resumes
  const fetchResumes = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/resumes', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setResumesList(data.resumes);
      } else {
        setError(data.error || "Failed to retrieve candidate resumes.");
      }
    } catch (err) {
      setError("Network issues loading uploaded resumes.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch master interview loops
  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/interviews', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setInterviewsList(data.interviews);
      } else {
        setError(data.error || "Failed to retrieve student sessions.");
      }
    } catch (err) {
      setError("Network issues obtaining active logs.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger content population based on current selection
  useEffect(() => {
    if (activeSubTab === 'overview') fetchStats();
    if (activeSubTab === 'users') fetchUsers();
    if (activeSubTab === 'resumes') fetchResumes();
    if (activeSubTab === 'interviews') fetchInterviews();
  }, [activeSubTab]);

  // Run dynamic users filter query on button click or keyword enter
  const handleUserFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  // Toggle user blocked state
  const handleToggleBlock = async (userId: string, isCurrentlyBlocked: boolean) => {
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    try {
      const resp = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        triggerToast(data.msg, 'success');
        // Refresh users roster
        fetchUsers();
      } else {
        triggerToast(data.error || `Unable to completed suspension trigger.`, 'error');
      }
    } catch (err) {
      triggerToast("Network link failed to process request.", 'error');
    }
  };

  // Delete user account cascade
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`CRITICAL HAZARD ACTION!\n\nAre you absolutely sure you want to permanently delete user "${userName}"?\n\nThis will instantly remove their Mongoose files, resume histories, interview evaluations, and analytics metrics recursively.`)) {
      return;
    }
    try {
      const resp = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        triggerToast(data.msg, 'success');
        fetchUsers();
      } else {
        triggerToast(data.error || "Account deletion was rejected.", 'error');
      }
    } catch (err) {
      triggerToast("System offline during deletion dispatch.", 'error');
    }
  };

  // Delete Resume
  const handleDeleteResume = async (resumeId: string) => {
    if (!window.confirm("Archive deletion trigger!\n\nAre you sure you want to clear this CV Analyzer file record permanently?")) {
      return;
    }
    try {
      const resp = await fetch(`/api/admin/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        triggerToast(data.msg, 'success');
        fetchResumes();
      } else {
        triggerToast(data.error || "Cannot complete file deletion request.", 'error');
      }
    } catch (err) {
      triggerToast("Network link failed to reach file system.", 'error');
    }
  };

  // Delete Interview
  const handleDeleteInterview = async (interviewId: string) => {
    if (!window.confirm("Auditing clean requirement!\n\nAre you sure you want to permanently delete this Candidate Speech Interview record and its corresponding overall report from the database?")) {
      return;
    }
    try {
      const resp = await fetch(`/api/admin/interviews/${interviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        triggerToast(data.msg, 'success');
        fetchInterviews();
      } else {
        triggerToast(data.error || "Cannot complete record cleanup.", 'error');
      }
    } catch (err) {
      triggerToast("Network link failed to process telemetry update.", 'error');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-hidden" id="admin-panel-container">
      {/* 1. Header banner */}
      <div className="bg-slate-900 px-6 py-5 text-white flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-md">
              <Command className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold tracking-tight">Administrative Supervision Hub</h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono uppercase tracking-wider">
            Protected Role-Based Console (RBAC Stage: Active Level-1)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-[10px] bg-slate-800 text-emerald-400 border border-slate-700 px-2.5 py-1 rounded font-mono font-bold flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            ROOT AUTHORITY ENABLED
          </span>
          <button 
            onClick={() => {
              if (activeSubTab === 'overview') fetchStats();
              if (activeSubTab === 'users') fetchUsers();
              if (activeSubTab === 'resumes') fetchResumes();
              if (activeSubTab === 'interviews') fetchInterviews();
            }}
            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Reload
          </button>
        </div>
      </div>

      {/* 2. Embedded Toast Indicator */}
      {(error || successMsg) && (
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex transition-all duration-300">
          {error && (
            <div className="w-full bg-rose-50 border border-rose-100/80 rounded-lg p-3 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="w-full bg-emerald-50 border border-emerald-100/80 rounded-lg p-3 text-emerald-700 text-xs flex items-center gap-2 font-medium">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Sub Tabs Rail Selector */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
          { id: 'users', label: 'Candidate Accounts', icon: Users },
          { id: 'resumes', label: 'ATS Resume Archives', icon: FileText },
          { id: 'interviews', label: 'Interview Loops & Scorecards', icon: Video }
        ].map((sub) => {
          const SIcon = sub.icon;
          const isSelected = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <SIcon className="h-4 w-4 shrink-0" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Active Area View Canvas */}
      <div className="p-6">
        {loading && !stats && usersList.length === 0 && resumesList.length === 0 && interviewsList.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-xs mt-3 font-mono">Quarrying master collections, please wait...</p>
          </div>
        ) : (
          <>
            {/* TAB: OVERVIEW */}
            {activeSubTab === 'overview' && stats && (
              <div className="space-y-6">
                {/* Visual Bento Stats Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Total Candidates</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-extrabold text-slate-900">{stats.totalUsers}</span>
                      <Users className="h-5 w-5 text-blue-500 shrink-0 self-center" />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">ATS Resumes Tested</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-extrabold text-slate-900">{stats.totalResumes}</span>
                      <FileText className="h-5 w-5 text-emerald-500 shrink-0 self-center" />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Speech Interviews</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-extrabold text-slate-900">{stats.totalInterviews}</span>
                      <Video className="h-5 w-5 text-rose-500 shrink-0 self-center" />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Reports Compiled</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-extrabold text-slate-900">{stats.totalReports}</span>
                      <TrendingUp className="h-5 w-5 text-purple-500 shrink-0 self-center" />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 col-span-2 lg:col-span-1">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Roadmaps Generated</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-extrabold text-slate-900">{stats.totalRoadmaps}</span>
                      <Compass className="h-5 w-5 text-amber-500 shrink-0 self-center" />
                    </div>
                  </div>
                </div>

                {/* Score Medians & Database status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-600/80 font-mono block">Median ATS Compatibility</span>
                      <p className="text-2xl font-black text-blue-900 mt-1">{stats.avgAts}%</p>
                      <p className="text-[11px] text-blue-700/80 mt-1">Sourced from processed PDF keyword evaluations.</p>
                    </div>
                    <Sliders className="h-10 w-10 text-blue-400/40" />
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-600/80 font-mono block">Average Speech Presentation Score</span>
                      <p className="text-2xl font-black text-emerald-900 mt-1">{stats.avgInterview} / 10</p>
                      <p className="text-[11px] text-emerald-700/80 mt-1">Weighted metric considering pauses, fillers and tempo.</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-emerald-400/40" />
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between text-white">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
                      <Database className="h-4.5 w-4.5" />
                      <span>MONGODB CLUSTER STATE: ONLINE</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      All indexes parsed. Data synchronization verified on multi-tenant architecture schemas.
                    </p>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 mt-3 font-semibold block">Host: AWS Mumbai (M0 Cluster)</span>
                  </div>
                </div>

                {/* Growth trend metrics visually styled */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-indigo-500" />
                      <h3 className="text-xs font-bold text-slate-800">Weekly Candidate Registrations Trend</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Last 7 Days</span>
                  </div>

                  <div className="grid grid-cols-7 gap-2.5 items-end h-40 pt-4" id="trend-graph-area">
                    {stats.growthTrend?.map((item: any, i: number) => {
                      const maxCount = Math.max(...stats.growthTrend.map((el: any) => el.count), 1);
                      const heightPercent = Math.min(100, Math.max(8, (item.count / maxCount) * 100));
                      return (
                        <div key={i} className="flex flex-col items-center gap-2Group h-full justify-end">
                          <div className="text-[10px] font-bold text-slate-500 text-center mb-1 font-mono">{item.count}</div>
                          <div 
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 rounded-t-sm transition-all duration-300 relative group flex items-end justify-center"
                          >
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[9px] font-medium p-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity mb-1 whitespace-nowrap z-55">
                              {item.count} new student sign-ups
                            </span>
                          </div>
                          <div className="text-[9px] font-bold font-mono mt-1.5 text-slate-400 capitalize text-center uppercase tracking-tighter truncate max-w-full">
                            {item.date}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: USERS LIST */}
            {activeSubTab === 'users' && (
              <div className="space-y-4">
                {/* Filter and Search Form */}
                <form onSubmit={handleUserFilterSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 font-mono">Search Name, Email or Track</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input 
                        type="search"
                        placeholder="e.g. Navneet Kumar"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-36">
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 font-mono">System Role</label>
                    <select 
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="w-full py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500 font-semibold"
                    >
                      <option value="">All Roles</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="w-full md:w-36">
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 font-mono">Block Status</label>
                    <select 
                      value={userBlockFilter}
                      onChange={(e) => setUserBlockFilter(e.target.value)}
                      className="w-full py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500 font-semibold"
                    >
                      <option value="">All States</option>
                      <option value="true">Suspended Only</option>
                      <option value="false">Active Only</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full md:w-auto px-5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filter Query
                  </button>
                </form>

                {/* Directory table */}
                <div className="border border-slate-200 rounded-xl overflow-x-hidden" id="users-table-frame">
                  {usersList.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-slate-50 font-mono text-xs">
                      No customer account matched criteria. Try clear the queries parameters filters.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Candidate student</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">System Role</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Target Track</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Account Creation</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Last Login stamp</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">State status</th>
                            <th className="px-4 py-3 text-right text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Actions Dispatch</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-xs font-medium text-slate-700">
                          {usersList.map((usr) => (
                            <tr key={usr._id} className="hover:bg-slate-50/50 transition-all font-semibold">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-slate-900 text-xs font-extrabold">{usr.fullName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{usr.email}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono border ${
                                  usr.role === 'admin' 
                                    ? 'bg-purple-100 border-purple-200 text-purple-700' 
                                    : 'bg-blue-100 border-blue-200 text-blue-700'
                                }`}>
                                  {usr.role || 'user'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">
                                {usr.preferredRole || 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">
                                {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'Original'}
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">
                                {usr.lastLogin ? new Date(usr.lastLogin).toLocaleString() : 'Never logged'}
                              </td>
                              <td className="px-4 py-3">
                                {usr.isBlocked ? (
                                  <span className="inline-flex items-center gap-1 text-rose-600 font-mono text-[10px] uppercase">
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                    Blocked
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-mono text-[10px] uppercase">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                    Active
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlock(usr._id, usr.isBlocked)}
                                  disabled={usr._id === currentUser.id}
                                  className={`p-1 bg-white border rounded cursor-pointer transition-colors ${
                                    usr._id === currentUser.id 
                                      ? 'opacity-30 border-slate-100 text-slate-300' 
                                      : usr.isBlocked 
                                        ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' 
                                        : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                  }`}
                                  title={usr.isBlocked ? "Revoke Suspension" : "Block Access"}
                                >
                                  {usr.isBlocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(usr._id, usr.fullName)}
                                  disabled={usr._id === currentUser.id}
                                  className={`p-1 bg-white border rounded text-slate-400 cursor-pointer hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors ${
                                    usr._id === currentUser.id ? 'opacity-30 cursor-not-allowed' : ''
                                  }`}
                                  title="Unrecoverable cascade deletion"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: RESUMES ARCHIVES */}
            {activeSubTab === 'resumes' && (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl overflow-x-hidden" id="resumes-table-frame">
                  {resumesList.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-slate-50 font-mono text-xs">
                      No CV records analyzed by candidates in this MongoDB yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Candidate Student Name</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Original File Name</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Target Parsed Role</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Parsed timestamp</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">ATS score match</th>
                            <th className="px-4 py-3 text-right text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Clear CV records</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-xs font-medium text-slate-700">
                          {resumesList.map((res) => (
                            <tr key={res._id || res.id} className="hover:bg-slate-50/50 transition-all font-semibold">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-slate-900 text-xs font-extrabold">{res.user?.fullName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{res.user?.email || "N/A"}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-mono font-semibold max-w-xs truncate" title={res.fileName || res.originalName}>
                                {res.fileName || res.originalName || "Uploaded CV_Doc"}
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-mono text-[10px] uppercase">
                                {res.targetRole || "MERN Student"}
                              </td>
                              <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">
                                {res.createdAt ? new Date(res.createdAt).toLocaleString() : 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                                  (res.atsScore || 0) >= 75 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : (res.atsScore || 0) >= 50 
                                      ? 'bg-amber-100 text-amber-800' 
                                      : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {res.atsScore || 0}% Match
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteResume(res._id || res.id)}
                                  className="p-1 px-2 border border-rose-200 rounded text-rose-600 hover:bg-rose-50 cursor-pointer text-[10px] font-bold flex items-center gap-1 ml-auto"
                                  title="Remove resume logs permanently"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Clear CV</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: INTERVIEWS LOOP */}
            {activeSubTab === 'interviews' && (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl overflow-x-hidden" id="interviews-table-frame">
                  {interviewsList.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-slate-50 font-mono text-xs">
                      No speech loops or mock sessions performed yet in this deployment database.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Candidate Student</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Interview track</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Difficulty</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Interviews loop questions</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Total answers</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Evaluation result</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Session createdAt</th>
                            <th className="px-4 py-3 text-right text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Dispatch Clean</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-xs font-medium text-slate-700">
                          {interviewsList.map((int) => (
                            <tr key={int._id || int.id} className="hover:bg-slate-50/50 transition-all font-semibold">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-slate-900 text-xs font-extrabold">{int.user?.fullName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{int.user?.email || "N/A"}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-indigo-700 font-medium font-mono text-[10px]">
                                {int.role || "Specialist Developer"}
                              </td>
                              <td className="px-4 py-3 font-semibold">
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono tracking-tight ${
                                  int.difficulty === 'Hard' 
                                    ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                    : int.difficulty === 'Medium' 
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                }`}>
                                  {int.difficulty || 'Medium'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500 text-[10px]">
                                <ul className="list-disc list-inside max-w-xs space-y-0.5 truncate font-medium">
                                  {int.questions?.map((q: string, idx: number) => (
                                    <li key={idx} className="truncate" title={q}>
                                      {q}
                                    </li>
                                  ))}
                                </ul>
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-slate-600 text-center text-[10px]">
                                {int.answers?.length || 0}
                              </td>
                              <td className="px-4 py-3">
                                {int.report ? (
                                  <span className="inline-flex items-center gap-1 font-mono font-black text-xs text-blue-700">
                                    {int.report.overallScore || 0} / 10
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-mono text-[10px]">No Report</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">
                                {int.createdAt ? new Date(int.createdAt).toLocaleString() : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInterview(int._id || int.id)}
                                  className="p-1 px-2 border border-slate-200 rounded text-slate-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 cursor-pointer text-[10px] font-bold flex items-center gap-1 ml-auto transition-colors"
                                  title="Permanent telemetry disposal"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Archive</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
