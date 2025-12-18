
import React, { useState } from 'react';
import { User } from '../types';
import { mockAuthService } from '../services/mockDb';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await mockAuthService.signInWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      setError(err || 'Failed to verify Google Account. Ensure your email is registered in the Users database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-10 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative mx-auto bg-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20 rotate-3">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          
          <h1 className="relative text-2xl font-black text-white tracking-tight uppercase">
            Archipelago
          </h1>
          <p className="relative text-slate-400 text-sm font-medium tracking-wide uppercase mt-1">
            Secure Vault
          </p>
        </div>

        <div className="p-10">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-2">Please sign in with your corporate Google Account to access the password vault.</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full group relative bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all border-2 border-slate-100 hover:border-slate-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 flex items-start gap-2 animate-in slide-in-from-top-2">
                <div className="w-1 h-1 bg-red-600 rounded-full mt-1.5 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
             <div className="h-px bg-slate-100 flex-1"></div>
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Internal Use Only</span>
             <div className="h-px bg-slate-100 flex-1"></div>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-6 text-slate-500 text-[10px] font-medium tracking-widest uppercase">
        &copy; 2024 Archipelago International
      </div>
    </div>
  );
};

export default LoginScreen;
