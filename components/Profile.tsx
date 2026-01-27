
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { mockAuthService } from '../services/mockDb';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Smartphone, 
  User as UserIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [step, setStep] = useState<'info' | 'verify' | 'new-password'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Verification State
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer: any;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleRequestCode = async () => {
    setLoading(true);
    setError(null);
    try {
      await mockAuthService.sendVerificationCode(user.email);
      setStep('verify');
      setTimeLeft(600); // 10 minutes
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    setError(null);
    setStep('new-password');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await mockAuthService.verifyAndChangePassword(user.email, code, newPassword);
      setSuccess("Your password has been successfully updated.");
      setStep('info');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStrength = (pwd: string) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length > 8) s += 20;
    if (/[A-Z]/.test(pwd)) s += 20;
    if (/[0-9]/.test(pwd)) s += 20;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 20;
    if (pwd.length > 12) s += 20;
    return s;
  };

  const strength = getStrength(newPassword);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="w-32 h-32" />
           </div>
           
           <div className="relative w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-200 border-4 border-white rotate-3">
             {user.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover rounded-2xl" alt="" />
             ) : (
                <UserIcon className="w-12 h-12 text-white" />
             )}
           </div>

           <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">{user.name}</h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                 <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    {user.access_level}
                 </span>
                 <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                    {user.position}
                 </span>
              </div>
              <div className="mt-4 flex items-center justify-center sm:justify-start gap-2 text-slate-400 text-sm">
                 <Mail className="w-4 h-4" />
                 <span className="font-mono">{user.email}</span>
              </div>
           </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px]"></div>
           <div>
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Account Status</div>
              <div className="text-xl font-bold flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                 Active & Secure
              </div>
           </div>
           <div className="mt-8 text-xs text-slate-400 leading-relaxed">
              Last password change was verified via corporate email authentication.
           </div>
        </div>
      </div>

      {/* Action Content */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
           <div className="p-2.5 bg-slate-900 rounded-2xl">
              <Lock className="w-5 h-5 text-white" />
           </div>
           <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight italic">Security Management</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update your vault access credentials</p>
           </div>
        </div>

        <div className="p-10 max-w-lg mx-auto">
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm animate-in zoom-in-95">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{error.replace('Error: ', '')}</p>
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-emerald-700 text-sm animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{success}</p>
            </div>
          )}

          {step === 'info' && (
            <div className="text-center space-y-8">
              <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
                <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Changing your password requires email verification. We will send a 6-digit security code to your registered email: 
                  <br/><strong className="text-indigo-600 font-mono mt-2 block">{user.email}</strong>
                </p>
              </div>
              
              <button
                onClick={handleRequestCode}
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                Request Verification Code
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-8">
               <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-amber-100">
                    <Clock className="w-3.5 h-3.5" />
                    Code expires in {formatTime(timeLeft)}
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">Check your email</h4>
                  <p className="text-slate-500 text-sm mt-2">Enter the 6-digit code we just sent you.</p>
               </div>

               <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-48 text-center text-4xl font-black tracking-[0.5em] py-4 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all text-indigo-600"
                  />
               </div>

               <button
                onClick={handleVerifyCode}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                Verify Code
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setStep('info')} 
                className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
              >
                Cancel & Go Back
              </button>
            </div>
          )}

          {step === 'new-password' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
               <div className="text-center mb-8">
                  <h4 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">Set New Password</h4>
                  <p className="text-slate-500 text-sm mt-2">Use at least 8 characters with numbers and symbols.</p>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input
                         type={showPasswords ? "text" : "password"}
                         required
                         value={newPassword}
                         onChange={e => setNewPassword(e.target.value)}
                         className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                       />
                       <button
                         type="button"
                         onClick={() => setShowPasswords(!showPasswords)}
                         className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                       >
                         {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                    </div>
                    <div className="mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-700 ${
                           strength < 40 ? 'bg-red-500' : strength < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                         }`}
                         style={{ width: `${strength}%` }}
                       />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input
                         type={showPasswords ? "text" : "password"}
                         required
                         value={confirmPassword}
                         onChange={e => setConfirmPassword(e.target.value)}
                         className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                       />
                    </div>
                  </div>
               </div>

               <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Commit Password Update
              </button>
            </form>
          )}

        </div>
      </div>

      <div className="text-center">
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Audit Logging Enabled for this Session</p>
      </div>
    </div>
  );
};

export default Profile;
