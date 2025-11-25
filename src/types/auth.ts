export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  // Note: role removed - use user_roles table for secure role checks
}

export interface UserSignUpData {
  first_name?: string;
  last_name?: string;
  role?: string;
  phone?: string;
  business_name?: string;
  address?: string;
  website?: string;
}

export interface AuthState {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
}
