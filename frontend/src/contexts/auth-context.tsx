import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { api, type Profile } from "@/lib/api";

interface UserInfo {
  id: string;
  email?: string;
}

interface AuthContextValue {
  user: UserInfo | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const profileData = await api.getProfile(userId);
      setProfile(profileData);
      return profileData;
    } catch {
      setProfile(null);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const session = await api.getSession();
      if (cancelled) return;

      if (!session) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const userInfo = { id: session.user.id, email: session.user.email };
      setUser(userInfo);
      await fetchProfile(session.user.id);
      if (!cancelled) setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = api.onAuthStateChange((session) => {
      if (!session) {
        setUser(null);
        setProfile(null);
      } else {
        const userInfo = {
          id: session.user.id,
          email: session.user.email,
        };
        setUser(userInfo);
        fetchProfile(session.user.id);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !loading && !!user,
        isProfileComplete: !loading && !!profile,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
