export interface Password {
  id: string;
  description: string;
  username: string;
  password_value: string; // Renamed from 'password' to avoid confusion
  created_by: string;
  last_edited: string;
  last_edited_by: string;
  hotel_id: string;
  login_type: 'Admin' | 'WiFi' | 'PMS' | 'Vendor' | 'Social' | 'Other';
}

export interface Hotel {
  id: string;
  name: string;
  group_id: string | null;
}

export type AccessLevel = 'viewer' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  position: string;
  group_id: string | null;
  access_level: AccessLevel;
  avatar?: string;
}

export interface UserHotel {
  id: string;
  user_id: string;
  hotel_id: string;
}

export interface Group {
  id: string;
  name: string;
}

export interface GroupHotel {
  id: string;
  group_id: string;
  hotel_id: string;
}

// Helper type for the authenticated session
export interface AuthSession {
  user: User;
  accessibleHotels: Hotel[];
}
