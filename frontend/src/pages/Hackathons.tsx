import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { 
  Trophy, 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Calendar, 
  User, 
  Users, 
  Eye, 
  Trash2,
  AlertCircle,
  Plus
} from 'lucide-react';

export const Hackathons: React.FC = () => {
  const [hackathons, setHackathons] = useState<any[]>(() => {
    return api.getCached('/hackathons') || [];
  });
  const [loading, setLoading] = useState(() => {
    return !api.getCached('/hackathons');
  });
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState('');
  const [participation, setParticipation] = useState('');
  const [result, setResult] = useState('');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  const fetchHackathons = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);
      if (mode) queryParams.append('mode', mode);
      if (participation) queryParams.append('participation_type', participation);
      if (result) queryParams.append('result', result);

      const data = await api.get(`/hackathons?${queryParams.toString()}`);
      setHackathons(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search hackathons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch (only show loader if cache is empty)
    fetchHackathons(hackathons.length === 0);
  }, [status, mode, participation, result]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHackathons(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this hackathon? All rounds, team details, and achievements will be permanently removed.')) {
      return;
    }

    try {
      await api.delete(`/hackathons/${id}`);
      setHackathons(prev => prev.filter(h => h.id !== id));
    } catch (err: any) {
      alert(err.message || 'Deletion failed.');
    }
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case 'ongoing': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'upcoming': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'completed': return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-white/5 text-gray-400';
    }
  };

  const getResultBadgeClass = (res: string) => {
    switch (res) {
      case 'winner': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'runner_up': return 'bg-yellow-600/15 text-yellow-400 border border-yellow-500/30';
      case 'finalist': return 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30';
      case 'participant': return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit tracking-wide">My Hackathons</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track your active and completed hackathon timeline logs.</p>
        </div>
        <Link 
          to="/hackathons/add" 
          className="flex items-center space-x-2 px-5 py-3 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-glow transition-all hover:scale-[1.02]"
        >
          <Plus size={16} />
          <span>Add Hackathon</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-cardBorder space-y-4 max-w-2xl">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hackathons by name, organizer, domain..."
              className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-gray-200 placeholder-gray-600 outline-none transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilterSidebar(!showFilterSidebar)}
            className={`px-4 py-2.5 border rounded-xl flex items-center space-x-2 text-sm font-bold transition-all shrink-0 ${
              showFilterSidebar 
                ? 'bg-indigoAccent/15 border-indigoAccent text-indigo-400' 
                : 'bg-white/5 border-cardBorder text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main layout container with conditional left filter sidebar */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {showFilterSidebar && (
          <div className="w-full md:w-64 shrink-0 glass-panel p-5 rounded-2xl border border-cardBorder space-y-5 animate-slide-right select-none">
            <div className="flex items-center justify-between border-b border-cardBorder/30 pb-2.5">
              <span className="text-xs font-bold text-gray-200 flex items-center space-x-1.5 uppercase tracking-wider">
                <SlidersHorizontal size={13} className="text-indigo-400 animate-pulse" />
                <span>Filters</span>
              </span>
              <button 
                type="button"
                onClick={() => {
                  setStatus('');
                  setMode('');
                  setParticipation('');
                  setResult('');
                }}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#0d1321]/80 border border-cardBorder rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-300 outline-none focus:border-indigoAccent transition-colors"
                >
                  <option value="">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Mode Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-[#0d1321]/80 border border-cardBorder rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-300 outline-none focus:border-indigoAccent transition-colors"
                >
                  <option value="">All Modes</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Participation Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Participation</label>
                <select
                  value={participation}
                  onChange={(e) => setParticipation(e.target.value)}
                  className="w-full bg-[#0d1321]/80 border border-cardBorder rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-300 outline-none focus:border-indigoAccent transition-colors"
                >
                  <option value="">All Types</option>
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
              </div>

              {/* Achievement Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Achievements</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full bg-[#0d1321]/80 border border-cardBorder rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-300 outline-none focus:border-indigoAccent transition-colors"
                >
                  <option value="">All Results</option>
                  <option value="winner">Winner</option>
                  <option value="runner_up">Runner-up</option>
                  <option value="finalist">Finalist</option>
                  <option value="participant">Participant</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid Content */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-indigoAccent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-xs animate-pulse">Searching matching records...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center glass-panel rounded-2xl border border-red-500/20 max-w-md mx-auto space-y-3">
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
              <p className="text-sm font-medium text-red-300">{error}</p>
            </div>
          ) : hackathons.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-2xl border border-cardBorder max-w-xl mx-auto space-y-4">
              <Trophy className="h-12 w-12 text-gray-600 mx-auto" />
              <h3 className="text-lg font-bold text-white font-outfit">No hackathons match criteria</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                Try adjusting your search criteria or register a new hackathon.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hackathons.map((hack) => {
                const hasPoster = !!hack.poster_url;
                return (
                  <Link 
                    key={hack.id}
                    to={`/hackathons/${hack.id}`}
                    className="glass-panel rounded-2xl border border-cardBorder overflow-hidden flex flex-col group/card hover:border-indigo-500/30 transition-all duration-300"
                  >
                    {/* Poster section */}
                    <div className="h-40 bg-[#090d16] relative overflow-hidden shrink-0 border-b border-cardBorder/30">
                      {hasPoster ? (
                        <img 
                          src={hack.poster_url} 
                          alt={hack.name} 
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                          <Trophy size={36} className="text-gray-700" />
                        </div>
                      )}
                      
                      {/* Badges container */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${getStatusBadgeClass(hack.status)}`}>
                          {hack.status}
                        </span>
                        {hack.mode && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {hack.mode}
                          </span>
                        )}
                        {hack.achievements && hack.achievements.length > 0 && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${getResultBadgeClass(hack.achievements[0].result)}`}>
                            {hack.achievements[0].result.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-base leading-snug group-hover/card:text-indigo-400 transition-colors font-outfit line-clamp-1">
                          {hack.name}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          Organized by <span className="font-semibold text-gray-300">{hack.organizer}</span>
                        </p>

                        <div className="space-y-1.5 pt-2 text-[11px] text-gray-500">
                          {hack.start_date && (
                            <div className="flex items-center space-x-2">
                              <Calendar size={13} className="text-indigoAccent shrink-0" />
                              <span className="truncate">
                                {new Date(hack.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                {hack.end_date && ` - ${new Date(hack.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}`}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            {hack.participation_type === 'team' ? (
                              <>
                                <Users size={13} className="text-indigoAccent shrink-0" />
                                <span className="truncate">
                                  Team: {hack.team_name || 'Unnamed Team'} ({hack.team_members?.length || 0} members)
                                </span>
                              </>
                            ) : (
                              <>
                                <User size={13} className="text-indigoAccent shrink-0" />
                                <span>Individual Participation</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="flex items-center justify-between border-t border-cardBorder/30 pt-4">
                        <span 
                          className="flex items-center space-x-1 text-xs text-indigo-400 group-hover/card:text-indigo-300 font-bold transition-colors"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(hack.id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all relative z-10"
                          title="Delete Hackathon"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Hackathons;
