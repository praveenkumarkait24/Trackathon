import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  LayoutDashboard, 
  Trophy, 
  Calendar, 
  Award, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    const saved = localStorage.getItem('trackathon_sidebar_pinned');
    return saved !== 'false'; // Default to true (open)
  });
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const isSidebarOpen = sidebarPinned || sidebarHovered;

  const toggleSidebar = () => {
    setSidebarPinned(prev => {
      const next = !prev;
      localStorage.setItem('trackathon_sidebar_pinned', String(next));
      return next;
    });
  };

  const menuItems = [
    { name: 'Dashboard',    path: '/',             icon: LayoutDashboard, activeColor: 'text-indigo-500',  activeBg: 'from-indigo-500/15 to-indigo-400/5',  border: 'border-indigo-500' },
    { name: 'Hackathons',   path: '/hackathons',   icon: Trophy,          activeColor: 'text-cyan-500',    activeBg: 'from-cyan-500/15 to-cyan-400/5',      border: 'border-cyan-500'   },
    { name: 'Calendar',     path: '/calendar',     icon: Calendar,        activeColor: 'text-violet-500',  activeBg: 'from-violet-500/15 to-violet-400/5',  border: 'border-violet-500' },
    { name: 'Achievements', path: '/achievements', icon: Award,           activeColor: 'text-amber-500',   activeBg: 'from-amber-500/15 to-amber-400/5',    border: 'border-amber-500'  },
    { name: 'Settings',     path: '/settings',     icon: Settings,        activeColor: 'text-emerald-500', activeBg: 'from-emerald-500/15 to-emerald-400/5',border: 'border-emerald-500'},
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-900 flex flex-col md:flex-row antialiased">
      {/* Invisible Hover Zone for Desktop Sidebar */}
      <div 
        className="hidden md:block fixed left-0 top-0 w-3.5 h-screen z-40 bg-transparent"
        onMouseEnter={() => setSidebarHovered(true)}
      />

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-cardBorder sticky top-0 z-40">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/favicon.png" alt="Trackathon Logo" className="h-6 w-6 object-contain" />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent font-outfit">
            Trackathon
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col w-64 glass-panel border-r border-cardBorder h-screen fixed top-0 left-0 z-50 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-cardBorder">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
              <img src="/favicon.png" alt="Trackathon Logo" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent font-outfit tracking-wide">
              Trackathon
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const Active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{ animationDelay: `${idx * 0.06}s` }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group font-semibold text-sm animate-slide-in-left ${
                  Active
                    ? `bg-gradient-to-r ${item.activeBg} border-l-[3px] ${item.border} shadow-sm`
                    : 'border-l-[3px] border-transparent hover:bg-indigo-50 dark:hover:bg-white/5'
                }`}
              >
                <Icon 
                  size={19} 
                  className={`transition-all duration-200 ${Active ? item.activeColor : 'text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-white'}`} 
                />
                <span className={Active ? `${item.activeColor} dark:text-white` : 'text-slate-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white'}>{item.name}</span>
                {Active && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${item.activeColor.replace('text-','bg-')}`} />}
              </Link>
            );
          })}
        </nav>

        {/* User profile section & logout */}
        <div className="p-4 border-t border-cardBorder space-y-3">
          <div className="flex items-center space-x-3 px-2 py-2 rounded-xl bg-indigo-50/60 dark:bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-glow overflow-hidden ring-2 ring-indigo-200 dark:ring-indigo-900">
              {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                <img 
                  src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                user?.email?.charAt(0).toUpperCase() || 'S'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-800 dark:text-gray-100">
                {user?.user_metadata?.full_name || 'Student'}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200 font-semibold text-sm border border-transparent hover:border-rose-200 dark:hover:border-red-500/20 group"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sliding Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <aside 
            className="w-72 bg-darkBg border-r border-cardBorder h-full flex flex-col p-6 space-y-6 transform transition-transform duration-300 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-cardBorder pb-4">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent font-outfit">
                Navigation
              </span>
              <div className="flex items-center space-x-2">
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const Active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${
                      Active
                        ? `bg-gradient-to-r ${item.activeBg} border-l-[3px] ${item.border} shadow-sm`
                        : 'border-l-[3px] border-transparent hover:bg-indigo-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon size={19} className={Active ? item.activeColor : 'text-slate-400'} />
                    <span className={Active ? item.activeColor : 'text-slate-600 dark:text-gray-400'}>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-cardBorder pt-4 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-glow overflow-hidden">
                  {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                    <img 
                      src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    user?.email?.charAt(0).toUpperCase() || 'S'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-gray-200">
                    {user?.user_metadata?.full_name || 'Student'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium border border-transparent"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Page Container */}
      <main className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'md:pl-64' : 'pl-0'}`}>
        {/* Top Navbar Header - Desktop only */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white/70 dark:bg-[#090d16]/40 backdrop-blur-md border-b border-indigo-100 dark:border-cardBorder/30 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-indigo-500 dark:text-gray-400 dark:hover:text-white transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
              title={sidebarPinned ? 'Collapse Sidebar' : 'Pin Sidebar'}
            >
              <Menu size={18} />
            </button>
            {/* Breadcrumb-style page indicator */}
            <div className="hidden lg:flex items-center space-x-2 text-sm">
              <span className="text-indigo-400">✦</span>
              <span className="font-semibold text-slate-700 dark:text-gray-300 capitalize">
                {location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/','').split('/')[0].charAt(0).toUpperCase() + location.pathname.replace('/','').split('/')[0].slice(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2.5 bg-indigo-50/80 dark:bg-white/5 rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xs overflow-hidden ring-2 ring-white dark:ring-indigo-900 shadow-sm">
                {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                  <img 
                    src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  user?.email?.charAt(0).toUpperCase() || 'S'
                )}
              </div>
              <span className="font-semibold text-sm text-slate-700 dark:text-gray-300">{user?.user_metadata?.full_name || 'Student'}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
export default DashboardLayout;
