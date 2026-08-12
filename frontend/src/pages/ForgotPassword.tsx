import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase.js';
import { Mail, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset. Please verify your email.');
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
        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </Link>

        <h1 className="text-2xl font-extrabold text-white font-outfit mb-2">Reset Password</h1>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Enter your registered email below, and we'll send you instructions to reset your password.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl flex items-start space-x-3 text-sm animate-fade-in">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-glowEmerald">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Reset Email Sent</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              We've dispatched a recovery email to <span className="font-semibold text-white">{email}</span>. Check your inbox and click the reset link to establish a new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-semibold shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Sending Instructions...' : 'Send Recovery Email'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;
