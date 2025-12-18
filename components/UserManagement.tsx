import React, { useEffect, useState } from 'react';
import { User, AccessLevel } from '../types';
import { mockAuthService } from '../services/mockDb';
import { Search, UserCog, Shield, ShieldAlert, Eye } from 'lucide-react';

interface UserManagementProps {
  currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await mockAuthService.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AccessLevel) => {
    setUpdatingId(userId);
    try {
      await mockAuthService.updateUserAccessLevel(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, access_level: newRole } : u));
    } catch (e) {
      console.error("Failed to update role", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleIcon = (role: AccessLevel) => {
    switch (role) {
      case 'admin': return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'manager': return <Shield className="w-4 h-4 text-indigo-600" />;
      default: return <Eye className="w-4 h-4 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <UserCog className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">User Management</h2>
            <p className="text-slate-500 text-sm">Manage user access levels and permissions.</p>
          </div>
        </div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-slate-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {user.name.charAt(0)}
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
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs">
                        Group {user.group_id}
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
                          disabled={updatingId === user.id || user.id === currentUser.id} // Prevent changing own role for safety in demo
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
