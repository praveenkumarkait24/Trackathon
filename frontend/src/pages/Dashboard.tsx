import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { supabase } from '../services/supabase.js';
import { 
  Trophy, 
  Clock, 
  Calendar, 
  Award, 
  Users, 
  Sparkles, 
  Plus,
  ArrowRight,
  BookmarkCheck,
  Zap,
  Target
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

export const Dashboard: React.FC = () => {
  const [hackathons, setHackathons] = useState<any[]>(() => {
    return api.getCached('/hackathons') || [];
  });
  const [loading, setLoading] = useState(() => {
    return !api.getCached('/hackathons');
  });
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await api.get('/hackathons');
        setHackathons(data);
      } catch (err: any) {
        if (!api.getCached('/hackathons')) {
          setError(err.message || 'Failed to fetch dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);



  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-rose-500/25 max-w-lg mx-auto text-center space-y-4">
        <p className="text-rose-300 font-medium">Error loading dashboard: {error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm border border-cardBorder">
          Try Again
        </button>
      </div>
    );
  }

  // --- STATS COMPUTATION ---
  const totalHackathons = hackathons.length;
  const ongoingHackathons = hackathons.filter(h => h.status === 'ongoing').length;
  const upcomingHackathons = hackathons.filter(h => h.status === 'upcoming').length;
  const completedHackathons = hackathons.filter(h => h.status === 'completed').length;
  
  const achievements = hackathons.map(h => h.achievements).filter(Boolean);
  const winnersCount = achievements.filter(a => a.result === 'winner').length;
  const runnerupsCount = achievements.filter(a => a.result === 'runner_up').length;
  const finalistsCount = achievements.filter(a => a.result === 'finalist').length;
  const certificatesCount = achievements.filter(a => a.certificate_url).length;

  // --- PREPARE DATA FOR CHARTS ---
  // Chart 1: Participation Mode (Team vs Individual)
  const teamCount = hackathons.filter(h => h.participation_type === 'team').length;
  const individualCount = hackathons.filter(h => h.participation_type === 'individual').length;
  const modeData = [
    { name: 'Team', value: teamCount },
    { name: 'Individual', value: individualCount }
  ].filter(d => d.value > 0);

  // Chart 2: Status Breakdown
  const statusData = [
    { name: 'Upcoming', value: upcomingHackathons },
    { name: 'Ongoing', value: ongoingHackathons },
    { name: 'Completed', value: completedHackathons }
  ].filter(d => d.value > 0);

  // Chart 3: Monthly Participation Trends (Last 6 Months)
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      name: date.toLocaleString('default', { month: 'short' }),
      monthNum: date.getMonth(),
      year: date.getFullYear(),
      count: 0
    };
  }).reverse();

  hackathons.forEach(h => {
    if (h.start_date) {
      const d = new Date(h.start_date);
      const match = last6Months.find(m => m.monthNum === d.getMonth() && m.year === d.getFullYear());
      if (match) {
        match.count += 1;
      }
    }
  });

  const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'];

  // Upcoming deadlines listing
  const upcomingDeadlines = hackathons
    .filter(h => h.registration_deadline && new Date(h.registration_deadline) > new Date())
    .map(h => ({
      id: h.id,
      name: h.name,
      deadline: new Date(h.registration_deadline),
      type: 'Registration'
    }))
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 4);

  // Recent updates
  const recentHackathons = [...hackathons]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  // Empty State Onboarding
  if (totalHackathons === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-slide-up">
        {/* Banner Card */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-[#111928] via-[#090d16] to-[#090d16] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="max-w-xl space-y-6 text-left relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Let's Get Started</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight font-outfit">
              No Hackathons Tracked Yet
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Trackathon is designed to keep all your competitive programming details organized. Register teammate details, round statuses, email/push settings, calendar syncing, and proof uploads.
            </p>
            <Link
              to="/hackathons/add"
              className="inline-flex items-center space-x-3 px-6 py-3.5 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-bold shadow-glow hover:shadow-indigo-500/30 transition-all hover:scale-[1.02]"
            >
              <Plus size={18} />
              <span>Track Your First Hackathon</span>
            </Link>
          </div>
        </div>

        {/* Informative Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-3">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
              <Target size={20} />
            </div>
            <h3 className="font-bold text-white">Record Hackathon Info</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Save registration links, timelines, domain categories, prize breakdowns, and event modes.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-3">
            <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-white">Interactive Rounds</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Follow our database progression system. Round 2 unlocks only after completing Round 1.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
              <BookmarkCheck size={20} />
            </div>
            <h3 className="font-bold text-white">Build Your Portfolio</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Complete events, upload your certificates/proofs, and share your live Github & demo links.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit tracking-wide">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time tracker metrics for your coding hackathons.</p>
        </div>
        <Link 
          to="/hackathons/add" 
          className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-extrabold text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus size={18} />
          <span>Add Hackathon</span>
        </Link>
      </div>

      {/* Summary Statistics Cards Grid (Blue, Green, Yellow, Red) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 relative overflow-hidden group hover:border-blue-500/60 hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Total Events</span>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
              <Trophy size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-outfit">{totalHackathons}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden group hover:border-emerald-500/60 hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Ongoing / Upcoming</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-outfit">{ongoingHackathons + upcomingHackathons}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 relative overflow-hidden group hover:border-amber-500/60 hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Winners / Runners</span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg group-hover:scale-110 transition-transform">
              <Award size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-outfit">{winnersCount + runnerupsCount}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 relative overflow-hidden group hover:border-rose-500/60 hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Certificates Saved</span>
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg group-hover:scale-110 transition-transform">
              <BookmarkCheck size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-outfit">{certificatesCount}</p>
        </div>
      </div>

      {/* Main Grid: Charts & Deadlines */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trend Chart (Bar Chart) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-cardBorder flex flex-col space-y-6 min-h-[350px]">
          <h3 className="font-bold text-white font-outfit text-base">Participation Trend (Last 6 Months)</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6Months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1321', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="url(#colorIndigo)" radius={[4, 4, 0, 0]}>
                  {last6Months.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white font-outfit text-base">Upcoming Deadlines</h3>
            <Link to="/calendar" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center space-x-1">
              <span>Calendar</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {upcomingDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Calendar className="h-10 w-10 text-gray-600 mb-2" />
                <p className="text-xs text-slate-600 dark:text-gray-500">No approaching deadlines.</p>
              </div>
            ) : (
              upcomingDeadlines.map((item, idx) => {
                const isOverdue = item.deadline.getTime() < Date.now();
                return (
                  <Link 
                    key={idx} 
                    to={`/hackathons/${item.id}`}
                    className="flex items-center justify-between p-3.5 bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-cardBorder hover:border-gray-400 dark:hover:border-gray-800 rounded-xl transition-all group grid-card-link"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs text-slate-700 dark:text-gray-400 font-bold uppercase tracking-wider">{item.type} Deadline</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-gray-200 truncate group-hover:text-black dark:group-hover:text-white mt-0.5">{item.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                        isOverdue 
                          ? 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30' 
                          : 'bg-indigo-500/15 text-indigo-900 dark:text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {item.deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grid 2: Distribution Charts & Recent Trackers */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Participation Type Share (Donut Chart) */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder flex flex-col space-y-6 min-h-[300px]">
          <h3 className="font-bold text-white font-outfit text-base">Participation Mode</h3>
          <div className="flex-1 flex items-center justify-center min-h-[180px]">
            {modeData.length === 0 ? (
              <p className="text-xs text-gray-500">No participation records.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {modeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0d1321', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Hackathon Status breakdown (Pie Chart) */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder flex flex-col space-y-6 min-h-[300px]">
          <h3 className="font-bold text-white font-outfit text-base">Status Breakdown</h3>
          <div className="flex-1 flex items-center justify-center min-h-[180px]">
            {statusData.length === 0 ? (
              <p className="text-xs text-gray-500">No records available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    labelLine={false}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0d1321', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recently Logged Hackathons */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white font-outfit text-base">Recent Hackathons</h3>
            <Link to="/hackathons" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {recentHackathons.map((item, index) => (
              <Link 
                key={index} 
                to={`/hackathons/${item.id}`}
                className="block p-4 bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-cardBorder hover:border-gray-400 dark:hover:border-gray-800 rounded-xl transition-all grid-card-link"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shadow-sm ${
                    item.status === 'ongoing' 
                      ? 'bg-emerald-500/20 text-slate-900 dark:text-emerald-300 border-emerald-500/40 animate-pulse' 
                      : item.status === 'upcoming'
                      ? 'bg-cyan-500/20 text-slate-900 dark:text-cyan-300 border-cyan-500/40'
                      : item.status === 'completed'
                      ? 'bg-violet-500/20 text-slate-900 dark:text-violet-300 border-violet-500/40'
                      : 'bg-rose-500/20 text-slate-900 dark:text-rose-300 border-rose-500/40'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] text-slate-700 dark:text-gray-400 font-semibold">
                    {item.participation_type}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-gray-200 truncate">{item.name}</h4>
                <p className="text-xs text-slate-700 dark:text-gray-400 font-medium truncate mt-1">Organized by {item.organizer}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
export default Dashboard;
