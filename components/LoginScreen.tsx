
import React, { useState } from 'react';
import { User } from '../types';
import { mockAuthService } from '../services/mockDb';
import { ShieldCheck, Loader2, AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await mockAuthService.signInWithCredentials(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.toString() || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
        {/* Banner Section */}
        <div className="bg-slate-900 p-12 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          
          <div className="relative mx-auto bg-gradient-to-br from-indigo-500 to-indigo-700 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/30 -rotate-3 border-2 border-white/10">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          
          <h1 className="relative text-3xl font-black text-white tracking-tighter uppercase italic">
            Archipelago
          </h1>
          <p className="relative text-indigo-400 text-[10px] font-black tracking-[0.3em] uppercase mt-2">
            Secure Vault System
          </p>
        </div>

        {/* Login Form Section */}
        <div className="p-10">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">Internal Access</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Enter your corporate credentials to access hotel password vault.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@archipelago.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 text-xs font-bold rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error.replace('Error: ', '')}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Decoration */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
             <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Group IT Infrastructure</div>
             <div className="flex gap-4">
                <div className="w-1 h-1 rounded-full bg-slate-100"></div>
                <div className="w-1 h-1 rounded-full bg-slate-100"></div>
                <div className="w-1 h-1 rounded-full bg-slate-100"></div>
             </div>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-8 text-slate-500 text-[9px] font-black tracking-[0.4em] uppercase opacity-50">
        &copy; 2025 Archipelago International
      </div>
    </div>
  );
};

export default LoginScreen;
