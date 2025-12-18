
import { Group, GroupHotel, Hotel, Password, User, UserHotel } from '../types';

// Fix: Added and exported demoUsers to resolve the "no exported member 'demoUsers'" error in PasswordDetailModal.tsx
export const demoUsers: User[] = [
  { 
    id: 'u1', 
    email: 'alice@globalresorts.com', 
    name: 'Alice Manager', 
    position: 'Regional Director', 
    group_id: 'g1', 
    access_level: 'admin', 
    avatar: 'https://picsum.photos/100/100' 
  },
  { 
    id: 'u2', 
    email: 'bob@globalresorts.com', 
    name: 'Bob Smith', 
    position: 'IT Support', 
    group_id: 'g1', 
    access_level: 'manager' 
  },
  {
    id: 'u3',
    email: 'charlie@globalresorts.com',
    name: 'Charlie Clerk',
    position: 'Receptionist',
    group_id: 'g1',
    access_level: 'viewer'
  }
];

// --- HELPER: Detect Environment ---
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
  /**
   * Triggers the Google Sign-In flow by checking current session
   */
  signInWithGoogle: async (): Promise<User> => {
    if (isGAS()) {
      return runGas('login');
    }
    // Mock for local dev
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Default to first mock user for local testing
    return demoUsers[0];
  },

  getAccessibleHotels: async (user: User): Promise<Hotel[]> => {
    if (isGAS()) return runGas('getAccessibleHotels', user);
    // Mock hotels for local development
    return [
      { id: 'h1', name: 'Grand Archipelago Bali', group_id: 'g1' },
      { id: 'h2', name: 'Archipelago City Jakarta', group_id: 'g1' }
    ];
  },

  getPasswordsForHotel: async (hotelId: string): Promise<Password[]> => {
    if (isGAS()) return runGas('getPasswordsForHotel', hotelId);
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
    // Fix: Return exported demoUsers for local testing consistency
    return demoUsers;
  },

  updateUserAccessLevel: async (userId: string, newLevel: User['access_level']): Promise<User> => {
    if (isGAS()) return runGas('updateUserAccessLevel', userId, newLevel);
    const user = demoUsers.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    return { ...user, access_level: newLevel };
  }
};
