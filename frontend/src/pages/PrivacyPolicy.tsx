import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Shield, ArrowLeft, Calendar, Mail, FileText } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-darkBg text-gray-300 py-12 px-4 relative overflow-hidden select-none">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-glow mx-auto">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit tracking-wide">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Last Updated: August 12, 2026
          </p>
        </div>

        {/* Main Content Area */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-cardBorder space-y-8 shadow-2xl leading-relaxed text-sm">
          
          {/* Section 1: Overview */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center space-x-2 border-b border-cardBorder/30 pb-2">
              <FileText size={18} className="text-indigo-400" />
              <span>1. Introduction</span>
            </h2>
            <p>
              Welcome to <strong>Trackathon</strong>. We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy describes how we collect, use, store, and share your information when you use our web application, including details regarding Google API Scopes.
            </p>
          </div>

          {/* Section 2: Data Collection */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center space-x-2 border-b border-cardBorder/30 pb-2">
              <Mail size={18} className="text-cyan-400" />
              <span>2. Data We Collect</span>
            </h2>
            <p>When you register or log in, we collect information necessary to provide our services:</p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-gray-400">
              <li><strong className="text-white">Account Information:</strong> Full name, email address, profile avatar, and credentials when you sign up using Google OAuth or Email.</li>
              <li><strong className="text-white">Hackathon Details:</strong> Deadlines, custom rounds, team rosters, and submission statuses manually inputted by you.</li>
              <li><strong className="text-white">OAuth Tokens:</strong> Temporary Google access tokens and refresh tokens strictly for Google Calendar integrations.</li>
            </ul>
          </div>

          {/* Section 3: Google OAuth & Calendar Scopes */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center space-x-2 border-b border-cardBorder/30 pb-2">
              <Calendar size={18} className="text-indigo-400" />
              <span>3. Google API Data Usage</span>
            </h2>
            <p>
              Trackathon requests access to your Google Calendar via the <code className="text-indigo-300 font-mono">https://www.googleapis.com/auth/calendar.events</code> scope.
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-gray-400">
              <li><strong className="text-white">Usage:</strong> We only use this permission to automatically create, modify, or delete calendar events corresponding to your hackathon registration deadlines and round schedules.</li>
              <li><strong className="text-white">No Transfer:</strong> We do not transfer, sell, or share your Google Calendar events or data with third parties. Your data remains strictly within our application for automation purposes.</li>
              <li><strong className="text-white">Revocation:</strong> You can disconnect calendar synchronization or revoke access at any time through your Google Account Security Settings.</li>
            </ul>
          </div>

          {/* Section 4: Data Security */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center space-x-2 border-b border-cardBorder/30 pb-2">
              <Shield size={18} className="text-cyan-400" />
              <span>4. Data Storage & Protection</span>
            </h2>
            <p>
              Your data is stored securely using encrypted cloud services. We implement strict Row Level Security (RLS) policies to ensure that your records are only accessible to you and authorized team members you invite to your hackathons.
            </p>
          </div>

          {/* Section 5: Your Rights */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center space-x-2 border-b border-cardBorder/30 pb-2">
              <Trophy size={18} className="text-indigo-400" />
              <span>5. Data Deletion</span>
            </h2>
            <p>
              You have the right to request deletion of your account and all associated hackathon details at any time. To request data deletion, please contact our support team.
            </p>
          </div>

          {/* Section 6: Contact */}
          <div className="space-y-3 border-t border-cardBorder/30 pt-6">
            <p className="text-xs text-gray-500">
              If you have any questions about this Privacy Policy, please contact us at: <span className="text-indigo-400 font-semibold">praveenkumar.student.dev@gmail.com</span>
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600">
          &copy; 2026 Trackathon. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
