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
  FileText,
  Github,
  Video,
  Award,
  Clock,
  AlertTriangle,
  Calendar,
  Share2,
  Link2,
  MessageCircle,
  Send,
  UserMinus,
  Check
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

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

  // Share & Remove States
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [removeEmail, setRemoveEmail] = useState('');
  const [removePanelOpen, setRemovePanelOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removeSuccess, setRemoveSuccess] = useState<string | null>(null);

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

  const inviteLink = `${window.location.origin}/hackathons/${hackathon?.id}/join`;

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      alert('Failed to copy link.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my team – ${hackathon?.name}`,
          text: `Hey! Join my hackathon team for "${hackathon?.name}". Click the link to join:`,
          url: inviteLink,
        });
      } catch (err) {
        // User cancelled share – do nothing
      }
    } else {
      handleCopyInviteLink();
    }
  };

  const handleRemoveByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeEmail.trim()) return;
    setRemoving(true);
    setRemoveError(null);
    setRemoveSuccess(null);
    try {
      await api.delete(`/hackathons/${id}/team/member/by-email`, { email: removeEmail.trim() });
      // Remove from local state
      setHackathon((prev: any) => ({
        ...prev,
        team_members: (prev.team_members || []).filter(
          (m: any) => m.email?.toLowerCase() !== removeEmail.trim().toLowerCase()
        )
      }));
      setRemoveSuccess(`Successfully removed ${removeEmail.trim()} from the team.`);
      setRemoveEmail('');
    } catch (err: any) {
      setRemoveError(err.message || 'Member not found with that email.');
    } finally {
      setRemoving(false);
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
  const [newRoundFile, setNewRoundFile] = useState<File | null>(null);
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

      const createdRound = await api.post(`/hackathons/${id}/rounds`, roundPayload);

      // Upload round presentation file (PPT/PPTX/PDF) if provided
      if (newRoundFile && createdRound?.id) {
        const formData = new FormData();
        formData.append('file', newRoundFile);
        await api.post(`/hackathons/${id}/rounds/${createdRound.id}/upload`, formData, true);
      }

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
      setNewRoundFile(null);
      
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
    return <LoadingSpinner />;
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
              className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/40 rounded-full text-xs font-extrabold transition-all shadow-md shadow-blue-500/20"
            >
              <Edit size={15} />
              <span>Edit Details</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-extrabold transition-all shadow-md shadow-rose-500/20"
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
              {hackathon.poster_url.toLowerCase().includes('.pdf') ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <FileText size={44} className="text-red-400" />
                  <span className="text-sm font-bold text-gray-200">Hackathon Poster PDF Document</span>
                  <a 
                    href={hackathon.poster_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-4 py-2 bg-indigoAccent hover:bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all shadow-glow"
                  >
                    <ExternalLink size={14} />
                    <span>View / Download Poster PDF</span>
                  </a>
                </div>
              ) : (
                <img src={hackathon.poster_url} alt="Poster" className="w-full h-full object-cover" />
              )}
            </div>
          )}
          <div className="p-6 flex-1 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border shadow-sm ${
                  hackathon.status === 'ongoing' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' 
                    : hackathon.status === 'upcoming'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : hackathon.status === 'completed'
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {hackathon.status}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm">
                  {hackathon.mode}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm">
                  {hackathon.participation_type}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text font-outfit tracking-wide">{hackathon.name}</h2>
              <p className="text-sm text-gray-400">Organized by <span className="font-semibold text-gray-300">{hackathon.organizer}</span></p>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">{hackathon.description || 'No description provided.'}</p>

            {/* Highlights Grid: Registration & Schedule Timelines */}
            <div className="grid sm:grid-cols-2 gap-4 border-t border-cardBorder/30 pt-6">
              {/* Registration Highlight Card */}
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block">Registration Status</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <Calendar size={16} className="text-indigoAccent shrink-0" />
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {hackathon.registration_deadline ? (
                        <>Deadline: {new Date(hackathon.registration_deadline).toLocaleDateString(undefined, { dateStyle: 'medium' })}</>
                      ) : (
                        'No Deadline Set'
                      )}
                    </span>
                  </div>
                </div>
                {hackathon.registration_link ? (
                  <a 
                    href={hackathon.registration_link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 !text-white rounded-full text-xs font-extrabold transition-all shadow-md shadow-blue-500/20 text-center block hover:scale-[1.01]"
                    style={{ color: '#ffffff' }}
                  >
                    <span style={{ color: '#ffffff' }}>Register / Apply Now</span>
                  </a>
                ) : (
                  <span className="w-full py-3 bg-gray-500/10 text-gray-500 rounded-full text-xs font-extrabold text-center block">
                    No Direct Registration Link
                  </span>
                )}
              </div>

              {/* Event Dates & Timeline Card */}
              <div className="p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest block">Event Schedule</span>
                  <div className="mt-1.5 space-y-2 text-xs text-slate-700 dark:text-gray-300">
                    {hackathon.start_date && (
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                        <span>Starts: <strong>{new Date(hackathon.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong></span>
                      </div>
                    )}
                    {hackathon.end_date && (
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                        <span>Ends: <strong>{new Date(hackathon.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong></span>
                      </div>
                    )}
                    {!hackathon.start_date && !hackathon.end_date && (
                      <p className="text-gray-500 italic">No timeline schedule announced.</p>
                    )}
                  </div>
                </div>
                {hackathon.website_url ? (
                  <a 
                    href={hackathon.website_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-extrabold transition-all shadow-md shadow-blue-500/20 text-center block hover:scale-[1.01]"
                  >
                    Visit Event Website
                  </a>
                ) : (
                  <span className="w-full py-2.5 bg-gray-500/10 text-gray-500 rounded-full text-xs font-bold text-center block">
                    No Website Configured
                  </span>
                )}
              </div>
            </div>

            {/* Event Meta Info grid */}
            <div className="grid grid-cols-3 gap-4 border-t border-cardBorder/30 pt-4 text-xs text-gray-400">
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
                  {(() => {
                    const leadName = hackathon.profiles?.full_name || 'Team Lead';
                    const initials = leadName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                    const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-pink-500', 'bg-amber-500'];
                    const colorClass = colors[leadName.charCodeAt(0) % colors.length];
                    return (
                      <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-center gap-3 animate-fade-in">
                        <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md`}>
                          {hackathon.profiles?.avatar_url
                            ? <img src={hackathon.profiles.avatar_url} alt={leadName} className="w-full h-full rounded-full object-cover" />
                            : initials
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-white truncate">{leadName}</p>
                          <p className="text-[11px] text-gray-400 truncate">{hackathon.profiles?.email || 'Project Creator'}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-indigoAccent text-white rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0">
                          Lead
                        </span>
                      </div>
                    );
                  })()}

                  {/* Teammates List */}
                  {hackathon.team_members && hackathon.team_members.map((mate: any, idx: number) => {
                    const mateName = mate.name || 'Member';
                    const mateInitials = mateName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                    const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-pink-500', 'bg-amber-500'];
                    const mateColor = colors[(mateName.charCodeAt(0) + idx) % colors.length];
                    return (
                      <div key={idx} className="p-3 bg-white/[0.03] border border-cardBorder rounded-2xl space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${mateColor} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md`}>
                            {mate.avatar_url
                              ? <img src={mate.avatar_url} alt={mateName} className="w-full h-full rounded-full object-cover" />
                              : mateInitials
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white truncate">{mateName}</p>
                            <p className="text-[11px] text-gray-400 truncate">{mate.email || 'No email'}</p>
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => handleDeleteTeammate(mate.id)}
                              className="text-gray-600 hover:text-red-400 transition-colors p-1 shrink-0 rounded-lg hover:bg-red-500/10"
                              title="Remove Teammate"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        {mate.role && (
                          <button
                            className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                            onClick={() => {}}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            <span>View Details</span>
                            <span className="text-emerald-200 text-[10px]">(Check Team Status)</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Share Invite & Remove Member — Owner Only */}
              {isOwner && (
                <div className="pt-3 border-t border-cardBorder/30 space-y-3">

                  {/* ── Share Invite Link ── */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 size={11} />
                      <span>Share Invite Link</span>
                    </p>

                    {/* URL pill row */}
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-1.5 bg-[#0d1321]/60 border border-cardBorder rounded-xl px-3 py-2 overflow-hidden">
                        <Link2 size={12} className="text-indigo-400 shrink-0" />
                        <span className="text-xs text-gray-400 truncate select-all">{inviteLink}</span>
                      </div>
                    </div>

                    {/* Social icon row — always visible */}
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-500">Share with</p>
                      <div className="flex items-center gap-2">
                        {/* X / Twitter */}
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join my hackathon team for "${hackathon.name}"! ${inviteLink}`)}`}
                          target="_blank" rel="noreferrer"
                          title="Share on X"
                          className="w-9 h-9 rounded-full bg-[#0f0f0f] hover:bg-[#1a1a1a] flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.834L1.254 2.25H8.08l4.262 5.634 5.903-5.634Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>

                        {/* WhatsApp */}
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Join my hackathon team for "${hackathon.name}"! Click to join: ${inviteLink}`)}`}
                          target="_blank" rel="noreferrer"
                          title="Share on WhatsApp"
                          className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#20bd59] flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        </a>

                        {/* LinkedIn */}
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteLink)}`}
                          target="_blank" rel="noreferrer"
                          title="Share on LinkedIn"
                          className="w-9 h-9 rounded-full bg-[#0A66C2] hover:bg-[#0958a8] flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>

                        {/* Email */}
                        <a
                          href={`mailto:?subject=${encodeURIComponent(`Join my team – ${hackathon.name}`)}&body=${encodeURIComponent(`Hi!\n\nI'd like you to join my hackathon team for "${hackathon.name}".\n\nClick here to join: ${inviteLink}\n\nSee you there!`)}`}
                          title="Share via Email"
                          className="w-9 h-9 rounded-full bg-[#EA4335] hover:bg-[#d33828] flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        </a>

                        {/* Copy URL */}
                        <button
                          onClick={handleCopyInviteLink}
                          title={linkCopied ? 'Copied!' : 'Copy link'}
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95 relative ${
                            linkCopied
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                              : 'border-gray-600 bg-white/5 hover:bg-white/10 text-gray-300'
                          }`}
                        >
                          {linkCopied ? <Check size={14} /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                          {linkCopied && (
                            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400 font-bold whitespace-nowrap">Copied!</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>


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
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition-all shadow-md ${
                canAddRound
                  ? 'bg-emerald-600 hover:bg-emerald-500 !text-white shadow-emerald-500/20 hover:scale-[1.02]'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-cardBorder'
              }`}
              style={canAddRound ? { color: '#ffffff' } : {}}
              title={!canAddRound ? `Reached total rounds limit (${limit} rounds). You can increase this in Edit Details.` : ''}
            >
              <Plus size={15} style={canAddRound ? { color: '#ffffff', stroke: '#ffffff' } : {}} />
              <span style={canAddRound ? { color: '#ffffff' } : {}}>Add Round</span>
            </button>
          </div>

          {/* Interactive Timeline Layout */}
          <div className="space-y-8 relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-cardBorder">
            {/* Registration Deadline node */}
            <div className="relative animate-fade-in">
              <div className="absolute -left-[20px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-darkBg shadow-glow"></div>
              <div className="p-4 bg-white/5 border border-cardBorder rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registration Deadline</h4>
                  <p className="text-sm font-semibold text-gray-200 mt-1">
                    {hackathon.registration_deadline
                      ? new Date(hackathon.registration_deadline).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                      : 'No deadline set'}
                  </p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border shadow-sm ${
                  hackathon.registration_deadline && new Date(hackathon.registration_deadline) < new Date()
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
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
                          className={`border rounded-xl px-3 py-1.5 text-xs font-black outline-none transition-all cursor-pointer ${
                            round.status === 'ongoing' || round.status === 'completed' || round.status === 'qualified'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/10'
                              : round.status === 'not_qualified' || round.status === 'cancelled'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/10'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-cyan-500/10'
                          }`}
                        >
                          <option value="upcoming" className="bg-[#0d1321] text-cyan-300 font-bold">Upcoming</option>
                          <option value="ongoing" className="bg-[#0d1321] text-emerald-300 font-bold">Ongoing</option>
                          <option value="completed" className="bg-[#0d1321] text-emerald-300 font-bold">Completed</option>
                          <option value="qualified" className="bg-[#0d1321] text-emerald-300 font-bold">Qualified</option>
                          <option value="not_qualified" className="bg-[#0d1321] text-rose-300 font-bold">Not Qualified</option>
                          <option value="skipped" className="bg-[#0d1321] text-gray-400 font-bold">Skipped</option>
                          <option value="cancelled" className="bg-[#0d1321] text-rose-300 font-bold">Cancelled</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${
                          round.status === 'ongoing' || round.status === 'completed' || round.status === 'qualified'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : round.status === 'not_qualified' || round.status === 'cancelled'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}>
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
                      {(round.venue || round.meeting_link || round.submission_link || round.proof_url) && (
                        <div>
                          <span className="font-bold text-gray-600 block">Venue & Round Attachments</span>
                          <span className="text-gray-400 mt-0.5 block space-y-1">
                            {round.venue && <span className="block flex items-center space-x-1"><MapPin size={10} className="text-cyan-400" /> <span>{round.venue}</span></span>}
                            {round.meeting_link && <a href={round.meeting_link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-1"><Video size={10} /> <span>Meeting Link</span></a>}
                            {(round.submission_link || round.proof_url) && (
                              <a
                                href={round.proof_url || round.submission_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-xs font-bold text-indigo-300 transition-colors mt-1"
                              >
                                {(round.proof_url || round.submission_link)?.toLowerCase().match(/\.(ppt|pptx)$/) ? (
                                  <>
                                    <FileText size={13} className="text-amber-400" />
                                    <span>View Presentation (PPT / PPTX)</span>
                                  </>
                                ) : (round.proof_url || round.submission_link)?.toLowerCase().includes('.pdf') ? (
                                  <>
                                    <FileText size={13} className="text-red-400" />
                                    <span>View Round PDF</span>
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink size={13} className="text-indigo-400" />
                                    <span>View Submission File / Link</span>
                                  </>
                                )}
                              </a>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Delete Round Node (allowed only for the last round) */}
                    {isLastRound && isOwner && (
                      <div className="flex justify-end pt-2 border-t border-cardBorder/20">
                        <button
                          onClick={() => handleDeleteRound(round.id)}
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 !text-white rounded-full text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-md shadow-rose-500/20 hover:scale-105"
                          style={{ color: '#ffffff' }}
                        >
                          <Trash2 size={13} style={{ color: '#ffffff', stroke: '#ffffff' }} />
                          <span style={{ color: '#ffffff' }}>Delete Round</span>
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
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 !text-white rounded-full text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1.5"
              style={{ color: '#ffffff' }}
            >
              <Award size={14} style={{ color: '#ffffff', stroke: '#ffffff' }} />
              <span style={{ color: '#ffffff' }}>{hackathon.achievements ? 'Edit Result' : 'Record Result'}</span>
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
              <Award size={32} className="text-amber-500/20" />
              <p className="text-xs text-gray-400 font-medium">This hackathon result has not been recorded yet.</p>
              <button 
                onClick={() => setAchievementModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02]"
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

              {/* Presentation PPT / PDF Upload */}
              <div className="space-y-1">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Upload Presentation (PPT / PPTX) or PDF</label>
                <input
                  type="file"
                  accept=".ppt,.pptx,.pdf,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*"
                  onChange={(e) => e.target.files && setNewRoundFile(e.target.files[0])}
                  className="w-full bg-[#0d1321]/40 border border-cardBorder rounded-xl p-2 text-xs text-gray-300"
                />
                <p className="text-[9px] text-gray-500">Upload presentation slides (.ppt, .pptx) or PDF round submission. Max 25MB.</p>
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
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 !text-white rounded-full font-extrabold shadow-md shadow-emerald-500/20"
                  style={{ color: '#ffffff' }}
                >
                  <span style={{ color: '#ffffff' }}>{achievementSaving ? 'Uploading...' : 'Save Result'}</span>
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
