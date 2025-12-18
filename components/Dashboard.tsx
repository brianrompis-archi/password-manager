import React, { useState, useEffect } from 'react';
import { AuthSession, Hotel, Password } from '../types';
import { mockAuthService } from '../services/mockDb';
import PasswordModal from './PasswordModal';
import PasswordDetailModal from './PasswordDetailModal';
import UserManagement from './UserManagement';
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
  Users
} from 'lucide-react';

interface DashboardProps {
  session: AuthSession;
  onLogout: () => void;
}

type ViewMode = 'passwords' | 'users';

const Dashboard: React.FC<DashboardProps> = ({ session, onLogout }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('passwords');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(session.accessibleHotels[0] || null);
  const [passwords, setPasswords] = useState<Password[]>([]);
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

  // Derived state for filtered passwords
  // Defensive check: Ensure passwords is an array before filtering
  const filteredPasswords = (passwords || []).filter(p => {
    const matchesSearch = 
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || p.login_type === filterType;
    return matchesSearch && matchesType;
  });

  // Fetch passwords when hotel changes
  useEffect(() => {
    if (selectedHotel && currentView === 'passwords') {
      loadPasswords();
    }
  }, [selectedHotel, currentView]);

  const loadPasswords = async () => {
    if (!selectedHotel) return;
    setLoading(true);
    try {
      const data = await mockAuthService.getPasswordsForHotel(selectedHotel.id);
      // Defensive check: Ensure response is an array
      if (Array.isArray(data)) {
        setPasswords(data);
      } else {
        console.warn("Received invalid password data format", data);
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
      await loadPasswords(); // Reload list
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

  const getIconForType = (type: string) => {
    switch (type) {
      case 'WiFi': return <Wifi className="w-4 h-4 text-emerald-500" />;
      case 'PMS': return <Monitor className="w-4 h-4 text-blue-500" />;
      case 'Admin': return <ShieldCheck className="w-4 h-4 text-red-500" />;
      case 'Vendor': return <Globe className="w-4 h-4 text-orange-500" />;
      default: return <Key className="w-4 h-4 text-slate-500" />;
    }
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
              <span className="text-xs text-slate-500 font-medium capitalize">Password Manager</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="ml-auto lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links (Admin Only) */}
          {isAdmin && (
            <div className="px-3 py-4 space-y-1 border-b border-slate-800">
              <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Management
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
              <button
                onClick={() => { setCurrentView('users'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${
                  currentView === 'users' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                User Management
              </button>
            </div>
          )}

          {/* Hotel List (Only show if in Password View) */}
          {currentView === 'passwords' && (
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
              <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Accessible Hotels
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
              {session.user.avatar ? (
                <img src={session.user.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-700" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-slate-400" />
                </div>
              )}
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
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 truncate">
              {currentView === 'users' ? 'User Administration' : (selectedHotel ? selectedHotel.name : 'Select a Hotel')}
            </h1>
          </div>
          
          <div className="hidden md:flex items-center text-sm text-slate-500 gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>Sync Active</span>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          
          {currentView === 'users' ? (
            <UserManagement currentUser={session.user} />
          ) : (
            selectedHotel ? (
              <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search passwords..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    <Filter className="w-4 h-4 text-slate-500 mr-1" />
                    {['All', 'WiFi', 'PMS', 'Admin', 'Vendor'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                          filterType === type 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                    
                    {canEdit && (
                      <button 
                        onClick={(e) => handleOpenModal(undefined, e)}
                        className="ml-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Password
                      </button>
                    )}
                  </div>
                </div>

                {/* Password List */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  {loading ? (
                    <div className="p-12 text-center text-slate-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                      <p>Loading secure data...</p>
                    </div>
                  ) : filteredPasswords.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-slate-900 font-medium">No passwords found</h3>
                      <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                          <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-500 uppercase text-xs">
                            <tr>
                              <th className="px-6 py-4">Description</th>
                              <th className="px-6 py-4">Username</th>
                              <th className="px-6 py-4">Password</th>
                              <th className="px-6 py-4 hidden sm:table-cell">Type</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredPasswords.map((p) => (
                              <tr 
                                key={p.id} 
                                onClick={() => handleViewPassword(p)}
                                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                                      {getIconForType(p.login_type)}
                                    </div>
                                    <span className="font-semibold text-slate-900">{p.description}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-700">
                                  {p.username}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                                      {revealedIds.has(p.id) ? p.password_value : '••••••••••••'}
                                    </code>
                                    <button 
                                      onClick={(e) => toggleReveal(p.id, e)}
                                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                                    >
                                      {revealedIds.has(p.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4 hidden sm:table-cell">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${p.login_type === 'Admin' ? 'bg-red-50 text-red-700' : 
                                      p.login_type === 'WiFi' ? 'bg-emerald-50 text-emerald-700' :
                                      'bg-blue-50 text-blue-700'
                                    }`}>
                                    {p.login_type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={(e) => copyToClipboard(p.password_value, e)}
                                      className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-medium text-xs py-1.5 px-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                      title="Copy Password"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    {canEdit && (
                                      <>
                                        <button 
                                          onClick={(e) => handleOpenModal(p, e)}
                                          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 font-medium text-xs py-1.5 px-2 hover:bg-blue-50 rounded-lg transition-colors"
                                          title="Edit"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={(e) => handleDeletePassword(p.id, e)}
                                          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 font-medium text-xs py-1.5 px-2 hover:bg-red-50 rounded-lg transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
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

                      {/* Mobile Card View */}
                      <div className="md:hidden divide-y divide-slate-100">
                        {filteredPasswords.map((p) => (
                          <div 
                            key={p.id} 
                            onClick={() => handleViewPassword(p)}
                            className="p-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                                  {getIconForType(p.login_type)}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 text-sm">{p.description}</div>
                                  <div className="font-mono text-xs text-slate-500 mt-0.5">{p.username}</div>
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider
                                ${p.login_type === 'Admin' ? 'bg-red-50 text-red-700' : 
                                  p.login_type === 'WiFi' ? 'bg-emerald-50 text-emerald-700' :
                                  'bg-blue-50 text-blue-700'
                                }`}>
                                {p.login_type}
                              </span>
                            </div>

                            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <code className="text-xs font-mono text-slate-700 truncate">
                                    {revealedIds.has(p.id) ? p.password_value : '••••••••••••'}
                                  </code>
                                </div>
                                <button 
                                  onClick={(e) => toggleReveal(p.id, e)}
                                  className="p-1.5 -mr-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                                >
                                  {revealedIds.has(p.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <button 
                                  onClick={(e) => copyToClipboard(p.password_value, e)}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </button>
                                {canEdit && (
                                  <>
                                    <button 
                                      onClick={(e) => handleOpenModal(p, e)}
                                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                      Edit
                                    </button>
                                    <button 
                                      onClick={(e) => handleDeletePassword(p.id, e)}
                                      className="flex-none p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
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
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-slate-300" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Welcome to ARCHIPELAGO Password Manager</h2>
                  <p className="text-slate-500 mt-2">Select a hotel from the sidebar to view assigned passwords and secure credentials.</p>
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
        />

        {/* View Detail Modal */}
        <PasswordDetailModal
           isOpen={!!viewingPassword}
           onClose={() => setViewingPassword(undefined)}
           password={viewingPassword}
        />
      </main>
    </div>
  );
};

export default Dashboard;