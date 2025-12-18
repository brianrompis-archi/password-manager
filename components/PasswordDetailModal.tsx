
import React, { useState, useEffect } from 'react';
import { Password, PasswordHistoryEntry } from '../types';
import { demoUsers, mockAuthService } from '../services/mockDb';
import { 
  X, 
  Calendar, 
  User, 
  Clock, 
  Shield, 
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  History,
  Info,
  Loader2,
  ChevronRight
} from 'lucide-react';

interface PasswordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  password?: Password;
}

const PasswordDetailModal: React.FC<PasswordDetailModalProps> = ({ isOpen, onClose, password }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [showPassword, setShowPassword] = useState(false);
  const [history, setHistory] = useState<PasswordHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [revealedHistoryIds, setRevealedHistoryIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && password && activeTab === 'history') {
      loadHistory();
    }
  }, [isOpen, password, activeTab]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('details');
      setHistory([]);
      setRevealedHistoryIds(new Set());
    }
  }, [isOpen]);

  const loadHistory = async () => {
    if (!password) return;
    setLoadingHistory(true);
    try {
      const data = await mockAuthService.getPasswordHistory(password.id);
      setHistory(data);
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleHistoryReveal = (id: string) => {
    setRevealedHistoryIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isOpen || !password) return null;

  const getUserName = (id: string) => {
    const user = demoUsers.find(u => u.id === id);
    return user ? user.name : id;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
               <Shield className="w-6 h-6 text-white" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-slate-900 leading-tight">{password.description}</h2>
               <div className="flex items-center gap-2 mt-1">
                 <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border
                    ${password.login_type === 'Admin' ? 'bg-red-50 text-red-700 border-red-100' : 
                      password.login_type === 'WiFi' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                    {password.login_type}
                 </span>
               </div>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-white">
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all relative ${
              activeTab === 'details' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Info className="w-4 h-4" />
            Active Details
            {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all relative ${
              activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <History className="w-4 h-4" />
            Audit History
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />}
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Credentials Box */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-5 shadow-inner">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5 ml-1">
                    <User className="w-3.5 h-3.5" />
                    Username / ID
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono text-sm text-indigo-700 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm select-all">
                      {password.username}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(password.username)}
                      className="p-3 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all active:scale-95"
                      title="Copy Username"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5 ml-1">
                    <KeyRound className="w-3.5 h-3.5" />
                    Secure Password
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        readOnly
                        value={password.password_value}
                        className="w-full text-sm font-mono text-slate-700 bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none shadow-sm select-all"
                      />
                    </div>
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-3 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all active:scale-95"
                      title={showPassword ? "Hide" : "Show"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(password.password_value)}
                      className="p-3 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all active:scale-95"
                      title="Copy Password"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Audit Details */}
              <div className="grid grid-cols-2 gap-6 px-1">
                <div className="space-y-2">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Registered By
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                        {getUserName(password.created_by).charAt(0)}
                     </div>
                     <span className="text-sm text-slate-700 font-semibold">{getUserName(password.created_by)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                   <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5 justify-end">
                    <Calendar className="w-3.5 h-3.5" />
                    Last Verified
                  </div>
                  <div className="text-sm text-slate-700 font-bold">
                    {new Date(password.last_edited).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loadingHistory ? (
                <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <p className="text-sm font-medium">Retrieving archive...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <History className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-sm font-medium">No previous versions recorded</p>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 py-2">
                  {history.map((entry, index) => (
                    <div key={entry.id} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 shadow-sm" />
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                            {formatDate(entry.change_date)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                            Version {history.length - index}
                          </span>
                        </div>
                        
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-indigo-200 transition-colors group">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-indigo-100">
                                {getUserName(entry.changed_by).charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-slate-700">
                                Changed by {getUserName(entry.changed_by)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                             <div className="p-2 bg-slate-50 rounded-lg">
                               <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Username</div>
                               <div className="font-mono text-slate-700 truncate">{entry.username}</div>
                             </div>
                             <div className="p-2 bg-slate-50 rounded-lg">
                               <div className="text-[9px] font-black text-slate-400 uppercase mb-1 flex justify-between items-center">
                                 Password
                                 <button onClick={() => toggleHistoryReveal(entry.id)} className="hover:text-indigo-600">
                                   {revealedHistoryIds.has(entry.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                 </button>
                               </div>
                               <div className="flex items-center justify-between gap-1 overflow-hidden">
                                 <div className="font-mono text-indigo-700 truncate">
                                   {revealedHistoryIds.has(entry.id) ? entry.password_value : '••••••••'}
                                 </div>
                                 <button 
                                   onClick={() => copyToClipboard(entry.password_value)}
                                   className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded"
                                   title="Recover this value"
                                 >
                                   <Copy className="w-3 h-3 text-slate-400" />
                                 </button>
                               </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* End of Timeline marker */}
                  <div className="absolute -left-[31px] -bottom-2 w-4 h-4 rounded-full bg-slate-100 border-4 border-white" />
                </div>
              )}
            </div>
          )}

        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end items-center gap-4">
          <div className="mr-auto text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
             <Shield className="w-3 h-3" />
             End-to-end Encrypted
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default PasswordDetailModal;
