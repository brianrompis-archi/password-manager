
import React, { useState, useEffect } from 'react';
import { AuthSession, Hotel, Password, User, Category } from '../types';
import { mockAuthService } from '../services/mockDb';
import PasswordModal from './PasswordModal';
import PasswordDetailModal from './PasswordDetailModal';
import UserManagement from './UserManagement';
import Profile from './Profile';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  Wifi, 
  Monitor, 
  Globe, 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Filter,
  Plus,
  Pencil,
  Trash2,
  Users,
  Smartphone,
  LayoutGrid,
  Loader2,
  Settings
} from 'lucide-react';

interface DashboardProps {
  session: AuthSession;
  onLogout: () => void;
}

type ViewMode = 'passwords' | 'users' | 'profile';

const Dashboard: React.FC<DashboardProps> = ({ session, onLogout }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('passwords');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(session.accessibleHotels[0] || null);
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('All'); 
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | undefined>(undefined);
  
  // Detail Modal State
  const [viewingPassword, setViewingPassword] = useState<Password | undefined>(undefined);

  const isAdmin = session.user.access_level === 'admin';
  const canEdit = session.user.access_level === 'manager' || isAdmin;

  // Helper to get category name from ID
  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : id;
  };

  // Derived state for filtered passwords
  const filteredPasswords = (passwords || []).filter(p => {
    const matchesSearch = 
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || p.login_type === filterType;
    return matchesSearch && matchesType;
  });

  // Fetch initial data
  useEffect(() => {
    loadAllUsers();
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedHotel && currentView === 'passwords') {
      loadPasswords();
    }
  }, [selectedHotel, currentView]);

  const loadCategories = async () => {
    try {
      const data = await mockAuthService.getLoginTypes();
      setCategories(data);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await mockAuthService.getAllUsers();
      setAllUsers(users);
    } catch (e) {
      console.error("Failed to load users for registry", e);
    }
  };

  const loadPasswords = async () => {
    if (!selectedHotel) return;
    setLoading(true);
    try {
      const data = await mockAuthService.getPasswordsForHotel(selectedHotel.id);
      if (Array.isArray(data)) {
        setPasswords(data);
      } else {
        setPasswords([]);
      }
    } catch (e) {
      console.error("Failed to load passwords", e);
      setPasswords([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleReveal = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  const handleOpenModal = (password?: Password, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPassword(password);
    setIsModalOpen(true);
  };

  const handleViewPassword = (password: Password) => {
    setViewingPassword(password);
  };

  const handleSavePassword = async (data: Partial<Password>) => {
    if (!selectedHotel) return;
    try {
      await mockAuthService.savePassword(data as any, session.user.id);
      await loadPasswords();
    } catch (e) {
      console.error("Failed to save", e);
      throw e;
    }
  };

  const handleDeletePassword = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this password?")) return;
    try {
      await mockAuthService.deletePassword(id);
      setPasswords(passwords.filter(p => p.id !== id));
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const getIconForType = (typeId: string) => {
    const t = getCategoryName(typeId).toLowerCase();
    if (t.includes('wifi') || t.includes('network')) return <Wifi className="w-4 h-4 text-emerald-500" />;
    if (t.includes('pms') || t.includes('software')) return <Monitor className="w-4 h-4 text-blue-500" />;
    if (t.includes('admin')) return <ShieldCheck className="w-4 h-4 text-red-500" />;
    if (t.includes('vendor') || t.includes('website')) return <Globe className="w-4 h-4 text-orange-500" />;
    if (t.includes('social')) return <Smartphone className="w-4 h-4 text-pink-500" />;
    if (t.includes('computer')) return <Monitor className="w-4 h-4 text-indigo-500" />;
    return <Key className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">ARCHIPELAGO</h2>
              <span className="text-xs text-slate-500 font-medium capitalize">Vault Manager</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="ml-auto lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-1 border-b border-slate-800">
             <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Personal
              </div>
              <button
                onClick={() => { setCurrentView('profile'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${
                  currentView === 'profile' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                My Account
              </button>
          </div>

          <div className="px-3 py-4 space-y-1 border-b border-slate-800">
              <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Vault
              </div>
              <button
                onClick={() => { setCurrentView('passwords'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${
                  currentView === 'passwords' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
                }`}
              >
                <Key className="w-4 h-4" />
                Password Vault
              </button>

              {isAdmin && (
                <button
                  onClick={() => { setCurrentView('users'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${
                    currentView === 'users' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  User Management
                </button>
              )}
          </div>

          {/* Hotel List */}
          {currentView === 'passwords' && (
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
              <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Hotels
              </div>
              {session.accessibleHotels.length === 0 ? (
                <div className="px-3 text-sm text-slate-500 italic">No hotels assigned.</div>
              ) : (
                session.accessibleHotels.map(hotel => (
                  <button
                    key={hotel.id}
                    onClick={() => {
                      setSelectedHotel(hotel);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${
                      selectedHotel?.id === hotel.id
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Building2 className={`w-5 h-5 ${selectedHotel?.id === hotel.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="truncate">{hotel.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
          
          {/* User Footer */}
          <div className="mt-auto p-4 border-t border-slate-800 bg-slate-950/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 overflow-hidden">
                {session.user.avatar ? (
                  <img src={session.user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    session.user.access_level === 'admin' ? 'bg-red-500' :
                    session.user.access_level === 'manager' ? 'bg-indigo-500' : 'bg-emerald-500'
                  }`}></span>
                  <span className="capitalize">{session.user.access_level}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 truncate uppercase tracking-tight">
              {currentView === 'users' ? 'User Administration' : 
               currentView === 'profile' ? 'My Account' :
               (selectedHotel ? selectedHotel.name : 'Select a Hotel')}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          
          {currentView === 'users' ? (
            <UserManagement currentUser={session.user} onUserChange={loadAllUsers} />
          ) : currentView === 'profile' ? (
            <Profile user={session.user} />
          ) : (
            selectedHotel ? (
              <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Quick search..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                      <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Filter</span>
                      <button
                        onClick={() => setFilterType('All')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          filterType === 'All' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        All
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setFilterType(cat.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            filterType === cat.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    
                    {canEdit && (
                      <button 
                        onClick={(e) => handleOpenModal(undefined, e)}
                        className="ml-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        Add New
                      </button>
                    )}
                  </div>
                </div>

                {/* Password List */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  {loading ? (
                    <div className="p-20 text-center text-slate-500">
                      <Loader2 className="inline-block animate-spin h-8 w-8 text-indigo-600 mb-4" />
                      <p className="font-medium">Accessing encrypted vault...</p>
                    </div>
                  ) : filteredPasswords.length === 0 ? (
                    <div className="p-20 text-center">
                      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-slate-900 font-bold text-lg">No records found</h3>
                      <p className="text-slate-500 text-sm mt-1">Refine your search or create a new entry.</p>
                    </div>
                  ) : (
                    <>
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                          <thead className="bg-slate-50/50 border-b border-slate-200 font-bold text-slate-400 uppercase text-[10px] tracking-widest">
                            <tr>
                              <th className="px-6 py-4">Credential Description</th>
                              <th className="px-6 py-4">Identity</th>
                              <th className="px-6 py-4">Security Key</th>
                              <th className="px-6 py-4">Classification</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredPasswords.map((p) => (
                              <tr 
                                key={p.id} 
                                onClick={() => handleViewPassword(p)}
                                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                              >
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                                      {getIconForType(p.login_type)}
                                    </div>
                                    <span className="font-bold text-slate-900">{p.description}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 font-mono text-xs text-slate-600 bg-slate-50/30">
                                  {p.username}
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <code className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-200 shadow-inner">
                                      {revealedIds.has(p.id) ? p.password_value : '••••••••••••'}
                                    </code>
                                    <button 
                                      onClick={(e) => toggleReveal(p.id, e)}
                                      className="p-1.5 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                                    >
                                      {revealedIds.has(p.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 shadow-sm text-slate-600">
                                    {getCategoryName(p.login_type)}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button 
                                      onClick={(e) => copyToClipboard(p.password_value, e)}
                                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                      title="Copy"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                    
                                    {canEdit && (
                                      <>
                                        <button 
                                          onClick={(e) => handleOpenModal(p, e)}
                                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={(e) => handleDeletePassword(p.id, e)}
                                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile View */}
                      <div className="md:hidden divide-y divide-slate-100">
                        {filteredPasswords.map((p) => (
                          <div key={p.id} onClick={() => handleViewPassword(p)} className="p-4 space-y-4 hover:bg-slate-50 cursor-pointer">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg">{getIconForType(p.login_type)}</div>
                                <div>
                                  <div className="font-bold text-slate-900 text-sm">{p.description}</div>
                                  <div className="text-[10px] font-mono text-slate-500">{p.username}</div>
                                </div>
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded text-slate-600">{getCategoryName(p.login_type)}</span>
                            </div>
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                              <code className="text-xs font-mono">{revealedIds.has(p.id) ? p.password_value : '••••••••••••'}</code>
                              <div className="flex gap-1">
                                <button onClick={(e) => toggleReveal(p.id, e)} className="p-1.5 text-slate-400"><Eye className="w-4 h-4" /></button>
                                <button onClick={(e) => copyToClipboard(p.password_value, e)} className="p-1.5 text-slate-400"><Copy className="w-4 h-4" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div className="max-w-md">
                  <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Building2 className="w-12 h-12 text-indigo-300" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Identity Verification Required</h2>
                  <p className="text-slate-500 mt-3 text-sm leading-relaxed">Please select an assigned hotel facility from the sidebar to authorize access to encrypted records.</p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Edit Password Modal */}
        <PasswordModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSavePassword}
          initialData={editingPassword}
          hotelId={selectedHotel?.id || ''}
          categories={categories}
        />

        {/* View Detail Modal */}
        <PasswordDetailModal
           isOpen={!!viewingPassword}
           onClose={() => setViewingPassword(undefined)}
           password={viewingPassword}
           users={allUsers}
           categories={categories}
        />
      </main>
    </div>
  );
};

export default Dashboard;
