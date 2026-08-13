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
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const isSidebarOpen = sidebarPinned || sidebarHovered;

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Hackathons', path: '/hackathons', icon: Trophy },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Achievements', path: '/achievements', icon: Award },
    { name: 'Settings', path: '/settings', icon: Settings },
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
    <div className="min-h-screen bg-darkBg text-gray-100 flex flex-col md:flex-row antialiased">
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
        <div className="p-6 border-b border-cardBorder">
          <Link to="/" className="flex items-center space-x-2.5">
            <img src="/favicon.png" alt="Trackathon Logo" className="h-8 w-8 object-contain" />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent font-outfit tracking-wide">
              Trackathon
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${
                  Active
                    ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-600/20 text-white border-l-4 border-indigoAccent shadow-glow'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <Icon size={20} className={Active ? 'text-indigoAccent' : 'text-gray-400 group-hover:text-white transition-colors'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile section & logout */}
        <div className="p-4 border-t border-cardBorder space-y-4">
          <div className="flex items-center space-x-3 px-2">
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
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium border border-transparent hover:border-red-500/20"
          >
            <LogOut size={20} />
            <span>Logout</span>
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

            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const Active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      Active
                        ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-600/20 text-white border-l-4 border-indigoAccent shadow-glow'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                    }`}
                  >
                    <Icon size={20} className={Active ? 'text-indigoAccent' : 'text-gray-400'} />
                    <span>{item.name}</span>
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
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#090d16]/30 border-b border-cardBorder/30">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarPinned(!sidebarPinned)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center justify-center shadow-sm"
              title={sidebarPinned ? 'Collapse Sidebar' : 'Pin Sidebar'}
            >
              <Menu size={18} />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5 text-sm text-gray-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
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
              <span className="font-semibold text-slate-800 dark:text-gray-300">{user?.user_metadata?.full_name || 'Student'}</span>
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
