import { supabase } from "../../supabase-instance";
import { atomicListAdapter } from "./atomic-adapter";
import { SEED_ATOMICS } from "../../lib/seed";
import type { Atomic, NewAtomicInput } from "../../types/atomic";

/** Data layer for the `atomics` resource. Raw queries + adapter transforms. */
export const atomicApi = {
  async fetchAtomics(userId: string): Promise<Atomic[]> {
    const { data, error } = await supabase
      .from("atomics")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return atomicListAdapter(data);
  },

  async seedAtomics(userId: string): Promise<void> {
    const rows = SEED_ATOMICS.map((s, i) => ({
      user_id: userId,
      code: s.code,
      name: s.name,
      trigger: s.trigger,
      old_behavior: s.oldBehavior,
      new_behavior: s.newBehavior,
      note: s.note,
      graduated: false,
      is_active: i === 0,
      sort_order: i,
    }));
    const { error } = await supabase.from("atomics").insert(rows);
    if (error) throw error;
  },

  async createAtomic(
    userId: string,
    code: string,
    sortOrder: number,
    makeActive: boolean,
    input: NewAtomicInput
  ): Promise<void> {
    const { error } = await supabase.from("atomics").insert({
      user_id: userId,
      code,
      name: input.name.toUpperCase(),
      trigger: input.trigger || "When the moment comes",
      old_behavior: input.oldBehavior || "The old default",
      new_behavior: input.newBehavior,
      note: "",
      graduated: false,
      is_active: makeActive,
      sort_order: sortOrder,
    });
    if (error) throw error;
  },

  async graduateAtomic(atomicId: string): Promise<void> {
    const { error } = await supabase
      .from("atomics")
      .update({
        graduated: true,
        is_active: false,
        graduated_at: new Date().toISOString(),
      })
      .eq("id", atomicId);
    if (error) throw error;
  },

  async activateAtomic(atomicId: string): Promise<void> {
    const { error } = await supabase
      .from("atomics")
      .update({ is_active: true })
      .eq("id", atomicId);
    if (error) throw error;
  },

  async deleteAtomic(atomicId: string): Promise<void> {
    await supabase.from("logs").delete().eq("atomic_id", atomicId);
    const { error } = await supabase.from("atomics").delete().eq("id", atomicId);
    if (error) throw error;
  },
};
