
import React, { useState, useEffect, useCallback } from 'react';
import { Password, Category } from '../types';
import { X, Save, Eye, EyeOff, Loader2, Wand2, Settings2, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Password>) => Promise<void>;
  initialData?: Password;
  hotelId: string;
  categories: Category[];
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSave, initialData, hotelId, categories }) => {
  const [description, setDescription] = useState('');
  const [username, setUsername] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [loginType, setLoginType] = useState<string>(''); // Stores Category ID
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generator State
  const [showGeneratorSettings, setShowGeneratorSettings] = useState(false);
  const [genLength, setGenLength] = useState(16);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDescription(initialData.description);
        setUsername(initialData.username);
        setPasswordValue(initialData.password_value);
        setLoginType(initialData.login_type); // This should now be an ID
      } else {
        setDescription('');
        setUsername('');
        setPasswordValue('');
        // Default to first category ID
        setLoginType(categories.length > 0 ? categories[0].id : '');
      }
      setIsSubmitting(false);
      setShowPassword(false);
      setShowGeneratorSettings(false);
    }
  }, [isOpen, initialData, categories]);

  const generatePassword = useCallback(() => {
    const charset = {
      letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let available = charset.letters;
    if (useNumbers) available += charset.numbers;
    if (useSymbols) available += charset.symbols;

    let result = '';
    for (let i = 0; i < genLength; i++) {
      result += available.charAt(Math.floor(Math.random() * available.length));
    }

    setPasswordValue(result);
    setShowPassword(true);
  }, [genLength, useNumbers, useSymbols]);

  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length > 8) score++;
    if (pwd.length > 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', icon: <ShieldAlert className="w-3 h-3" /> };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500', icon: <Shield className="w-3 h-3" /> };
    return { score, label: 'Strong', color: 'bg-emerald-500', icon: <ShieldCheck className="w-3 h-3" /> };
  };

  const strength = getStrength(passwordValue);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        hotel_id: hotelId,
        description,
        username,
        password_value: passwordValue,
        login_type: loginType // Saves as ID
      });
      onClose();
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {initialData ? 'Update Record' : 'Vault Entry'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Secure Encrypted Session</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Asset Description</label>
              <input
                type="text"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Server Admin Access"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Classification</label>
                <select
                  value={loginType}
                  onChange={e => setLoginType(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm bg-white font-medium"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  {categories.length === 0 && <option value="">Select Category</option>}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Identity/ID</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                {passwordValue && (
                   <div className="flex items-center gap-1.5">
                     <span className={`text-[9px] font-black uppercase ${strength.color.replace('bg-', 'text-')}`}>
                       {strength.label}
                     </span>
                     {strength.icon}
                   </div>
                )}
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordValue}
                  onChange={e => setPasswordValue(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-5 pr-24 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-mono shadow-inner bg-slate-50/50"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Generate"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-700 ease-out ${strength.color}`} 
                   style={{ width: `${(strength.score / 5) * 100}%` }}
                 />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
             <button
                type="button"
                onClick={() => setShowGeneratorSettings(!showGeneratorSettings)}
                className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
             >
                <Settings2 className="w-3.5 h-3.5" />
                Security Options
             </button>

             {showGeneratorSettings && (
                <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-5 animate-in slide-in-from-top-3 duration-300">
                   <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                         <span>Complexity</span>
                         <span className="text-indigo-600">{genLength} Characters</span>
                      </div>
                      <input 
                         type="range" min="8" max="32" 
                         value={genLength} 
                         onChange={(e) => setGenLength(parseInt(e.target.value))}
                         className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                   </div>
                   <div className="flex flex-col gap-3">
                      <label className="flex items-center justify-between cursor-pointer group bg-white p-3 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all">
                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 uppercase tracking-wider">Numbers (0-9)</span>
                        <input 
                           type="checkbox" 
                           checked={useNumbers} 
                           onChange={e => setUseNumbers(e.target.checked)}
                           className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group bg-white p-3 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all">
                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 uppercase tracking-wider">Symbols (!@#$)</span>
                        <input 
                           type="checkbox" 
                           checked={useSymbols} 
                           onChange={e => setUseSymbols(e.target.checked)}
                           className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                   </div>
                </div>
             )}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 transition-all disabled:opacity-70 active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {initialData ? 'Commit Changes' : 'Secure Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
