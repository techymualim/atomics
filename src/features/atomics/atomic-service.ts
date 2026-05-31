import { useEffect, useMemo, useCallback } from "react";
import {
  useAtomicsQuery,
  useLogsQuery,
  useSeedAtomics,
  useCreateAtomic,
  useDeleteAtomic,
  useGraduateAtomic,
  useUpsertLog,
} from "./atomic-repository";
import { useAuthContext } from "../auth/auth-context";
import { computeMetrics, isGraduated } from "../../lib/metrics";
import { today } from "../../lib/dates";
import { SEED_CODES } from "../../lib/seed";
import type { Atomic, NewAtomicInput } from "../../types/atomic";
import type { CheckInStatus, DayLog, AtomicMetrics } from "../../types/log";

export interface AtomicsViewModel {
  loading: boolean;
  active: Atomic | null;
  queued: Atomic[];
  graduated: Atomic[];
  logs: DayLog[];
  todayLog: DayLog | null;
  activeMetrics: AtomicMetrics | null;
  checkIn: (status: CheckInStatus) => void;
  toggleBadDay: () => void;
  setDayNote: (note: string) => void;
  addAtomic: (input: NewAtomicInput) => void;
  removeAtomic: (atomicId: string) => void;
  isSeed: (atomic: Atomic) => boolean;
  refresh: () => void;
}

/**
 * The use-case layer for the atomics feature. Composes the repository hooks,
 * applies the swap-model business rules (one active at a time, graduation on
 * charge + hard days), and exposes a flat view-model to the screen.
 */
export function useAtomicsService(): AtomicsViewModel {
  const { user } = useAuthContext();
  const userId = user?.id;
  const t = today();

  const atomicsQuery = useAtomicsQuery(userId);
  const logsQuery = useLogsQuery(userId);
  const seedMutation = useSeedAtomics();
  const createMutation = useCreateAtomic();
  const deleteMutation = useDeleteAtomic();
  const graduateMutation = useGraduateAtomic();
  const upsertMutation = useUpsertLog();

  const atomics = useMemo(() => atomicsQuery.data ?? [], [atomicsQuery.data]);
  const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

  // First run for a brand-new account: install the starter set once.
  useEffect(() => {
    if (
      userId &&
      atomicsQuery.isSuccess &&
      atomics.length === 0 &&
      !seedMutation.isPending
    ) {
      seedMutation.mutate(userId);
    }
  }, [userId, atomicsQuery.isSuccess, atomics.length, seedMutation]);

  const active = useMemo(
    () => atomics.find((a) => a.isActive && !a.graduated) ?? null,
    [atomics]
  );
  const queued = useMemo(
    () => atomics.filter((a) => !a.graduated && a.id !== active?.id),
    [atomics, active]
  );
  const graduated = useMemo(
    () => atomics.filter((a) => a.graduated),
    [atomics]
  );

  const activeLogs = useMemo(
    () => (active ? logs.filter((l) => l.atomicId === active.id) : []),
    [logs, active]
  );
  const activeMetrics = useMemo(
    () => (active ? computeMetrics(active.id, activeLogs) : null),
    [active, activeLogs]
  );
  const todayLog = useMemo(
    () =>
      active
        ? logs.find((l) => l.atomicId === active.id && l.date === t) ?? null
        : null,
    [logs, active, t]
  );

  // Graduation pass: when the active atomic crosses the threshold, graduate it
  // and promote the next queued one. Runs whenever metrics change.
  useEffect(() => {
    if (
      active &&
      activeMetrics &&
      isGraduated(activeMetrics) &&
      !graduateMutation.isPending
    ) {
      const next = atomics.find((a) => !a.graduated && a.id !== active.id);
      graduateMutation.mutate({ atomicId: active.id, nextId: next?.id ?? null });
    }
  }, [active, activeMetrics, atomics, graduateMutation]);

  const checkIn = useCallback(
    (status: CheckInStatus) => {
      if (!active || !userId) return;
      upsertMutation.mutate({
        userId,
        atomicId: active.id,
        date: t,
        status,
      });
    },
    [active, userId, t, upsertMutation]
  );

  const toggleBadDay = useCallback(() => {
    if (!active || !userId) return;
    upsertMutation.mutate({
      userId,
      atomicId: active.id,
      date: t,
      badDay: !(todayLog?.badDay ?? false),
    });
  }, [active, userId, t, todayLog, upsertMutation]);

  const setDayNote = useCallback(
    (note: string) => {
      if (!active || !userId) return;
      upsertMutation.mutate({ userId, atomicId: active.id, date: t, note });
    },
    [active, userId, t, upsertMutation]
  );

  const addAtomic = useCallback(
    (input: NewAtomicInput) => {
      if (!userId || !input.name.trim() || !input.newBehavior.trim()) return;
      const code = `A-${String(atomics.length + 1).padStart(2, "0")}`;
      const hasActive = atomics.some((a) => a.isActive && !a.graduated);
      createMutation.mutate({
        userId,
        code,
        sortOrder: atomics.length,
        makeActive: !hasActive,
        input,
      });
    },
    [userId, atomics, createMutation]
  );

  const removeAtomic = useCallback(
    (atomicId: string) => deleteMutation.mutate(atomicId),
    [deleteMutation]
  );

  const refresh = useCallback(() => {
    atomicsQuery.refetch();
    logsQuery.refetch();
  }, [atomicsQuery, logsQuery]);

  return {
    loading: atomicsQuery.isLoading || logsQuery.isLoading,
    active,
    queued,
    graduated,
    logs,
    todayLog,
    activeMetrics,
    checkIn,
    toggleBadDay,
    setDayNote,
    addAtomic,
    removeAtomic,
    isSeed: (a: Atomic) => SEED_CODES.has(a.code),
    refresh,
  };
}
