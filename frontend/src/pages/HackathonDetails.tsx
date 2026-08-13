import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  Trophy, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  ExternalLink, 
  Users, 
  User, 
  Plus, 
  CheckCircle2, 
  XCircle,
  FileCheck,
  Github,
  Video,
  Award,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Round {
  id: string;
  round_number: number;
  round_name: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  meeting_link: string;
  submission_link: string;
  instructions: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'qualified' | 'not_qualified' | 'skipped' | 'cancelled';
  proof_url: string;
}

export const HackathonDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner = hackathon && user && hackathon.user_id === user.id;

  // Teammate Management States
  const [teammateModalOpen, setTeammateModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  
  // New Teammate Form States
  const [tName, setTName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tRole, setTRole] = useState('Frontend Developer');
  const [tCollege, setTCollege] = useState('');
  const [tDept, setTDept] = useState('');
  const [tSaving, setTSaving] = useState(false);
  const [tError, setTError] = useState<string | null>(null);

  const handleSendInviteEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      await api.post(`/hackathons/${id}/team/invite`, { email: inviteEmail.trim() });
      alert('Teammate invitation email sent successfully!');
      setInviteEmail('');
    } catch (err: any) {
      alert(err.message || 'Failed to send invitation email.');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleAddTeammateManually = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim()) {
      setTError('Name is required');
      return;
    }
    setTSaving(true);
    setTError(null);
    try {
      const newMember = await api.post(`/hackathons/${id}/team/member`, {
        name: tName.trim(),
        email: tEmail.trim() || null,
        role: tRole.trim() || null,
        college: tCollege.trim() || null,
        department: tDept.trim() || null
      });
      
      setHackathon((prev: any) => ({
        ...prev,
        team_members: [...(prev.team_members || []), newMember]
      }));
      
      setTeammateModalOpen(false);
      setTName('');
      setTEmail('');
      setTRole('Frontend Developer');
      setTCollege('');
      setTDept('');
    } catch (err: any) {
      setTError(err.message || 'Failed to add teammate.');
    } finally {
      setTSaving(false);
    }
  };

  const handleDeleteTeammate = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    try {
      await api.delete(`/hackathons/${id}/team/member/${memberId}`);
      setHackathon((prev: any) => ({
        ...prev,
        team_members: (prev.team_members || []).filter((m: any) => m.id !== memberId)
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to remove team member.');
    }
  };

  // Modals state
  const [roundModalOpen, setRoundModalOpen] = useState(false);
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);

  // New Round Form State
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundDesc, setNewRoundDesc] = useState('');
  const [newRoundDate, setNewRoundDate] = useState('');
  const [newRoundStart, setNewRoundStart] = useState('');
  const [newRoundEnd, setNewRoundEnd] = useState('');
  const [newRoundVenue, setNewRoundVenue] = useState('');
  const [newRoundMeeting, setNewRoundMeeting] = useState('');
  const [newRoundSubmission, setNewRoundSubmission] = useState('');
  const [newRoundInstructions, setNewRoundInstructions] = useState('');
  const [newRoundLoading, setNewRoundLoading] = useState(false);
  const [newRoundError, setNewRoundError] = useState<string | null>(null);

  // Achievement Form State
  const [result, setResult] = useState<'winner' | 'runner_up' | 'finalist' | 'participant' | 'no_result' | 'other'>('participant');
  const [githubRepo, setGithubRepo] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [achievementSaving, setAchievementSaving] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Quick Round Status Editing State
  const [updatingRoundId, setUpdatingRoundId] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      const data = await api.get(`/hackathons/${id}`);
      setHackathon(data);
      if (data.achievements) {
        setResult(data.achievements.result || 'participant');
        setGithubRepo(data.achievements.github_repo || '');
        setProjectUrl(data.achievements.project_url || '');
        setDemoUrl(data.achievements.demo_url || '');
        setNotes(data.achievements.notes || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this hackathon? This action is permanent.')) return;
    try {
      await api.delete(`/hackathons/${id}`);
      navigate('/hackathons');
    } catch (err: any) {
      alert(err.message || 'Deletion failed.');
    }
  };

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoundName) return;

    setNewRoundLoading(true);
    setNewRoundError(null);

    const nextRoundNumber = (hackathon.hackathon_rounds?.length || 0) + 1;

    try {
      const roundPayload = {
        round_number: nextRoundNumber,
        round_name: newRoundName,
        description: newRoundDesc || null,
        date: newRoundDate ? new Date(newRoundDate).toISOString() : null,
        start_time: newRoundStart || null,
        end_time: newRoundEnd || null,
        venue: newRoundVenue || null,
        meeting_link: newRoundMeeting || null,
        submission_link: newRoundSubmission || null,
        instructions: newRoundInstructions || null,
        status: 'upcoming'
      };

      await api.post(`/hackathons/${id}/rounds`, roundPayload);

      // Reset round form states
      setNewRoundName('');
      setNewRoundDesc('');
      setNewRoundDate('');
      setNewRoundStart('');
      setNewRoundEnd('');
      setNewRoundVenue('');
      setNewRoundMeeting('');
      setNewRoundSubmission('');
      setNewRoundInstructions('');
      
      setRoundModalOpen(false);
      fetchDetails(); // Reload data
    } catch (err: any) {
      setNewRoundError(err.message || 'Failed to add round. Check progression rule.');
    } finally {
      setNewRoundLoading(false);
    }
  };

  const handleUpdateRoundStatus = async (round: Round, newStatus: any) => {
    setUpdatingRoundId(round.id);
    try {
      const payload = {
        round_number: round.round_number,
        round_name: round.round_name,
        description: round.description,
        date: round.date,
        start_time: round.start_time,
        end_time: round.end_time,
        venue: round.venue,
        meeting_link: round.meeting_link,
        submission_link: round.submission_link,
        instructions: round.instructions,
        status: newStatus
      };

      await api.put(`/hackathons/${id}/rounds/${round.id}`, payload);
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update round status.');
    } finally {
      setUpdatingRoundId(null);
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    if (!window.confirm('Delete this round?')) return;
    try {
      await api.delete(`/hackathons/${id}/rounds/${roundId}`);
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Deletion failed.');
    }
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAchievementSaving(true);
    try {
      const achPayload = {
        result,
        github_repo: githubRepo || null,
        project_url: projectUrl || null,
        demo_url: demoUrl || null,
        notes: notes || null
      };

      // 1. Save Text Achievements
      await api.post(`/hackathons/${id}/achievements`, achPayload);

      // 2. Upload Certificate if selected
      if (certificateFile) {
        const formData = new FormData();
        formData.append('file', certificateFile);
        await api.post(`/hackathons/${id}/proofs?type=certificate`, formData, true);
      }

      // 3. Upload Proof if selected
      if (proofFile) {
        const formData = new FormData();
        formData.append('file', proofFile);
        await api.post(`/hackathons/${id}/proofs?type=proof`, formData, true);
      }

      setCertificateFile(null);
      setProofFile(null);
      setAchievementModalOpen(false);
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to save achievement details.');
    } finally {
      setAchievementSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigoAccent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Assembling details...</p>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-rose-500/25 max-w-lg mx-auto text-center space-y-4">
        <p className="text-rose-300 font-medium">{error || 'Hackathon details not found.'}</p>
        <button onClick={() => navigate('/hackathons')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm border border-cardBorder">
          Back to List
        </button>
      </div>
    );
  }

  // Round progression check helper
  const rounds = hackathon.hackathon_rounds || [];
  const totalRoundsCount = rounds.length;
  const limit = hackathon.total_rounds || 5;
  
  // Rule check: Next round can be added up to the total rounds limit
  const canAddRound = totalRoundsCount < limit;

  return (
    <div className="space-y-8 animate-slide-up select-none">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          onClick={() => navigate('/hackathons')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Hackathons</span>
        </button>
        {isOwner && (
          <div className="flex flex-wrap gap-2.5">
            <Link
              to={`/hackathons/${id}/edit`}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigoAccent/10 hover:bg-indigoAccent/20 text-indigo-300 hover:text-indigo-200 border border-indigoAccent/30 rounded-xl text-xs font-bold transition-all"
            >
              <Edit size={15} />
              <span>Edit Details</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Hackathon Intro Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Side: Metadata and Description */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-cardBorder overflow-hidden flex flex-col">
          {hackathon.poster_url && (
            <div className="w-full h-64 md:h-80 bg-[#070c14] border-b border-cardBorder flex items-center justify-center overflow-hidden shrink-0">
              <img src={hackathon.poster_url} alt="Poster" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6 flex-1 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {hackathon.status}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {hackathon.mode}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {hackathon.participation_type}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white font-outfit">{hackathon.name}</h2>
              <p className="text-sm text-gray-400">Organized by <span className="font-semibold text-gray-300">{hackathon.organizer}</span></p>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">{hackathon.description || 'No description provided.'}</p>

            <div className="grid grid-cols-2 gap-4 border-t border-cardBorder/30 pt-4 text-xs text-gray-400">
              {hackathon.domain && (
                <div>
                  <span className="font-bold text-gray-500 uppercase tracking-wider block">Domain</span>
                  <span className="text-gray-300 font-semibold mt-0.5 block">{hackathon.domain}</span>
                </div>
              )}
              {hackathon.technology && (
                <div>
                  <span className="font-bold text-gray-500 uppercase tracking-wider block">Technologies</span>
                  <span className="text-gray-300 font-semibold mt-0.5 block">{hackathon.technology}</span>
                </div>
              )}
              {hackathon.location && (
                <div>
                  <span className="font-bold text-gray-500 uppercase tracking-wider block">Location / Venue</span>
                  <span className="text-gray-300 font-semibold mt-0.5 block flex items-center space-x-1">
                    <MapPin size={12} className="text-cyan-400" />
                    <span>{hackathon.location}</span>
                  </span>
                </div>
              )}
              {(hackathon.website_url || hackathon.registration_link) && (
                <div>
                  <span className="font-bold text-gray-500 uppercase tracking-wider block">Links</span>
                  <span className="mt-1 flex gap-2">
                    {hackathon.website_url && (
                      <a href={hackathon.website_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-0.5 font-bold">
                        <span>Website</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                    {hackathon.registration_link && (
                      <a href={hackathon.registration_link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-0.5 font-bold">
                        <span>Registration</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Team Management */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4">
          <h3 className="font-bold text-white font-outfit text-base border-b border-cardBorder/30 pb-3 flex items-center space-x-2">
            <Users size={18} className="text-indigo-400" />
            <span>Participation Details</span>
          </h3>

          {hackathon.participation_type === 'individual' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500 space-y-2">
              <User size={32} className="text-indigo-500/20" />
              <p className="text-xs">You registered as an Individual student for this hackathon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#090d16]/30 border border-cardBorder rounded-xl">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Team Name</p>
                <p className="text-sm font-bold text-white mt-0.5">{hackathon.team_name || 'N/A'}</p>
                <p className="text-[10px] text-gray-500 mt-1">Configured team size: {hackathon.team_size || 'N/A'}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Team Members ({(hackathon.team_members?.length || 0) + 1} / {hackathon.team_size || 1})
                  </p>
                  {isOwner && !((hackathon.team_members?.length || 0) + 1 >= (hackathon.team_size || 1)) && (
                    <button
                      onClick={() => setTeammateModalOpen(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {/* Team Lead (Creator) */}
                  <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/25 rounded-xl flex items-start justify-between text-xs animate-fade-in">
                    <div>
                      <p className="font-semibold text-gray-200">{hackathon.profiles?.full_name || 'Team Lead'}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Project Creator</p>
                    </div>
                    <span className="px-1.5 py-0.5 bg-indigoAccent text-white rounded text-[9px] font-bold uppercase tracking-wider">
                      Team Lead
                    </span>
                  </div>

                  {/* Teammates List */}
                  {hackathon.team_members && hackathon.team_members.map((mate: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-white/5 border border-cardBorder rounded-xl flex items-start justify-between text-xs">
                      <div>
                        <p className="font-semibold text-gray-200">{mate.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{mate.email || 'No email'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {mate.role && (
                          <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[9px] font-bold uppercase tracking-wider">
                            {mate.role}
                          </span>
                        )}
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteTeammate(mate.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-0.5 shrink-0"
                            title="Remove Teammate"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite Link section for Team Lead */}
              {isOwner && !((hackathon.team_members?.length || 0) + 1 >= (hackathon.team_size || 1)) && (
                <div className="pt-3 border-t border-cardBorder/30 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Copy Invitation Link</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/hackathons/${hackathon.id}/join`}
                        className="w-full bg-[#0d1321]/60 border border-cardBorder rounded-xl py-2 px-3 text-xs text-gray-300 select-all outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/hackathons/${hackathon.id}/join`);
                          alert('Teammate invitation link copied to clipboard!');
                        }}
                        className="px-3 py-2 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSendInviteEmail} className="space-y-1 pt-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Invite via Email</p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="teammate@email.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full bg-[#0d1321]/60 border border-cardBorder rounded-xl py-2 px-3 text-xs text-gray-300 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={sendingInvite || !inviteEmail.trim()}
                        className="px-3 py-2 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shrink-0 disabled:opacity-50"
                      >
                        {sendingInvite ? 'Sending...' : 'Invite'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Bottom Section: Timeline & Rounds */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline (Vertical Node Progression) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-cardBorder flex flex-col space-y-6">
          <div className="flex justify-between items-center border-b border-cardBorder/30 pb-3">
            <h3 className="font-bold text-white font-outfit text-base">Timeline & Rounds</h3>
            <button
              onClick={() => setRoundModalOpen(true)}
              disabled={!canAddRound}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                canAddRound
                  ? 'bg-indigoAccent hover:bg-indigo-600 text-white shadow-glow'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-cardBorder'
              }`}
              title={!canAddRound ? `Reached total rounds limit (${limit} rounds). You can increase this in Edit Details.` : ''}
            >
              <Plus size={14} />
              <span>Add Round</span>
            </button>
          </div>

          {/* Interactive Timeline Layout */}
          <div className="space-y-8 relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-cardBorder">
            {/* Registration Deadline node */}
            <div className="relative animate-fade-in">
              <div className="absolute -left-[20px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-darkBg shadow-glow"></div>
              <div className="p-4 bg-white/5 border border-cardBorder rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registration Deadline</h4>
                  <p className="text-sm font-semibold text-gray-200 mt-1">
                    {hackathon.registration_deadline
                      ? new Date(hackathon.registration_deadline).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                      : 'No deadline set'}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  hackathon.registration_deadline && new Date(hackathon.registration_deadline) < new Date()
                    ? 'bg-gray-500/10 text-gray-400'
                    : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {hackathon.registration_deadline && new Date(hackathon.registration_deadline) < new Date() ? 'Completed' : 'Upcoming'}
                </span>
              </div>
            </div>

            {/* Rounds Dynamic nodes */}
            {rounds.map((round: Round, idx: number) => {
              const isUpdating = updatingRoundId === round.id;
              const hasDate = !!round.date;
              const isLastRound = idx === rounds.length - 1;

              return (
                <div key={round.id} className="relative animate-fade-in">
                  <div className={`absolute -left-[23px] top-1 w-5 h-5 rounded-full border-2 border-darkBg flex items-center justify-center bg-[#131a2b] ${
                    round.status === 'qualified' || round.status === 'completed'
                      ? 'text-emerald-400 border-emerald-400 shadow-glowEmerald'
                      : round.status === 'not_qualified' || round.status === 'cancelled'
                      ? 'text-red-400 border-red-400'
                      : round.status === 'ongoing'
                      ? 'text-indigo-400 border-indigo-400 active-pulse-node'
                      : 'text-gray-500 border-cardBorder'
                  }`}>
                    {round.status === 'qualified' || round.status === 'completed' ? (
                      <CheckCircle2 size={12} />
                    ) : round.status === 'not_qualified' || round.status === 'cancelled' ? (
                      <XCircle size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                  </div>

                  <div className="p-4 bg-white/5 border border-cardBorder rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Round #{round.round_number}</span>
                        <h4 className="text-sm font-extrabold text-gray-100 mt-0.5">{round.round_name}</h4>
                      </div>

                      {/* Dropdown to change Round status */}
                      {isOwner ? (
                        <select
                          value={round.status}
                          onChange={(e) => handleUpdateRoundStatus(round, e.target.value)}
                          disabled={isUpdating}
                          className="bg-[#0d1321] border border-cardBorder rounded-lg p-1 text-[10px] font-bold text-gray-300 focus:border-indigoAccent outline-none"
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="qualified">Qualified</option>
                          <option value="not_qualified">Not Qualified</option>
                          <option value="skipped">Skipped</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-cardBorder text-gray-300">
                          {round.status}
                        </span>
                      )}
                    </div>

                    {round.description && <p className="text-xs text-gray-400">{round.description}</p>}

                    <div className="grid sm:grid-cols-2 gap-3 text-[11px] text-gray-500 pt-2 border-t border-cardBorder/30">
                      {hasDate && (
                        <div>
                          <span className="font-bold text-gray-600 block">Date & Time</span>
                          <span className="text-gray-400 mt-0.5 block">
                            {new Date(round.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            {round.start_time && ` (${round.start_time} - ${round.end_time || 'N/A'})`}
                          </span>
                        </div>
                      )}
                      {(round.venue || round.meeting_link || round.submission_link) && (
                        <div>
                          <span className="font-bold text-gray-600 block">Venue & Submission Links</span>
                          <span className="text-gray-400 mt-0.5 block space-y-1">
                            {round.venue && <span className="block flex items-center space-x-1"><MapPin size={10} className="text-cyan-400" /> <span>{round.venue}</span></span>}
                            {round.meeting_link && <a href={round.meeting_link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline block flex items-center space-x-0.5"><Video size={10} /> <span>Meeting Link</span></a>}
                            {round.submission_link && <a href={round.submission_link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline block flex items-center space-x-0.5"><ExternalLink size={10} /> <span>Submission Link</span></a>}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Delete Round Node (allowed only for the last round) */}
                    {isLastRound && isOwner && (
                      <div className="flex justify-end pt-2 border-t border-cardBorder/20">
                        <button
                          onClick={() => handleDeleteRound(round.id)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-bold transition-colors"
                        >
                          Delete Round
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements Card (Upload Proof) */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder flex flex-col space-y-4">
          <div className="flex justify-between items-center border-b border-cardBorder/30 pb-3">
            <h3 className="font-bold text-white font-outfit text-base flex items-center space-x-2">
              <Award size={18} className="text-amber-400" />
              <span>Result & Achievements</span>
            </h3>
            <button
              onClick={() => setAchievementModalOpen(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              {hackathon.achievements ? 'Edit' : 'Record'}
            </button>
          </div>

          {hackathon.achievements ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl font-bold uppercase tracking-wider text-center flex items-center justify-center space-x-2">
                <Trophy size={16} />
                <span>Result: {hackathon.achievements.result.replace('_', ' ')}</span>
              </div>

              {(hackathon.achievements.github_repo || hackathon.achievements.project_url || hackathon.achievements.demo_url) && (
                <div className="space-y-2">
                  <span className="font-bold text-gray-500 uppercase tracking-wider block">Project Repository & Demos</span>
                  <div className="space-y-1.5">
                    {hackathon.achievements.github_repo && (
                      <a href={hackathon.achievements.github_repo} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-gray-300 hover:text-indigo-400 transition-colors">
                        <Github size={14} />
                        <span className="truncate">{hackathon.achievements.github_repo}</span>
                      </a>
                    )}
                    {hackathon.achievements.project_url && (
                      <a href={hackathon.achievements.project_url} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-gray-300 hover:text-indigo-400 transition-colors">
                        <ExternalLink size={14} />
                        <span className="truncate">Project URL</span>
                      </a>
                    )}
                    {hackathon.achievements.demo_url && (
                      <a href={hackathon.achievements.demo_url} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-gray-300 hover:text-indigo-400 transition-colors">
                        <Video size={14} />
                        <span className="truncate">Demo Link</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {hackathon.achievements.notes && (
                <div className="space-y-1">
                  <span className="font-bold text-gray-500 uppercase tracking-wider block">Summary Notes</span>
                  <p className="text-gray-400 leading-relaxed bg-white/5 p-2 rounded-lg border border-cardBorder">{hackathon.achievements.notes}</p>
                </div>
              )}

              {/* Uploaded Certificate / Proof preview links */}
              {(hackathon.achievements.certificate_url || hackathon.achievements.proof_url) && (
                <div className="space-y-2 pt-2 border-t border-cardBorder/30">
                  <span className="font-bold text-gray-500 uppercase tracking-wider block">Uploaded Proofs</span>
                  <div className="flex flex-col gap-2">
                    {hackathon.achievements.certificate_url && (
                      <a 
                        href={hackathon.achievements.certificate_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 rounded-lg font-bold flex items-center justify-between"
                      >
                        <span className="flex items-center space-x-2"><FileCheck size={14} /> <span>Certificate</span></span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {hackathon.achievements.proof_url && (
                      <a 
                        href={hackathon.achievements.proof_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 hover:text-emerald-200 rounded-lg font-bold flex items-center justify-between"
                      >
                        <span className="flex items-center space-x-2"><FileCheck size={14} /> <span>Winner Announcement</span></span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500 space-y-3">
              <Award size={32} className="text-amber-500/10" />
              <p className="text-xs">This hackathon result has not been recorded yet.</p>
              <button 
                onClick={() => setAchievementModalOpen(true)}
                className="px-4 py-2 bg-indigoAccent/10 text-indigo-300 border border-indigoAccent/20 hover:bg-indigoAccent/20 rounded-xl text-xs font-bold transition-all"
              >
                Record Achievement Result
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD ROUND MODAL */}
      {roundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setRoundModalOpen(false)}>
          <div 
            className="w-full max-w-lg bg-[#0c1220] border border-cardBorder rounded-2xl p-6 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-cardBorder pb-3">
              <h3 className="text-lg font-bold text-white font-outfit">Add Round #{(hackathon.hackathon_rounds?.length || 0) + 1}</h3>
              <button onClick={() => setRoundModalOpen(false)} className="text-gray-400 hover:text-white">Close</button>
            </div>

            {newRoundError && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl text-xs">
                {newRoundError}
              </div>
            )}

            <form onSubmit={handleCreateRound} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Round Name *</label>
                <input
                  type="text"
                  required
                  value={newRoundName}
                  onChange={(e) => setNewRoundName(e.target.value)}
                  placeholder="Idea Submission, Prototype evaluation"
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={newRoundDesc}
                  onChange={(e) => setNewRoundDesc(e.target.value)}
                  placeholder="Instructions, guidelines or description for this round..."
                  rows={2}
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Round Date</label>
                  <input
                    type="date"
                    value={newRoundDate}
                    onChange={(e) => setNewRoundDate(e.target.value)}
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-300 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Start Time</label>
                  <input
                    type="time"
                    value={newRoundStart}
                    onChange={(e) => setNewRoundStart(e.target.value)}
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-300 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">End Time</label>
                  <input
                    type="time"
                    value={newRoundEnd}
                    onChange={(e) => setNewRoundEnd(e.target.value)}
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-300 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Venue / Link</label>
                <input
                  type="text"
                  value={newRoundVenue}
                  onChange={(e) => setNewRoundVenue(e.target.value)}
                  placeholder="Hall C, or Zoom"
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Meeting Link</label>
                  <input
                    type="url"
                    value={newRoundMeeting}
                    onChange={(e) => setNewRoundMeeting(e.target.value)}
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Submission Link</label>
                  <input
                    type="url"
                    value={newRoundSubmission}
                    onChange={(e) => setNewRoundSubmission(e.target.value)}
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-cardBorder/30">
                <button
                  type="button"
                  onClick={() => setRoundModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-cardBorder"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newRoundLoading}
                  className="px-6 py-2 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-bold shadow-glow"
                >
                  {newRoundLoading ? 'Saving...' : 'Add Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD ACHIEVEMENT MODAL */}
      {achievementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setAchievementModalOpen(false)}>
          <div 
            className="w-full max-w-lg bg-[#0c1220] border border-cardBorder rounded-2xl p-6 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-cardBorder pb-3">
              <h3 className="text-lg font-bold text-white font-outfit">Record Result</h3>
              <button onClick={() => setAchievementModalOpen(false)} className="text-gray-400 hover:text-white">Close</button>
            </div>

            <form onSubmit={handleSaveAchievement} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Placement Result *</label>
                <select
                  value={result}
                  onChange={(e: any) => setResult(e.target.value)}
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-300 outline-none"
                >
                  <option value="winner">🏆 Winner</option>
                  <option value="runner_up">🥈 Runner-up</option>
                  <option value="finalist">🥉 Finalist</option>
                  <option value="participant">🏅 Participant</option>
                  <option value="no_result">No result</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">GitHub Repository</label>
                  <input
                    type="url"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Project Landing URL</label>
                  <input
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://devpost.com/..."
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Demo / Video Link</label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Summary Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key learnings, stack details, feedback..."
                  rows={2}
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none resize-none"
                />
              </div>

              {/* Certificate File Input */}
              <div className="space-y-1">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Upload Certificate</label>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => e.target.files && setCertificateFile(e.target.files[0])}
                  className="w-full bg-[#0d1321]/30 border border-cardBorder rounded-xl p-2 text-gray-400"
                />
                <p className="text-[9px] text-gray-500">PDF, JPG, PNG or WEBP. Max 5MB.</p>
              </div>

              {/* Screenshot Proof File Input */}
              <div className="space-y-1">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Upload Winner Announcement / Proof</label>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => e.target.files && setProofFile(e.target.files[0])}
                  className="w-full bg-[#0d1321]/30 border border-cardBorder rounded-xl p-2 text-gray-400"
                />
                <p className="text-[9px] text-gray-500">PDF, JPG, PNG or WEBP. Max 5MB.</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-cardBorder/30">
                <button
                  type="button"
                  onClick={() => setAchievementModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-cardBorder"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={achievementSaving}
                  className="px-6 py-2 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-bold shadow-glow"
                >
                  {achievementSaving ? 'Uploading...' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD TEAMMATE MODAL */}
      {teammateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setTeammateModalOpen(false)}>
          <div 
            className="w-full max-w-md bg-[#0c1220] border border-cardBorder rounded-2xl p-6 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-cardBorder pb-3">
              <h3 className="text-lg font-bold text-white font-outfit">Add Teammate Manually</h3>
              <button onClick={() => setTeammateModalOpen(false)} className="text-gray-400 hover:text-white">Close</button>
            </div>

            {tError && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{tError}</span>
              </div>
            )}

            <form onSubmit={handleAddTeammateManually} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  placeholder="Teammate's full name"
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={tEmail}
                  onChange={(e) => setTEmail(e.target.value)}
                  placeholder="teammate@email.com"
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none"
                />
                <p className="text-[10px] text-gray-500">If this email matches a registered student, they are automatically linked.</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Role / Specialization</label>
                <select
                  value={tRole}
                  onChange={(e) => setTRole(e.target.value)}
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-300 outline-none"
                >
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Fullstack Developer">Fullstack Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Mobile Developer">Mobile Developer</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">College</label>
                  <input
                    type="text"
                    value={tCollege}
                    onChange={(e) => setTCollege(e.target.value)}
                    placeholder="e.g. MIT"
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Department</label>
                  <input
                    type="text"
                    value={tDept}
                    onChange={(e) => setTDept(e.target.value)}
                    placeholder="e.g. CSE"
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-gray-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-cardBorder/30">
                <button
                  type="button"
                  onClick={() => setTeammateModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-cardBorder"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tSaving}
                  className="px-6 py-2 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-bold shadow-glow"
                >
                  {tSaving ? 'Adding...' : 'Add Teammate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default HackathonDetails;
