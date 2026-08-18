import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
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
  AlertTriangle,
  FileText,
  Save,
  X
} from 'lucide-react';

interface TeammateInput {
  name: string;
  email: string;
  college: string;
  department: string;
  role: string;
}

export const AddHackathon: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  // Teammates dynamic array
  const [teammates, setTeammates] = useState<TeammateInput[]>([]);

  // Poster File State
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  // Rounds dynamic setup
  const [totalRounds, setTotalRounds] = useState<number>(3);
  const [rounds, setRounds] = useState<any[]>([
    { round_name: 'Round #1: Demo Assessment', description: '', date: '', start_time: '', end_time: '', venue: '', meeting_link: '', submission_link: '' },
    { round_name: 'Round #2: Prototype/MVP Submission', description: '', date: '', start_time: '', end_time: '', venue: '', meeting_link: '', submission_link: '' },
    { round_name: 'Round #3: Final Presentation & Judging', description: '', date: '', start_time: '', end_time: '', venue: '', meeting_link: '', submission_link: '' }
  ]);

  const handleTotalRoundsChange = (val: number) => {
    const cleanVal = Math.max(1, Math.min(20, val));
    setTotalRounds(cleanVal);
    setRounds(prev => {
      const copy = [...prev];
      if (copy.length < cleanVal) {
        for (let i = copy.length; i < cleanVal; i++) {
          copy.push({
            round_name: `Round #${i + 1}`,
            description: '',
            date: '',
            start_time: '',
            end_time: '',
            venue: '',
            meeting_link: '',
            submission_link: ''
          });
        }
      } else if (copy.length > cleanVal) {
        return copy.slice(0, cleanVal);
      }
      return copy;
    });
  };

  const handleRoundChange = (index: number, field: string, value: string) => {
    setRounds(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB limit.');
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

    // Date logical validations
    if (registrationDeadline && startDate && new Date(registrationDeadline) > new Date(startDate)) {
      setError('Registration deadline cannot occur after the event start date.');
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('Event start date cannot occur after the end date.');
      return;
    }

    setLoading(true);
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
        total_rounds: Number(totalRounds) || 3,
        participation_type: participationType,
        team_name: participationType === 'team' ? teamName || null : null,
        team_size: participationType === 'team' ? Number(teamSize) || null : null,
        domain: domain || null,
        technology: technology || null,
        prize_info: prizeInfo || null,
        eligibility: eligibility || null,
      };

      // 1. Create Hackathon
      const hackathon = await api.post('/hackathons', payload);

      // 2. Upload Poster if selected
      if (posterFile && hackathon.id) {
        const formData = new FormData();
        formData.append('poster', posterFile);
        await api.post(`/hackathons/${hackathon.id}/poster`, formData, true);
      }

      // 3. Register team members if team participation
      if (participationType === 'team' && teammates.length > 0 && hackathon.id) {
        // filter out completely blank teammate rows
        const activeTeammates = teammates.filter(t => t.name.trim() !== '');
        if (activeTeammates.length > 0) {
          await api.post(`/hackathons/${hackathon.id}/team`, { members: activeTeammates });
        }
      }

      // 4. Create rounds in database
      if (hackathon.id && rounds.length > 0) {
        for (let i = 0; i < rounds.length; i++) {
          const r = rounds[i];
          if (r.round_name.trim()) {
            await api.post(`/hackathons/${hackathon.id}/rounds`, {
              round_number: i + 1,
              round_name: r.round_name,
              description: r.description || null,
              date: r.date ? new Date(r.date).toISOString() : null,
              start_time: r.start_time || null,
              end_time: r.end_time || null,
              venue: r.venue || null,
              meeting_link: r.meeting_link || null,
              submission_link: r.submission_link || null,
              status: 'upcoming'
            });
          }
        }
      }

      navigate(`/hackathons/${hackathon.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create hackathon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/hackathons')}
          className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-cardBorder"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit tracking-wide">Add Hackathon</h1>
          <p className="text-gray-400 text-sm mt-1">Register a new hackathon tracker log.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl flex items-start space-x-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4">
          <h3 className="font-bold text-white border-b border-cardBorder pb-3 flex items-center space-x-2">
            <Trophy size={18} className="text-indigo-400" />
            <span>Basic Information</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Hackathon Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Smart India Hackathon 2026"
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
                placeholder="Ministry of Education"
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief description of the hackathon rules, themes, problem statements..."
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
                placeholder="https://sih.gov.in"
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Registration Link</label>
              <input
                type="url"
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
                placeholder="https://sih.gov.in/register"
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
            </div>
          </div>

          {/* Poster Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Hackathon Poster</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-cardBorder rounded-xl bg-[#090d16]/30">
              {posterPreview ? (
                <div className="w-24 h-24 rounded-lg bg-gray-900 overflow-hidden relative border border-cardBorder flex items-center justify-center">
                  {posterFile?.type === 'application/pdf' || posterFile?.name.toLowerCase().endsWith('.pdf') ? (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-red-400 space-y-1">
                      <FileText size={28} />
                      <span className="text-[10px] font-bold text-gray-300 truncate max-w-[80px]">PDF Document</span>
                    </div>
                  ) : (
                    <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                  )}
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
                  accept="image/*,application/pdf,.pdf"
                  onChange={handlePosterChange}
                  className="hidden"
                />
                <label 
                  htmlFor="poster-input"
                  className="inline-block px-4 py-2 bg-white/5 hover:bg-white/10 border border-cardBorder hover:border-gray-600 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Upload Poster (PDF or Image)
                </label>
                <p className="text-[10px] text-gray-500 mt-1">PDF or any image format (JPG, PNG, WEBP, GIF, SVG). Max 15MB.</p>
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
                  placeholder={mode === 'online' ? 'Discord, Zoom' : 'IIT Bombay campus, Hall A'}
                  className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Meeting / Video Link</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-500" />
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none"
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
                    placeholder="Bit_By_Bit"
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
                  <p className="text-xs text-gray-500 text-center py-4 italic">No teammates added yet. Click above to register teammate records.</p>
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
                placeholder="AI/ML, Web3, FinTech"
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Technology Stack</label>
              <input
                type="text"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                placeholder="React, Express, PyTorch, Solidity"
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
              placeholder="1st Place: $5000, 2nd Place: $3000, Best AI Hack: $1000"
              className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Eligibility Criteria</label>
              <textarea
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                placeholder="Undergraduate students, maximum 4 members per team..."
                rows={3}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Rules & Guidelines</label>
              <textarea
                value={rulesGuidelines}
                onChange={(e) => setRulesGuidelines(e.target.value)}
                placeholder="Codes must be committed to GitHub, project must be built during hacking hours..."
                rows={3}
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Rounds Details Setup */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-6">
          <h3 className="font-bold text-white border-b border-cardBorder pb-3 flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Trophy size={18} className="text-indigo-400" />
              <span>Configure Hackathon Rounds</span>
            </span>
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-gray-400">Total Rounds Limit:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={totalRounds}
                onChange={(e) => handleTotalRoundsChange(Number(e.target.value))}
                className="w-16 bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-1.5 text-xs text-center text-gray-200 outline-none"
              />
            </div>
          </h3>

          <div className="space-y-6">
            {rounds.map((r, index) => (
              <div 
                key={index} 
                className="p-5 bg-[#090d16]/30 border border-cardBorder/80 rounded-xl space-y-4 animate-slide-up"
              >
                <div className="flex justify-between items-center border-b border-cardBorder/30 pb-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Round #{index + 1}</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Round Name *</label>
                    <input
                      type="text"
                      required
                      value={r.round_name}
                      onChange={(e) => handleRoundChange(index, 'round_name', e.target.value)}
                      placeholder="e.g. Idea Submission, Prototype evaluation"
                      className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-xs text-gray-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</label>
                    <input
                      type="text"
                      value={r.description}
                      onChange={(e) => handleRoundChange(index, 'description', e.target.value)}
                      placeholder="Instructions or guidelines..."
                      className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-xs text-gray-200 outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Round Date</label>
                    <input
                      type="date"
                      value={r.date}
                      onChange={(e) => handleRoundChange(index, 'date', e.target.value)}
                      className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-xs text-gray-300 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Start Time</label>
                    <input
                      type="time"
                      value={r.start_time}
                      onChange={(e) => handleRoundChange(index, 'start_time', e.target.value)}
                      className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-xs text-gray-300 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">End Time</label>
                    <input
                      type="time"
                      value={r.end_time}
                      onChange={(e) => handleRoundChange(index, 'end_time', e.target.value)}
                      className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-xs text-gray-300 outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Venue / Location</label>
                    <input
                      type="text"
                      value={r.venue}
                      onChange={(e) => handleRoundChange(index, 'venue', e.target.value)}
                      placeholder="Hall C, or Zoom"
                      className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-xs text-gray-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Meeting Link</label>
                    <input
                      type="url"
                      value={r.meeting_link}
                      onChange={(e) => handleRoundChange(index, 'meeting_link', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-xs text-gray-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Submission Link</label>
                    <input
                      type="url"
                      value={r.submission_link}
                      onChange={(e) => handleRoundChange(index, 'submission_link', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-xs text-gray-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/hackathons')}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-extrabold shadow-md shadow-rose-500/20 transition-all flex items-center space-x-2 text-sm hover:scale-[1.02]"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-extrabold shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-2 disabled:opacity-50 text-sm hover:scale-[1.02]"
          >
            <Save size={16} />
            <span>{loading ? 'Registering Tracker...' : 'Save Hackathon'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default AddHackathon;
