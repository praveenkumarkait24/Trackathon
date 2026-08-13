import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase.js';
import { useAuth } from '../context/AuthContext.js';
import { Trophy, Mail, Lock, AlertTriangle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get('redirectTo') || '/';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('oauth_redirect_to', redirectTo);
      await signInWithGoogle(window.location.origin);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate via Google.');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-cardBorder shadow-2xl relative z-10 animate-slide-up">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8">
          <img src="/favicon.png" alt="Trackathon Logo" className="w-14 h-14 object-contain mb-4 filter drop-shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
          <h1 className="text-3xl font-extrabold text-white font-outfit tracking-wide text-center">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Sign in to track your hackathon progression.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl flex items-start space-x-3 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-3 pl-11 pr-4 text-gray-200 placeholder-gray-600 outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-300">Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0d1321]/60 border border-cardBorder focus:border-indigoAccent rounded-xl py-3 pl-11 pr-4 text-gray-200 placeholder-gray-600 outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-semibold shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-cardBorder"></div>
          <span className="text-xs text-gray-500 px-4 font-semibold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-cardBorder"></div>
        </div>

        {/* Google Sign In */}
        <div className="w-full py-1">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white rounded-xl font-bold transition-all border border-cardBorder flex items-center justify-center space-x-2.5 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Redirect Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 space-y-3.5">
          <div>
            Don't have an account?{' '}
            <Link to={`/register${window.location.search}`} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Register for free
            </Link>
          </div>
          <div className="flex justify-center space-x-4 text-xs text-gray-600 border-t border-cardBorder/30 pt-3">
            <Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
