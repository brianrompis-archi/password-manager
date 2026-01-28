
import React, { useEffect, useState } from 'react';
import { User, AccessLevel, Hotel, Group } from '../types';
import { mockAuthService } from '../services/mockDb';
import { 
  UserCog, 
  Shield, 
  ShieldAlert, 
  Eye, 
  EyeOff,
  Plus, 
  X, 
  UserPlus, 
  Loader2, 
  Mail, 
  Briefcase, 
  Layers, 
  LockKeyhole,
  CheckCircle2,
  Building2,
  Search,
  ChevronDown,
  Lock
} from 'lucide-react';

interface UserManagementProps {
  currentUser: User;
  onUserChange?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, onUserChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Create User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    position: '',
    group_id: '',
    access_level: 'viewer',
    password: ''
  });

  // Permissions Modal State
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);
  const [permSearch, setPermSearch] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [usersData, groupsData] = await Promise.all([
        mockAuthService.getAllUsers(),
        mockAuthService.getGroups()
      ]);
      setUsers(usersData);
      setGroups(groupsData);
    } catch (e) {
      console.error("Failed to load initial data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AccessLevel) => {
    setUpdatingId(userId);
    try {
      await mockAuthService.updateUserAccessLevel(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, access_level: newRole } : u));
      if (onUserChange) onUserChange();
    } catch (e) {
      console.error("Failed to update role", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const openPermissionsModal = async (user: User) => {
    setTargetUser(user);
    setIsPermModalOpen(true);
    setLoadingPerms(true);
    try {
      const [hotels, perms] = await Promise.all([
        mockAuthService.getAllHotels(),
        mockAuthService.getUserPermissions(user.id)
      ]);
      setAllHotels(hotels);
      setSelectedHotels(perms);
    } catch (e) {
      console.error("Failed to load permissions data", e);
    } finally {
      setLoadingPerms(false);
    }
  };

  const handleToggleHotel = (hotelId: string) => {
    setSelectedHotels(prev => 
      prev.includes(hotelId) ? prev.filter(id => id !== hotelId) : [...prev, hotelId]
    );
  };

  const handleSavePermissions = async () => {
    if (!targetUser) return;
    setSavingPerms(true);
    try {
      await mockAuthService.updateUserPermissions(targetUser.id, selectedHotels);
      setIsPermModalOpen(false);
    } catch (e) {
      console.error("Failed to save permissions", e);
      alert("Error saving permissions.");
    } finally {
      setSavingPerms(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const createdUser = await mockAuthService.createUser(newUser);
      setUsers(prev => [...prev, createdUser]);
      setIsModalOpen(false);
      setShowNewUserPassword(false);
      setNewUser({
        name: '',
        email: '',
        position: '',
        group_id: '',
        access_level: 'viewer',
        password: ''
      });
      if (onUserChange) onUserChange();
    } catch (err) {
      console.error("Failed to create user", err);
      alert("Error creating user. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: AccessLevel) => {
    switch (role) {
      case 'admin': return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'manager': return <Shield className="w-4 h-4 text-indigo-600" />;
      default: return <Eye className="w-4 h-4 text-slate-500" />;
    }
  };

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return 'No Group';
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : groupId;
  };

  const filteredPermHotels = allHotels.filter(h => 
    h.name.toLowerCase().includes(permSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <UserCog className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">User Management</h2>
            <p className="text-slate-500 text-sm">Manage user access levels and assigned permissions.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Group</th>
                <th className="px-6 py-4">Access Level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                          {user.name ? user.name.charAt(0) : '?'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-slate-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{user.position}</td>
                  <td className="px-6 py-4">
                    {user.group_id ? (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        {getGroupName(user.group_id)}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No Group</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          {getRoleIcon(user.access_level)}
                        </div>
                        <select
                          value={user.access_level}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as AccessLevel)}
                          disabled={updatingId === user.id || user.id === currentUser.id} 
                          className={`
                            pl-9 pr-8 py-1.5 rounded-lg border text-sm font-medium appearance-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer
                            ${user.access_level === 'admin' ? 'bg-red-50 border-red-200 text-red-800' : 
                              user.access_level === 'manager' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 
                              'bg-slate-50 border-slate-200 text-slate-700'}
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      {updatingId === user.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openPermissionsModal(user)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Manage Access"
                    >
                      <LockKeyhole className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hotel Permissions Modal */}
      {isPermModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
             <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                  <LockKeyhole className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Manage Access</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Assigned hotels for {targetUser?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsPermModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 flex-1 overflow-hidden flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter hotels..." 
                  value={permSearch}
                  onChange={e => setPermSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {loadingPerms ? (
                 <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-sm font-medium text-slate-500">Retrieving permission matrix...</p>
                 </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {filteredPermHotels.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm italic">No hotels found.</div>
                  ) : (
                    filteredPermHotels.map(hotel => (
                      <div 
                        key={hotel.id}
                        onClick={() => handleToggleHotel(hotel.id)}
                        className={`
                          group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer
                          ${selectedHotels.includes(hotel.id) 
                            ? 'bg-indigo-50 border-indigo-200' 
                            : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${selectedHotels.includes(hotel.id) ? 'bg-white' : 'bg-slate-50'}`}>
                            <Building2 className={`w-5 h-5 ${selectedHotels.includes(hotel.id) ? 'text-indigo-600' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <span className={`text-sm font-bold ${selectedHotels.includes(hotel.id) ? 'text-indigo-900' : 'text-slate-700'}`}>
                              {hotel.name}
                            </span>
                            {hotel.group_id && (
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{hotel.group_id} Group</div>
                            )}
                          </div>
                        </div>
                        <div className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                          ${selectedHotels.includes(hotel.id) 
                            ? 'bg-indigo-600 border-indigo-600' 
                            : 'border-slate-200 group-hover:border-slate-300'}
                        `}>
                          {selectedHotels.includes(hotel.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end items-center gap-4">
               <p className="mr-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {selectedHotels.length} Hotel{selectedHotels.length !== 1 && 's'} Selected
               </p>
               <button
                  type="button"
                  onClick={() => setIsPermModalOpen(false)}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={savingPerms || loadingPerms}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-70 active:scale-[0.98]"
                >
                  {savingPerms ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Update Access
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-xl">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Add New User</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newUser.name ?? ''}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={newUser.email ?? ''}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="john.doe@archipelago.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Initial Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showNewUserPassword ? "text" : "password"}
                      required
                      value={newUser.password ?? ''}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Position</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newUser.position ?? ''}
                      onChange={e => setNewUser({ ...newUser, position: e.target.value })}
                      placeholder="General Manager"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Organization Group</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Layers className="w-4 h-4 text-slate-400" />
                    </div>
                    <select
                      value={newUser.group_id ?? ''}
                      onChange={e => setNewUser({ ...newUser, group_id: e.target.value })}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none bg-white"
                    >
                      <option value="">None (Standalone)</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Access Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['viewer', 'manager', 'admin'] as AccessLevel[]).map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setNewUser({ ...newUser, access_level: level })}
                        className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                          newUser.access_level === level 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-70 active:scale-[0.98]"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
