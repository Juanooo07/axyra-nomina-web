import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type CompanyUser = Database['public']['Tables']['company_users']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  companyUsers: CompanyUser[];
  selectedCompanyId: string | null;
  currentRole: 'admin' | 'operator' | 'viewer' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; data?: { user: User | null } }>;
  signOut: () => Promise<void>;
  selectCompany: (companyId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setProfile(null);
          setCompanyUsers([]);
          setSelectedCompanyId(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const [profileResult, companyUsersResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('company_users').select('*').eq('user_id', userId)
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      if (companyUsersResult.data) {
        setCompanyUsers(companyUsersResult.data);
        if (companyUsersResult.data.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(companyUsersResult.data[0].company_id);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      return { error, data };
    } catch (error) {
      return { error: error as Error, data: undefined };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCompanyUsers([]);
    setSelectedCompanyId(null);
  };

  const selectCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    localStorage.setItem('selectedCompanyId', companyId);
  };

  const currentRole = companyUsers.find(cu => cu.company_id === selectedCompanyId)?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        companyUsers,
        selectedCompanyId,
        currentRole,
        loading,
        signIn,
        signUp,
        signOut,
        selectCompany
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
