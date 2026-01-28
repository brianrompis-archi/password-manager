
import { Hotel, Password, PasswordHistoryEntry, User, Category, Group } from '../types';

export const demoUsers: User[] = [
  { 
    id: 'u1', 
    email: 'alice@globalresorts.com', 
    name: 'Alice Manager', 
    position: 'Regional Director', 
    group_id: 'g1', 
    access_level: 'admin', 
    avatar: 'https://picsum.photos/100/100' 
  }
];

const isGAS = () => typeof window !== 'undefined' && (window as any).google && (window as any).google.script;

const runGas = (functionName: string, ...args: any[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!isGAS()) {
      reject("Not running in Google Apps Script environment.");
      return;
    }
    (window as any).google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler((err: any) => reject(err.message || err))
      [functionName](...args);
  });
};

export const mockAuthService = {
  signInWithCredentials: async (email: string, password: string): Promise<User> => {
    if (isGAS()) return runGas('loginWithCredentials', email, password);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return demoUsers[0];
  },

  sendVerificationCode: async (email: string): Promise<void> => {
    if (isGAS()) return runGas('sendVerificationCode', email);
    console.log("Mock code sent to", email);
  },

  verifyAndChangePassword: async (email: string, code: string, newPassword: string): Promise<void> => {
    if (isGAS()) return runGas('verifyAndChangePassword', email, code, newPassword);
    console.log("Mock password changed for", email);
  },

  getLoginTypes: async (): Promise<Category[]> => {
    if (isGAS()) return runGas('getLoginTypes');
    return [
      { id: '1', name: 'Network' },
      { id: '2', name: 'Computer' },
      { id: '3', name: 'Website' },
      { id: '4', name: 'Software' },
      { id: '5', name: 'Vendor' },
      { id: '6', name: 'Social' },
      { id: '7', name: 'Other' }
    ];
  },

  getGroups: async (): Promise<Group[]> => {
    if (isGAS()) return runGas('getGroups');
    return [
      { id: 'g1', name: 'Archipelago Corporate' },
      { id: 'g2', name: 'Bali Regional' }
    ];
  },

  getAllHotels: async (): Promise<Hotel[]> => {
    if (isGAS()) return runGas('getAllHotels');
    return [
      { id: 'h1', name: 'Grand Archipelago Bali', group_id: 'g1' },
      { id: 'h2', name: 'Archipelago City Jakarta', group_id: 'g1' },
      { id: 'h3', name: 'Archipelago Resort Ubud', group_id: 'g2' },
      { id: 'h4', name: 'Aston Archipelago Kuta', group_id: 'g2' }
    ];
  },

  getAccessibleHotels: async (user: User): Promise<Hotel[]> => {
    if (isGAS()) return runGas('getAccessibleHotels', user);
    const all = await mockAuthService.getAllHotels();
    return all.filter(h => h.group_id === user.group_id);
  },

  getUserPermissions: async (userId: string): Promise<string[]> => {
    if (isGAS()) return runGas('getUserPermissions', userId);
    return ['h1', 'h2'];
  },

  updateUserPermissions: async (userId: string, hotelIds: string[]): Promise<void> => {
    if (isGAS()) return runGas('updateUserPermissions', userId, hotelIds);
    console.log("Updated permissions for", userId, hotelIds);
  },

  getPasswordsForHotel: async (hotelId: string): Promise<Password[]> => {
    if (isGAS()) return runGas('getPasswordsForHotel', hotelId);
    return [
      {
        id: 'p1',
        description: 'Main WiFi Router',
        username: 'admin',
        password_value: 'B@liResort2024!',
        login_type: '1',
        hotel_id: hotelId,
        created_by: 'u1',
        // Fix: Removed 'created_at' as it's not in the Password type definition
        last_edited: '2024-05-20T10:30:00Z',
        last_edited_by: 'u1'
      },
      {
        id: 'p2',
        description: 'VHP PMS Server',
        username: 'sysadmin',
        password_value: 'PMS_Secure_99',
        login_type: '2',
        hotel_id: hotelId,
        created_by: 'u1',
        // Fix: Removed 'created_at' as it's not in the Password type definition
        last_edited: '2024-06-01T08:15:00Z',
        last_edited_by: 'u1'
      }
    ];
  },

  getPasswordHistory: async (passwordId: string): Promise<PasswordHistoryEntry[]> => {
    if (isGAS()) return runGas('getPasswordHistory', passwordId);
    return [
      {
        id: 'h1',
        password_id: passwordId,
        description: 'Updated for Q3 Audit',
        username: 'admin',
        password_value: 'OldPassword123!',
        changed_by: 'u1',
        change_date: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'h2',
        password_id: passwordId,
        description: 'Initial Migration',
        username: 'admin',
        password_value: 'B@li2023',
        changed_by: 'u1',
        change_date: new Date(Date.now() - 86400000 * 30).toISOString()
      }
    ];
  },

  savePassword: async (password: any, userId: string): Promise<Password> => {
    if (isGAS()) return runGas('savePassword', password, userId);
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      ...password,
      id: password.id || Math.random().toString(36).substr(2, 9),
      created_by: userId,
      last_edited: new Date().toISOString(),
      last_edited_by: userId
    } as Password;
  },

  deletePassword: async (id: string): Promise<void> => {
    if (isGAS()) return runGas('deletePassword', id);
    console.log("Deleted password", id);
  },

  getAllUsers: async (): Promise<User[]> => {
    if (isGAS()) return runGas('getAllUsers');
    return demoUsers;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    if (isGAS()) return runGas('createUser', userData);
    const newUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`
    } as User;
    return newUser;
  },

  updateUserAccessLevel: async (userId: string, newLevel: User['access_level']): Promise<User> => {
    if (isGAS()) return runGas('updateUserAccessLevel', userId, newLevel);
    const user = demoUsers.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    return { ...user, access_level: newLevel };
  }
};
