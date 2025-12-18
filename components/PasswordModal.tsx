
import React, { useState, useEffect, useCallback } from 'react';
import { Password } from '../types';
import { X, Save, Eye, EyeOff, Loader2, Wand2, Settings2, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Password>) => Promise<void>;
  initialData?: Password;
  hotelId: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSave, initialData, hotelId }) => {
  const [description, setDescription] = useState('');
  const [username, setUsername] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [loginType, setLoginType] = useState<Password['login_type']>('Other');
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
        setLoginType(initialData.login_type);
      } else {
        setDescription('');
        setUsername('');
        setPasswordValue('');
        setLoginType('Other');
      }
      setIsSubmitting(false);
      setShowPassword(false);
      setShowGeneratorSettings(false);
    }
  }, [isOpen, initialData]);

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
    setShowPassword(true); // Show it so the user sees what was generated
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
        login_type: loginType
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
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialData ? 'Edit Password' : 'New Credential'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Label / Description</label>
              <input
                type="text"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Front Office Manager Login"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="col-span-full sm:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Category</label>
              <select
                value={loginType}
                onChange={e => setLoginType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm bg-white"
              >
                <option value="WiFi">WiFi</option>
                <option value="PMS">PMS</option>
                <option value="Admin">Admin</option>
                <option value="Vendor">Vendor</option>
                <option value="Social">Social</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-full sm:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Account ID / User</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="col-span-full">
              <div className="flex justify-between items-end mb-1.5 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Secure Password</label>
                {passwordValue && (
                   <div className="flex items-center gap-1.5">
                     <span className={`text-[9px] font-bold uppercase ${strength.color.replace('bg-', 'text-')}`}>
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
                  placeholder="Password"
                  className="w-full pl-4 pr-24 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-mono"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Generate Random"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {/* Strength Bar */}
              <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-500 ${strength.color}`} 
                   style={{ width: `${(strength.score / 5) * 100}%` }}
                 />
              </div>
            </div>
          </div>

          {/* Generator Settings Toggle */}
          <div className="pt-2 border-t border-slate-100">
             <button
                type="button"
                onClick={() => setShowGeneratorSettings(!showGeneratorSettings)}
                className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
             >
                <Settings2 className="w-3 h-3" />
                Generator Options
             </button>

             {showGeneratorSettings && (
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                         <span>Length</span>
                         <span className="text-indigo-600">{genLength} chars</span>
                      </div>
                      <input 
                         type="range" min="8" max="32" 
                         value={genLength} 
                         onChange={(e) => setGenLength(parseInt(e.target.value))}
                         className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                   </div>
                   <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                           type="checkbox" 
                           checked={useNumbers} 
                           onChange={e => setUseNumbers(e.target.checked)}
                           className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">Include Numbers</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                           type="checkbox" 
                           checked={useSymbols} 
                           onChange={e => setUseSymbols(e.target.checked)}
                           className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">Special Symbols</span>
                      </label>
                   </div>
                </div>
             )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all disabled:opacity-70 active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {initialData ? 'Update Record' : 'Save Credential'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
