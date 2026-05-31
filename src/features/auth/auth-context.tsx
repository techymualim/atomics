import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { authApi } from "./auth-api";
import { userAdapter } from "./auth-adapter";
import type { AppUser } from "../../types/user";

interface AuthContextValue {
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
});

/**
 * Holds global auth/session state. Acts as the repository for the session
 * resource — the rest of the app reads it through the useAuthContext hook.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .getSession()
      .then((s) => setSession(s))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = authApi.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user: userAdapter(session?.user), loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = (): AuthContextValue => useContext(AuthContext);
