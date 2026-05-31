import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { computeMetrics, isGraduated } from "../lib/metrics";
import { today } from "../lib/dates";
import { SEED_ATOMICS } from "../lib/constants";

export function useAtomics() {
  const { user } = useAuth();
  const [atomics, setAtomics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: atomicsData }, { data: logsData }] = await Promise.all([
      supabase
        .from("atomics")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true }),
    ]);

    const a = atomicsData || [];
    const l = logsData || [];

    if (a.length === 0) {
      await seedAtomics(user.id);
      return fetchAll();
    }

    setAtomics(a);
    setLogs(l);

    const active = a.find((x) => x.is_active && !x.graduated);
    setActiveId(active ? active.id : null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const seedAtomics = async (userId) => {
    const rows = SEED_ATOMICS.map((s, i) => ({
      user_id: userId,
      code: s.code,
      name: s.name,
      trigger: s.trigger,
      old_behavior: s.old_behavior,
      new_behavior: s.new_behavior,
      note: s.note,
      graduated: false,
      is_active: i === 0,
      sort_order: i,
    }));
    await supabase.from("atomics").insert(rows);
  };

  const checkIn = useCallback(
    async (atomicId, status) => {
      if (!user) return;
      const t = today();
      const existing = logs.find(
        (l) => l.atomic_id === atomicId && l.date === t
      );

      if (existing) {
        await supabase
          .from("logs")
          .update({ status })
          .eq("id", existing.id);
      } else {
        await supabase.from("logs").insert({
          user_id: user.id,
          atomic_id: atomicId,
          date: t,
          status,
          bad_day: false,
          note: "",
        });
      }
      await fetchAll();
      await checkGraduation(atomicId);
    },
    [user, logs, fetchAll]
  );

  const toggleBadDay = useCallback(async (atomicId) => {
    if (!user) return;
    const t = today();
    const existing = logs.find(
      (l) => l.atomic_id === atomicId && l.date === t
    );

    if (existing) {
      await supabase
        .from("logs")
        .update({ bad_day: !existing.bad_day })
        .eq("id", existing.id);
    } else {
      await supabase.from("logs").insert({
        user_id: user.id,
        atomic_id: atomicId,
        date: t,
        status: null,
        bad_day: true,
        note: "",
      });
    }
    await fetchAll();
  }, [user, logs, fetchAll]);

  const setDayNote = useCallback(async (atomicId, note) => {
    if (!user) return;
    const t = today();
    const existing = logs.find(
      (l) => l.atomic_id === atomicId && l.date === t
    );

    if (existing) {
      await supabase
        .from("logs")
        .update({ note })
        .eq("id", existing.id);
    } else {
      await supabase.from("logs").insert({
        user_id: user.id,
        atomic_id: atomicId,
        date: t,
        status: null,
        bad_day: false,
        note,
      });
    }
    await fetchAll();
  }, [user, logs, fetchAll]);

  const checkGraduation = useCallback(async (atomicId) => {
    const atomicLogs = logs.filter((l) => l.atomic_id === atomicId);
    const metrics = computeMetrics(atomicId, atomicLogs);

    if (isGraduated(metrics)) {
      await supabase
        .from("atomics")
        .update({ graduated: true, is_active: false, graduated_at: new Date().toISOString() })
        .eq("id", atomicId);

      const next = atomics.find((a) => !a.graduated && a.id !== atomicId);
      if (next) {
        await supabase
          .from("atomics")
          .update({ is_active: true })
          .eq("id", next.id);
      }
      await fetchAll();
    }
  }, [logs, atomics, fetchAll]);

  const addAtomic = useCallback(async ({ name, trigger, oldBehavior, newBehavior }) => {
    if (!user) return;
    const code = `A-${String(atomics.length + 1).padStart(2, "0")}`;
    const hasActive = atomics.some((a) => a.is_active && !a.graduated);

    await supabase.from("atomics").insert({
      user_id: user.id,
      code,
      name: name.toUpperCase(),
      trigger: trigger || "When the moment comes",
      old_behavior: oldBehavior || "The old default",
      new_behavior: newBehavior,
      note: "",
      graduated: false,
      is_active: !hasActive,
      sort_order: atomics.length,
    });
    await fetchAll();
  }, [user, atomics, fetchAll]);

  const removeAtomic = useCallback(async (id) => {
    await supabase.from("atomics").delete().eq("id", id);
    await supabase.from("logs").delete().eq("atomic_id", id);
    await fetchAll();
  }, [fetchAll]);

  const active = atomics.find((a) => a.id === activeId) || null;
  const queued = atomics.filter((a) => !a.graduated && a.id !== activeId);
  const graduated = atomics.filter((a) => a.graduated);
  const t = today();
  const todayLog = active
    ? logs.find((l) => l.atomic_id === active.id && l.date === t) || null
    : null;
  const activeMetrics = active
    ? computeMetrics(
        active.id,
        logs.filter((l) => l.atomic_id === active.id)
      )
    : null;

  return {
    atomics,
    active,
    queued,
    graduated,
    logs,
    todayLog,
    activeMetrics,
    loading,
    checkIn,
    toggleBadDay,
    setDayNote,
    addAtomic,
    removeAtomic,
    refresh: fetchAll,
  };
}
