import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { 
  Award, 
  Trophy, 
  Calendar, 
  ExternalLink, 
  Github, 
  Video, 
  FileCheck,
  BookmarkCheck,
  Zap,
  BookOpen
} from 'lucide-react';

export const Achievements: React.FC = () => {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await api.get('/hackathons');
        setHackathons(data);
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigoAccent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Building portfolio list...</p>
      </div>
    );
  }

  // Filter hackathons that have recorded achievements
  const achievementHackathons = hackathons.filter(h => h.achievements);

  // Compute Stats
  const totalParticipation = hackathons.filter(h => h.status === 'completed').length;
  const winnersCount = achievementHackathons.filter(h => h.achievements.result === 'winner').length;
  const runnerupsCount = achievementHackathons.filter(h => h.achievements.result === 'runner_up').length;
  const finalistsCount = achievementHackathons.filter(h => h.achievements.result === 'finalist').length;
  const certificatesCount = achievementHackathons.filter(h => h.achievements.certificate_url).length;

  const getMedalColor = (res: string) => {
    switch (res) {
      case 'winner': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'runner_up': return 'text-yellow-600 border-yellow-500/30 bg-yellow-500/10';
      case 'finalist': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'participant': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      default: return 'text-gray-400 border-cardBorder bg-white/5';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-slide-up select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white font-outfit tracking-wide">Achievements Portfolio</h1>
        <p className="text-gray-400 text-sm mt-1">Showcase and review your completed hackathons and placement results.</p>
      </div>

      {/* Portfolio Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-cardBorder text-center">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-extrabold text-white font-outfit mt-1">{totalParticipation}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-cardBorder text-center">
          <p className="text-xs text-amber-500/80 font-bold uppercase tracking-wider">Winners</p>
          <p className="text-2xl font-extrabold text-amber-400 font-outfit mt-1">{winnersCount}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-cardBorder text-center">
          <p className="text-xs text-yellow-600/80 font-bold uppercase tracking-wider">Runner-ups</p>
          <p className="text-2xl font-extrabold text-yellow-400 font-outfit mt-1">{runnerupsCount}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-cardBorder text-center">
          <p className="text-xs text-cyan-500/80 font-bold uppercase tracking-wider">Finalists</p>
          <p className="text-2xl font-extrabold text-cyan-400 font-outfit mt-1">{finalistsCount}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-cardBorder text-center col-span-2 md:col-span-1">
          <p className="text-xs text-indigo-500/80 font-bold uppercase tracking-wider">Certificates</p>
          <p className="text-2xl font-extrabold text-indigo-400 font-outfit mt-1">{certificatesCount}</p>
        </div>
      </div>

      {/* Portfolio Grid */}
      {achievementHackathons.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl border border-cardBorder max-w-2xl mx-auto space-y-4">
          <Award className="h-14 w-14 text-gray-700 mx-auto" />
          <h3 className="text-xl font-bold text-white font-outfit">Your Portfolio is Empty</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Record results and upload proofs on any completed hackathon details page. Once added, your accomplishments will populate here.
          </p>
          <Link
            to="/hackathons"
            className="inline-flex px-5 py-2.5 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-glow transition-all"
          >
            Track Completed Hackathons
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {achievementHackathons.map((hack) => {
            const ach = hack.achievements;
            const startD = hack.start_date ? new Date(hack.start_date) : null;

            return (
              <div 
                key={hack.id} 
                className="glass-panel rounded-2xl border border-cardBorder p-6 flex flex-col justify-between space-y-5 hover:border-indigo-500/15 transition-all duration-300 group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-gray-100 group-hover:text-white font-outfit leading-tight">
                        {hack.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium truncate mt-1">
                        Organized by <span className="text-gray-400">{hack.organizer}</span>
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border shrink-0 ${getMedalColor(ach.result)}`}>
                      🏆 {ach.result.replace('_', ' ')}
                    </span>
                  </div>

                  {startD && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500 font-semibold">
                      <Calendar size={13} className="text-indigo-400" />
                      <span>{startD.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}

                  {ach.notes && (
                    <p className="text-xs text-gray-400 leading-relaxed bg-[#0d1321]/30 p-2.5 rounded-lg border border-cardBorder">
                      {ach.notes}
                    </p>
                  )}
                </div>

                {/* Resource links & Certificate proofs */}
                <div className="space-y-3.5 border-t border-cardBorder/30 pt-4 text-xs">
                  {/* Project URL & Code Link */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {ach.github_repo && (
                      <a 
                        href={ach.github_repo} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center space-x-1.5 text-gray-400 hover:text-white transition-colors"
                      >
                        <Github size={14} className="text-gray-400" />
                        <span>Code Repository</span>
                      </a>
                    )}
                    {ach.project_url && (
                      <a 
                        href={ach.project_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center space-x-1.5 text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink size={14} className="text-gray-400" />
                        <span>Project Page</span>
                      </a>
                    )}
                    {ach.demo_url && (
                      <a 
                        href={ach.demo_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center space-x-1.5 text-gray-400 hover:text-white transition-colors"
                      >
                        <Video size={14} className="text-gray-400" />
                        <span>Video Demo</span>
                      </a>
                    )}
                  </div>

                  {/* Proof documents */}
                  <div className="flex gap-2">
                    {ach.certificate_url && (
                      <a 
                        href={ach.certificate_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex-1 p-2 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 rounded-lg font-bold flex items-center justify-between text-[11px]"
                      >
                        <span className="flex items-center space-x-1.5"><FileCheck size={13} /> <span>Certificate</span></span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                    {ach.proof_url && (
                      <a 
                        href={ach.proof_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex-1 p-2 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 hover:text-emerald-200 rounded-lg font-bold flex items-center justify-between text-[11px]"
                      >
                        <span className="flex items-center space-x-1.5"><FileCheck size={13} /> <span>Result Announcement</span></span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  {/* Footer detail redirect */}
                  <div className="flex justify-between items-center pt-2">
                    <Link 
                      to={`/hackathons/${hack.id}`} 
                      className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center space-x-0.5"
                    >
                      <span>View Hackathon details</span>
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Achievements;
