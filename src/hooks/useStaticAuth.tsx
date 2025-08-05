// Completely static auth without any React dependencies
interface StaticAuthContextType {
  user: null;
  session: null;
  profile: null;
  loading: false;
  isAdmin: false;
  canAccessClient: false;
  canAccessRepairer: false;
  canAccessAdmin: false;
  signIn: () => Promise<{ error: any }>;
  signInAdmin: () => Promise<{ error: any }>;
  signUp: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const staticAuthValue: StaticAuthContextType = {
  user: null,
  session: null,
  profile: null,
  loading: false,
  isAdmin: false,
  canAccessClient: false,
  canAccessRepairer: false,
  canAccessAdmin: false,
  signIn: async () => ({ error: 'Static mode' }),
  signInAdmin: async () => ({ error: 'Static mode' }),
  signUp: async () => ({ error: 'Static mode' }),
  signOut: async () => ({ error: 'Static mode' }),
  refreshProfile: async () => {}
};

// Static provider that just renders children
export const StaticAuthProvider = ({ children }: { children: any }) => {
  return children;
};

// Static hook that returns fixed values
export const useStaticAuth = () => {
  return staticAuthValue;
};