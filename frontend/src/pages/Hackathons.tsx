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
  Plus,
  FileText,
  RotateCcw
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

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

  const fetchHackathons = async (query = search) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (query) queryParams.append('search', query);
      if (status) queryParams.append('status', status);
      if (mode) queryParams.append('mode', mode);
      if (participation) queryParams.append('participation_type', participation);
      if (result) queryParams.append('result', result);

      const endpoint = queryParams.toString() ? `/hackathons?${queryParams.toString()}` : '/hackathons';
      const data = await api.get(endpoint);
      setHackathons(data);
    } catch (err: any) {
      if (!api.getCached('/hackathons')) {
        setError(err.message || 'Failed to fetch hackathons.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [status, mode, participation, result]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHackathons(search);
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
      case 'ongoing': return 'bg-emerald-600 text-white border border-emerald-400 shadow-sm font-extrabold animate-pulse';
      case 'upcoming': return 'bg-blue-600 text-white border border-blue-400 shadow-sm font-extrabold';
      case 'completed': return 'bg-purple-600 text-white border border-purple-400 shadow-sm font-extrabold';
      case 'cancelled': return 'bg-rose-600 text-white border border-rose-400 shadow-sm font-extrabold';
      default: return 'bg-slate-700 text-white border border-slate-500 font-extrabold';
    }
  };

  const getResultBadgeClass = (res: string) => {
    switch (res) {
      case 'winner': return 'bg-amber-500 text-white border border-amber-300 shadow-glowAmber font-extrabold';
      case 'runner_up': return 'bg-cyan-600 text-white border border-cyan-400 font-extrabold';
      case 'finalist': return 'bg-indigo-600 text-white border border-indigo-400 font-extrabold';
      case 'participant': return 'bg-blue-600 text-white border border-blue-400 font-extrabold';
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
          className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-extrabold text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus size={18} />
          <span>Add Hackathon</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-full border border-cardBorder space-y-4 max-w-2xl">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hackathons by name, organizer, domain..."
              className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-blue-500 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all font-semibold"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilterSidebar(!showFilterSidebar)}
            className={`px-5 py-2.5 rounded-full flex items-center space-x-2 text-sm font-extrabold text-white transition-all shrink-0 shadow-md ${
              showFilterSidebar 
                ? 'bg-blue-600 border border-blue-400' 
                : 'bg-blue-600/80 hover:bg-blue-600 border border-blue-500/50'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all shrink-0 flex items-center space-x-2"
          >
            <Search size={16} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Main layout container with conditional left filter sidebar */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {showFilterSidebar && (
          <div className="w-full md:w-64 shrink-0 glass-panel p-5 rounded-2xl border border-cardBorder space-y-5 animate-slide-right select-none">
            <div className="flex items-center justify-between border-b border-cardBorder/30 pb-2.5">
              <span className="text-xs font-extrabold text-white flex items-center space-x-1.5 uppercase tracking-wider">
                <SlidersHorizontal size={14} className="text-blue-400 animate-pulse" />
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
                className="text-xs font-extrabold text-white bg-amber-500 hover:bg-amber-400 transition-all px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm"
              >
                <RotateCcw size={12} />
                <span>Clear All</span>
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
            <LoadingSpinner />
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
                        hack.poster_url.toLowerCase().includes('.pdf') ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-950/40 text-red-400 p-2 space-y-1">
                            <FileText size={32} />
                            <span className="text-[10px] font-bold text-gray-300">PDF Poster Document</span>
                          </div>
                        ) : (
                          <img 
                            src={hack.poster_url} 
                            alt={hack.name} 
                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" 
                          />
                        )
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
