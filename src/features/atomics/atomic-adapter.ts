import type { Atomic, AtomicRow } from "../../types/atomic";

/** Maps a raw `atomics` row into the domain model. */
export const atomicAdapter = (row: AtomicRow): Atomic => ({
  id: row.id,
  code: row.code,
  name: row.name,
  trigger: row.trigger,
  oldBehavior: row.old_behavior,
  newBehavior: row.new_behavior,
  note: row.note ?? "",
  graduated: row.graduated,
  graduatedAt: row.graduated_at,
  isActive: row.is_active,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
});

export const atomicListAdapter = (rows: AtomicRow[] | null): Atomic[] =>
  (rows ?? []).map(atomicAdapter);
