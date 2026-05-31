import type { User } from "@supabase/supabase-js";
import type { AppUser } from "../../types/user";

/** Maps a raw Supabase auth user into the app's domain user model. */
export const userAdapter = (user: User | null | undefined): AppUser | null => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
  };
};
