import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  Trophy, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Info,
  Users,
  AlertTriangle
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

interface TeammateInput {
  name: string;
  email: string;
  college: string;
  department: string;
  role: string;
}

export const EditHackathon: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mode, setMode] = useState<'online' | 'offline' | 'hybrid'>('online');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [participationType, setParticipationType] = useState<'individual' | 'team'>('individual');
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState<number>(1);
  const [domain, setDomain] = useState('');
  const [technology, setTechnology] = useState('');
  const [prizeInfo, setPrizeInfo] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [rulesGuidelines, setRulesGuidelines] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('upcoming');
  const [totalRounds, setTotalRounds] = useState<number>(5);

  // Teammates dynamic array
  const [teammates, setTeammates] = useState<TeammateInput[]>([]);

  // Poster File State
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  // Helper to format ISO to datetime-local string
  const formatDatetimeLocal = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const hackathon = await api.get(`/hackathons/${id}`);
        
        if (user && hackathon.user_id !== user.id) {
          setError('Access denied: Only the team lead (creator) can edit this hackathon.');
          setLoading(false);
          return;
        }

        setName(hackathon.name);
        setOrganizer(hackathon.organizer);
        setDescription(hackathon.description || '');
        setWebsiteUrl(hackathon.website_url || '');
        setRegistrationLink(hackathon.registration_link || '');
        setRegistrationDeadline(formatDatetimeLocal(hackathon.registration_deadline));
        setStartDate(formatDatetimeLocal(hackathon.start_date));
        setEndDate(formatDatetimeLocal(hackathon.end_date));
        setMode(hackathon.mode || 'online');
        setLocation(hackathon.location || '');
        setMeetingLink(hackathon.meeting_link || '');
        setParticipationType(hackathon.participation_type || 'individual');
        setTotalRounds(hackathon.total_rounds || 5);
        setTeamName(hackathon.team_name || '');
        setTeamSize(hackathon.team_size || 1);
        setDomain(hackathon.domain || '');
        setTechnology(hackathon.technology || '');
        setPrizeInfo(hackathon.prize_info || '');
        setEligibility(hackathon.eligibility || '');
        setRulesGuidelines(hackathon.rules_guidelines || '');
        setStatus(hackathon.status || 'upcoming');
        setPosterPreview(hackathon.poster_url || null);

        // Prepopulate teammates if team mode
        if (hackathon.team_members) {
          setTeammates(hackathon.team_members.map((m: any) => ({
            name: m.name,
            email: m.email || '',
            college: m.college || '',
            department: m.department || '',
            role: m.role || ''
          })));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch hackathon details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleAddTeammate = () => {
    setTeammates(prev => [
      ...prev,
      { name: '', email: '', college: '', department: '', role: '' }
    ]);
  };

  const handleRemoveTeammate = (index: number) => {
    setTeammates(prev => prev.filter((_, i) => i !== index));
  };

  const handleTeammateChange = (index: number, field: keyof TeammateInput, value: string) => {
    setTeammates(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !organizer) {
      setError('Hackathon name and Organizer are required fields.');
      return;
    }

    if (registrationDeadline && startDate && new Date(registrationDeadline) > new Date(startDate)) {
      setError('Registration deadline cannot occur after the event start date.');
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('Event start date cannot occur after the end date.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name,
        organizer,
        description: description || null,
        website_url: websiteUrl || null,
        registration_link: registrationLink || null,
        registration_deadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        mode,
        location: location || null,
        meeting_link: meetingLink || null,
        total_rounds: Number(totalRounds) || 5,
        participation_type: participationType,
        team_name: participationType === 'team' ? teamName || null : null,
        team_size: participationType === 'team' ? Number(teamSize) || null : null,
        domain: domain || null,
        technology: technology || null,
        prize_info: prizeInfo || null,
        eligibility: eligibility || null,
        rules_guidelines: rulesGuidelines || null,
        status
      };

      // 1. Update Hackathon
      await api.put(`/hackathons/${id}`, payload);

      // 2. Upload Poster if modified
      if (posterFile) {
        const formData = new FormData();
        formData.append('poster', posterFile);
        await api.post(`/hackathons/${id}/poster`, formData, true);
      }

      // 3. Update team members list
      if (participationType === 'team') {
        const activeTeammates = teammates.filter(t => t.name.trim() !== '');
        await api.post(`/hackathons/${id}/team`, { members: activeTeammates });
      } else {
        // Purge team members if switched to individual
        await api.post(`/hackathons/${id}/team`, { members: [] });
      }

      navigate(`/hackathons/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update hackathon.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate(`/hackathons/${id}`)}
          className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-cardBorder"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit tracking-wide">Edit Hackathon</h1>
          <p className="text-gray-400 text-sm mt-1">Modify details for your registered hackathon.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl flex items-start space-x-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4">
          <div className="flex justify-between items-center border-b border-cardBorder pb-3">
            <h3 className="font-bold text-white flex items-center space-x-2">
              <Trophy size={18} className="text-indigo-400" />
              <span>Basic Information</span>
            </h3>
            <div className="space-y-1.5 flex items-center space-x-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">Status:</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="bg-[#0d1321] border border-cardBorder rounded-lg p-1.5 text-xs text-gray-300 outline-none focus:border-indigoAccent"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Hackathon Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Organizer *</label>
              <input
                type="text"
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Website URL</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Registration Link</label>
              <input
                type="url"
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
            </div>
          </div>

          {/* Poster Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Hackathon Poster</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-cardBorder rounded-xl bg-[#090d16]/30">
              {posterPreview ? (
                <div className="w-24 h-24 rounded-lg bg-gray-900 overflow-hidden relative border border-cardBorder">
                  <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => { setPosterFile(null); setPosterPreview(null); }}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Trophy size={20} />
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <input
                  type="file"
                  id="poster-input"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePosterChange}
                  className="hidden"
                />
                <label 
                  htmlFor="poster-input"
                  className="inline-block px-4 py-2 bg-white/5 hover:bg-white/10 border border-cardBorder hover:border-gray-600 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Change Poster Image
                </label>
                <p className="text-[10px] text-gray-500 mt-1">JPEG, PNG, or WEBP. Max size 5MB.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Event Details */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4">
          <h3 className="font-bold text-white border-b border-cardBorder pb-3 flex items-center space-x-2">
            <Calendar size={18} className="text-cyan-400" />
            <span>Event & Timings</span>
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Registration Deadline</label>
              <input
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-xs text-gray-300 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Event Start Date</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-xs text-gray-300 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Event End Date</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-xs text-gray-300 outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Mode</label>
              <select
                value={mode}
                onChange={(e: any) => setMode(e.target.value)}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-300 outline-none"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Location / Venue</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Meeting / Video Link</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Rounds Limit</label>
              <input
                type="number"
                min={1}
                max={20}
                value={totalRounds}
                onChange={(e) => setTotalRounds(Number(e.target.value))}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Participation & Teams */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4">
          <h3 className="font-bold text-white border-b border-cardBorder pb-3 flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users size={18} className="text-emerald-400" />
              <span>Participation Mode</span>
            </span>
            <div className="flex bg-[#0d1321] rounded-xl p-0.5 border border-cardBorder">
              <button
                type="button"
                onClick={() => setParticipationType('individual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  participationType === 'individual'
                    ? 'bg-indigoAccent text-white shadow-glow'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setParticipationType('team')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  participationType === 'team'
                    ? 'bg-indigoAccent text-white shadow-glow'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Team
              </button>
            </div>
          </h3>

          {participationType === 'team' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Team Name *</label>
                  <input
                    type="text"
                    required={participationType === 'team'}
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Team Size</label>
                  <input
                    type="number"
                    min={1}
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Teammates List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-t border-cardBorder/30 pt-4">
                  <h4 className="text-sm font-bold text-gray-300">Teammate Details</h4>
                  {teammates.length + 1 < teamSize && (
                    <button
                      type="button"
                      onClick={handleAddTeammate}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-cardBorder rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                      <Plus size={14} />
                      <span>Add Teammate</span>
                    </button>
                  )}
                </div>

                {teammates.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4 italic">No teammates registered.</p>
                ) : (
                  <div className="space-y-4">
                    {teammates.map((mate, index) => (
                      <div 
                        key={index} 
                        className="p-4 bg-[#090d16]/30 border border-cardBorder rounded-xl relative space-y-3 animate-slide-up"
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveTeammate(index)}
                          className="absolute top-3.5 right-3.5 text-gray-500 hover:text-red-400 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                        <p className="text-xs font-bold text-indigo-400">Teammate #{index + 1}</p>

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            required
                            value={mate.name}
                            onChange={(e) => handleTeammateChange(index, 'name', e.target.value)}
                            placeholder="Name *"
                            className="bg-[#0d1321]/60 border border-cardBorder rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-indigoAccent"
                          />
                          <input
                            type="email"
                            value={mate.email}
                            onChange={(e) => handleTeammateChange(index, 'email', e.target.value)}
                            placeholder="Email"
                            className="bg-[#0d1321]/60 border border-cardBorder rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-indigoAccent"
                          />
                          <input
                            type="text"
                            value={mate.role}
                            onChange={(e) => handleTeammateChange(index, 'role', e.target.value)}
                            placeholder="Role (e.g. Frontend, Designer)"
                            className="bg-[#0d1321]/60 border border-cardBorder rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-indigoAccent"
                          />
                          <input
                            type="text"
                            value={mate.college}
                            onChange={(e) => handleTeammateChange(index, 'college', e.target.value)}
                            placeholder="College"
                            className="bg-[#0d1321]/60 border border-cardBorder rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-indigoAccent"
                          />
                          <input
                            type="text"
                            value={mate.department}
                            onChange={(e) => handleTeammateChange(index, 'department', e.target.value)}
                            placeholder="Department"
                            className="bg-[#0d1321]/60 border border-cardBorder rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-indigoAccent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Additional Information */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4">
          <h3 className="font-bold text-white border-b border-cardBorder pb-3 flex items-center space-x-2">
            <Info size={18} className="text-amber-400" />
            <span>Additional Information</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Domain / Theme</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Technology Stack</label>
              <input
                type="text"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Prize Pool / Rewards</label>
            <input
              type="text"
              value={prizeInfo}
              onChange={(e) => setPrizeInfo(e.target.value)}
              className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Eligibility Criteria</label>
              <textarea
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                rows={3}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Rules & Guidelines</label>
              <textarea
                value={rulesGuidelines}
                onChange={(e) => setRulesGuidelines(e.target.value)}
                rows={3}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/hackathons/${id}`)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-cardBorder hover:border-gray-600 rounded-xl font-bold transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-bold shadow-glow transition-all flex items-center space-x-2 disabled:opacity-50 text-sm"
          >
            <span>{saving ? 'Updating Tracker...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default EditHackathon;
