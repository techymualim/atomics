import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { atomicApi } from "./atomic-api";
import { logApi } from "./log-api";
import { queryKeys } from "../../query-client";
import type { Atomic, NewAtomicInput } from "../../types/atomic";
import type { CheckInStatus, DayLog } from "../../types/log";

/**
 * Repository layer: React Query hooks that expose the atomics/logs resources to
 * the rest of the app and own cache invalidation. No business rules here.
 */
export const useAtomicsQuery = (userId: string | undefined) =>
  useQuery<Atomic[]>({
    queryKey: queryKeys.atomics,
    queryFn: () => atomicApi.fetchAtomics(userId as string),
    enabled: !!userId,
  });

export const useLogsQuery = (userId: string | undefined) =>
  useQuery<DayLog[]>({
    queryKey: queryKeys.logs,
    queryFn: () => logApi.fetchLogs(userId as string),
    enabled: !!userId,
  });

export const useSeedAtomics = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => atomicApi.seedAtomics(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.atomics }),
  });
};

export const useCreateAtomic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      userId: string;
      code: string;
      sortOrder: number;
      makeActive: boolean;
      input: NewAtomicInput;
    }) =>
      atomicApi.createAtomic(
        args.userId,
        args.code,
        args.sortOrder,
        args.makeActive,
        args.input
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.atomics }),
  });
};

export const useDeleteAtomic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (atomicId: string) => atomicApi.deleteAtomic(atomicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.atomics });
      qc.invalidateQueries({ queryKey: queryKeys.logs });
    },
  });
};

export const useGraduateAtomic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { atomicId: string; nextId: string | null }) => {
      await atomicApi.graduateAtomic(args.atomicId);
      if (args.nextId) await atomicApi.activateAtomic(args.nextId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.atomics }),
  });
};

export const useUpsertLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      userId: string;
      atomicId: string;
      date: string;
      status?: CheckInStatus | null;
      badDay?: boolean;
      note?: string;
    }) => logApi.upsertLog(args),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.logs }),
  });
};
