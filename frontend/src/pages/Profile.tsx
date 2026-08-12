import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { supabase } from '../services/supabase.js';
import { 
  User, 
  Mail, 
  BookOpen, 
  Phone, 
  Github, 
  Linkedin, 
  Save, 
  Upload, 
  X, 
  Plus, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [githubProfile, setGithubProfile] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Skills tag input state
  const [skillInput, setSkillInput] = useState('');

  // Avatar file upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/profile');
      setFullName(data.full_name || '');
      setCollege(data.college || '');
      setDepartment(data.department || '');
      setAcademicYear(data.academic_year || '');
      setPhoneNumber(data.phone_number || '');
      setGithubProfile(data.github_profile || '');
      setLinkedinProfile(data.linkedin_profile || '');
      setSkills(data.skills || []);
      setAvatarUrl(data.avatar_url || null);

      // Get user email directly from Supabase
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email) {
        setEmail(userData.user.email);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('Profile image exceeds 2MB limit.');
        return;
      }

      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const res = await api.post('/profile/avatar', formData, true);
        if (res.avatar_url) {
          setAvatarUrl(res.avatar_url);
        }
      } catch (err: any) {
        alert(err.message || 'Failed to upload profile picture.');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = skillInput.trim();
    if (tag && !skills.includes(tag)) {
      setSkills(prev => [...prev, tag]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (tagToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== tagToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      setError('Full name is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        full_name: fullName,
        college: college || null,
        department: department || null,
        academic_year: academicYear || null,
        phone_number: phoneNumber || null,
        github_profile: githubProfile || null,
        linkedin_profile: linkedinProfile || null,
        skills
      };

      await api.put('/profile', payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigoAccent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading profile info...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-slide-up select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white font-outfit tracking-wide">Hacker Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Configure your academic details, links, and hacker skill tags.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center space-x-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 size={16} />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl flex items-start space-x-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Card: Avatar & Skills Tags */}
        <div className="space-y-6">
          {/* Avatar card */}
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder flex flex-col items-center text-center space-y-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 relative overflow-hidden flex items-center justify-center font-bold text-white text-3xl shadow-glow">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{fullName.charAt(0).toUpperCase() || 'S'}</span>
              )}

              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div>
              <input
                type="file"
                id="avatar-input"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploadingAvatar}
              />
              <label 
                htmlFor="avatar-input"
                className="flex items-center space-x-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-cardBorder hover:border-gray-600 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                <Upload size={13} />
                <span>Upload Photo</span>
              </label>
              <p className="text-[10px] text-gray-500 mt-2">JPEG, PNG or WEBP. Max 2MB.</p>
            </div>
          </div>

          {/* Skill Tag Card */}
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4">
            <h3 className="font-bold text-white font-outfit text-sm border-b border-cardBorder/30 pb-3">Hacker Skills</h3>
            
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="React, ML, Solidity..."
                className="flex-1 bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600 outline-none"
              />
              <button 
                type="submit"
                className="p-2 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl transition-colors shrink-0"
              >
                <Plus size={16} />
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {skills.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">Add skill tags above (e.g. NextJS, PyTorch).</p>
              ) : (
                skills.map((tag) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-xs font-semibold"
                  >
                    <span>{tag}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(tag)}
                      className="text-indigo-400 hover:text-indigo-200 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Form: Main profile details */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-cardBorder">
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="font-bold text-white font-outfit text-sm border-b border-cardBorder/30 pb-3">Personal & Academic Details</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-500" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">College / Institution</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-500" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="IIT Madras"
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="CSE"
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Academic Year</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="3rd Year"
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl p-2.5 text-sm text-gray-200 outline-none"
                  />
                </div>
              </div>
            </div>

            <h3 className="font-bold text-white font-outfit text-sm border-b border-cardBorder/30 pb-3 pt-2">Developer Links</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">GitHub Profile URL</label>
                <div className="relative">
                  <Github className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-500" />
                  <input
                    type="url"
                    value={githubProfile}
                    onChange={(e) => setGithubProfile(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">LinkedIn Profile URL</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-500" />
                  <input
                    type="url"
                    value={linkedinProfile}
                    onChange={(e) => setLinkedinProfile(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-cardBorder/30">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-8 py-3 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-bold shadow-glow hover:shadow-indigo-500/30 transition-all text-sm disabled:opacity-50"
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Profile;
