import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
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
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}