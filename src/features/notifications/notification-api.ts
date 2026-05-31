import { supabase } from "../../supabase-instance";

/**
 * Data layer for push tokens. Persists a device's push token against the user
 * so a backend (Supabase Edge Function / FCM) can target them later.
 */
export const notificationApi = {
  async savePushToken(
    userId: string,
    token: string,
    platform: string
  ): Promise<void> {
    const { error } = await supabase.from("push_tokens").upsert(
      {
        user_id: userId,
        token,
        platform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "token" }
    );
    if (error) throw error;
  },

  async deletePushToken(token: string): Promise<void> {
    await supabase.from("push_tokens").delete().eq("token", token);
  },
};
