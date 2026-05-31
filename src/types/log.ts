export type CheckInStatus = "ran" | "missed";

/** Domain model for a single daily check-in on an atomic. */
export interface DayLog {
  id: string;
  atomicId: string;
  date: string;
  status: CheckInStatus | null;
  badDay: boolean;
  note: string;
}

/** Shape of the raw `logs` row coming back from Supabase. */
export interface LogRow {
  id: string;
  user_id: string;
  atomic_id: string;
  date: string;
  status: CheckInStatus | null;
  bad_day: boolean;
  note: string | null;
  created_at: string;
}

export interface AtomicMetrics {
  charge: number;
  badHeld: number;
  badTotal: number;
  completion: number;
  totalDays: number;
}
