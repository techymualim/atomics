import { supabase } from "../../supabase-instance";
import { logListAdapter } from "./log-adapter";
import type { CheckInStatus, DayLog } from "../../types/log";

interface UpsertLogInput {
  userId: string;
  atomicId: string;
  date: string;
  status?: CheckInStatus | null;
  badDay?: boolean;
  note?: string;
}

/** Data layer for the `logs` resource. */
export const logApi = {
  async fetchLogs(userId: string): Promise<DayLog[]> {
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });
    if (error) throw error;
    return logListAdapter(data);
  },

  /**
   * Inserts or updates the single log row for (atomic, date). Relies on the
   * unique(atomic_id, date) constraint defined in the schema.
   */
  async upsertLog(input: UpsertLogInput): Promise<void> {
    const payload: Record<string, unknown> = {
      user_id: input.userId,
      atomic_id: input.atomicId,
      date: input.date,
    };
    if (input.status !== undefined) payload.status = input.status;
    if (input.badDay !== undefined) payload.bad_day = input.badDay;
    if (input.note !== undefined) payload.note = input.note;

    const { error } = await supabase
      .from("logs")
      .upsert(payload, { onConflict: "atomic_id,date" });
    if (error) throw error;
  },
};
