import { useState, useCallback } from "react";
import { authApi } from "./auth-api";
import { useAuthContext } from "./auth-context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Business logic for authentication. Validates input, owns the loading/error
 * state for the auth screen, and delegates the actual calls to the api layer.
 */
export function useAuthService() {
  const { user, session, loading: sessionLoading } = useAuthContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (email: string, password: string): string | null => {
    if (!EMAIL_RE.test(email.trim())) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const signUp = useCallback(async (email: string, password: string) => {
    const v = validate(email, password);
    if (v) {
      setError(v);
      return { needsConfirmation: false, ok: false };
    }
    setBusy(true);
    setError(null);
    try {
      const data = await authApi.signUp(email.trim(), password);
      return { needsConfirmation: !data.session, ok: true };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-up failed.");
      return { needsConfirmation: false, ok: false };
    } finally {
      setBusy(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const v = validate(email, password);
    if (v) {
      setError(v);
      return { ok: false };
    }
    setBusy(true);
    setError(null);
    try {
      await authApi.signIn(email.trim(), password);
      return { ok: true };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
      return { ok: false };
    } finally {
      setBusy(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
  }, []);

  return {
    user,
    session,
    sessionLoading,
    busy,
    error,
    clearError: () => setError(null),
    signUp,
    signIn,
    signOut,
  };
}
