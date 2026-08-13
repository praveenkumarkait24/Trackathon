import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Trophy, AlertTriangle, Users, Briefcase, ArrowRight, Home } from 'lucide-react';

export const JoinTeam: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState('Frontend Developer');

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Fullstack Developer',
    'UI/UX Designer',
    'Mobile Developer',
    'QA Engineer',
    'Data Scientist',
    'DevOps Engineer',
    'Other'
  ];

  useEffect(() => {
    const fetchJoinInfo = async () => {
      try {
        setError(null);
        const data = await api.get(`/hackathons/${id}/join-info`);
        setHackathon(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch invite details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJoinInfo();
    }
  }, [id]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role.');
      return;
    }

    setJoining(true);
    setError(null);

    try {
      await api.post(`/hackathons/${id}/join`, { role });
      navigate(`/hackathons/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join team.');
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex flex-col items-center justify-center space-y-4 select-none">
        <div className="w-10 h-10 border-4 border-indigoAccent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-xs">Fetching team invitation details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-cardBorder shadow-2xl relative z-10 animate-slide-up">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-glow mb-4">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-outfit tracking-wide text-center">
            Team Invitation
          </h1>
          <p className="text-gray-400 text-xs mt-1.5 text-center">
            You've been invited to join a hackathon workspace.
          </p>
        </div>

        {/* Error Alert Box */}
        {error ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl flex items-start space-x-3 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-[#0d1321]/60 hover:bg-[#0d1321] text-gray-400 hover:text-white border border-cardBorder rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <Home size={16} />
              <span>Go to Dashboard</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-5">
            {/* Hackathon Invite Card Details */}
            {hackathon && (
              <div className="p-4 bg-[#090d16]/50 border border-cardBorder/60 rounded-xl space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Hackathon Name</label>
                  <p className="text-sm font-bold text-white mt-0.5">{hackathon.name}</p>
                  <p className="text-xs text-gray-400">Organized by {hackathon.organizer}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cardBorder/30">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Team Name</label>
                    <span className="text-xs font-bold text-indigo-400 flex items-center space-x-1 mt-0.5">
                      <Users size={12} />
                      <span>{hackathon.team_name || 'N/A'}</span>
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Max Team Size</label>
                    <p className="text-xs font-semibold text-gray-300 mt-0.5">{hackathon.team_size || 'N/A'} members</p>
                  </div>
                </div>
              </div>
            )}

            {/* Role Input Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Your Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-3 pl-11 pr-4 text-gray-200 outline-none transition-all text-sm appearance-none cursor-pointer"
                  disabled={joining}
                >
                  {roles.map((r, idx) => (
                    <option key={idx} value={r} className="bg-[#0c101b] text-gray-200">
                      {r}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-500"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={joining}
                className="w-full py-3.5 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-semibold shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{joining ? 'Joining Team...' : 'Confirm & Join Team'}</span>
                {!joining && <ArrowRight size={18} />}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={joining}
                className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default JoinTeam;
