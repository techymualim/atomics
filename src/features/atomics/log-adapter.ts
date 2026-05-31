import type { DayLog, LogRow } from "../../types/log";

/** Maps a raw `logs` row into the domain model. */
export const logAdapter = (row: LogRow): DayLog => ({
  id: row.id,
  atomicId: row.atomic_id,
  date: row.date,
  status: row.status,
  badDay: row.bad_day,
  note: row.note ?? "",
});

export const logListAdapter = (rows: LogRow[] | null): DayLog[] =>
  (rows ?? []).map(logAdapter);
