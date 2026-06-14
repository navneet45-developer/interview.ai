import React, { useState, useEffect } from 'react';
import { Map, Star, Compass, Play, Calendar, ExternalLink, RefreshCw, AlertCircle, ShieldCheck, CheckCircle } from 'lucide-react';

interface CareerRoadmapsProps {
  currentUser: any;
}

export default function CareerRoadmaps({ currentUser }: CareerRoadmapsProps) {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState('MERN Developer');
  const [activeRoadmap, setActiveRoadmap] = useState<any | null>(null);
  const [errorStr, setErrorStr] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadRoadmaps();
    }
  }, [currentUser]);

  const loadRoadmaps = async () => {
    setLoading(true);
    setErrorStr(null);
    try {
      const token = localStorage.getItem('interview_token');
      const res = await fetch('/api/roadmaps/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setRoadmaps(data.roadmaps);
          if (data.roadmaps.length > 0) {
            setActiveRoadmap(data.roadmaps[0]);
          }
        }
      }
    } catch (e) {
      console.error("Error loading profile roadmaps: ", e);
    } finally {
      setLoading(false);
    }
  };

  const triggerNewRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setErrorStr(null);

    try {
      const token = localStorage.getItem('interview_token');
      const response = await fetch('/api/roadmaps/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resultId: "manual_gen_" + Math.random().toString(36).substr(2, 9),
          role: targetRole
        })
      });

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          setRoadmaps(prev => [data.roadmap, ...prev]);
          setActiveRoadmap(data.roadmap);
        } else {
          setErrorStr(data.error || "Path compiler reported a structural error.");
        }
      } else {
        setErrorStr("Path compiler reported a structural error: invalid response from server.");
      }
    } catch (err) {
      setErrorStr("Failed to link to B.Tech career compilation microservices.");
    } finally {
      setGenerating(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center shadow-xs">
        <Compass className="h-10 w-10 text-slate-400 mx-auto mb-2 animate-bounce" />
        <h3 className="text-sm font-bold text-slate-700">Access Roadmap Portal</h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">Log in or register to compile personalized weekly learning programs based on mock metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in" id="roadmaps-view-container">
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight uppercase flex items-center gap-1.5">
              <Map className="h-4.5 w-4.5 text-blue-600" /> AI Career Pathway & Roadmap Generator
            </h2>
            <p className="text-[11px] text-slate-500">Mines weak areas from previous mock recordings to compose custom week-by-week study targets</p>
          </div>

          <form onSubmit={triggerNewRoadmap} className="flex items-center gap-2">
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500 font-semibold"
            >
              <option>MERN Developer</option>
              <option>Java Developer</option>
              <option>Python Developer</option>
              <option>System Architect</option>
              <option>Data Engineer</option>
            </select>

            <button
              type="submit"
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded text-xs shrink-0 cursor-pointer flex items-center gap-1 font-mono uppercase tracking-wide border border-blue-500 hover:border-blue-600 text-[10px]"
            >
              {generating ? "Compiling..." : "Generate New Pathway"}
            </button>
          </form>
        </div>

        {errorStr && (
          <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded border border-red-100 mt-3">
            {errorStr}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="roadmaps-columns">
        {/* Left Side: history list selector */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3 lg:col-span-1">
          <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Your Stored Pathways ({roadmaps.length})</span>
          
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono animate-pulse">Loading saved configurations...</div>
          ) : roadmaps.length > 0 ? (
            <div className="space-y-2">
              {roadmaps.map(road => (
                <button
                  key={road.id || road._id}
                  onClick={() => setActiveRoadmap(road)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${activeRoadmap && (activeRoadmap.id === road.id || activeRoadmap._id === road._id) ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'}`}
                >
                  <span className="block text-xs font-bold truncate">{road.role} Roadmap</span>
                  <span className="block text-[9px] text-slate-400 font-mono mt-0.5">Attempt: {new Date(road.createdAt || Date.now()).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-150 rounded p-4 text-center">
              <p className="text-[11px] text-slate-400 font-mono">Select target role and click Generate above to build your very first roadmap!</p>
            </div>
          )}
        </div>

        {/* Right Side: Active Roadmap visual boards */}
        <div className="lg:col-span-2">
          {activeRoadmap ? (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-5 animate-fade-in" id="active-roadmap-billboard">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[8.5px] font-extrabold text-blue-600 uppercase font-mono bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">LEARNING PATHWAY ACTIVE</span>
                  <h3 className="text-sm font-black text-slate-800 mt-1 uppercase">{activeRoadmap.role} Masterclass Program</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-medium">Compiled chronologically</span>
              </div>

              {/* Study Plan text */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-600 leading-relaxed font-mono">
                <strong>AI Assessment Plan:</strong> {activeRoadmap.studyPlan}
              </div>

              {/* Weekly blocks */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Weekly Milestone Tracks</h4>
                {activeRoadmap.weeklyRoadmap.map((wk: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs hover:border-slate-300 transition-all relative overflow-x-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-blue-800 font-mono uppercase bg-blue-50 px-1.5 py-0.5 rounded">{wk.week}</span>
                      <span className="text-[10px] text-slate-500 font-bold truncate italic max-w-[250px]">{wk.objective}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div>
                        <span className="block text-[8.5px] font-bold text-slate-400 uppercase font-mono">Core Study Topics</span>
                        <ul className="space-y-1 mt-1 pl-4">
                          {wk.topics.map((t: string, i: number) => (
                            <li key={i} className="text-[10px] font-bold text-slate-600 list-disc leading-normal font-mono">{t}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-50/50 p-2 rounded border border-slate-100 space-y-1">
                        <span className="block text-[8.5px] font-bold text-slate-400 uppercase font-mono">Recommended Resources</span>
                        <ul className="space-y-1">
                          {wk.resources.map((r: string, i: number) => (
                            <li key={i} className="text-[9px] font-extrabold text-blue-700 flex items-center gap-1">
                              <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="hover:underline cursor-pointer font-mono">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Sequence Objectives</h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                    {activeRoadmap.learningSequence.map((seq: string, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 text-[10px] font-bold text-slate-600 flex items-center gap-2 font-mono">
                        <span className="bg-blue-600 text-white rounded-full h-4.5 w-4.5 text-[9px] font-mono flex items-center justify-center shrink-0">{idx+1}</span>
                        <span>{seq}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Skills To Strengthen</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRoadmap.skillsToImprove.map((skill: string) => (
                      <span key={skill} className="bg-blue-50 text-blue-800 border border-blue-100 font-sans font-black text-[9px] px-2.5 py-0.5 rounded shadow-2xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center shadow-xs">
              <Compass className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-600">Select Roadmap</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">Pick a pathway from the history list, or launch a new compilation above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
