import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  Bell, 
  Users, 
  Award, 
  LineChart, 
  ArrowRight, 
  Clock, 
  ShieldAlert, 
  CheckCircle,
  FileCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-darkBg text-slate-800 dark:text-gray-100 font-sans relative overflow-hidden select-none">
      {/* Background Neon Spotlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Top Header Navigation */}
      <header className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center space-x-2.5">
          <img src="/favicon.png" alt="Trackathon Logo" className="h-8 w-8 object-contain" />
          <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent font-outfit tracking-wide">
            Trackathon
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors font-medium text-sm">
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="px-5 py-2.5 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-glow hover:shadow-indigo-500/30 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 text-center z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
          <Award size={14} />
          <span>Built Exclusively for Student Hackers</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto font-outfit">
          Manage, Track & Master Your{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Hackathon Journey
          </span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
          Never miss a registration deadline, team submission, or round schedule. Store certificates, sync timelines with Google Calendar, and showcase your achievements in one premium student portfolio.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-extrabold shadow-glow flex items-center justify-center space-x-3 transition-all hover:scale-[1.02]"
          >
            <span>Start Tracking Hackathons</span>
            <ArrowRight size={20} />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-cardBorder hover:border-gray-600 rounded-xl font-bold transition-all"
          >
            Explore Dashboard
          </Link>
        </div>

        {/* Dashboard Mockup Banner */}
        <div className="mt-20 max-w-5xl mx-auto rounded-2xl border border-cardBorder bg-[#0c1220]/60 p-2.5 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="bg-[#090d16] rounded-xl border border-white/5 aspect-[16/9] flex flex-col items-center justify-center p-8 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-cyan-500/10 opacity-30"></div>
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-glow">
              <Trophy size={32} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Centralized Hacker Dashboard</h3>
            <p className="text-gray-400 text-sm sm:text-base max-w-md">
              A visually stunning dashboard loaded with live timelines, upcoming deadlines, custom rounds, calendar sync states, and responsive analytical chart insights.
            </p>
          </div>
        </div>
      </section>

      {/* Problem & Solution Panel */}
      <section className="border-y border-cardBorder bg-[#080c14]/40 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          {/* Problem */}
          <div className="space-y-6">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl flex items-center justify-center shadow-md">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-white font-outfit">The Student Hacker Dilemma</h2>
            <p className="text-gray-400 leading-relaxed">
              Registering for multiple hackathons is exciting, but staying organized is a nightmare. Missing submission windows, forgetting which round comes next, coordinating team details, and losing certificates in chaotic email threads happens all too often.
            </p>
            <ul className="space-y-3.5 text-sm text-gray-400">
              <li className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                <span>Missed registration deadlines and event dates.</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                <span>Uncoordinated round progression timelines.</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                <span>Misplaced teammate info and credentials.</span>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="space-y-6">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-glowEmerald">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-white font-outfit">The Trackathon Solution</h2>
            <p className="text-gray-400 leading-relaxed">
              Trackathon gives you a private space to record, coordinate, and review your complete hackathon lifecycle. Watch your rounds progress, manage team details, receive reminders, sync calendar blocks, and generate a portfolio of your wins.
            </p>
            <ul className="space-y-3.5 text-sm text-gray-400">
              <li className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>Structured timeline trackers from sign-up to final.</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>Google Calendar synchronization and auto-reminders.</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>Premium achievement showcase portfolio.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit">Engineered for Peak Performance</h2>
          <p className="text-gray-400 mt-4 text-sm sm:text-base">
            Every feature you need to organize your competitive hacking schedule and build your developer portfolio.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4 hover:border-indigo-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-glow">
              <Clock size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Dynamic Timeline</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Enforces round-by-round progression in the database. Round N unlocks only when Round N-1 is complete, providing a clear progression checklist.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4 hover:border-indigo-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-glow">
              <Calendar size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Google Calendar Sync</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connect Google Calendar with one click. Deadlines, event schedules, and round dates are automatically synced with zero duplicate entries.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4 hover:border-indigo-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-glow">
              <Bell size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-channel Reminders</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Configure reminder offsets (e.g. 24h, 1h). Receive push notifications in the browser and emails straight to your inbox.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4 hover:border-indigo-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-glow">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Teammate Coordination</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Manage teammate roles, emails, colleges, and tasks for team events. Access quick links to GitHub repositories and project demos.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4 hover:border-indigo-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-glow">
              <Award size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Achievements Portfolio</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Showcase your track record (Winner, Runner-up, Finalist). Upload certificates, screenshots, and rules to share your achievements.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4 hover:border-indigo-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-glow">
              <LineChart size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Hacker Analytics</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Examine charts that detail your participation trends, domain breakdowns, and success ratios using responsive, interactive Recharts components.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Footer Section */}
      <section className="relative max-w-5xl mx-auto px-6 pb-24 text-center z-10">
        <div className="glass-panel p-12 rounded-3xl border border-cardBorder/80 bg-gradient-to-b from-[#111928]/90 to-[#090d16] relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit mb-4">
            Ready to Streamline Your Tracking?
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base mb-8">
            Create your account today, add your next upcoming hackathon registration link, connect Google Calendar, and focus on coding!
          </p>
          <Link
            to="/register"
            className="inline-flex px-8 py-4 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-extrabold shadow-glow flex items-center justify-center space-x-3 transition-all hover:scale-[1.02] mx-auto w-fit"
          >
            <span>Start Tracking Hackathons</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cardBorder/30 py-8 relative z-10 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Trackathon. Built by student developers, for student developers.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
            <a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
