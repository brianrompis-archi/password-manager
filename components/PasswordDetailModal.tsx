import React, { useState } from 'react';
import { Password } from '../types';
import { demoUsers } from '../services/mockDb';
import { 
  X, 
  Calendar, 
  User, 
  Clock, 
  Shield, 
  Tag, 
  Hash, 
  KeyRound,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';

interface PasswordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  password?: Password;
}

const PasswordDetailModal: React.FC<PasswordDetailModalProps> = ({ isOpen, onClose, password }) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen || !password) return null;

  const getUserName = (id: string) => {
    const user = demoUsers.find(u => u.id === id);
    return user ? user.name : id;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-100 rounded-xl">
               <Shield className="w-6 h-6 text-indigo-600" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-slate-900">{password.description}</h2>
               <div className="flex items-center gap-2 mt-0.5">
                 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                    ${password.login_type === 'Admin' ? 'bg-red-50 text-red-700 border-red-100' : 
                      password.login_type === 'WiFi' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                    {password.login_type}
                 </span>
                 <span className="text-xs text-slate-400 font-mono uppercase">ID: {password.id}</span>
               </div>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Credentials Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Username
              </label>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 block w-full">
                  {password.username}
                </code>
                <button 
                  onClick={() => copyToClipboard(password.username)}
                  className="ml-2 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Copy Username"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Password
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    readOnly
                    value={password.password_value}
                    className="w-full text-sm font-mono text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200 outline-none"
                  />
                </div>
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  title={showPassword ? "Hide" : "Show"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => copyToClipboard(password.password_value)}
                  className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Copy Password"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Audit Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Created By
              </div>
              <div className="text-sm text-slate-700 font-medium">{getUserName(password.created_by)}</div>
            </div>

            <div className="space-y-1">
               <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Last Modified
              </div>
              <div className="text-sm text-slate-700 font-medium">
                {new Date(password.last_edited).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="space-y-1 col-span-1 sm:col-span-2">
               <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Last Modified By
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                    {getUserName(password.last_edited_by).charAt(0)}
                 </div>
                 <span className="text-sm text-slate-700 font-medium">{getUserName(password.last_edited_by)}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default PasswordDetailModal;
