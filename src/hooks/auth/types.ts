export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  // Note: role removed - use user_roles table for secure role checks
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: any;
  session: any;
  profile: Profile | null;
  loading: boolean;
}

export interface UserSignUpData {
  first_name?: string;
  last_name?: string;
  role?: string;
  phone?: string;
}