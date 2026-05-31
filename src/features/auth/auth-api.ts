import { supabase } from "../../supabase-instance";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

type AuthStateCallback = (
  event: AuthChangeEvent,
  session: Session | null
) => void;

/**
 * Data layer for authentication. Thin wrappers over the Supabase auth gateway;
 * no validation or business rules live here.
 */
export const authApi = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuthStateChange(callback: AuthStateCallback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
