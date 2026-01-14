
// Fix: Removed Group, GroupHotel, and UserHotel as they are not exported members of '../types'
import { Hotel, Password, PasswordHistoryEntry, User, Category } from '../types';

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

  getAccessibleHotels: async (user: User): Promise<Hotel[]> => {
    if (isGAS()) return runGas('getAccessibleHotels', user);
    return [
      { id: 'h1', name: 'Grand Archipelago Bali', group_id: 'g1' },
      { id: 'h2', name: 'Archipelago City Jakarta', group_id: 'g1' }
    ];
  },

  getPasswordsForHotel: async (hotelId: string): Promise<Password[]> => {
    if (isGAS()) return runGas('getPasswordsForHotel', hotelId);
    return [];
  },

  getPasswordHistory: async (passwordId: string): Promise<PasswordHistoryEntry[]> => {
    if (isGAS()) return runGas('getPasswordHistory', passwordId);
    return [];
  },

  savePassword: async (password: any, userId: string): Promise<Password> => {
    if (isGAS()) return runGas('savePassword', password, userId);
    throw new Error("Method not implemented in mock");
  },

  deletePassword: async (id: string): Promise<void> => {
    if (isGAS()) return runGas('deletePassword', id);
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
