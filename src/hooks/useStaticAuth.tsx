import * as React from 'react';

// Static auth context without any React hooks
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

const StaticAuthContext = React.createContext<StaticAuthContextType>(staticAuthValue);

export const StaticAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <StaticAuthContext.Provider value={staticAuthValue}>
      {children}
    </StaticAuthContext.Provider>
  );
};

export const useStaticAuth = () => {
  return staticAuthValue;
};