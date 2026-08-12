import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, FileText, ArrowLeft, Scale, ShieldAlert, Globe } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
            <Scale className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit tracking-wide">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Last Updated: August 12, 2026
          </p>
        </div>

        {/* Main Content Area */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-cardBorder space-y-8 shadow-2xl leading-relaxed text-sm">
          
          {/* Section 1: Agreement */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center space-x-2 border-b border-cardBorder/30 pb-2">
              <FileText size={18} className="text-indigo-400" />
              <span>1. Agreement to Terms</span>
            </h2>
            <p>
              By accessing or using <strong>Trackathon</strong>, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you are not authorized to use the platform.
            </p>
          </div>

          {/* Section 2: Account Terms */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center space-x-2 border-b border-cardBorder/30 pb-2">
              <Globe size={18} className="text-cyan-400" />
              <span>2. Use of the Service</span>
            </h2>
            <p>
              Trackathon is a workspace helper for tracking hackathon progressions, rounds, teams, and achievements.
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-gray-400">
              <li>You must provide accurate account information during signup.</li>
              <li>You are responsible for keeping your credentials and Google OAuth link secure.</li>
              <li>You agree not to upload harmful, offensive, or copyright-infringing posters or event links.</li>
            </ul>
          </div>

          {/* Section 3: Third Party Services */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center space-x-2 border-b border-cardBorder/30 pb-2">
              <Trophy size={18} className="text-indigo-400" />
              <span>3. Google Integrations & Calendar</span>
            </h2>
            <p>
              Our service integrates directly with Google Calendar APIs to sync hackathon events. By choosing to enable Google Calendar synchronization, you authorize Trackathon to interact with your Google Account as permitted by Google API policies. We disclaim any liability for accidental calendar modifications resulting from third-party API interruptions or local configurations.
            </p>
          </div>

          {/* Section 4: Limitation of Liability */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center space-x-2 border-b border-cardBorder/30 pb-2">
              <ShieldAlert size={18} className="text-cyan-400" />
              <span>4. Disclaimer of Warranties</span>
            </h2>
            <p>
              Trackathon is provided on an "as-is" and "as-available" basis without warranties of any kind. We do not guarantee that the service will always be error-free or uninterrupted, especially with regards to browser service workers, push subscriptions, and Google connection sync times.
            </p>
          </div>

          {/* Section 5: Support */}
          <div className="space-y-3 border-t border-cardBorder/30 pt-6">
            <p className="text-xs text-gray-500">
              If you have any questions or feedback about our Terms of Service, please reach out to us at: <span className="text-indigo-400 font-semibold">praveenkumar.student.dev@gmail.com</span>
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

export default TermsOfService;
